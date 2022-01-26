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
   * keeps 'data' key in init() output clean (deduplicates values, etc)
   * @param {array} ary 
   * @param {string} key 
   * @returns {array}
   */
  addToDataList: function (ary, key) {
    if (!ary.includes(key)) {
      ary.push(key);
    }
    return ary;
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
        // use for all extension types
        if (/_source$/.test(key)) {
          this.addToDataList(data, extension[key]);
        }

        // use for specific extension types
        if (extension.extType === "Set Data Values") {
          if (/_set$/.test(key)) {
            this.addToDataList(data, extension[key]);
          }
        } else if (extension.extType === "Lookup Table") {
          if (key === "var" || key === "varlookup") {
            this.addToDataList(data, extension[key]);
          }
        } else if (extension.extType === "Join Data Values") {
          if (/_set$/.test(key) || key === "var") {
            this.addToDataList(data, extension[key]);
          }
        } else if (extension.extType === "Persist Data Value") {
          if (key === "var" || key === "settovar") {
            this.addToDataList(data, extension[key]);
          }
        }
      }

      this.exts.push({
        _id: extension._id,
        type: extension.extType,
        title: extension.title,
        status: extension.status,
        scope: extension.scope.replaceAll(",","|"),
        data: data.join("|")
      });
    }

    return this.convertToCSV(this.exts);
  }
}

console.log(getExtVars.init());