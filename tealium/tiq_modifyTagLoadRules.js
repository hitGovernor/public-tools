/**
 * adds the specified load rule (by uid) to ALL tags
 * TODO: update to add 1 or more load rule to specific tags
 * TODO: update to remove specified load rule(s) from specified tags
 *
 * DONE: update to add multiple load rules
 * DONE: update to only add/remove load rule(s) to/from ACTIVE (enabled) tags
 * DONE: update to remove specified load rule(s) from all tags
 */

function logger(msg, do_log) {
  if (!!do_log) {
    console.log(msg);
  };
}

function modifyLoadRules(payload) {
  let modify_active_only = payload.active_only || false;
  let modify_loadrules = payload.loadrules || [];
  let modify_loadrules_join_operator = payload.operator;
  let modify_action = payload.action;
  let do_log = payload.enable_logger || false;

  for (var i = 0; i < Object.keys(utui.data.manage).length; i++) {
    let existing_loadrules = utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule.split(",");
    let tag_uid = utui.data.manage[Object.keys(utui.data.manage)[i]].id;
    let do_modify = true;

    // if specified to only modify active tags and the tag is NOT active, set flag to prevent modification
    if (modify_active_only && utui.data.manage[Object.keys(utui.data.manage)[i]].status !== "active") {
      do_modify = false;
    }

    if (do_modify) {
      modify_loadrules.forEach(function (item) {
        if (modify_action !== "remove") { // handle the ADDS
          if (existing_loadrules[0] === "all") {
            // if first load rule, add it, don't .push()
            existing_loadrules[0] = item;
            logger("Adding load rule " + item + " to tag " + tag_uid, do_log);
          } else if (!existing_loadrules.includes(item)) {
            // if load rules already exist, .push() it
            existing_loadrules.push(item);
            logger("Adding load rule " + item + " to tag " + tag_uid, do_log);
          } else {
            // load rule is already present, don't add it again
            logger("Load rule " + item + " already exists for tag " + tag_uid, do_log);
          }
        } else { // handle the REMOVES
          existing_loadrules.splice(existing_loadrules.indexOf(item));
          if (existing_loadrules.length === 0) {
            existing_loadrules.push("all");
            logger("Removing load rule " + item + " from tag " + tag_uid, do_log);
          }
        }
      });

      utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule = existing_loadrules.join(",");
      if (modify_loadrules_join_operator && modify_loadrules_join_operator !== "") {
        utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule_join_operator = modify_loadrules_join_operator;
        logger("Setting join operator to \"" + modify_loadrules_join_operator + "\" for tag " + tag_uid, do_log);
      }
    }
  }
}

modifyLoadRules({
  enable_logger: true, // optional, Boolean, true|false, enables logging if set to true
  // active_only: true, // optional, Boolean, true|false, only modify active tags if set to true
  loadrules: ['29'], // required, array, load rules to add or remove
  // operator: "any", // optional, string, any|all (and|or conditional for multiple load rules, no change made if omitted);
  action: "remove" // optional, string, add|remove (default to add if not specified);
});