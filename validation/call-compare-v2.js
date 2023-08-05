// parses url parameters into an object of [key, value] pairs
let parseParams = function (params) {
  let retval = {};

  params = params.substr(1).split("&");
  params.forEach(function (item) {
    let tmp = item.split("=");
    retval[tmp[0]] = tmp[1];
  });

  return retval;
}

// flattens json object keys
let flattenObject = (obj = {}, res = {}, extraKey = '') => {
  for (key in obj) {
    if (typeof obj[key] !== 'object') {
      res[extraKey + key] = obj[key];
    } else {
      flattenObject(obj[key], res, `${extraKey}${key}.`);
    };
  };

  return res;
};

// does comparisons and returns results
let buildResult = function (type, keyName, leftVal, rightVal) {
  let retval = {
    type: type,
    key: keyName,
    left: leftVal || "",
    right: rightVal || "",
    leftOnly: (leftVal && !rightVal) ? true : false,
    rightOnly: (rightVal && !leftVal) ? true : false,
    exact: (leftVal === rightVal) ? true : false,
    exists: (leftVal && rightVal && (leftVal !== rightVal)) ? true : false
  };

  return retval;
}

// determines if url or json object to compare
let getCompareType = function (left) {
  if (left) {
    try {
      new URL(left);
      return "url";
    } catch (err) {
      return "json";
    }
  } else {
    return false
  }
}

// returns deduplicated list of merged object keys
let mergeKeys = function (left, right) {
  let retval = [];

  for (key in left) {
    if(key && key !== "") retval.push(key);
  }

  for (key in right) {
    if (!retval.includes(key)) {
      if(key && key !== "") retval.push(key);
    }
  }
  return retval;
}

let doCompare = function (lurl, rurl) {
  let result = [];
  let compareType = getCompareType(lurl, rurl);

  if (compareType === "url") {
    // convert url strings into url objects for easy reference
    let urlLeft = new URL(lurl);
    let urlRight = (rurl) ? new URL(rurl) : urlLeft; // if no right url, assume self-compare with left
    let leftParams = parseParams(urlLeft.search);
    let rightParams = parseParams(urlRight.search);
    let paramKeys = mergeKeys(leftParams, rightParams);

    // begin compare everything BUT search params
    ['origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'hash'].forEach(function (key) {
      result.push(buildResult("url", key, urlLeft[key], urlRight[key]));
    });

    // begin compare search params
    paramKeys.forEach(function (item) {
      result.push(buildResult("param", item, leftParams[item], rightParams[item]));
    });
  } else if (compareType) { // if not url, assume json object
    let leftObj = flattenObject(lurl);
    let rightObj = (rurl) ? flattenObject(rurl) : leftObj; // if no right obj, assume self-compare with left
    let paramKeys = mergeKeys(leftObj, rightObj);

    paramKeys.forEach(function (item) {
      result.push(buildResult("json", item, leftObj[item], rightObj[item]));
    });
  } else {
    console.log("invalid comparison type, lefthand side");
    return false;
  }

  return result;
}

/// /// /// /// /// /// /// /// /// /// /// ///
// // // // // // // // // // // // // // // //
/// /// /// /// /// /// /// /// /// /// /// ///
// // // // // // // // // // // // // // // //

let tests = [];
tests.push({
  left: "https://team-demo.github.io/call-compare/static/js/main.5c4fb26c.js?a=1&b=2&c=3#no=way",
  right: "https://team-demo.github.io/call-compare/static/js/main.5c4fb26c.js?a=1&b=2&d=4#nos=way"
});
tests.push({
  left: "https://team-demo.github.io:80/b/call-compare/static/js/main.5c4fb26c.js?a=1&b=2&c=3#no=way",
  right: "http://team-demo.github.io/call-compare/static/js/main.5c4fb26c.js?a=1&b=2&d=4#nos=way"
});
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
tests.push({
  left: "https://www.example.com/something/a",
  right: "https://www.example.com/something?first=param"
});
tests.push({
  left: "https://www.example.com/something/a?second=param",
  right: "https://www.example.com/something?first=param"
});
tests.push({
  left: {
    one: {
      two: {
        three: [{
          one: "again"
        }, {
          two: "two"
        }]
      }
    },
    two: "two",
    three: "three"
  },
  right: {
    one: {
      two: {
        three: [{
          one: "again"
        }, {
          two: "two2"
        }]
      }
    },
    two: "two",
    four: "four"
  }
});

tests.forEach(function (test, idx) {
  idx++;
  console.log("TEST #" + idx);
  console.table(doCompare(test.left, test.right));
});