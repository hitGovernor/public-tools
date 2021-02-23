/**
 * sets the specified cookie
 * @param cName {string} name of the cookie to create
 * @param cVal {string} the value being stored in the cookie
 * @param expDays {number} specifies expiration date the specified number of days from today
 */
function setCookie(cName, cVal, expDays) {
  var domain = "example.com",
    path = "/",
    cookieExpire = "";

  if (expDays) {
    var dt = new Date(),
      now = dt.getTime();

    cookieExpire = new Date(now + (1000 * 60 * 60 * 24 * expDays)); // ms*sec*min*hour*day
  }

  // update data layer to keep the cookie and data layer in synch
  b["cp." + cName] = cVal;

  document.cookie = cName + "=" + cVal + ";domain=" + domain +
    ";path=" + path + ";SameSite= None;Secure" +
    ((cookieExpire) ? ";expires=" + cookieExpire : "");
}

/** SAMPLE USAGE **/ /** SAMPLE USAGE **/ /** SAMPLE USAGE **/
/** SAMPLE USAGE **/ /** SAMPLE USAGE **/ /** SAMPLE USAGE **/

// look for "my-id" parameter, set 30 day cookie, if found
try {
  // if the "my-id" query parameter ("qp.my-id") exists...
  if (b["qp.my-id"]) {
    // set the "my-id" cookie with the "qp.my-id" value
    // 30 day expiry
    // calling setCookie() also updates b["cp.my-id"] data layer variable
    setCookie("my-id", b["qp.my-id"], 30);
  }
} catch (err) {
  // log that there's been an issue
  utag.DB("error:##UID##:cookie logic")
}