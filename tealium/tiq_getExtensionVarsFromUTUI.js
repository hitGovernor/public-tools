const getExtVars = {
  exts: [],

  /**
   * returns a comma-delimited string of all assets; suitable for copy/paste into spreadsheet
   * @param {array} assets - an array of objects, where each object represents a single asset
   * @returns {string}
   * @example tiqHelper.convertToCSV(tiqHelper.getAllAssets());
   * @example var allAssets=tiqHelper.getAllAssets(); tiqHelper.convertToCSV(allAssets);
   */
  convertToCSV: function (assets) {
    var allBody = [],
      headers = [];

    // build the csv header row based on keys in first asset
    for (var key in assets[0]) {
      headers.push(key);
    }
    headers = headers.join(",") + "\n";

    // loop throug all assets to build the individual rows
    for (var item in assets) {
      var tmp = assets[item],
        tmpArray = [];

      for (var key in tmp) {
        tmpArray.push(tmp[key]);
      }

      allBody.push(tmpArray.join(","));
    }

    // join everything together w/ line breaks between asset rows
    return headers + allBody.join("\n");
  },

  /**
   * evaulates specified extension types, returning a list of data layer variables found in each
   * @returns {string}
   */
  init: function () {
    for (var item in utui.data.customizations) {
      var extension = utui.data.customizations[item];

      var data = [];
      for (var key in extension) {
        if (extension.extType === "Set Data Values") {
          if (/_set$/.test(key)) {
            data.push(extension[key]);
          }
        } else if (extension.extType === "Lookup Table") {
          if (key === "var" || key === "varlookup") {
            data.push(extension[key]);
          }
        } else if (extension.extType === "Join Data Values") {
          if (/_set$/.test(key) || key === "var") {
            data.push(extension[key]);
          }
        }
      }

      this.exts.push({
        _id: extension._id,
        type: extension.extType,
        title: extension.title,
        status: extension.status,
        data: data
      });
    }

    return this.convertToCSV(this.exts);
  }
}

console.log(getExtVars.init());