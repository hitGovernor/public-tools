var callCompare = {
  /**
   * compares one object against another, starting with left[key] vs right[key]
   * @param left {object}
   * @param right {object}
   * @returns {object}
   */
  compare: function (left, right) {
    var result = {};

    // start comparison with left object as source of truth
    for (var key in left) {
      // don't look at keys with no name
      if (key !== "") {
        result[key] = {
          leftVal: left[key],
          rightVal: right[key]
        };

        if (right.hasOwnProperty(key)) {
          if (left[key] === right[key]) { // are the values the same?
            result[key].result = "exact";
          } else {
            result[key].result = "exists"; // do both objects have the key, but different values?
          }

          // remove from right key since we've already done the comparison
          delete right[key];
        } else {
          result[key].result = "left-only"; // we've checked, the key is left only
        }
      }
    }

    // anything left in the right object is right-only
    for (var key in right) {
      if (key !== "") {
        if (!result.hasOwnProperty[key]) {
          result[key] = {
            leftVal: left[key],
            rightVal: right[key],
            result: "right-only"
          }
        }
      }
    }

    // return the result object with all findings
    return result;
  },

  /**
   * parses url string into object of key/value pairs
   * @param url {string}
   * @returns {object}
   */
  parseIt: function (url) {
    var retval = {},
      urlSegment = url.split("?"),
      httpInfo = urlSegment[0].split("/");

    // account for protocol, hostname, and path info
    for (var i = 0, max = httpInfo.length; i < max; i++) {
      if (httpInfo[i] !== "") {
        retval["http" + i] = httpInfo[i];
      }
    }

    // if no params after "?", assume all ";" delimiters (ie// DCM, Google Ads)
    if (urlSegment.length === 1) {
      if(urlSegment[0].indexOf(";") > -1) {
        urlSegment[1] = httpInfo[httpInfo.length - 1].replace(/;/g, "&");
        delete retval["http" + (httpInfo.length - 1)];
      }
    }

    // parse all parameters
    if (urlSegment.length > 1) {
      for (var i = 0, max = urlSegment[1].length; i < max; i++) {
        var separator = "&";
        var params = urlSegment[1].split(separator);

        for (var i = 0, max = params.length; i < max; i++) {
          var tmp = params[i].split("=");
          retval[tmp[0]] = decodeURIComponent(tmp[1]);
        }
      }
    }

    // return fully parsed object of key/value pairs
    return retval;
  },

  mergeLeftRight: function (aryLeft, aryRight) {
    var retval = [];
    for (var i = 0, max = aryLeft.length; i < max; i++) {

      // clean up trailing characters
      aryLeft[i] = aryLeft[i].replace(/[\/\?]$/, "");
      aryRight[i] = aryRight[i].replace(/[\/\?]$/, "");

      retval.push({
        left: aryLeft[i],
        right: aryRight[i]
      });
    }

    return retval;
  }
}


var tests = [];
tests.push({
  left: "https://www.example.com/something?a=b&c=d&e=f",
  right: "https://www.example.com/something?a=b&c=e"
});
tests.push({
  left: "https://www.example.com/something?a=b&c=d",
  right: "https://www.example.com/something?a=b&c=e&x=y"
});
tests.push({
  left: "https://www.example.com/something?a=b&c=d&y=z",
  right: "https://www.example.com/something?a=b&c=e&x=y"
});
tests.push({
  left: "https://ad.doubleclick.net/ddm/activity/src=xxxxx1984865;type=abc123;cat=evocom00;u93=[CS]v1aaa111bbb222ccc333-zzz999yyy888xxx777[CE];u94=11111111222222223333333344444444;dc_rdid=%20;ord=1;num=920837467;u38=fb.1.1234567879741.987654321",
  right: "https://ad.doubleclick.net/ddm/activity/src=aaaaa1984865;type=abc123;cat=evocom00;u93=[CS]v1aaa111bbb222ccc333-zzz999yyy888xxx777[CE];u94=11111111222222223333333344444444;dc_rdid=%20;ord=1;num=920837467;u38=fb.1.1234567879741.987654321"
});
tests.push({
  left: "https://www.example.com/something/a",
  right: "https://www.example.com/something"
});

var output = [];
for (var i = 0, max = tests.length; i < max; i++) {
  var left = callCompare.parseIt(tests[i].left),
    right = callCompare.parseIt(tests[i].right);

  var result = callCompare.compare(left, right);
  console.table(result);
  output.push(result);
}