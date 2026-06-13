(function () {
    function initMoviePlayer(streamUrl) {
        const video = document.querySelector('[data-player-video]');
        const overlay = document.querySelector('[data-player-overlay]');
        const button = document.querySelector('[data-player-button]');
        let loaded = false;
        let hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function loadStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
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
            } else {
                video.src = streamUrl;
            }
            video.controls = true;
        }

        function startPlayback() {
            loadStream();
            if (overlay) {
                overlay.hidden = true;
            }
            const playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                startPlayback();
            });
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
}());
