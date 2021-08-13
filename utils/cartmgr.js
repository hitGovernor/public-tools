var plugin = "CartMgr";

// define cart manager and set default/static values
window[plugin] = {
  tax: .1,
  shipping: 8.00
};

// add support for browser events; default console logs the results, but can be 
// modified to push to a data layer or any other requirement
document.addEventListener("cart_mgr_notification", function (item) {
  console.log(item.detail);
});

// window.CustomEvent polyfill from:
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
(function () {
  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

window[plugin].notify = function (eventDetail) {
  var event = new CustomEvent("cart_mgr_notification", {
    detail: eventDetail
  });
  document.dispatchEvent(event);
}

window[plugin].tools = {
  buildTransactionID: function (length) {
    var transID = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      transID += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return transID;
  }
}

window[plugin].init = function (payload) {
  this.cart = (payload && payload.cart) ? payload.cart : {
    items: {},
    status: 'closed'
  };
  this.transactions = {};

  this.notify({
    trigger: 'init',
    payload: payload,
    cart: this.cart
  });

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].empty = function (payload) {
  this.cart = {
    items: {},
    status: 'empty'
  };

  this.notify({
    trigger: 'empty',
    payload: payload,
    cart: this.cart
  });

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].open = function (payload) {
  this.cart.status = 'open';

  this.notify({
    trigger: 'open',
    payload: payload,
    cart: this.cart
  });

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].getItemCount = function () {
  var itemCount = 0;

  for (var key in this.cart.items) {
    itemCount += this.cart.items[key].qty;
  }

  this.notify({
    trigger: 'getItemCount',
    payload: {},
    cart: this.cart
  });

  return itemCount;
}

window[plugin].getSubtotal = function () {
  var subtotal = 0;

  for (var key in this.cart.items) {
    subtotal = (Number(subtotal) + Number(this.cart.items[key].ttl));
  }

  subtotal = Number(subtotal.toFixed(2));

  this.notify({
    trigger: 'getSubtotal',
    payload: {},
    cart: this.cart
  });

  return subtotal;
}

window[plugin].getTotal = function () {
  var total = Number((Number(this.cart.subtotal) + Number(this.cart.tax) + Number(this.cart.shipping)).toFixed(2));

  this.notify({
    trigger: 'getTotal',
    payload: {},
    cart: this.cart
  });

  return total;
}

window[plugin].add = function (payload) {
  var sku = payload.sku || '';
  if (sku) {
    if (this.cart.status === 'closed' || this.cart.status === 'empty') {
      this.open();
    }

    if (!this.cart.items[sku]) {
      var qty = Number(payload.qty).toFixed(2),
        amt = Number(payload.amt).toFixed(2),
        ttl = Number(qty * amt).toFixed(2);

      this.cart.items[sku] = {
        sku: sku,
        qty: payload.qty,
        amt: payload.amt,
        ttl: ttl,
        category: payload.category
      }
    } else {
      var qty = this.cart.items[sku].qty + payload.qty,
        amt = Number(payload.amt).toFixed(2),
        ttl = Number(qty * amt).toFixed(2);

      this.cart.items[sku] = {
        sku: sku,
        qty: qty,
        amt: amt,
        ttl: ttl,
        category: payload.category
      }
    }

    this.notify({
      trigger: 'add',
      payload: payload,
      cart: this.cart
    });

    if (payload.callback) {
      payload.callback();
    }
    return this.cart;
  } else {
    console.log('A SKU must be specified when adding a product to the cart.');
  }
}

window[plugin].remove = function (payload) {
  if (payload && this.cart.status === 'open') {
    var sku = payload.sku,
      qtyToRemove = payload.qty;

    if (this.cart.items[sku]) {
      var qtyRemaining = this.cart.items[sku].qty - qtyToRemove;
      if (qtyRemaining < 1) {
        delete this.cart.items[sku];
      } else {
        this.cart.items[sku] = {
          qty: qtyRemaining,
          amt: this.cart.items[sku].amt,
          ttl: qtyRemaining * this.cart.items[sku].amt
        }
      }
    }

    this.notify({
      trigger: 'remove',
      payload: payload,
      cart: this.cart
    });

    if (payload && payload.callback) {
      payload.callback();
    }

    return this.cart;
  }
}

window[plugin].checkout = function (payload) {
  this.cart.subtotal = this.getSubtotal();
  this.cart.shipping = Number(window[plugin].shipping.toFixed(2));
  this.cart.tax = Number((this.cart.subtotal * window[plugin].tax).toFixed(2));
  this.cart.total = this.getTotal();

  this.notify({
    trigger: 'checkout',
    payload: payload,
    cart: this.cart
  });
}

window[plugin].purchase = function (payload) {
  if (!this.cart.subtotal) {
    this.checkout();
  }
  var transID = this.tools.buildTransactionID(15);
  this.cart.status = 'complete';
  this.transactions.lastTransaction = transID;
  this.transactions[transID] = this.cart;
  this.transactions[transID].transID = transID;
  this.transactions[transID].subtotal = Number(this.cart.subtotal);
  this.transactions[transID].total = Number(this.cart.total);

  sessionStorage.removeItem(plugin);
  window[plugin].empty();

  this.cart = {
    items: {},
    status: 'closed'
  }

  this.notify({
    trigger: 'purchase',
    payload: payload,
    transaction: this.transactions[transID],
    cart: this.cart
  });

  if (payload && payload.callback) {
    payload.callback();
  }
  return this.cart;
}

// auto-initialize the cart manager
window[plugin].init();