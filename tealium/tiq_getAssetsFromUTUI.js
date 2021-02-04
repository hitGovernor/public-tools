var tiqHelper = {
  getId: function (type, asset) {
    try {
      return asset._id || "";
    } catch (err) {
      return "";
    }
  },

  getName: function (type, asset) {
    try {
      var retval = (type === "datalayer") ? asset.name : asset.title;
      return retval;
    } catch (err) {
      return "";
    }
  },

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

  getStatus: function (type, asset) {
    try {
      return asset.status || "";
    } catch (err) {
      return "";
    }
  },

  getPublishRevisions: function (type, asset) {
    try {
      return Object.keys(asset.publish_revisions.svr_save_timestamps).sort().join("|")
    } catch (err) {
      return "";
    }
  },

  getLastModified: function (type, asset) {
    try {
      return asset.publish_revisions.last_modified;
    } catch (err) {
      return "";
    }
  },

  getLabels: function (type, asset) {
    try {
      var retval = asset.labels || "";
      if (asset.imported) {
        retval += (retval) ? "," + asset.imported : asset.imported;
      }
      return retval;
    } catch (err) {
      return "ERROR";
    }
  },

  // build csv output
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

  // shortcut for getting all assets of all types
  getAllAssets: function () {
    var retval = this.getAssetsByType("tag", "extension", "loadrule", "datalayer");
    return retval;
  },

  // returns specified asset types; accepts 0 - n parameters
  // parameters must match item keys in the assetSources object in the fn
  // getAssetsByType("tag"), getAssetsByType("tag","datalayer")...
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
// var myTiQAssets = tiqHelper.getAssetsByType("tag");
// console.table(myTiQAssets);
// console.log(tiqHelper.convertToCSV(myTiQAssets));

// asks the user how they want the output; only 'table' and 'csv' are accepted, all other values do nothing
var userInput = prompt("Sepcify your preferred format:\n\n* table: Displays assets using console.table()\n* csv: Displays assets as a comma-delimited string\n\nNote: Make sure you are in TiQ, with the Data Layer tab selected.", "table", "csv");
if (/^csv$/i.test(userInput)) {
  console.log(tiqHelper.convertToCSV(myTiQAssets));
} else if(/^table$/i.test(userInput)) {
  console.table(myTiQAssets);
} else {
  console.log("tiqHelper: Invalid input. Please specify \"csv\" or \"table\".");
}