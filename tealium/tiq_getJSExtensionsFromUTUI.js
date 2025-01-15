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
          if (item.extType == "Javascript Code") {
            output.push({
              profile: item.profile,
              type: item.extType,
              status: item.status,
              uid: item._id,
              title: item.title,
              scope: item.advExecOption,
              code: item.code
            });
          } else if (item.extType == "Advanced Javascript Code") {
            let prodPromoted = "";
            if (item?.codeDevData?.promotedSnippets) {
              for (snippet in item.codeDevData.promotedSnippets) {
                if (item.codeDevData.promotedSnippets[snippet].name === "prod") {
                  prodPromoted = item.codeDevData.promotedSnippets[snippet].code;
                }

              }
            }
            output.push({
              profile: item.profile,
              type: item.extType,
              status: item.status,
              uid: item._id,
              title: item.title,
              scope: item.advExecOption,
              code: prodPromoted
            });
          }
        });

        console.log(output);
      }
    });
  });
});
