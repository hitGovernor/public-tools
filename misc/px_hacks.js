// PX: Wrap Project Names
// bookmarklet: 
// javascript:(function()%7Bdocument.querySelectorAll(%22%5Bdata-testid%3D%27MatchedText%27%5D,%20%5Bdata-testid%3D%27UiTypography%27%5D%22).forEach(function(item)%7Bitem.setAttribute(%22style%22,%22white-space:normal%22)%3B%7D)%3B%7D)()%3B

document.querySelectorAll("[data-testid='MatchedText'], [data-testid='UiTypography']").forEach(function (item) {
  item.setAttribute("style", "white-space:normal");
});