// not required, but helpful -- enter the orgId and org name to be included in output
let orgId = "";
let orgName = "";

// privacyUrl = "https://app.fullstory.com/ui/" + orgId + "/settings/privacy";

// build headers for delimited output (use ~ instead of , because of user-entered notes text)
let delimited = "orgId~orgName~selector~action~exception~scope~notes~last-updated";

// define output array; will push rows in as ojbects, defined below
let output = [];

// locate all element data capture rules and interate through them 1 at a time
document.querySelectorAll("tr.hKSZNa__Row.hKSZNa__Editable").forEach(function (item) {

  // find all necessary values
  let selector = item.querySelector("td.hKSZNa__SelectorCell span[data-testid='typography']").innerText;
  let notes = item.querySelector("div.P5A7sq__root.qOufMG__sans.ivQjJG__neutrals-n10.P5A7sq__ellipsize").innerText;
  let lastUpdated = item.querySelector("td.hKSZNa__DateModified span[data-testid='typography']").innerText;

  // scope === "Preview and Live Sessions", "No Sessions (Inactive)", etc...
  let scope = "";
  let scopeDropDown = item.querySelectorAll("button span.eYKEPW__text.KB33nq__bodySmallBold.yrIMCa__inherit.tOCGGW__inherit.eYKEPW__noWrap")
  scopeDropDown.forEach(function (ele) {
    scope = ele.innerText;
  });

  // secondary items include action (mask, exclude) and exception count (eg// 1 exception) but not actual exception logic
  let secondary = item.querySelectorAll("div.oRmVLa__pillContent,nf3jgq__secondary span[data-testid='typography']");
  let action = "";
  let exception = "";

  if (secondary.length > 0) {
    if (secondary[0]) {
      action = secondary[0].innerText;
    }
    if (secondary[1]) {
      exception = secondary[1].innerText;
    }
  }

  // push results into output []
  output.push({
    orgId: orgId,
    orgName: orgName,
    selector: selector,
    action: action,
    exception: exception,
    notes: notes,
    scope: scope,
    lastUpdated: lastUpdated
  });

  // add result to delimited string (for easy import into sheets/excel using "text to columns" options)
  // creates new line (\n) and joins using tilde (~)
  delimited += "\n" + [orgId, orgName, selector, action, exception, scope, notes, lastUpdated].join("~");
});

// use either of the below to write results to the console (using both simultaneously is NOT recommended)
// console.log(delimited); // for copying into a spreadsheet
// console.table(output); // for reviewing directly in the console as a table