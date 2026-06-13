(function () {
    const header = document.querySelector('[data-site-header]');
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    const searchInput = document.querySelector('[data-search-input]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-search-card]'));
    const empty = document.querySelector('[data-empty-result]');

    function filterCards() {
        if (!cards.length) {
            return;
        }
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const year = yearFilter ? yearFilter.value.trim() : '';
        let visibleCount = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute('data-search-text') || '').toLowerCase();
            const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchedYear = !year || text.indexOf(year) !== -1;
            const matched = matchedKeyword && matchedYear;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    filterCards();
}());
