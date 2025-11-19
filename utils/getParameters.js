/**
 * Retrieves parameter values from a given query string, case-insensitively.
 *
 * - If 'name' is a string, returns the single value (string or null).
 * - If 'name' is an array, returns an object of {name: value} pairs.
 * - Automatically prepends '?' to searchString if missing.
 * - Defaults to window.location.search if no searchString is provided.
 *
 * @param {string | string[]} name The parameter name(s) to find.
 * @param {string} [searchString=window.location.search] The string to search within.
 * @returns {string | null | Object<string, string | null>} The result.
 */
let getParameters = function(name, searchString = window.location.search) {
  const paramSource = (searchString && !searchString.startsWith("?")) ? "?" + searchString : searchString;

  const params = new URLSearchParams(paramSource);

  /**
   * Finds a single parameter value given the URLSearchParams object and name.
   * @param {string} targetName 
   * @returns {string | null}
   */
  const findParamValue = (targetName) => {
    const searchNameLower = targetName.toLowerCase();
    const foundEntry = [...params.entries()].find(([key]) => {
      return key.toLowerCase() === searchNameLower;
    });

    return foundEntry ? foundEntry[1] : null;
  };

  if (Array.isArray(name)) {
    return name.reduce((accumulator, currentName) => { // Use reduce to iterate over the array and build the result object
      if (typeof currentName === 'string') {
        accumulator[currentName] = findParamValue(currentName); // Call the helper function for each name and assign the result
      }
      return accumulator;
    }, {});

  } else if (typeof name === 'string') {
    return findParamValue(name);

  } else {
    return null; // return null for unexpected input types
  }
}


/// // /// // /// // /// // /// // /// // /// // /// // /// // ///
// /// // /// // /// // /// // /// // /// // /// // /// // /// //
/// // /// // /// // /// // /// // /// // /// // /// // /// // ///

let tests = [];
tests.push({ "param": "test", "search": "test=test" });
tests.push({ "param": "test", "search": "" });
tests.push({ "param": "test", "search": "test=test&next=next" });
tests.push({ "param": "doesnotexist", "search": "test=test&next=next" });
tests.push({ "param": ["test"], "search": "test=test&next=next" });
tests.push({ "param": ["test"], "search": "" });
tests.push({ "param": ["test", "next"], "search": "test=test&next=next" });
tests.push({ "param": ["doesnotexist"], "search": "test=test&next=next" });

tests.forEach(function (test, idx) {
  console.log(idx, JSON.stringify(test), getParameters(test.param, test.search));
});