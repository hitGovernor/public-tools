let addVar = function (payload) {
  utui.automator.addVariable({
    name: payload.name, // "ga4_measurement_id",
    type: payload.type, // "js",
    description: payload.description // "GA4 tracking ID"
  }, function (new_id) {
    console.log("The new data source ID is: " + new_id);
  });
}

// create any new data layer variables required for 
// mapping in the new tag;
// this does NOT populate the variables, only defines them
// for use in the tag
let newVars = [{
  name: "ga4_measurement_id",
  type: "js",
  description: "GA4 tracking ID. ~evo~"
}, {
  name: "ga4_event_category",
  type: "js",
  description: "GA4 Event Category. ~evo~"
}, {
  name: "ga4_event_action",
  type: "js",
  description: "GA4 Event Action. ~evo~"
}, {
  name: "ga4_event_label",
  type: "js",
  description: "GA4 Event Label. ~evo~"
}, {
  name: "ga4_page_type",
  type: "js",
  description: "GA4 Page Type ~evo~"
}, {
  name: "tealium_event",
  type: "js",
  description: ". ~evo~"
}];

newVars.forEach(function (item) {
  addVar(item);
});

setTimeout(function () {
  // build the new tag, complete with initial configuration
  utui.automator.addTag({
    "status": "active",
    "tag_name": "Google Analytics 4 (gtag.js)",
    "tag_id": "7142", // Google Analytics 4 (gtag.js) template

    // tag config: properties
    "title": "GA4 - All Pages",

    // tag config: vendor config
    "config_measurement_id": "PLACEHOLDER",
    "config_gaobject": "gtag", // "gtag" (default)
    "config_data_layer_name": "dataLayer", // "dataLayer" (default)
    "config_send_page_view": "true", // "true" (default) | "false"
    "config_clear_global_vars": "false", // "true" | "false" (default)

    // tag config: publish settings
    "selectedTargets": {
      "dev": "true",
      "qa": "true",
      "prod": "false" // removes ability to release to prod
    },

    // tag config: notes
    "notes": "Tag added via utui.automator() ~evo~",

    // include custom mappings
    "map": [{
      "variable": "measurement_id",
      "key": "ga4_measurement_id",
      "type": "js"
    }, {
      "variable": "config.debug_mode", // what you're mapping TO
      "key": "utag.data[\"ut.env\"] !== \"prod\" ? true  : \"\"", // data layer variable (or static value)
      "type": "static.js" // type (js, cp, qp, etc)
    }, {
      "variable": "event.event_category", // what you're mapping TO
      "key": "ga4_event_category", // data layer variable (or static value)
      "type": "js" // type (js, cp, qp, etc)
    }, {
      "variable": "event.event_action", // what you're mapping TO
      "key": "ga4_event_action", // data layer variable (or static value)
      "type": "js" // type (js, cp, qp, etc)
    }, {
      "variable": "event.event_label", // what you're mapping TO
      "key": "ga4_event_label", // data layer variable (or static value)
      "type": "js" // type (js, cp, qp, etc)
    }, {
      "variable": "event.tealium_event, video_start:video_start, video_complete:video_complete, link_click:link_click", // what you're mapping TO
      "key": "tealium_event", // data layer variable (or static value)
      "type": "js" // type (js, cp, qp, etc)
    }],

    // "loadrule": "1,2",

    // "labels": "1,2",
  }, function (tag_id) {
    // The new tag ID can be accessed here
    console.log(tag_id);
  });

}, 1000)