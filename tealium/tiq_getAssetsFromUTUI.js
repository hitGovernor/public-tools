var tiqHelper = {
  /**
   * returns the asset's ID
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// "14"
   */
  getId: function (type, asset) {
    try {
      return asset._id || "";
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's name
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// "Name of Tag"
   * @example
   */
  getName: function (type, asset) {
    try {
      var retval = (type === "datalayer") ? asset.name : asset.title;
      return retval;
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's template type
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// "Tealium Generic Tag", "Lookup Table", "Floodlight (gtag.js)"
   */
  getType: function (type, asset) {
    try {
      var retval = "";
      if (type === "datalayer") {
        retval = asset.type;
      } else if (type === "tag") {
        retval = asset.tag_name;
      } else if (type === "extension") {
        retval = asset.extType;
      }
      return retval;
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's status (active/inactive)
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// "active"
   */
  getStatus: function (type, asset) {
    try {
      return asset.status || "";
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's active environments (dev,qa,prod)
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - "dev|prod|qa"
   */
  getPublishRevisions: function (type, asset) {
    try {
      return Object.keys(asset.publish_revisions.svr_save_timestamps).sort().join("|")
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's last modified date (yyyymmddhhmm)
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// 202102040010
   */
  getLastModified: function (type, asset) {
    try {
      return asset.publish_revisions.last_modified;
    } catch (err) {
      return "";
    }
  },

  /**
   * returns any labels assigned to the asset
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluate
   * @returns {string} - eg// "label-1"
   */
  getLabels: function (type, asset) {
    try {
      var retval = asset.labels || "";
      if (asset.imported) {
        retval += (retval) ? "," + asset.imported : asset.imported;
      }
      return retval;
    } catch (err) {
      return "";
    }
  },

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
   * shortcut for getting all assets of all types
   * @returns {array} an array of objects, where each object is a single asset
   * @example tiqHelper.getAllAssets();
   */
  getAllAssets: function () {
    var retval = this.getAssetsByType("tag", "extension", "loadrule", "datalayer");
    return retval;
  },

  /**
   * returns specified asset types: tag, extension, loadrule, datalayer; accepts 0 - n parameters
   * @param {...string=} asset_type - type of asset(s) to return
   * @returns {array} an array of objects, where each object is a single asset
   * @example tiqHelper.getAssetsByType("tag");
   * // returns all assets of type "tag"
   * @example tiqHelper.getAssetsByType("tag", "extension", "loadrule");
   * // returns all assets of type "tag", "extension", and "loadrule"
   */
  getAssetsByType: function () {
    var tagsToGet = Array.from(arguments),
      retval = [];

    // specifies the js object to evaluate for the asset type
    var assetSources = {
      tag: utui.data.manage,
      extension: utui.data.customizations,
      loadrule: utui.data.loadrules,
      datalayer: utui.data.define
    };

    tagsToGet.forEach(function (item) {
      var assets = assetSources[item];

      for (var key in assets) {
        var tmp = {};
        tmp.assetType = item;
        tmp.id = tiqHelper.getId(item, assets[key]);
        tmp.name = tiqHelper.getName(item, assets[key]);
        tmp.publishedTargets = tiqHelper.getPublishRevisions(item, assets[key]);
        tmp.type = tiqHelper.getType(item, assets[key]);
        tmp.status = tiqHelper.getStatus(item, assets[key]);
        tmp.labels = tiqHelper.getLabels(item, assets[key]);
        tmp.lastModified = tiqHelper.getLastModified(item, assets[key]);

        retval.push(tmp);
      }
    });

    return retval;
  }
};

var myTiQAssets = tiqHelper.getAllAssets();

// asks the user how they want the output; only 'table' and 'csv' are accepted, all other values do nothing
var userInput = prompt("Sepcify your preferred format:\n\n* table: Displays assets using console.table()\n* csv: Displays assets as a comma-delimited string\n\nNote: Make sure you are in TiQ, with the Data Layer tab selected.", "table", "csv");
if (/^csv$/i.test(userInput)) {
  console.log(tiqHelper.convertToCSV(myTiQAssets));
} else if (/^table$/i.test(userInput)) {
  console.table(myTiQAssets);
} else {
  console.log("tiqHelper: Invalid input. Please specify \"csv\" or \"table\".");
}