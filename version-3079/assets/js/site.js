(function () {
    const index = Array.isArray(window.siteSearchIndex) ? window.siteSearchIndex : [];

    function selectAll(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    function setupMenu() {
        const button = document.querySelector('.js-menu-button');
        const nav = document.querySelector('.js-mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.hidden = !nav.hidden;
        });
    }

    function setupHero() {
        const slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        const slides = selectAll('[data-hero-slide]');
        const dots = selectAll('[data-hero-dot]');
        const prev = document.querySelector('[data-hero-prev]');
        const next = document.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function renderResults(panel, results) {
        if (!panel) {
            return;
        }
        if (!results.length) {
            panel.innerHTML = '<a href="categories.html"><span></span><strong>浏览全部分类</strong><span>换个关键词继续查找</span></a>';
            panel.hidden = false;
            return;
        }
        panel.innerHTML = results.map(function (item) {
            return '<a href="' + item.link + '">' +
                '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.year + '</span></span>' +
                '</a>';
        }).join('');
        panel.hidden = false;
    }

    function setupSearch() {
        const boxes = selectAll('.js-site-search');
        boxes.forEach(function (box) {
            const holder = box.parentElement;
            const panel = holder ? holder.querySelector('.js-search-panel') : null;
            box.addEventListener('input', function () {
                const query = box.value.trim().toLowerCase();
                if (!query) {
                    if (panel) {
                        panel.hidden = true;
                    }
                    return;
                }
                const results = index.filter(function (item) {
                    const text = [item.title, item.region, item.year, item.category].join(' ').toLowerCase();
                    return text.indexOf(query) !== -1;
                }).slice(0, 8);
                renderResults(panel, results);
            });
            document.addEventListener('click', function (event) {
                if (panel && holder && !holder.contains(event.target)) {
                    panel.hidden = true;
                }
            });
        });
    }

    function setupLocalFilters() {
        const list = document.querySelector('.js-card-list');
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll('.movie-card'));
        const search = document.querySelector('.js-local-search');
        const year = document.querySelector('.js-year-filter');

        function apply() {
            const query = search ? search.value.trim().toLowerCase() : '';
            const selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const region = (card.getAttribute('data-region') || '').toLowerCase();
                const tags = (card.getAttribute('data-tags') || '').toLowerCase();
                const cardYear = card.getAttribute('data-year') || '';
                const matchText = !query || title.indexOf(query) !== -1 || region.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
                const matchYear = !selectedYear || cardYear === selectedYear;
                card.classList.toggle('is-hidden', !(matchText && matchYear));
            });
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupLocalFilters();
    });
}());
