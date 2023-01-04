let tiqHelper = {
  /**
   * returns the asset's ID
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
   * @returns {string} - eg// "14"
   */
  getId: function (type, asset) {
    try {
      return asset._id || asset.id || "";
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's name
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
   * @returns {string} - eg// "Name of Tag"
   * @example
   */
  getName: function (type, asset) {
    try {
      let retval = (type === "datalayer") ? asset.name : asset.title;
      retval = retval.replace(/[,\t]/g, " ");
      return retval;
    } catch (err) {
      return "";
    }
  },

  /**
   * returns the asset's template type
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
   * @returns {string} - eg// "Tealium Generic Tag", "Lookup Table", "Floodlight (gtag.js)"
   */
  getType: function (type, asset) {
    try {
      let retval = "";
      if (type === "datalayer") {
        retval = asset.type;
      } else if (type === "tag") {
        retval = asset.tag_name;
        retval += (asset.config_tagtype) ? " - " + asset.config_tagtype : "";
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
   * @param {object} asset - the asset being evaluated
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
   * @param {object} asset - the asset being evaluated
   * @returns {object} - {"last_modified": "202301011234", "dev": "202301011234", "qa": "202301011234", "prod": "202301011234"}
   */
  getPublishTargets: function (type, asset) {
    try {
      let retval = {
        last_modified: asset.publish_revisions.last_modified
      };

      Object.assign(retval, asset.publish_revisions.svr_save_timestamps);
      return retval;
    } catch (err) {
      return {};
    }
  },

  /**
   * returns details about the asset's latest publish
   * @param {string} pub_date - last publish date (yyyymmddhhmm)
   * @returns {object} - {"operator": "user@domain.com", "notes": "release includes these changes..."}
   */
  getLastPublishDetail: function (pub_date) {
    try {
      let retval = {};
      let obj = utui.data.publish_history[pub_date][pub_date];

      retval.notes = obj.notes;
      retval.operator = obj.operator;

      return retval;
    } catch (err) {
      return {};
    }
  },

  /**
   * returns the asset's last modified date (yyyymmddhhmm)
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
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
   * returns a list of all data layer variables that have been mapped
   * to the specified asset (tag, extension, load rule)
   * @param {string} type - specifies asset type (tag, extension, loadrule)
   * @param {object} asset = the asset being evaluated (tag, extension, loadrule)
   * @returns {string}
   */
  getMappedVars: function (type, asset) {
    let output = [];
    if (type === "tag") {
      for (let mapped in asset.map) {
        output.push(asset.map[mapped].type + "." + asset.map[mapped].key);
      }
    } else if (type === "extension") {
      for (let key in asset) {
        // use for all extension types
        if (/_source$/.test(key)) {
          this.addToDataList(output, asset[key]);
        }

        // use for specific extension types
        if (asset.extType === "Set Data Values") {
          if (/_set$/.test(key)) {
            this.addToDataList(output, asset[key]);
          }
        } else if (asset.extType === "Lookup Table") {
          if (key === "var" || key === "varlookup") {
            this.addToDataList(output, asset[key]);
          }
        } else if (asset.extType === "Join Data Values") {
          if (/_set$/.test(key) || key === "var") {
            this.addToDataList(output, asset[key]);
          }
        } else if (asset.extType === "Persist Data Value") {
          if (key === "var" || key === "settovar") {
            this.addToDataList(output, asset[key]);
          }
        }
      }
    } else if (type === "loadrule") {
      for (let key in asset) {
        if (typeof asset[key] === "object") {
          for (let subkey in asset[key]) {
            if (/^input_/.test(subkey)) {
              this.addToDataList(output, asset[key][subkey]);
            }
          }
        }
      }
    }

    return output.join("|");
    // return output;
  },

  /**
   * returns an object with the number of active, inactive, and total tags assigned to a load rule
   * @param {string} type - specifies asset type (tag, extension, loadrule)
   * @param {object} asset = the asset being evaluated (tag, extension, loadrule)
   * @returns {string} - eg// { active: 15, inactive: 2, total: 17 }
   */
  getLoadRuleTagCount: function (type, asset) {
    if (type === "loadrule") {
      return utui.loadrules.getTagsScopedCount(asset) || {};
    } else {
      return {
        active: "",
        inactive: "",
        total: ""
      };
    }
  },

  /**
   * returns a pipe-delimited list of load rules (UID) associated with each tag
   * @param {string} type - specifies asset type (tag, extension, loadrule)
   * @param {object} asset = the asset being evaluated (tag, extension, loadrule)
   * @returns {string} - eg// "2", "15|29"
   */
  getLoadRulesForTags: function (type, asset) {
    if (type === "tag") {
      return asset.loadrule.replaceAll(",", "|");
      // return asset.loadrule.split(",");
    } else {
      return "";
      // return [];
    }
  },

  /**
   * returns the scope of each extension; if scoped to multiple tags, the result
   * will be a pipe-delimited list of tag UIDs
   * @param {string} type - specifies asset type (tag, extension, loadrule)
   * @param {object} asset = the asset being evaluated (tag, extension, loadrule)
   * @returns {string} - eg// "global", "domready", "2", "15|29"
   */
  getExtensionScope: function (type, asset) {
    if (type === "extension") {
      return asset.scope.replaceAll(",", "|");
      // return asset.scope.split(",");
    } else {
      return "";
      // return [];
    }
  },

  /**
   * returns any labels assigned to the asset
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
   * @returns {string} - eg// "label-1"
   */
  getLabels: function (type, asset) {
    try {
      let retval = [];

      if (asset.labels) {
        asset.labels.split(",").forEach(function (item) {
          retval.push(utui.data.labels[item].name);
        });
      }

      if (asset.imported) {
        retval.push(asset.imported);
      }

      return retval.join("|");
      // return retval;
    } catch (err) {
      return "";
      // return [];
    }
  },

  /**
   * returns the library name if asset comes from a library
   * @param {object} asset - the asset being evaluated
   * @returns {string}
   */
  getParentLibrary: function (asset) {
    try {
      return asset.settings.profileid;
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
    let allBody = [];
    let headers = [];

    // build the csv header row based on keys in first asset
    headers = Object.keys(assets[0]).join(",") + "\n";

    // loop throug all assets to build the individual rows
    for (let item in assets) {
      let tmp = assets[item],
        tmpArray = [];

      for (let key in tmp) {
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
    let retval = this.getAssetsByType("tag", "extension", "loadrule", "datalayer");
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
    let ACCOUNT = document.getElementById("profile_legend_account").innerText;
    let PROFILE = document.getElementById("profile_legend_profile").innerText;
    let tagsToGet = Array.from(arguments);
    let retval = [];

    // specifies the js object to evaluate for the asset type
    let assetSources = {
      tag: utui.data.manage,
      extension: utui.data.customizations,
      loadrule: utui.data.loadrules,
      datalayer: utui.data.define
    };

    tagsToGet.forEach(function (item) {
      let assets = assetSources[item];

      for (let key in assets) {
        let tmp = {};
        let loadRuleTagCounts = tiqHelper.getLoadRuleTagCount(item, assets[key]);
        let publishTargetsAndDates = tiqHelper.getPublishTargets(item, assets[key]);
        let lastProdPublishDetails = tiqHelper.getLastPublishDetail(publishTargetsAndDates.prod);

        tmp.account = ACCOUNT;
        tmp.profile = PROFILE;
        tmp.parentLibrary = tiqHelper.getParentLibrary(assets[key]);
        tmp.assetType = item;
        tmp.id = tiqHelper.getId(item, assets[key]);
        tmp.name = tiqHelper.getName(item, assets[key]);
        tmp.lastModified = publishTargetsAndDates.last_modified || "unpublished";
        tmp.lastDevPubDate = publishTargetsAndDates.dev || "unpublished";
        tmp.lastQAPubDate = publishTargetsAndDates.qa || "unpublished";
        tmp.lastProdPubDate = publishTargetsAndDates.prod || "unpublished";
        tmp.lastProdPubUser = lastProdPublishDetails.operator || "";
        tmp.lastProdPubNotes = lastProdPublishDetails.notes || "";
        tmp.type = tiqHelper.getType(item, assets[key]);
        tmp.status = tiqHelper.getStatus(item, assets[key]);
        tmp.labels = tiqHelper.getLabels(item, assets[key]);
        tmp.mappedVars = tiqHelper.getMappedVars(item, assets[key]);
        tmp.loadRuleTagsActive = loadRuleTagCounts.active;
        tmp.loadRuleTagsInactive = loadRuleTagCounts.inactive;
        tmp.tagLoadRules = tiqHelper.getLoadRulesForTags(item, assets[key]);
        tmp.extensionScope = tiqHelper.getExtensionScope(item, assets[key]);

        retval.push(tmp);
      }
    });

    return retval;
  }
};

let myTiQAssets = tiqHelper.getAllAssets();

// asks the user how they want the output; only 'table' and 'csv' are accepted, all other values do nothing
let userInput = prompt("Sepcify your preferred format:\n\n* table: Displays assets using console.table()\n* csv: Displays assets as a comma-delimited string\n\nNote: Make sure you are in TiQ, with the Data Layer tab selected.", "table", "csv");
if (/^csv$/i.test(userInput)) {
  console.log(tiqHelper.convertToCSV(myTiQAssets));
} else if (/^table$/i.test(userInput)) {
  console.table(myTiQAssets);
} else {
  console.log("tiqHelper: Invalid input. Please specify \"csv\" or \"table\".");
}