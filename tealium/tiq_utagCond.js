// default the variables to empty arrays
b["dcm_advertiser_id"] = [],
b["dcm_activity_group"] = [],
b["dcm_activity"] = [],
b["dcm_counting_method"] = [];

// load rule: Affiliate Landing Pages (UID: 18)
// logic: hostname equals "tiq.example.com" AND pathname begins with "/aff/"
if (utag.cond["18"] === 1) {
  b["dcm_advertiser_id"].push("DC-1234567");
  b["dcm_activity_group"].push("abc123");
  b["dcm_activity"].push("xyz_001");
  b["dcm_counting_method"].push("unique");
}

// load rule: Support Emails (UID: 29)
// logic: "src" query parameter begins with "sup_"
if (utag.cond["29"] === 1) {
  b["dcm_advertiser_id"].push("DC-1234567");
  b["dcm_activity_group"].push("abc123");
  b["dcm_activity"].push("xyz_002");
  b["dcm_counting_method"].push("unique");
}