function createMoviePlayer(options) {
    var video = options && options.video;
    var button = options && options.button;
    var overlay = options && options.overlay;
    var source = options && options.source;
    var hls = null;
    var ready = false;

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function attachSource() {
        if (!video || !source || ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return;
        }
        video.src = source;
    }

    function start() {
        if (!video) {
            return;
        }
        attachSource();
        hideOverlay();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }
    if (overlay) {
        overlay.addEventListener('click', start);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', hideOverlay);
    }
}
