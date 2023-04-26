/**
 * free for anyone to use as they wish
 * all uses and risks are your own
 * i make no promises or claims with this code
 * 
 * grabs all extensions from the currently loaded tiq profile
 * exports results to the console in a ready-for-csv format
 * easy to copy/paste into excel or google sheets, then parse
 * into cells w/text-to-columns focusing on the specified delimiter
 */

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

  conditions.forEach(function (item) {
    // after splitting into columns in excel, run a substitute(A2,"^|^",CHAR(10)) to break 
    // conditions into multiple rows in a single cell for easier consumption
    retval += item[0] + "=" + item[1] + "^|^";
  });

  // strip trailing delimiter
  retval = retval.replace(/(\^\|\^)$/, "");
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

  output.push([
    item._id,
    item.title,
    item.extType,
    item.sort + 1,
    item.status,
    item.scope,
    (advExecOptionLookup[item.advExecOption] + " (" + item.advExecOption + ")") || item.advExecOption,
    conditions || ""
  ].join(delimiter));
}

let forCsv = "";
output.forEach(function (item) {
  forCsv += (forCsv !== "") ? "\n" + item : item;
});
console.log(forCsv);