/* =============================================================================
   Benedetti & Santini — interazioni
   ========================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Tema (persistente) ---------------------------------------------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("bs-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("bs-theme", next); } catch (e) {}
    });
  }

  /* ---- Header : stato allo scroll -------------------------------------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ----------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  function setMenu(open) {
    if (!mobileNav || !navToggle) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    if (open) {
      mobileNav.hidden = false;
      requestAnimationFrame(function () { mobileNav.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
    } else {
      mobileNav.classList.remove("is-open");
      document.body.style.overflow = "";
      var done = function () { mobileNav.hidden = true; mobileNav.removeEventListener("transitionend", done); };
      if (reduceMotion) { mobileNav.hidden = true; } else { mobileNav.addEventListener("transitionend", done); }
    }
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle && navToggle.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  /* ---- Link attivo nella nav (sezione in vista) ------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__list a"));
  var linkById = {};
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (id) linkById[id] = a;
  });
  var sections = Object.keys(linkById).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var link = linkById[en.target.id];
          if (link) link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Parallax leggero sull'immagine hero ----------------------------- */
  var heroImg = document.querySelector(".hero__media img");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    var applyParallax = function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = "scale(1.06) translateY(" + (y * 0.06) + "px)";
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
  }

  /* ---- Anno footer ----------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Form contatti (demo, validazione client) ------------------------ */
  (function () {
    var form = document.querySelector(".contatti__form");
    if (!form) return;
    var success = form.querySelector(".contatti__success");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(field, msg) {
      var err = form.querySelector('.field__error[data-for="' + field.id + '"]');
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }
    function validate() {
      var ok = true;
      var nome = form.querySelector("#f-nome");
      var email = form.querySelector("#f-email");
      var msg = form.querySelector("#f-msg");
      if (!nome.value.trim()) { setError(nome, "Inserisci il tuo nome."); ok = false; } else setError(nome, "");
      if (!emailRe.test(email.value.trim())) { setError(email, "Inserisci un'email valida."); ok = false; } else setError(email, "");
      if (!msg.value.trim()) { setError(msg, "Descrivi brevemente il progetto."); ok = false; } else setError(msg, "");
      return ok;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstErr = form.querySelector('[aria-invalid="true"]');
        if (firstErr) firstErr.focus();
        return;
      }
      if (success) { success.hidden = false; }
      form.querySelectorAll("input, textarea").forEach(function (el) { el.value = ""; el.setAttribute("aria-invalid", "false"); });
    });
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setError(el, ""); });
    });
  })();

  /* ---- Lightbox galleria ----------------------------------------------- */
  (function () {
    var lb = document.getElementById("lightbox");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
    if (!lb || !items.length) return;
    var img = lb.querySelector(".lightbox__img");
    var curEl = document.getElementById("lb-cur");
    var totEl = document.getElementById("lb-tot");
    var btnClose = lb.querySelector(".lightbox__close");
    var btnPrev = lb.querySelector(".lightbox__prev");
    var btnNext = lb.querySelector(".lightbox__next");
    var sources = items.map(function (it) {
      var im = it.querySelector("img");
      return { src: im.getAttribute("src"), alt: im.getAttribute("alt") || "" };
    });
    var index = 0, lastFocused = null;
    if (totEl) totEl.textContent = String(sources.length);

    function show(i) {
      index = (i + sources.length) % sources.length;
      img.setAttribute("src", sources[index].src);
      img.setAttribute("alt", sources[index].alt);
      if (curEl) curEl.textContent = String(index + 1);
    }
    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      btnClose.focus();
    }
    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      var done = function () { lb.hidden = true; lb.removeEventListener("transitionend", done); };
      if (reduceMotion) lb.hidden = true; else lb.addEventListener("transitionend", done);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        var f = [btnClose, btnPrev, btnNext];
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* ---- Reveal allo scroll ---------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }
})();
