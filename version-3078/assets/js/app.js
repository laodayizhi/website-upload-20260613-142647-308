(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        restart();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var container = panel.parentElement.querySelector('[data-card-container]');
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
            var search = panel.querySelector('[data-filter-search]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var category = panel.querySelector('[data-filter-category]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery && search) {
                search.value = initialQuery;
            }

            function valueOf(input) {
                return input ? input.value.trim().toLowerCase() : '';
            }

            function apply() {
                var q = valueOf(search);
                var y = valueOf(year);
                var r = valueOf(region);
                var t = valueOf(type);
                var c = valueOf(category);
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var visible = true;
                    if (q && text.indexOf(q) === -1) visible = false;
                    if (y && String(card.getAttribute('data-year')).toLowerCase() !== y) visible = false;
                    if (r && String(card.getAttribute('data-region')).toLowerCase() !== r) visible = false;
                    if (t && String(card.getAttribute('data-type')).toLowerCase() !== t) visible = false;
                    if (c && String(card.getAttribute('data-category')).toLowerCase() !== c) visible = false;
                    card.classList.toggle('is-hidden-card', !visible);
                });
            }

            [search, year, region, type, category].forEach(function (input) {
                if (input) {
                    input.addEventListener('input', apply);
                    input.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function playVideo(video, mask) {
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-stream');
        if (!src) {
            return;
        }
        function start() {
            if (mask) {
                mask.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== src) {
                video.src = src;
            }
            start();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsPlayer) {
                video._hlsPlayer = new window.Hls();
                video._hlsPlayer.loadSource(src);
                video._hlsPlayer.attachMedia(video);
                video._hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, start);
            } else {
                start();
            }
            return;
        }
        video.src = src;
        start();
    }

    function initPlayers() {
        document.addEventListener('click', function (event) {
            var button = event.target.closest('[data-play-target]');
            if (!button) {
                return;
            }
            var id = button.getAttribute('data-play-target');
            var video = document.getElementById(id);
            playVideo(video, button);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
