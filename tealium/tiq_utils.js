// list of custom tools from tiq:
// https://community.tealiumiq.com/t5/Getting-Started/List-of-Custom-Tealium-Tools/ta-p/23066

// prints out current profile, environment, and version info (use as live expression)
utag_data["ut.profile"] + " -- " + utag_data["ut.env"] + " -- " + utag_data["ut.version"];



// tiq toggle debug
if (document.cookie.indexOf("utagdb=true") > -1) {
  document.cookie = "utagdb=false";
  console.log("TiQ debug disabled");
} else {
  document.cookie = "utagdb=true";
  console.log("TiQ debug enabled");
}



// display ccpa popup modal
utag.gdpr.showDoNotSellPrompt("en-US");