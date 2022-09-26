let scrubText = function (str) {
  if (str && str !== "" && str !== true && str !== null) {
    return str.toLowerCase().trim().replace(/\s/g, "_");
  }

  return "";
}

let links = document.querySelectorAll("a");
links.forEach(function (link) {
  let item = {};

  item.event_name = "link";
  item.link_url = link.getAttribute("href");
  item.link_type = ""; // getLinkType(item.link_url);
  item.link_text = (function () {
    let retval = "";

    if (link.innerText && link.innerText.trim() !== "") {
      retval = link.innerText.trim();
    } else if (link.innerHtml && link.innerHtml.trim() !== "") {
      retval = link.innerText.trim();
    } else if (link.getAttribute("alt") && link.getAttribute("alt").trim() !== "") {
      retval = link.getAttribute("alt").trim();
    } else if (link.getAttribute("title") && link.getAttribute("title").trim() !== "") {
      retval = link.getAttribute("title").trim();
    } else if (link.getAttribute("aria-label") && link.getAttribute("aria-label").trim() !== "") {
      retval = link.getAttribute("aria-label").trim();
    } else {
      retval = "";
    }
    return scrubText(retval)
  })();

  item.event_category = "link_click"; // item.link_text;
  item.event_action = item.link_text;
  item.event_label = item.link_url;

  link.addEventListener("click", function () {
    item.tealium_event = item.event_category;
    // utag.link(item);
    console.log(item);
  });

  console.log(item.event_category, item.event_action, item.event_label);
});