let allTiQAssets = [];
let results = {
  profiles: 0,
  tag: 0,
  loadrule: 0,
  extension: 0,
  datalayer: 0
};

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
  getLastPublishDetail: function (payload, pub_date) {
    try {
      let retval = {};
      let obj = payload.publish_history[pub_date][pub_date];

      retval.notes = this.decodeHTMLEntities(obj.notes);
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

    output = output.join("|");
    output = tiqHelper.decodeHTMLEntities(output);
    return output;
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
   * returns the doNotSell status for the specified TAG
   * @param {string} type - asset type (tag, extension, loadrule, datalayer)
   * @param {object} asset - the asset being evaluated
   * @returns {Boolean} true if DNS enabled for tag, otherwise false
   */
  getDoNotSellStatus: function (type, asset) {
    try {
      if (type === "tag") {
        let retval = "";

        for (key in utui.data.privacy_management.doNotSell.categories) {
          let tmp = utui.data.privacy_management.doNotSell.categories[key];

          tmp.tagid.forEach(function (item) {
            if (item.id === asset.id) {
              retval = item.doNotSell;
              return false; // break the loop
            }
          });

          if (retval !== "") {
            break;
          }
        }
        return retval;
      };
    } catch (err) {
      /*ignore*/ }
  },

  /**
   * cleans up strings to prevent unexpected/unnecessary line or column breaks when exporting to csv
   * @param {string} str - string to decode
   * @returns {string} - decoded string
   * @example tiqHelper.decodeHTMLEntities("this string has &quot;quotes&quot;") => "this string has \"quotes\""
   */
  decodeHTMLEntities: function (str) {
    let txt = document.createElement("textarea");
    txt.innerHTML = str.replace(/[\n,]/ig, "; ");
    return txt.value;
  },

  getLoadRulesByTag: function (tags_only, loadrules_only) {
    let loadRulesByTag = [];

    tags_only.forEach(function (item) {
      let loadRules = item.tagLoadRules.split("|");

      loadRules.forEach(function (lrule) {
        let tmpObj = {
          account: item.account,
          tagId: item.id,
          tagName: item.name,
          status: item.status,
          assetCategory: item.assetCategory,
          assetType: item.assetType,
          labels: item.labels,
          lastProdPubUser: item.lastProdPubUser,
          loadRuleId: lrule,
          parentLibrary: item.parentLibrary,
          profile: item.profile
        }

        loadrules_only.filter(function (lr) {
          if (lr.account === item.account && lr.profile === item.profile && lr.id === lrule) {
            tmpObj.loadRuleName = lr.name;
          }
        });
        loadRulesByTag.push(tmpObj);
      });
    });
    console.log("TIQ_AUDIT: LOAD RULES BY TAG", loadRulesByTag);
    tiqHelper.download(tiqHelper.convertToCSV(loadRulesByTag), "by-loadrule");
  },

  getDataLayerByTag: function (tags_only) {
    let dataLayerByTag = [];
    tags_only.forEach(function (item) {
      let mappedVars = item.mappedVars.split("|");

      mappedVars.forEach(function (mvar) {
        let tmpObj = {
          account: item.account,
          tagId: item.id,
          tagName: item.name,
          status: item.status,
          assetCategory: item.assetCategory,
          assetType: item.assetType,
          labels: item.labels,
          lastProdPubUser: item.lastProdPubUser,
          variable: mvar,
          parentLibrary: item.parentLibrary,
          profile: item.profile
        }

        dataLayerByTag.push(tmpObj);
      });
    });
    console.log("TIQ_AUDIT: DATA LAYER VARIABLES BY TAG", dataLayerByTag);
    tiqHelper.download(tiqHelper.convertToCSV(dataLayerByTag), "by-datalayer");
  },

  /**
   * returns a comma-delimited string of all assets; suitable for copy/paste into spreadsheet
   * @param {array} assets - an array of objects, where each object represents a single asset
   * @returns {string}
   * @example tiqHelper.convertToCSV(tiqHelper.getAllAssets());
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
   * downloads inventory as a csv file
   * @param {string} data - csv-formatted input
   * @param {*} tiq_account - name of tiq account, used in download file name: tiq-download-{{account}}.csv
   */
  download: function (data, suffix) {
    tiq_account = tiqHelper.account || "";
    let filename = 'tiq-inventory-' + tiq_account + ((suffix) ? "-" + suffix : "") + ".csv"
    const blob = new Blob([data], {
      type: 'text/csv'
    });

    // create object for download url
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url);
    a.setAttribute('download', filename);

    // download the file
    a.click();
  },

  /**
   * returns all asset types: tag, extension, loadrule, datalayer
   * @param {object} payload - profile object as provided by utui.profile.getProfile() method
   * @returns {array} an array of objects, where each object is a single asset
   */
  getAllAssets: function (payload) {
    let ACCOUNT = tiqHelper.account = payload.account || payload.settings.account;
    let PROFILE = payload.profile || payload.settings.profileid;
    let assetCategorysToRetrieve = ["tag", "extension", "loadrule", "datalayer"];
    let retval = [];

    // specifies the js object to evaluate for the asset type
    let assetSources = {
      tag: payload.manage,
      extension: payload.customizations,
      loadrule: payload.loadrules,
      datalayer: payload.define
    };

    assetCategorysToRetrieve.forEach(function (assetCategory) {
      let assets = assetSources[assetCategory];

      for (let key in assets) {
        results[assetCategory]++;
        let tmp = {};
        let loadRuleTagCounts = tiqHelper.getLoadRuleTagCount(assetCategory, assets[key]);
        let publishTargetsAndDates = tiqHelper.getPublishTargets(assetCategory, assets[key]);
        let lastProdPublishDetails = tiqHelper.getLastPublishDetail(payload, publishTargetsAndDates.prod);

        tmp.account = ACCOUNT;
        tmp.profile = PROFILE;
        tmp.parentLibrary = tiqHelper.getParentLibrary(assets[key]);
        tmp.assetType = assets[key].type;
        tmp.assetCategory = assetCategory;
        tmp.id = tiqHelper.getId(assetCategory, assets[key]);
        tmp.name = tiqHelper.getName(assetCategory, assets[key]);
        tmp.lastModified = publishTargetsAndDates.last_modified || "unpublished";
        tmp.lastDevPubDate = publishTargetsAndDates.dev || "unpublished";
        tmp.lastQAPubDate = publishTargetsAndDates.qa || "unpublished";
        tmp.lastProdPubDate = publishTargetsAndDates.prod || "unpublished";
        tmp.lastProdPubUser = lastProdPublishDetails.operator || "";
        tmp.lastProdPubNotes = lastProdPublishDetails.notes || "";
        tmp.type = tiqHelper.getType(assetCategory, assets[key]);
        tmp.status = tiqHelper.getStatus(assetCategory, assets[key]);
        tmp.labels = tiqHelper.getLabels(assetCategory, assets[key]);
        tmp.mappedVars = tiqHelper.getMappedVars(assetCategory, assets[key]);
        tmp.loadRuleTagsActive = loadRuleTagCounts.active;
        tmp.loadRuleTagsInactive = loadRuleTagCounts.inactive;
        tmp.tagLoadRules = tiqHelper.getLoadRulesForTags(assetCategory, assets[key]);
        tmp.extensionScope = tiqHelper.getExtensionScope(assetCategory, assets[key]);
        tmp.doNotSell = tiqHelper.getDoNotSellStatus(assetCategory, assets[key]);

        allTiQAssets.push(tmp);
        retval.push(tmp);
      }
    });

    return retval;
  }
};

// build and insert modal.....

const style = document.createElement('style'); // create style element
// set innerHTML to CSS styles for modal container
style.innerHTML = `
  #mytiq-inventory {
    /*display: flex; */
    position: fixed;
    padding: 10px;
    top: 50px;
    left: 50px;
    width: 75%;
    height: 75%;
    background-color: silver; /*rgba(0, 0, 0, 0.5);*/
    justify-content: center;
    align-items: center;
    z-index: 999;
    overflow: auto;
  }
`;
document.head.appendChild(style); // append style element to document head

function elementCleanup(ele) {
  if (ele) {
    ele.remove();
  }
}

function showHide(ele) {
console.log(ele, ele.style.display);
  if (ele) {
    if (ele.style.display === "none") {
      ele.style.display = "block";
    } else {
      ele.style.display = "none";
    }
  }
}

elementCleanup(document.getElementById("mytiq-inventory"));
let mytiq_form = document.createElement("form");
mytiq_form.setAttribute("id", "mytiq-inventory");

elementCleanup(document.getElementById("mytiq-fieldset"));
let mytiq_fs = document.createElement("fieldset");
mytiq_fs.id = "mytiq-fieldset";

elementCleanup(document.getElementById("mytiq-showhide"));
let mytiq_close_modal = document.createElement("a");
mytiq_close_modal.id = "mytiq-showhide";
mytiq_close_modal.innerHTML = "Close Modal<br>";
mytiq_close_modal.addEventListener("click", function () {
  showHide(document.getElementById("mytiq-inventory"));
});

elementCleanup(document.getElementById("mytiq-deselect"));
let mytiq_deselect_all = document.createElement("a");
mytiq_deselect_all.id = "mytiq-deselect";
mytiq_deselect_all.innerHTML = "De-select All<br>";
mytiq_deselect_all.addEventListener("click", function () {
  document.querySelectorAll("form#mytiq-inventory input[type='checkbox']").forEach(function (item) {
    item.checked = false;
  });
});

elementCleanup(document.getElementById("mytiq-select"));
let mytiq_select_all = document.createElement("a");
mytiq_select_all.id = "mytiq-select";
mytiq_select_all.innerHTML = "Select All<br><br>";
mytiq_select_all.addEventListener("click", function () {
  document.querySelectorAll("form#mytiq-inventory input[type='checkbox']").forEach(function (item) {
    item.checked = true;
  });
});

let mytiq_submit = document.createElement("input");
mytiq_submit.setAttribute("type", "button");
mytiq_submit.setAttribute("value", "Get Inventory");
mytiq_submit.addEventListener("click", function () {
  let checked = document.getElementById("mytiq-fieldset");
  let profiles = checked.querySelectorAll("input:checked");

  results = {
    profiles: 0,
    tag: 0,
    loadrule: 0,
    extension: 0,
    datalayer: 0
  }

  profiles.forEach(function (profile) {
    utui.profile.getProfile(null, {
      r: "getProfile",
      account: utui.login.account,
      profile: profile.id
    }, function (data) {
      tiqHelper.getAllAssets(data);
      results.profiles++
      console.log("TIQ_AUDIT: PROCESSING", results.profiles, "of", profiles.length, data.profile, data);

      if (results.profiles >= profiles.length) {
        console.log("TIQ_AUDIT: DONE", results.profiles, "of", profiles.length, results, allTiQAssets);

        tiqHelper.tagsOnly = allTiQAssets.filter(function (item) {
          if (item.assetCategory === "tag") {
            return item;
          }
        });

        tiqHelper.loadRulesOnly = allTiQAssets.filter(function (item) {
          if (item.assetCategory === "loadrule") {
            return item;
          }
        });

        if (confirm("Download FULL inventory?") === true) {
          tiqHelper.download(tiqHelper.convertToCSV(allTiQAssets), "full");
        }
        if (confirm("Download LOAD RULES broken out by tag?") === true) {
          tiqHelper.getLoadRulesByTag(tiqHelper.tagsOnly, tiqHelper.loadRulesOnly);
        }
        if (confirm("Download DATA LAYER variables broken out by tag?") === true) {
          tiqHelper.getDataLayerByTag(tiqHelper.tagsOnly);
        }
      }
    });
  });
    showHide(mytiq_form);
});

// retrieve all profile names (ids) and prep for display (with checkboxes) in modal
utui.automator.getAllProfiles(utui.login.account).then(function (profiles) {
  profiles = profiles.sort();
  profiles.forEach(function (profile, idx) {
    let div = document.createElement("div");
    div.verticalAlign = "middle";

    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.checked = true;
    input.setAttribute("id", profile);
    input.setAttribute("name", profile);
    input.setAttribute("style", "margin-right: 5px");

    let label = document.createElement("label");
    label.setAttribute("for", profile);
    label.innerText = (idx + 1) + " - " + profile;

    div.appendChild(input);
    div.appendChild(label);
    mytiq_fs.appendChild(div);
  });
});

mytiq_form.appendChild(mytiq_close_modal)
mytiq_form.appendChild(mytiq_deselect_all);
mytiq_form.appendChild(mytiq_select_all);
mytiq_form.appendChild(mytiq_submit);
mytiq_form.appendChild(mytiq_fs);

document.body.appendChild(mytiq_form);