javascript:(function()%7Blet user_input%3Dprompt("Enter your time")%7C%7C""%3Blet sheet%3D%5B%5D%3Bif(user_input%3D%3D%3D"")%7Bconsole.log("no time entered")%3B%7Delse%7Bvar tmp_sheet%3Duser_input.split(/%5Cn/)%3Btmp_sheet.forEach(function(item)%7Bsheet.push(item.split("~~"))%3B%7D)%3B%7Dlet states%3Ddocument.querySelectorAll("select%5Bname*%3D%27oneDayState%27%5D")%3Bstates.forEach(function(item)%7Bitem.value%3D"MO"%3B%7D)%3Bfunction add(accumulator,a)%7Breturn(Number(accumulator)%2BNumber(a)).toFixed(2)%3B%7Dlet col_inputs%3D%5B%5D%3Blet rows%3Ddocument.querySelectorAll("table.customTable tbody tr")%3Brows.forEach(function(row,row_index)%7Blet row_values%3D%5B%5D%3Blet row_total%3Drow.querySelector("%5Bid*%3D%27timesheetConsultantTotal%27%5D")%3Blet project%3Drow.querySelector("td:not(.customTableNumber)").innerText%3Brow.querySelectorAll("input").forEach(function(input,input_index)%7Blet task%3Dsheet.filter(function(item,item_index)%7Bif(project%3D%3D%3Ditem%5B0%5D)%7Bif(sheet%5Bitem_index%5D.indexOf("FOUND")<0)%7Bsheet%5Bitem_index%5D.push("FOUND")%3B%7Dreturn item%3B%7D%7D)%3Btask.forEach(function(item)%7Binput.value%3Ditem%5Binput_index%2B1%5D%3Binput.setAttribute("style","background-color: %23E7F0CC")%3B%7D)%3Bcol_inputs%5Binput_index%5D%3Dcol_inputs%5Binput_index%5D%7C%7C%5B%5D%3Bcol_inputs%5Binput_index%5D.push(input.value)%3Brow_values%5Binput_index%5D%3Dinput.value%3Brow_total.innerText%3Drow_values.reduce(add,0)%3Brow_total.innerText%2B%3D(Number(row_values%5B5%5D)>0%7C%7CNumber(row_values%5B6%5D)>0)%3F"*":""%3Blet col_total%3Dcol_inputs%5Binput_index%5D.reduce(add,0)%3Bdocument.querySelector("%5Bid*%3D%27:"%2Binput_index%2B":timesheetOneDayTotal%27%5D").innerText%3Dcol_total%3Blet timesheet_total%3D0%3Bdocument.querySelectorAll("%5Bid*%3D%27:hoursForConsultant%27%5D").forEach(function(item)%7Btimesheet_total%2B%3DNumber(item.value)%3B%7D)%3Bdocument.querySelector("%5Bid*%3D%27timesheetTotalHours%27%5D").innerText%3Dtimesheet_total.toFixed(2)%3B%7D)%3B%7D)%3B%7D)()%3B