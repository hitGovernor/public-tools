/**
 * 
 * @param sampleRate {Number} sample percent from 0 - 100
 * @param override {Boolean=} overrides sampling to return a specified true|false result
 * @returns {Boolean} true===sampled (included); false===not sampled (excluded)
 */
let isSampled = (sampleRate, override) => {
  // make sure override is Boolean
  override = override === 'true' ? true : (override === 'false' ? false : override);

  // if Boolean override value is provided, return that value (otherwise ignore override)
  if (override === true || override === false) {
    return override;
  }

  // make sure sampleRate is a number between 0 and 100
  if (typeof sampleRate !== 'number' || sampleRate < 0 || sampleRate > 100) {
    console.warn('Number between 0 and 100 expected, ' + sampleRate + ' (' + typeof (sampleRate) + ') provided; request not sampled');
    return false;
  }

  // determine sampling and return Boolean result
  let randomNumber = Math.random() * 100;
  return randomNumber < sampleRate;
}

/// TESTING TESTING TESTING
/// TESTING TESTING TESTING
/// TESTING TESTING TESTING

// // proving specified sample rate is achieved
// let result = {
//   t: 0, // count of sampled
//   f: 0, // count of not sampled
//   ttl: 0 // total count
// }
// while (result.ttl < 100000) {
//   let status = isSampled(5);
//   (status) ? result.t++: result.f++;
//   result.ttl++;
// }
// console.log(result);

// // example showing how to use to set sampling for a browser session
// let sampleStorageKeyName = "is_sampled";
// sessionStorage.setItem(sampleStorageKeyName, isSampled(100, sessionStorage.getItem(sampleStorageKeyName)));
// console.log(sessionStorage.getItem(sampleStorageKeyName));

// test confirm various outputs based on input
let tests = [];
tests.push({ rate: 50, override: true, expected: true }); // expect override value
tests.push({ rate: 50, override: false, expected: false }); // expect override value
tests.push({ rate: 50, override: 'true', expected: true }); // expect override value (Boolean preferred, string accepted)
tests.push({ rate: 50, override: 'false', expected: false }); // expect override value (Boolean preferred, string accepted)
tests.push({ rate: "50", override: undefined, expected: false }); // rate allows only number types
tests.push({ rate: {}, override: undefined, expected: false }); // rate allows only number types
tests.push({ rate: true, override: undefined, expected: false }); // rate allows only number types
tests.push({ rate: function(){}, override: undefined, expected: false }); // rate allows only number types
tests.push({ rate: 50, override: 'shoe', expected: undefined }); // Boolean expected for override
tests.push({ rate: 50, override: undefined, expected: undefined }); // random result expected
tests.push({ rate: 0, override: undefined, expected: false }); // 0% sample, expect false
tests.push({ rate: 100, override: undefined, expected: true }); // 100% sample, expect true

let output = [];
tests.forEach(function (test) {
  let result = {};
  result.isSampled = isSampled(test.rate, test.override);
  result.success = (typeof(test.expected) === 'boolean') ? (result.isSampled === test.expected) : undefined;
  result = {
    ...test,
    ...result
  }
  output.push(result);
});
console.table(output);