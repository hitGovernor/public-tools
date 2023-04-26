let extensions = utui.data.customizations;
let delimiter = "~~";
let csvTitles = [
  "id",
  "title",
  "type",
  "loadOrder",
  "status",
  "scope",
  "advExecOption",
  // "lastProdPubUser",
  // "lastProdPubVersion",
  "conditions"
].join(delimiter);
let output = [csvTitles];

let getConditions = function (payload) {
  let conditions = [];
  let retval = "";
  for (key in payload) {
    if (/^[0-9]{18}(_[0-9]{18})?_(filter(type)?|source)$/.test(key)) {
      conditions.push([key, payload[key]]);
    }
  }

  // Sort array by key names
  conditions.sort(function (a, b) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

  // Convert array back to object
  let objConditions = {};
  for (var i = 0; i < conditions.length; i++) {
    objConditions[conditions[i][0]] = conditions[i][1];
  }

  for (key in objConditions) {
    retval += key + "=" + objConditions[key] + "^|^";
  }

  retval = retval.replace(/(\^\|\^)$/, "");
  return retval;
}

let getLastProdUpdateInfo = function (payload) {
  let lastProdPubDate = payload.publish_revisions.svr_save_timestamps.prod;

  let retval = {};
  retval.lastProdPubUser = utui.data.publish_history[lastProdPubDate][lastProdPubDate].operator || "";
  retval.lastProdPubVersion = utui.data.publish_history[lastProdPubDate][lastProdPubDate].title || "";

  return retval;
}

let advExecOptionLookup = {
  alr: "After Load Rules - Run Always",
  alr_ro: "After Load Rules - Run Once",
  blr: "Before Load Rules - Run Always",
  blr_ro: "Before Load Rules - Run Once",
  end: "After Tag Extensions - Run Always",
  end_ro: "After Tag Extensions - Run Once"
}

for (extension in extensions) {
  let item = utui.automator.getExtensionById(extension);

  let conditions = getConditions(item);
  let lastProdUpdateInfo = getLastProdUpdateInfo(item);

  console.log(item);

  // output.push({
  //   id: item._id,
  //   title: item.title,
  //   type: item.extType,
  //   loadOrder: item.sort + 1,
  //   status: item.status,
  //   scope: item.scope,
  //   advExecOption: (advExecOptionLookup[item.advExecOption] + " (" + item.advExecOption + ")") || item.advExecOption,
  //   lastProdPubUser: lastProdUpdateInfo.lastProdPubUser,
  //   lastProdPubVersion: lastProdUpdateInfo.lastProdPubVersion,
  //   conditions: conditions || {}
  // });

  output.push([
    item._id,
    item.title,
    item.extType,
    item.sort + 1,
    item.status,
    item.scope,
    (advExecOptionLookup[item.advExecOption] + " (" + item.advExecOption + ")") || item.advExecOption,
    // lastProdUpdateInfo.lastProdPubUser,
    // lastProdUpdateInfo.lastProdPubVersion,
    conditions || ""
  ].join(delimiter));
}

let forCsv = "";
output.forEach(function (item) {
  forCsv += (forCsv !== "") ? "\n" + item : item;
});
console.log(forCsv);