/**
 * adds or removes load rules from tags
 * @param {string} payload
 * @param {Boolean=} payload.active_only - only modify active tags if set to true
 * @param {Array} payload.loadrules - load rules to add or remove
 * @param {String=} payload.operator - any|all (and|or conditional for multiple load rules, no change made if omitted);
 * @param {String=} payload.action - add|remove (default is to add if not specified);
 */
function modifyLoadRules(payload) {
  let modify_active_only = payload.active_only || false;
  let modify_loadrules = payload.loadrules || [];
  let modify_loadrules_join_operator = payload.operator;
  let modify_action = payload.action;

  for (var i = 0; i < Object.keys(utui.data.manage).length; i++) {
    let existing_loadrules = utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule.split(",");
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
          } else if (!existing_loadrules.includes(item)) {
            // if load rules already exist, .push() it
            existing_loadrules.push(item);
          } else {
            // load rule is already present, don't add it again
          }
        } else { // handle the REMOVES
          existing_loadrules.splice(existing_loadrules.indexOf(item));
          if (existing_loadrules.length === 0) {
            // if all load rules have removed, set to "all" 
            existing_loadrules.push("all");
          }
        }
      });

      // update the tag
      utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule = existing_loadrules.join(",");
      if (modify_loadrules_join_operator && modify_loadrules_join_operator !== "") {
        // if specified, update the join operator, otherwise leave as-is
        utui.data.manage[Object.keys(utui.data.manage)[i]].loadrule_join_operator = modify_loadrules_join_operator;
      }
    }
  }
}

modifyLoadRules({
  active_only: true, // optional, Boolean, true|false, only modify active tags if set to true
  loadrules: ['30'], // required, array, load rules to add or remove
  operator: "any", // optional, string, any|all (and|or conditional for multiple load rules, no change made if omitted);
  action: "add" // optional, string, add|remove (default to add if not specified);
});