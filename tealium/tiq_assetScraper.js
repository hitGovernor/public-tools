let ACCOUNT = document.querySelector("div#profile_legend_account").innerText + "|" + document.querySelector("div#profile_legend_profile").innerText;
// if the element exists, returns the innerText, otherwise an empty string
function getInnerText(ele) {
  if (ele) {
    return ele.innerText;
  }

  return "";
}

// executes the query selectors and builds the output
function getAssets(assetInfo) {
  document.querySelectorAll(assetInfo.row).forEach(function (row) {
    var tmp = {};
    tmp.account = ACCOUNT;
    tmp.assetType = assetInfo.assetType;
    tmp.uid = (assetInfo.uid) ? getInnerText(row.querySelector(assetInfo.uid)) : "";
    tmp.name = (assetInfo.name) ? getInnerText(row.querySelector(assetInfo.name)) : "";
    tmp.alias = (assetInfo.alias) ? getInnerText(row.querySelector(assetInfo.alias)) : "";
    tmp.type = (assetInfo.type) ? getInnerText(row.querySelector(assetInfo.type)) : "";
    tmp.isEnabled = (assetInfo.isEnabled) ? ((row.querySelector(assetInfo.isEnabled)) ? true : false) : "";

    outputStr += buildRow(tmp);
    output.push(tmp);
  });
}

// builds the csv string
function buildRow(obj) {
  var str = "";
  str += "\n" + obj.assetType || "";
  str += "," + obj.uid || "";
  str += "," + obj.name || "";
  str += "," + obj.alias || "";
  str += "," + obj.type || "";
  str += "," + obj.isEnabled || "";

  return str;
}

var output = [],
  outputStr = "assetType,uid,name,alias,type,isEnabled";

// defines the query selectors for each asset type
var criteria = {
  tags: {
    row: "div[id*='manage_content_'].manage_container",
    assetType: "tag",
    uid: "div.cth-cell__uid span.uidValue",
    name: "div.cth-cell__name span.title",
    alias: "",
    type: "div.cth-cell__type div.container_vendor",
    isEnabled: "div.cth-cell__activate span.container_status_active"
  },
  extensions: {
    row: "div[id*='customizations_'].customize_container",
    assetType: "extension",
    uid: "div.cth-cell__uid div.container_uid",
    name: "div.cth-cell__name span.title",
    alias: "",
    type: "div.cth-cell__type div.container_exType",
    isEnabled: "div.cth-cell__activate span.container_status_active"
  },
  load_rules: {
    row: "div[id*='loadrules_content_'].loadrules_container",
    assetType: "load_rule",
    uid: "div.cth-cell__uid span.uidValue",
    name: "div.cth-cell__name span.title",
    alias: "",
    type: "",
    isEnabled: "div.cth-cell__activate span.container_status_active"
  },
  data_layer: {
    row: "div[id*='datasources_'].viewItem",
    assetType: "data_layer",
    uid: "", // row.getAttribute("data-id")
    name: "div.cth-cell__name div.item-variable",
    alias: "div.cth-cell__name div.item-name-alias",
    type: "div.cth-cell__type div.type",
    isEnabled: ""
  }
};

// pulls it all together
for (var obj in criteria) {
  getAssets(criteria[obj]);
}

// asks the user how they want the output; only 'table' and 'csv' are accepted, all other values do nothing
var userInput = prompt("Sepcify your preferred format:\n\n* table: Displays assets using console.table()\n* csv: Displays assets as a comma-delimited string\n\nNote: Make sure you are in TiQ, with the Data Layer tab selected.", "table", "csv");
if (/^csv$/i.test(userInput)) {
  console.log(outputStr);
} else if(/^table$/i.test(userInput)) {
  console.table(output);
}