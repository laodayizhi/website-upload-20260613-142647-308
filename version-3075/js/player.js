function initPlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var cover = document.getElementById("player-cover");
  var button = document.getElementById("player-start");
  var started = false;
  var hlsInstance = null;

  if (!video || !cover || !button || !streamUrl) {
    return;
  }

  function attachStream() {
    if (started) {
      return;
    }

    started = true;
    cover.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {});
  }

  cover.addEventListener("click", attachStream);
  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    attachStream();
  });
  video.addEventListener("click", function () {
    if (!started) {
      attachStream();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
