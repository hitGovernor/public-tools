/**
 * console logger
 * @param {String} msg - the message to pass to the console.log() request
 * @param {Boolean=} do_log - enables logging if not set to false
 */
 function logger(msg, do_log) {
  if (!!do_log) {
    console.log(msg);
  };
}

/**
 * adds or removes load rules from tags
 * @param {string} payload
 * @param {Boolean=} payload.active_only - only modify active tags if set to true
 * @param {Array} payload.loadrules - load rules to add or remove
 * @param {Array=} payload.tags - specific tags (uids) to modify
 * @param {String=} payload.operator - any|all (and|or conditional for multiple load rules, no change made if omitted);
 * @param {String=} payload.action - add|remove (default is to add if not specified);
 */
function modifyLoadRules(payload) {
  let modify_active_only = payload.active_only || false;
  let modify_loadrules = payload.loadrules || [];
  let modify_loadrules_join_operator = payload.operator;
  let modify_action = payload.action;
  let modify_tags = payload.tags || [];
  let do_log = payload.enable_logger || false;

  for (var i = 0; i < Object.keys(utui.data.manage).length; i++) {
    let existing_loadrules = utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule.split(",");
    let tag_uid = utui.data.manage[Object.keys(utui.data.manage)[i]].id;
    let do_modify = true;

    if (modify_tags.length > 0 && !modify_tags.includes(tag_uid)) {
      logger("Tag " + tag_uid + " is not in the list to update", do_log);
      // if tags to modify are specify, only stick around for those in the array, otherwise, cancel
      continue;
    }

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
          if (existing_loadrules.includes(item)) {
            existing_loadrules.splice(existing_loadrules.indexOf(item));
            if (existing_loadrules.length === 0) {
              existing_loadrules.push("all");
            }
            logger("Removing load rule " + item + " from tag " + tag_uid, do_log);
          } else {
            logger("Load rule " + item + " does not exist for tag " + tag_uid + " and will not be removed", do_log);
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
  action: "add", // optional, string, add|remove (default to add if not specified);
  loadrules: ['30'], // required, array, load rules to add or remove
  tags: ['27','26'], // optional, array, specific tags to modify
  active_only: true, // optional, Boolean, true|false, only modify active tags if set to true
  // operator: "any", // optional, string, any|all (and|or conditional for multiple load rules, no change made if omitted);
  enable_logger: true // optional, Boolean, true|false, enables logging if set to true
});