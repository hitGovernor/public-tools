javascript:(function()%7Blet%20uname%3D%22%22%3Blet%20details%3Ddocument.querySelectorAll(%22table.detailList%22)%3Bdetails.forEach(function(detail)%7Buname%3Ddetail.querySelector(%22td.first%22).innerText%3B%7D)%3Bdocument.querySelectorAll(%22table.customTable%20tr%22).forEach(function(row)%7Blet%20project%3Drow.querySelector(%22td%20span%5Bid*%3D%27timesheetConsultant%27%5D%22)%3Bif(project)%7Blet%20project_name%3Dproject.innerText%3Bproject_name%3Dproject_name.replace(uname%2B%22%20-%22,%22%22).split(%22-%22).join(%22%20%7C%20%22)%3Bproject.innerText%3Dproject_name%3Bproject.parentNode.parentNode.setAttribute(%22align%22,%22%22)%3B%7D%7D)%3Blet%20cols%3Ddocument.querySelectorAll(%27td:nth-child(7),th:nth-child(7),td:nth-child(8),th:nth-child(8)%27)%3Bcols.forEach(function(col)%7Bcol.setAttribute(%22style%22,%22display:%20none%22)%3B%7D)%3Blet%20states%3Ddocument.querySelectorAll(%22select%5Bname*%3D%27oneDayState%27%5D%22)%3Bstates.forEach(function(item)%7Bitem.value%3D%22MO%22%3B%7D)%3Bfunction%20add(accumulator,a)%7Breturn(Number(accumulator)%2BNumber(a)).toFixed(2)%3B%7Dlet%20rows%3Ddocument.querySelectorAll(%22table.customTable%20tbody%20tr%22)%3Brows.forEach(function(row)%7Blet%20input_values%3D%5B%5D%3Blet%20total%3Drow.querySelector(%22%5Bid*%3D%27timesheetConsultantTotal%27%5D%22)%3Brow.querySelectorAll(%22input%22).forEach(function(input,idx)%7Binput_values%5Bidx%5D%3Dinput.value%3Binput.addEventListener(%22change%22,function()%7Binput_values%5Bidx%5D%3Dinput.value%3Btotal.innerText%3Dinput_values.reduce(add,0)%3Btotal.innerText%2B%3D(Number(input_values%5B5%5D)%3E0%7C%7CNumber(input_values%5B5%5D)%3E0)%3F%22*%22:%22%22%3B%7D)%3Btotal.innerText%3Dinput_values.reduce(add,0)%3Btotal.innerText%2B%3D(Number(input_values%5B5%5D)%3E0%7C%7CNumber(input_values%5B5%5D)%3E0)%3F%22*%22:%22%22%3B%7D)%3Brow.addEventListener(%22mouseover%22,function()%7Brow.setAttribute(%22style%22,%22background-color:%20%23c8c8c8%22)%3B%7D)%3Brow.addEventListener(%22mouseout%22,function()%7Brow.setAttribute(%22style%22,%22background-color:%20%22)%3B%7D)%3B%7D)%3B%7D)()%3B