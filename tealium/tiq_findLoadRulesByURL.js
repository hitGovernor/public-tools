let PROFILE_OVERRIDE = ["ENTER-A-SINGLE-PROFILE-ID-HERE-AS-AN-ARRAY"];
let LOG_FULL_DETAIL = true;
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
    const val = String(value || '');
    const flt = String(filter || '');
    
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
            return val.length > 0; 
            
        default: 
            return false;
    }
}


// --- Main Function (Updated to Output All Criteria) ---

function findMatchingRules(urlString, logFullDetail = false) {
    let url;
    try {
        url = new URL(urlString);
    } catch (e) {
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
        const urlMatchCriteria = []; 

        if (conditionBlocks.length === 0) continue;

        // Evaluate each condition block ('0', '1', '2'...) using OR logic
        for (const condition of conditionBlocks) {

            let blockHadUrlFilter = false;
            
            // Helper function to evaluate a single input (input_x)
            const evaluateInput = (inputKey, operator, filter) => {
                if (!inputKey) return { isUrl: false, isMatch: true, criteria: null };

                const isUrl = isUrlRelated(inputKey);

                if (isUrl) {
                    hasUrlFilters = true;
                    blockHadUrlFilter = true;
                    const valueToMatch = urlParts[inputKey];
                    const isMatch = checkCondition(valueToMatch, operator, filter);
                    
                    if (isMatch) {
                        // Capture the successful URL filter for output review
                        urlMatchCriteria.push(`"${inputKey}" ${operator.replace(/_/g, ' ')} "${filter}"`);
                    }
                    return { isUrl: true, isMatch, criteria: null };
                } else {
                    hasNonUrlFilters = true;
                    const criteriaString = `"${inputKey}" ${operator.replace(/_/g, ' ')} "${filter}"`;
                    nonUrlCriteria.push(criteriaString);
                    // Assume non-URL condition passes for partial match check
                    return { isUrl: false, isMatch: true, criteria: criteriaString };
                }
            };

            // Collect all inputs from condition object (up to input_7)
            const resultsInBlock = [];
            for (let i = 0; i < 8; i++) {
                const inputKey = condition[`input_${i}`];
                const operator = condition[`operator_${i}`];
                const filter = condition[`filter_${i}`];
                
                if (inputKey) {
                    resultsInBlock.push(evaluateInput(inputKey, operator, filter));
                }
            }

            // Check if ALL parts of this specific condition block passed (AND logic)
            const conditionBlockPassed = resultsInBlock.every(r => r.isMatch);

            // If this block passed AND contained a URL filter, the rule qualifies for a match (OR logic).
            if (conditionBlockPassed && blockHadUrlFilter) {
                urlConditionPasses = true;
            }
        }

        // --- Final Match Determination ---
        
        if (!hasUrlFilters) continue; // Requirement 4: No URL filters.
        if (!urlConditionPasses) continue; // Requirement 1: URL failed to match.

        const output = {
            id: rule.id,
            title: rule.title,
            status: rule.status,
            matchType: '',
            urlCriteria: [],
            nonUrlCriteria: []
        };

        // Clean up criteria lists (remove duplicates)
        output.urlCriteria = [...new Set(urlMatchCriteria)].filter(c => c !== null);
        output.nonUrlCriteria = [...new Set(nonUrlCriteria)].filter(c => c !== null);

        if (hasNonUrlFilters) {
            // Requirement 3: Partial Match
            // output.matchType = '⚠️ PARTIAL MATCH (Non-URL Criteria Exist)';
            output.matchType = '⚠️ PARTIAL MATCH';
            results.push(output);
        } else {
            // Requirement 2: EXACT MATCH (URL ONLY) - Includes criteria as requested
            // output.matchType = '✅ EXACT MATCH (URL ONLY)';
            output.matchType = '✅ EXACT MATCH';
            results.push(output);
        }
    }

    // --- Final Output ---
    if (results.length === 0) {
        console.log("❌ NO MATCHES found for the provided URL.");
    } else {
        results.forEach(result => {
            // console.groupCollapsed(`${result.matchType} -- UID: ${result.id}, Title: ${result.title}, Status: ${result.status}`);
            console.groupCollapsed(`${result.matchType} -- ${result.title} (UID: ${result.id})`);

            if(result.status == "inactive") {
              console.log("❌ Rule is inactive.");
            }
          
            // Output URL criteria for review (applies to both EXACT and PARTIAL)
            if (result.urlCriteria && result.urlCriteria.length > 0 && logFullDetail) {
                console.log(`** Matched URL Criteria: \n* ${result.urlCriteria.join('\n* ')}`);
            }
            
            // Output Non-URL criteria (for partial matches)
            if (result.nonUrlCriteria && result.nonUrlCriteria.length > 0) {
                console.log(`** Additional Criteria Needed: \n* ${result.nonUrlCriteria.join('\n* ')}`);
            }
            console.groupEnd();
        });
    }
    console.groupEnd();
}

let waitForRules = setInterval(function () {
  if (window.ruleDefinitions) {
    clearInterval(waitForRules);
    testURLs.forEach(function (test) {
      findMatchingRules(test, LOG_FULL_DETAIL);
    });
  }
}, 100);