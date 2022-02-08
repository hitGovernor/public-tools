var guidManager = {
  config: {
    UID_COOKIE_NAME: "evo_uid",
    COOKIE_DOMAIN: "example.com"
  },

  getCookie: function (c_name) {
    var retval = undefined,
      browser_cookie = document.cookie.match(new RegExp(c_name + '=([^;]+)'));

    retval = (browser_cookie) ? browser_cookie[1] : retval;

    return retval;
  },

  setCookie: function (cName, cVal, expDays) {
    var domain = this.config.COOKIE_DOMAIN,
      path = "/",
      cookieExpire = "";

    if (expDays) {
      var dt = new Date(),
        now = dt.getTime();

      cookieExpire = new Date(now + (1000 * 60 * 60 * 24 * expDays)); // ms*sec*min*hour*day
    }

    document.cookie = cName + "=" + cVal + ";domain=" + domain +
      ";path=" + path + ";SameSite=None;Secure" +
      ((cookieExpire) ? ";expires=" + cookieExpire : "");

    return cVal;
  },

  buildUserId: function (length) {
    var userId = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      userId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return userId;
  },

  getUserId: function (payload) {
    var userId = "",
      cookieName = payload.cookieName || this.config.UID_COOKIE_NAME;

    if (payload && payload.storageType === "session") {
      userId = sessionStorage.getItem(cookieName);
    } else { // default to cookie
      userId = this.getCookie(cookieName);
    }

    if (userId === undefined || userId === null || (payload && payload.reset === true)) {
      userId = this.buildUserId(48);
    }

    if (payload && payload.storageType === "session") {
      sessionStorage.setItem(cookieName, userId);
    } else { // default to cookie
      this.setCookie(cookieName, userId, 730);
    }

    return userId;
  }
}