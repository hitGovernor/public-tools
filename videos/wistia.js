window.videos = {};
wistiaEmbeds.forEach(function (vid) {
  window.videos[vid.hashedId()] = {
    id: vid.hashedId(),
    name: vid.name(),
    duration: vid.duration(),
    status: {
      step_play: false,
      step_25: false,
      step_50: false,
      step_75: false,
      step_95: false,
      step_end: false
    }
  }

  function resetProgressOnComplete(videoId) {
    window.videos[vid.hashedId()].status = {
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

  function checkProgress(milestone, percent) {
    var step = "step_" + milestone;
    if (milestone === "play" || milestone === "end") {
      if (!window.videos[vid.hashedId()].status[step]) {
        window.videos[vid.hashedId()].status[step] = true;
        trackProgress(step, window.videos[vid.hashedId()]);
      }
      if (milestone === "end") {
        resetProgressOnComplete(vid.hashedId());
      }
    } else {
      if ((percent * 100) >= milestone) {
        if (!window.videos[vid.hashedId()].status[step]) {
          window.videos[vid.hashedId()].status[step] = true;
          trackProgress(step, window.videos[vid.hashedId()]);
        }
      }
    }
  }

  vid.bind('percentwatchedchanged', function (percent, lastPercent) {
    checkProgress(25, percent);
    checkProgress(50, percent);
    checkProgress(75, percent);
    checkProgress(95, percent);
  });

  vid.bind('play', function () {
    checkProgress('play');
  });

  vid.bind('end', function () {
    checkProgress('end');
  });
});