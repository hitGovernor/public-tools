// list of custom tools from tiq:
// https://community.tealiumiq.com/t5/Getting-Started/List-of-Custom-Tealium-Tools/ta-p/23066

// prints out current profile, environment, and version info (use as live expression)
utag_data["ut.profile"] + " -- " + utag_data["ut.env"] + " -- " + utag_data["ut.version"];

// tiq toggle debug
if (document.cookie.indexOf("utagdb=true") > -1) {
  document.cookie = "utagdb=false";
} else {
  document.cookie = "utagdb=true";
}

// display ccpa popup modal
utag.gdpr.showDoNotSellPrompt("en-US");

// console list of custom data layer variables (must be in tiq)
var a = utui.data.define;
var output = "";
for (i in a) {
  output += '"' + a[i].name + '","' + a[i].type + '","' + a[i].description + '"\n';
}
console.log(output);

// console out list of extensions (without definitions)
var output = [], output_str = "";
var extensions = document.querySelectorAll("div[data-test='extension_accordion'].customize_container").forEach(function (item) {
  var tmp = [], tmp_str = "";
  var elements = item.querySelectorAll(".cth-cell").forEach(function (ele) {
    if (ele.innerText) {
      var title = ele.className.replace("cth-cell cth-cell__", "");
      tmp_str += "\"" + ele.innerText + "\",";
      tmp.push({
        title: title,
        value: ele.innerText
      });
    };
  });
  output.push(tmp);
  output_str += tmp_str + "\n";
});
console.log(output_str);