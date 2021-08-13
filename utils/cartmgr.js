var plugin = "CartMgr";
window[plugin] = {};
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

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].empty = function (payload) {
  this.cart = {
    items: {},
    status: 'emptied'
  };
  // this.transactions = {};

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].open = function (payload) {
  this.cart.status = 'open';

  if (payload && payload.callback) {
    payload.callback();
  }
}

window[plugin].getItemCount = function () {
  var itemCount = 0;

  for (var key in this.cart.items) {
    itemCount += this.cart.items[key].qty;
  }

  return itemCount;
}

window[plugin].getSubtotal = function () {
  var subtotal = 0;

  for (var key in this.cart.items) {
    subtotal = (Number(subtotal) + Number(this.cart.items[key].ttl));
  }

  return Number(subtotal.toFixed(2))
}

window[plugin].getTotal = function () {
  return Number((Number(this.cart.subtotal) + Number(this.cart.tax) + Number(this.cart.shipping)).toFixed(2));
}

window[plugin].add = function (payload) {
  var sku = payload.sku || '';
  if (sku) {
    if (this.cart.status === 'closed') {
      this.open();
    }

    if (!this.cart.items[sku]) {
      var qty = Number(payload.qty).toFixed(2),
        amt = Number(payload.amt).toFixed(2),
        ttl = qty * amt;

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

    if (payload && payload.callback) {
      payload.callback();
    }
    return this.cart;
  }
}

window[plugin].checkout = function (payload) {
  this.cart.subtotal = this.getSubtotal();
  this.cart.shipping = Number(8.99.toFixed(2));
  this.cart.tax = Number((this.cart.subtotal * .1).toFixed(2));
  this.cart.total = this.getTotal();
}

window[plugin].purchase = function (payload) {
  if (!this.cart.subtotal) {
    this.checkout();
  }
  var transID = this.tools.buildTransactionID(15);
  this.cart.status = 'complete';
  this.transactions.lastTransaction = transID;
  this.transactions[transID] = this.cart;
  this.transactions[transID].subtotal = Number(this.cart.subtotal);
  this.transactions[transID].total = Number(this.cart.total);

  sessionStorage.removeItem(plugin);
  window[plugin].empty();

  this.cart = {
    items: {},
    status: 'closed'
  }

  if (payload && payload.callback) {
    payload.callback();
  }
  return this.cart;
}
