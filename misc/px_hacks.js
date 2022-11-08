// PX: Wrap Project Names
// bookmarklet: 
// javascript:(function()%7Bdocument.querySelectorAll("%5Bdata-testid%3D%27MatchedText%27%5D").forEach(function(item)%7Bitem.setAttribute("style","white-space:normal")%3B%7D)%3B%7D)()%3B

document.querySelectorAll("[data-testid='MatchedText']").forEach(function (item) {
  item.setAttribute("style", "white-space:normal");
});