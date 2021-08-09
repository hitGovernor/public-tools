// list of custom tools from tiq:
// https://community.tealiumiq.com/t5/Getting-Started/List-of-Custom-Tealium-Tools/ta-p/23066

// prints out current profile, environment, and version info (use as live expression)
utag_data["ut.profile"] + " -- " + utag_data["ut.env"] + " -- " + utag_data["ut.version"];



// tiq toggle debug
var host = document.location.hostname.split('.').reverse();
var root = host[1] + '.' + host[0];
if (document.cookie.indexOf("utagdb=true") > -1) {
  document.cookie = "utagdb=false;path=/;domain=" + root;
  console.log("TiQ debug disabled");
} else {
  document.cookie = "utagdb=true;path=/;domain=" + root;
  console.log("TiQ debug enabled");
}



// display ccpa popup modal
utag.gdpr.showDoNotSellPrompt("en-US");


/**
 * checks for cookie value in utag datalayer before looking for the actual cookie
 * @param c_name {string} - Name of cookie to locate
 * @param do_update {=Boolean} - If true, updates utag datalayer value with value found in cookie; if false/undefined, does not
 */
function getCookie(c_name, do_update) {
  var b = b || {},
    retval = undefined,
    utag_cookie = b["cp." + c_name],
    browser_cookie = document.cookie.match(new RegExp(c_name + '=([^;]+)'))[1];

  if (browser_cookie) {
    retval = browser_cookie;
    if (do_update) {
      b["cp." + c_name] = browser_cookie;
    }
  } else {
    retval = utag_cookie;
  }

  return retval;
}