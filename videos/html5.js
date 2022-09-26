// VIDEO TRACKING
// monitors video start, progress (25/50/75), complete (at 95% viewed)
window.video_monitor = {}
let trackVideo = function (payload) {
  console.log({
    "video_event": payload.video_event || "",
    "video_title": payload.video_title || "",
    "video_current_time": payload.video_current_time || 0,
    "video_duration": payload.video_duration || 0,
    "video_percent": payload.video_percent || 0,
    "video_provider": payload.video_provider || "",
    "video_url": payload.video_url || ""
  });
}

// find videos and add event listeners + tracking logic
let videos = document.querySelectorAll("video");
videos.forEach(function (video, index) {
  // let title = video.getAttribute("XXXXXXX");
  let title = ""; // find the title and set it, per video, here
  let video_identifier = "vid" + index;

  // set defaults for each video, store in window.video_monitor
  window.video_monitor[video_identifier] = {};
  window.video_monitor[video_identifier].hasPlayed = false;
  window.video_monitor[video_identifier].hasEnded = false;
  window.video_monitor[video_identifier].title = title;
  window.video_monitor[video_identifier].video_provider = "html5-player";
  window.video_monitor[video_identifier].url = document.location.protocol + "//" + document.location.hostname + document.location.pathname;

  video.onplay = (event) => {
    if (!window.video_monitor[video_identifier].hasPlayed) {
      // mark video as having been played to prevent tracking multiple times per page load
      window.video_monitor[video_identifier].hasPlayed = true;
      window.video_monitor[video_identifier].duration = Math.round(event.target.duration);
      let payload = {
        "video_event": "video_start",
        "video_title": window.video_monitor[video_identifier].title,
        "video_duration": window.video_monitor[video_identifier].duration,
        "video_current_time": "",
        "video_percent": "",
        "video_provider": window.video_monitor[video_identifier].video_provider,
        "video_url": window.video_monitor[video_identifier].url
      }
      trackVideo(payload);
    }
  }

  // monitor video progress
  video.ontimeupdate = (event) => {
    let current = Math.round(event.target.currentTime);
    let duration = window.video_monitor[video_identifier].duration = Math.round(event.target.duration);
    let percent = Math.round((current / duration) * 100);
    let milestone = (function (percentPlayed) {
      percentPlayed = Math.round(percent);
      if (percentPlayed >= 25 && !window.video_monitor[video_identifier].milestone25) {
        window.video_monitor[video_identifier].milestone25 = true;
        return "25";
      }
      if (percentPlayed >= 50 && !window.video_monitor[video_identifier].milestone50) {
        window.video_monitor[video_identifier].milestone50 = true;
        return "50";
      }
      if (percentPlayed >= 75 && !window.video_monitor[video_identifier].milestone75) {
        window.video_monitor[video_identifier].milestone75 = true;
        return "75";
      }
      if (percentPlayed >= 95 && !window.video_monitor[video_identifier].milestone90) {
        window.video_monitor[video_identifier].milestone90 = true;
        return "95"; // 95% viewed is used as "complete"
      }
      return false;
    })(percent);

    if (milestone) {
      if (milestone === "95") {
        // mark video as having completed to prevent tracking multiple times per page load
        window.video_monitor[video_identifier].hasEnded = true;
      }
      let payload = {
        "video_event": (milestone === "95") ? "video_complete" : "video_progress", // at 95%, track as completed
        "video_title": window.video_monitor[video_identifier].title,
        "video_duration": window.video_monitor[video_identifier].duration,
        "video_current_time": current,
        "video_percent": milestone,
        "video_provider": window.video_monitor[video_identifier].video_provider,
        "video_url": window.video_monitor[video_identifier].url
      }
      trackVideo(payload);
    }
  }
});