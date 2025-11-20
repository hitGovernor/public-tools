let PROFILE_OVERRIDE = ["ENTER-A-SINGLE-PROFILE-ID-HERE-AS-AN-ARRAY"];
let testURLs = [
  "https://call-compare.pages.dev/",
];

// delete the ruleDefinitions so it's forced to update again for the next run
delete window.ruleDefinitions

utui.automator.getAllProfiles(utui.login.account).then(function (profiles) {
  let PROFILES = (PROFILE_OVERRIDE.length > 0) ? PROFILE_OVERRIDE : profiles.sort();
  let profileCount = 0;

  PROFILES.forEach(function (profile, idx) {
    idx++;

    utui.profile.getProfile(null, {
      r: "getProfile",
      account: utui.login.account,
      profile: profile
    }, function (data) {
      profileCount++;
      console.log(`Processing profile: ${data.profile} (${Object.keys(data.manage || {}).length} tags available)`);

      window.ruleDefinitions = data.loadrules;
    });
  });
});

/**
 * Checks if a value satisfies a given comparison rule for URL elements.
 */
function checkCondition(value, operator, filter) {
  if (value === undefined || value === null) return false;

  const val = String(value);
  const flt = String(filter);

  switch (operator) {
    case 'equals': return val === flt;
    case 'contains': return val.includes(flt);
    case 'starts_with': return val.startsWith(flt);
    case 'regular_expression':
      try {
        const match = flt.match(/^\/(.+)\/([gimyus]*)$/);
        const regex = match ? new RegExp(match[1], match[2]) : new RegExp(flt);
        return regex.test(val);
      } catch (e) {
        return false;
      }
    default: return false; // Non-URL operators are ignored in this check
  }
}

/**
 * Determines if a given input key targets a URL property (hostname or pathname).
 */
function isUrlRelated(inputKey) {
  return inputKey === 'dom.domain' || inputKey === 'dom.pathname';
}

/**
 * Parses a full URL and checks it against a set of rules, returning detailed
 * information about Exact and Partial matches.
 * @param {string} urlString The full URL to check.
 */
function findMatchingRules(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch (e) {
    console.group(`Checking URL: ${urlString} \n❌ INVALID URL provided.`);
    return;
  }

  const urlParts = {
    'dom.domain': url.hostname,
    'dom.pathname': url.pathname
  };

  console.group(`Evaluating Rules for URL: ${urlString}`);
  const results = [];

  // Iterate over each rule
  for (const ruleId in ruleDefinitions) {
    const rule = ruleDefinitions[ruleId];
    const conditionBlocks = [];

    // Extract all condition blocks (keys '0', '1', '2', etc.)
    for (const key in rule) {
      if (!isNaN(parseInt(key))) {
        conditionBlocks.push(rule[key]);
      }
    }

    let hasUrlFilters = false;
    let urlConditionPasses = false; // Flag for 'OR' logic across condition blocks
    let hasNonUrlFilters = false;
    const nonUrlCriteria = [];

    // If the rule has no filtering criteria, do nothing
    if (conditionBlocks.length === 0) continue;

    // Evaluate each condition block ('0', '1', '2'...) using OR logic
    for (const condition of conditionBlocks) {

      // Helper function to check a single input (input_0 or input_1)
      const evaluateInput = (inputKey, operator, filter) => {
        if (!inputKey || !operator || !filter) return { isUrl: false, isMatch: true, criteria: null };

        const isUrl = isUrlRelated(inputKey);

        if (isUrl) {
          hasUrlFilters = true;
          const valueToMatch = urlParts[inputKey];
          const isMatch = checkCondition(valueToMatch, operator, filter);
          return { isUrl: true, isMatch, criteria: null };
        } else {
          hasNonUrlFilters = true;
          nonUrlCriteria.push(`"${inputKey}" ${operator.replace(/_/g, ' ')} "${filter}"`);
          // We cannot evaluate non-URL conditions, so assume "true" for the current match logic
          // so it doesn't fail a combined URL+Non-URL block (like rule 11).
          return { isUrl: false, isMatch: true, criteria: `"${inputKey}" ${operator.replace(/_/g, ' ')} "${filter}"` };
        }
      };

      // Evaluate primary and secondary parts of the condition block
      const result0 = evaluateInput(condition.input_0, condition.operator_0, condition.filter_0);
      const result1 = evaluateInput(condition.input_1, condition.operator_1, condition.filter_1);

      // A condition block passes if all evaluated parts match AND it contains a URL filter OR it only contains non-URL filters.
      // If a condition block contains a URL filter that fails, the whole block fails.
      if ((result0.isMatch && result1.isMatch) && (result0.isUrl || result1.isUrl)) {
        urlConditionPasses = true; // At least one URL-filtered block matched (OR logic)
      }
    }

    if (!hasUrlFilters) continue;

    // 1. If the URL does not match any filters in the rule, do nothing (handled by if below)
    if (!urlConditionPasses) continue;

    // At this point, the URL MATCHES at least one filter.
    const output = {
      id: rule.id,
      title: rule.title,
      status: rule.status,
      matchType: '',
      nonUrlCriteria: []
    };

    // Clean up the nonUrlCriteria list, removing duplicates
    const uniqueNonUrlCriteria = [...new Set(nonUrlCriteria)];

    if (!hasNonUrlFilters) {
      output.matchType = '✅ EXACT MATCH (URL ONLY)';
      results.push(output);
    } else {
      output.matchType = '⚠️ PARTIAL MATCH (Non-URL Criteria Exist)';
      output.nonUrlCriteria = uniqueNonUrlCriteria;
      results.push(output);
    }
  }

  if (results.length === 0) {
    console.log("❌ NO MATCHES found for the provided URL.");
  } else {
    results.forEach(result => {
      console.log(`${result.matchType} -- UID: ${result.id}, Title: ${result.title}, Rule Status: ${result.status}`);
      if (result.nonUrlCriteria.length > 0) {
        console.log(`**Additional Criteria Needed:**\n* ${result.nonUrlCriteria.join('\n* ')}`);
      }
    });
  }
  console.groupEnd();
}

let waitForRules = setInterval(function () {
  if (window.ruleDefinitions) {
    clearInterval(waitForRules);
    testURLs.forEach(function (test) {
      findMatchingRules(test);
    });
  }
}, 100);