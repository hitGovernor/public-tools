// create any new data layer variables required for 
// mapping in the new tag;
// this does NOT populate the variables, only defines them
// for use in the tag
utui.automator.addVariable({
  name:"ga4_measurement_id",
  type:"js",
  description:"GA4 tracking ID"
}, function (new_id) {
  console.log("The new data source ID is: " + new_id);
});


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
  "notes": "Tag added via utui.automator()",

  // include custom mappings
  "map": [{
      "variable": "measurement_id",
      "key": "ga4_measurement_id",
      "type": "js"
    },
    // {
    // "variable": "...", // what you're mapping TO
    // "key": "...", // data layer variable (or static value)
    // "type": "..." // type (js, cp, qp, etc)
    //}
  ],

  // "loadrule": "1,2",
  
  // "labels": "1,2",
}, function (tag_id) {
  // The new tag ID can be accessed here
  console.log(tag_id);
});