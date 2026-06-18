/* Eikenlaan — light/dark toggle (geïsoleerd, geen globale namen, geen afhankelijkheden).
   - Onthoudt keuze in localStorage onder 'eik-theme'.
   - Zonder keuze volgt de site automatisch de systeemvoorkeur (zie theme.css).
   - Injecteert één zwevende knop rechtsonder. Raakt verder niets aan. */
(function () {
  "use strict";
  if (window.__eikThemeInit) return;
  window.__eikThemeInit = true;

  var KEY = "eik-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function effective() {
    var s = stored();
    if (s === "dark" || s === "light") return s;
    return systemDark() ? "dark" : "light";
  }
  function apply(mode) {
    if (mode === "dark" || mode === "light") root.setAttribute("data-theme", mode);
    else root.removeAttribute("data-theme");
  }

  // Vroege toepassing van een eventueel opgeslagen keuze (beperkt flikkeren).
  var s = stored();
  if (s === "dark" || s === "light") apply(s);

  function icon(mode) { return mode === "dark" ? "☀︎" : "☾︎"; }
  function label(mode) { return mode === "dark" ? "Lichte modus" : "Donkere modus"; }

  function build() {
    if (document.querySelector(".theme-toggle")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    function refresh() {
      var cur = effective();
      btn.textContent = icon(cur);
      btn.setAttribute("aria-label", label(cur));
      btn.title = label(cur);
    }
    btn.addEventListener("click", function () {
      var next = effective() === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      refresh();
    });
    refresh();
    document.body.appendChild(btn);

    // Volg systeemwijzigingen wanneer de gebruiker zelf niets koos.
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () { if (!stored()) refresh(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
