// scroll tracking
// will not auto-track milestones that are reached on page load, a scroll action is required
let maxScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
let percentageObj = {};
let milestones = [25, 50, 75, 90]; // add/remove milestones as needed

window.addEventListener("scroll", function (event) {
  let scrollVal = this.scrollY;

  for (let i = 0; i < milestones.length; i++) {
    let currentMilestone = milestones[i];
    let scrollPercentage = parseInt((maxScrollHeight / 100) * currentMilestone);

    if (scrollVal >= scrollPercentage && !percentageObj[currentMilestone]) {
      // mark target percentage as tracked to prevent double-counting the milestone
      percentageObj[currentMilestone] = true;

      // log and track the milestone
      // to use with other TMS or stand-alone, replace utag references with appropriate methods
      utag.DB("scrolled past - " + currentMilestone.toString() + "%");
      utag.link({
        "tealium_event": "scroll",
        "event_action": "scroll",
        "event_category": location.pathname,
        "event_label": currentMilestone.toString() + "%"
      });
    }
  }
});