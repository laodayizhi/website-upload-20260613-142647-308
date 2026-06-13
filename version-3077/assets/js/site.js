(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function bindMobileMenu() {
        var toggle = $('[data-mobile-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var carousel = $('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = $all('[data-hero-slide]', carousel);
        var dots = $all('[data-hero-dot]', carousel);
        var prev = $('[data-hero-prev]', carousel);
        var next = $('[data-hero-next]', carousel);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function bindGlobalSearch() {
        var modal = $('[data-search-modal]');
        var input = $('[data-global-search]');
        var results = $('[data-search-results]');
        var count = $('[data-search-count]');
        if (!modal || !input || !results || !count) {
            return;
        }
        var movies = window.MOVIE_INDEX || [];

        function openSearch() {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            setTimeout(function () {
                input.focus();
            }, 30);
        }

        function closeSearch() {
            modal.hidden = true;
            document.body.style.overflow = '';
        }

        function render(items, query) {
            if (!query) {
                count.textContent = '输入关键词发现更多精彩内容';
                results.innerHTML = '';
                return;
            }
            count.textContent = '找到 ' + items.length + ' 个结果';
            results.innerHTML = items.slice(0, 80).map(function (item) {
                return '<a class="search-result-card" href="' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                    '<em>' + escapeHtml(item.oneLine) + '</em>' +
                    '<span><b>' + escapeHtml(item.region) + '</b><i>' + escapeHtml(item.year) + '</i><i>' + escapeHtml(item.type) + '</i></span></span>' +
                    '</a>';
            }).join('');
        }

        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var terms = query.split(/\s+/).filter(Boolean);
            var matched = movies.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
                return terms.every(function (term) {
                    return text.indexOf(term) !== -1;
                });
            });
            render(matched, query);
        });

        $all('[data-open-search]').forEach(function (button) {
            button.addEventListener('click', openSearch);
        });
        $all('[data-close-search]').forEach(function (button) {
            button.addEventListener('click', closeSearch);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !modal.hidden) {
                closeSearch();
            }
        });
    }

    function bindLocalFilter() {
        var input = $('[data-local-filter]');
        var scope = $('[data-filter-scope]');
        if (!input || !scope) {
            return;
        }
        var cards = $all('.movie-card', scope);
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.hidden = query && text.indexOf(query) === -1;
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMobileMenu();
        bindHero();
        bindGlobalSearch();
        bindLocalFilter();
    });
})();
