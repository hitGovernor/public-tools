utui.automator.getAllProfiles(utui.login.account).then(function (profiles) {
  let extensions = [];
  let results = { profiles: 0 }

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

        // console.log(exts);

        let output = [];
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
        });
        console.log(output);
      }
    });
  });
});