let output = "";
document.querySelectorAll("table.customTable tr").forEach(function (row) {
  // locate the project/time entry rows
  let project = row.querySelector("td span[id*='timesheetConsultant']");
  if (project) {

    // parse the project/task/billability string and build the new innerText
    let project_name = project.innerText;
    output += "\n" + project_name;
  }
});
console.log(output);