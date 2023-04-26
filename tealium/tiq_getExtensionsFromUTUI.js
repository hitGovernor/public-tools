let extensions = utui.data.customizations;
let csvTitles = [
  "id",
  "title",
  "type",
  "loadOrder",
  "status",
  "scope",
  "advExecOption",
  "lastProdPubUser",
  "lastProdPubVersion",
  "conditions"
].join(",");
let output = [csvTitles];

let getConditions = function (payload) {
  let conditions = {};
  let retval = "";
  for (key in payload) {
    if (/^[0-9]{18}(_[0-9]{18})?_(filter(type)?|source)$/.test(key)) {
      conditions[key] = payload[key];
    }
  }

  for (key in conditions) {
    retval += key + "=" + conditions[key] + "|";
  }

  retval = retval.replace(/\|$/, "");
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
  alr: "After Load Rules",
  blr: "Before Load Rules",
  blr_ro: "Before Load Rules - Run Once",
  end: "After Tag Extensions"
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
    lastProdUpdateInfo.lastProdPubUser,
    lastProdUpdateInfo.lastProdPubVersion,
    conditions || ""
  ].join(","));
}

let forCsv = "";
output.forEach(function (item) {
  forCsv += "\n" + item;
});
console.log(forCsv);