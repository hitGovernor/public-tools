function resetProgressOnComplete(videoId) {
  window.videos[videoId].status = {
    step_play: false,
    step_25: false,
    step_50: false,
    step_75: false,
    step_95: false,
    step_end: false
  }
}

function trackProgress(milestone, currentVideo) {
  currentVideo.milestone = milestone;
  console.log("Video milestone", milestone, "reached for:", currentVideo);

  // trigger your direct call rule here
  // _satellite.track("dcr:video progress", currentVideo);
}

function checkProgress(videoId, milestone, percent) {
  var step = "step_" + milestone;
  if (milestone === "play" || milestone === "end") {
    if (!window.videos[videoId].status[step]) {
      window.videos[videoId].status[step] = true;
      trackProgress(step, window.videos[videoId]);
    }
    if (milestone === "end") {
      resetProgressOnComplete(videoId);
    }
  } else {
    if ((percent * 100) >= milestone) {
      if (!window.videos[videoId].status[step]) {
        window.videos[videoId].status[step] = true;
        trackProgress(step, window.videos[videoId]);
      }
    }
  }
}

window.videos = {};
window._wq = window._wq || [];
_wq.push({
  id: "_all",
  onReady: function (video) {
    console.log("VIDEO LOADED:", video.hashedId(), video);
    window.videos[video.hashedId()] = {
      id: video.hashedId(),
      name: video.name(),
      duration: video.duration(),
      status: {
        step_play: false,
        step_25: false,
        step_50: false,
        step_75: false,
        step_95: false,
        step_end: false
      }
    }

    video.bind('play', function () {
      checkProgress(video.hashedId(), 'play');
    });

    video.bind('percentwatchedchanged', function (percent, lastPercent) {
      checkProgress(video.hashedId(), 25, percent);
      checkProgress(video.hashedId(), 50, percent);
      checkProgress(video.hashedId(), 75, percent);
      checkProgress(video.hashedId(), 95, percent);
    });

    video.bind('end', function () {
      checkProgress(video.hashedId(), 'end');
    });
  }
});