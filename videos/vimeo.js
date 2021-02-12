// create a global placeholder for all videos on the page
window.vimeoPlayers = {}

// find all vimeo iframes on the page and begin assigning tracking logic
var vimeoIframes = document.querySelectorAll("iframe[src*='player.vimeo.com']");
vimeoIframes.forEach(function (iframe) {
  // create the player object
  var player = new Vimeo.Player(iframe);

  // build placholders for the video name, id and duration, then populate below
  var vid_name = "",
    vid_id = "",
    vid_duration = "";

  player.getVideoTitle().then(function (title) {
    vid_name = title;
  });

  player.getDuration().then(function (duration) {
    vid_duration = duration;
  });

  player.getVideoId().then(function (videoId) {
    vid_id = videoId;

    // add the video to the global object if it doesn't already exist
    window.vimeoPlayers[vid_id] = window.vimeoPlayers[vid_id] || {
      id: vid_id,
      name: vid_name,
      duration: vid_duration,
      status: {
        step_play: false,
        step_25: false,
        step_50: false,
        step_75: false,
        step_95: false,
        step_end: false
      }
    };
  });

  // calld on completion of a video (will re-enable step tracking)
  function resetProgressOnComplete(videoId) {
    window.vimeoPlayers[videoId].status = {
      step_play: false,
      step_25: false,
      step_50: false,
      step_75: false,
      step_95: false,
      step_end: false
    }
  }

  // updates the milestone info and sends the analytics call (adobe launch direct call rule shown)
  function trackProgress(milestone, videoId) {
    window.vimeoPlayers[videoId].milestone = milestone;
    console.log("Video milestone", milestone, "reached for:", window.vimeoPlayers[videoId]);

    // trigger your direct call rule here
    // _satellite.track("dcr:video progress", window.vimeoPlayers[videoId]);
  }

  // monitors video progress, determines whether to call trackProgress or not
  function checkProgress(videoId, milestone, percent) {
    var step = "step_" + milestone;
    if (milestone === "play" || milestone === "end") {
      if (!window.vimeoPlayers[videoId].status[step]) {
        window.vimeoPlayers[videoId].status[step] = true;
        trackProgress(step, videoId);
      }
      if (milestone === "end") {
        resetProgressOnComplete(videoId);
      }
    } else {
      if ((percent * 100) >= milestone) {
        if (!window.vimeoPlayers[videoId].status[step]) {
          window.vimeoPlayers[videoId].status[step] = true;
          trackProgress(step, videoId);
        }
      }
    }
  }

  // track videos on Play
  player.on('play', function (data) {
    player.getVideoId().then(function (videoId) {
      checkProgress(videoId, 'play');
    });
  });

  // track videos at percent played
  player.on('timeupdate', function (data) {
    player.getVideoId().then(function (videoId) {
      checkProgress(videoId, 25, data.percent);
      checkProgress(videoId, 50, data.percent);
      checkProgress(videoId, 75, data.percent);

      // any milestone can be added, but be sure to add it to 'status' in getVideoId above
      // checkProgress(videoId, 95, data.percent); 
    });
  });

  // track videos on End
  player.on('ended', function (data) {
    player.getVideoId().then(function (videoId) {
      checkProgress(videoId, 'end');
    });
  });
});