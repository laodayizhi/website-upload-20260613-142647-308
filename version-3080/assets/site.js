(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var menu = document.querySelector("[data-mobile-menu]");
        if (menu) {
          menu.classList.toggle("is-open");
        }
      });
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        var target = "search.html";
        if (keyword) {
          target += "?q=" + encodeURIComponent(keyword);
        }
        window.location.href = target;
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var container = panel.closest("main") || document;
      var input = panel.querySelector("[data-filter-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var counter = panel.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(container.querySelectorAll(".searchable-list .movie-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      if (yearSelect) {
        var years = cards.map(function (card) {
          return card.getAttribute("data-year") || "";
        }).filter(Boolean).filter(function (value, index, list) {
          return list.indexOf(value) === index;
        }).sort(function (a, b) {
          return Number(b) - Number(a);
        });

        years.forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-text"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var visible = true;

          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }
          if (year && cardYear !== year) {
            visible = false;
          }
          if (region && cardRegion !== region) {
            visible = false;
          }
          if (type && cardType !== type) {
            visible = false;
          }

          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            shown += 1;
          }
        });

        if (counter) {
          counter.textContent = "找到 " + shown + " 部";
        }
      }

      [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector(".js-video");
      var button = player.querySelector(".js-play");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-m3u8");
      var attached = false;

      function attach() {
        if (attached || !source) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
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
        } else {
          video.src = source;
        }
      }

      function playOrPause() {
        attach();
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              if (button) {
                button.textContent = "继续播放";
              }
            });
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", playOrPause);
      }

      video.addEventListener("click", function () {
        if (video.controls) {
          return;
        }
        playOrPause();
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        if (button) {
          button.textContent = "暂停播放";
        }
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
        if (button) {
          button.textContent = "继续播放";
        }
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
        if (button) {
          button.textContent = "重新播放";
        }
      });
    });
  });
})();
