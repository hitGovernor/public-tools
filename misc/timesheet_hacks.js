// get the uname so we can properly strip it out of project names
let uname = "";
let details = document.querySelectorAll("table.detailList");
details.forEach(function (detail) {
  uname = detail.querySelector("td.first").innerText;
});

// project naming schema: {uname} -{client} - {project}-{billable}
// get the timesheet table
document.querySelectorAll("table.customTable tr").forEach(function (row) {
  // locate the project/time entry rows
  let project = row.querySelector("td span[id*='timesheetConsultant']");
  if (project) {

    // parse the project/task/billability string and build the new innerText
    let project_name = project.innerText;
    project_name = project_name.replace(uname + " -", "").split("-").join(" | ");
    project.innerText = project_name;
    project.parentNode.parentNode.setAttribute("align", "");
  }
});

// hide "saturday" and "sunday" columns
let cols = document.querySelectorAll('td:nth-child(7),th:nth-child(7),td:nth-child(8),th:nth-child(8)');
cols.forEach(function (col) {
  col.setAttribute("style", "display: none");
});

// set salesforce state values
let states = document.querySelectorAll("select[name*='oneDayState']");
states.forEach(function (item) {
  item.value = "MO";
});

// add background shading when mousing over a row
let rows = document.querySelectorAll("table.customTable tbody tr");
rows.forEach(function (row) {
  row.addEventListener("mouseover", function () {
    row.setAttribute("style", "background-color: #c8c8c8");
  });

  row.addEventListener("mouseout", function () {
    row.setAttribute("style", "background-color: ");
  });
});