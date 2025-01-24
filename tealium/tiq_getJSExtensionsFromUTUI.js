let profileOverride = []; // if you want to specify pofiles, define here, otherwise leave empty array

let formatForCSV = function (payload) {
  let decodedCode = payload.replace(/&quot;/g, '"');
  let escapedCode = decodedCode.replace(/"/g, '\\"').replace(/\n/g, '\\n')//.replace(/\t/g, '\\t');
  let quotedCode = `"${escapedCode}"`; // wrap the entire code block in double quotes
  return quotedCode;
}

let download = function (data, account, suffix) {
  tiq_account = account || "";
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
}

let convertToCSV = function (assets) {
  let allBody = [];
  let headers = [];

  // build the csv header row based on keys in first asset
  headers = Object.keys(assets[0]).join(",") + "\n";

  // loop through all assets to build the individual rows
  for (let i = 0; i < assets.length; i++) {
    let tmp = assets[i],
      tmpArray = [];

    for (let key in tmp) {
      tmpArray.push(tmp[key]);
    }

    allBody.push(tmpArray.join(","));
  }

  // join everything together w/ line breaks between asset rows
  return headers + allBody.join("\n");
}

utui.automator.getAllProfiles(utui.login.account).then(function (profiles) {
  let extensions = [];
  let results = { profiles: 0 }

  profiles = (profileOverride.length > 0) ? profileOverride : profiles;
  profiles = profiles.sort();
  profiles.forEach(function (profile, idx) {
    utui.profile.getProfile(null, {
      r: "getProfile",
      account: utui.login.account,
      profile: profile
    }, function (data) {
      results.profiles++;
      if (data?.customizations) {
        for (item in data.customizations) {
          data.customizations[item].profile = profile;
          extensions.push(data.customizations[item]);
        }
      }

      if (results.profiles >= profiles.length) {
        let exts = [];
        let js_extensions = extensions.filter((item) => item.extType == "Javascript Code");
        let ajs_extensions = extensions.filter((item) => item.extType == "Advanced Javascript Code");
        exts = js_extensions.concat(ajs_extensions);

        let output = [];
        let csvOutput = [];
        exts.forEach(function (item) {
          let code = (function (asset) {
            if (asset?.codeDevData?.promotedSnippets) {
              for (snippet in asset.codeDevData.promotedSnippets) {
                if (asset.codeDevData.promotedSnippets[snippet].name === "prod") {
                  return asset.codeDevData.promotedSnippets[snippet].code;
                }
              }
            } else if (asset?.code) {
              return asset.code;
            } else {
              return "";
            }
          })(item);

          output.push({
            profile: item.profile,
            type: item.extType,
            status: item.status,
            uid: item._id,
            title: item.title,
            scope: item.advExecOption,
            code: code
          });

          csvOutput.push({
            profile: item.profile,
            type: item.extType,
            status: item.status,
            uid: item._id,
            title: item.title,
            scope: item.advExecOption,
            code: formatForCSV(code || "")
          });
        });

        console.log(output);
        download(convertToCSV(csvOutput), (utui.login.account || ""), "js-extensions");
      }
    });
  });
});