document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  var filterSections = Array.prototype.slice.call(document.querySelectorAll(".catalog-section"));

  filterSections.forEach(function (section) {
    var input = section.querySelector("[data-filter-input]");
    var year = section.querySelector("[data-year-filter]");
    var type = section.querySelector("[data-type-filter]");
    var region = section.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (input && q) {
      input.value = q;
    }

    function includesText(base, needle) {
      return !needle || base.indexOf(needle) !== -1;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-tags") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var visible = includesText(text, keyword)
          && (!yearValue || cardYear === yearValue)
          && (!typeValue || cardType.indexOf(typeValue) !== -1)
          && (!regionValue || cardRegion.indexOf(regionValue) !== -1);

        card.classList.toggle("is-hidden", !visible);
      });
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
});
