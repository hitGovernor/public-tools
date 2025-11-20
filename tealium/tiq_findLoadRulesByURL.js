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
 * Determines if a given input key targets a URL property (hostname or pathname).
 */
function isUrlRelated(inputKey) {
    return inputKey === 'dom.domain' || inputKey === 'dom.pathname';
}

/**
 * Checks if a value satisfies a given comparison rule for URL elements,
 * including case-insensitive, negative, and populated checks.
 */
function checkCondition(value, operator, filter) {
    // Treat empty value (for dom.domain/pathname) as "not populated"
    const val = String(value || '');
    const flt = String(filter || '');
    
    // Helper for case-insensitive comparison
    const valLower = val.toLowerCase();
    const fltLower = flt.toLowerCase();

    switch (operator) {
        // --- Positive Matches ---
        case 'equals': return val === flt;
        case 'equals_ignore_case': return valLower === fltLower;
        
        case 'contains': return val.includes(flt);
        case 'contains_ignore_case': return valLower.includes(fltLower);

        case 'starts_with': return val.startsWith(flt);
        case 'starts_with_ignore_case': return valLower.startsWith(fltLower);
        
        case 'regular_expression':
            try {
                // Handle patterns like /pattern/flags
                const match = flt.match(/^\/(.+)\/([gimyus]*)$/);
                const regex = match ? new RegExp(match[1], match[2]) : new RegExp(flt);
                return regex.test(val);
            } catch (e) {
                return false;
            }

        // --- Negative Matches ---
        case 'does_not_equal': return val !== flt;
        case 'does_not_equal_ignore_case': return valLower !== fltLower;
        
        case 'does_not_contain': return !val.includes(flt);
        case 'does_not_contain_ignore_case': return !valLower.includes(fltLower);
        
        case 'does_not_start_with': return !val.startsWith(flt);
        case 'does_not_start_with_ignore_case': return !valLower.startsWith(fltLower);
        
        // --- State Checks (for URL parts) ---
        case 'populated': 
            // For dom.domain or dom.pathname, check if the string is non-empty
            return val.length > 0; 
            
        case 'not_populated':
            return val.length === 0;

        default: 
            // Unhandled operators for URL (e.g., 'defined', 'undefined', numeric operators)
            return false;
    }
}


// --- Main Function (Updated Logic) ---

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
        // For invalid URLs, we can still try to derive domain/pathname if possible, 
        // but for safety, we'll just log and return.
        console.group(`Checking URL: ${urlString}`);
        console.log(`❌ INVALID URL provided.`);
        console.groupEnd();
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
        let urlConditionPasses = false; 
        let hasNonUrlFilters = false;
        const nonUrlCriteria = [];

        // If the rule has no filtering criteria, do nothing (Requirement 4 check, though unlikely with data structure)
        if (conditionBlocks.length === 0) continue;

        // Evaluate each condition block ('0', '1', '2'...) using OR logic
        for (const condition of conditionBlocks) {

            // Helper function to evaluate a single input (input_x)
            const evaluateInput = (inputKey, operator, filter) => {
                // Filter and operator are optional only if inputKey is missing.
                if (!inputKey) return { isUrl: false, isMatch: true, criteria: null };

                const isUrl = isUrlRelated(inputKey);

                if (isUrl) {
                    hasUrlFilters = true;
                    const valueToMatch = urlParts[inputKey];
                    // Check against the actual criteria.
                    const isMatch = checkCondition(valueToMatch, operator, filter);
                    return { isUrl: true, isMatch, criteria: null };
                } else {
                    hasNonUrlFilters = true;
                    // Record the full criteria string for the partial match output.
                    const criteriaString = `"${inputKey}" ${operator.replace(/_/g, ' ')} "${filter}"`;
                    nonUrlCriteria.push(criteriaString);

                    // Since we cannot evaluate non-URL conditions, we assume TRUE for the
                    // purpose of determining if the URL *could* be a match (Partial Match).
                    // This prevents a single non-URL filter from immediately ruling out a valid URL match.
                    return { isUrl: false, isMatch: true, criteria: criteriaString };
                }
            };

            // Rule conditions typically use AND logic across the inputs (e.g., input_0 AND input_1 AND input_2...)
            
            // Collect all inputs from condition object (up to input_7)
            const results = [];
            for (let i = 0; i < 8; i++) {
                const inputKey = condition[`input_${i}`];
                const operator = condition[`operator_${i}`];
                const filter = condition[`filter_${i}`];
                
                if (inputKey) {
                    results.push(evaluateInput(inputKey, operator, filter));
                }
            }

            // Check if ALL parts of this specific condition block passed
            const conditionBlockPassed = results.every(r => r.isMatch);
            
            // Check if ANY part of this specific condition block was URL related
            const blockHadUrlFilter = results.some(r => r.isUrl);

            // The main OR logic: if this block passed AND contained a URL filter, the rule qualifies for a match.
            if (conditionBlockPassed && blockHadUrlFilter) {
                urlConditionPasses = true; // This rule qualifies as a match.
                // We don't break yet because we need to collect ALL non-URL criteria from ALL matching blocks.
            }
        }

        // --- Final Match Determination ---
        
        // Requirement 4: If the rule has no URL-specific filtering criteria, do nothing.
        if (!hasUrlFilters) continue;

        // Requirement 1: If the URL does not match any filters in the rule, do nothing.
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

        if (hasNonUrlFilters) {
            // Requirement 3: URL matches, AND other requirements exist (Partial Match)
            output.matchType = '⚠️ PARTIAL MATCH (Non-URL Criteria Exist)';
            output.nonUrlCriteria = uniqueNonUrlCriteria;
            results.push(output);
        } else {
            // Requirement 2: URL matches, AND no other requirements exist (Exact Match)
            output.matchType = '✅ EXACT MATCH (URL ONLY)';
            results.push(output);
        }
    }

    // --- Final Output ---
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