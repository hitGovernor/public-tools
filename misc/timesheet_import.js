let user_input = prompt("Enter your time") || "";
let sheet = [];

if (user_input === "") {
  console.log("no time entered");
} else {
  var tmp_sheet = user_input.split(/\n/);
  tmp_sheet.forEach(function (item) {
    sheet.push(item.split("~~"));
  });
}

// set salesforce state values
let states = document.querySelectorAll("select[name*='oneDayState']");
states.forEach(function (item) {
  item.value = "MO";
});

// returns the sum of an array of numbers (called in .reduce())
function add(accumulator, a) {
  return (Number(accumulator) + Number(a)).toFixed(2);
}

let col_inputs = [];
let rows = document.querySelectorAll("table.customTable tbody tr");
rows.forEach(function (row, row_index) {
  let row_values = [];
  let row_total = row.querySelector("[id*='timesheetConsultantTotal']");
  let project = row.querySelector("td:not(.customTableNumber)").innerText;

  row.querySelectorAll("input").forEach(function (input, input_index) {
    let task = sheet.filter(function (item, item_index) {
      if (project === item[0]) {
        if (sheet[item_index].indexOf("FOUND") < 0) {
          sheet[item_index].push("FOUND");
        }
        return item;
      }
    });

    task.forEach(function (item) {
      input.value = item[input_index + 1];
      input.setAttribute("style", "background-color: #E7F0CC");
    });

    // build array of hours for each column
    col_inputs[input_index] = col_inputs[input_index] || [];
    col_inputs[input_index].push(input.value);
    // build array of hours for each row
    row_values[input_index] = input.value;

    // update row totals
    row_total.innerText = row_values.reduce(add, 0);
    row_total.innerText += (Number(row_values[5]) > 0 || Number(row_values[6]) > 0) ? "*" : "";

    // update column totals
    let col_total = col_inputs[input_index].reduce(add, 0);
    document.querySelector("[id*=':" + input_index + ":timesheetOneDayTotal']").innerText = col_total;

    // update timesheet total
    let timesheet_total = 0;
    document.querySelectorAll("[id*=':hoursForConsultant']").forEach(function (item) {
      timesheet_total += Number(item.value);
    });
    document.querySelector("[id*='timesheetTotalHours']").innerText = timesheet_total.toFixed(2);
  });
});