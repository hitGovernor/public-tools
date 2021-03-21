// cross-browser addEventListener support
function custEventListener(el, evt, action) {
  if (el.addEventListener) {
    el.addEventListener(evt, action, false);
  } else if (el.attachEvent) {
    el.attachEvent("on" + evt, action);
  }
}

// find the button and assign the tracking event listener
document.querySelectorAll(".looks-like-a-button").forEach(function(item) {
  customEventListener(item, "click", function() {
    b["tealium_event"] = "button-clicked";
    b["button_id"] = item.id || "";
    b["button_name"] = item.name || "";
    utag.link(b);
  });
});