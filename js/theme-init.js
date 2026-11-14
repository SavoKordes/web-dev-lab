/*
 * theme-init.js — runs BEFORE the page is drawn (classic script in <head>).
 *
 * Two small jobs:
 * 1. Apply the saved theme immediately, so there is no white flash in dark mode.
 * 2. Warn if the page was opened as a file (file://). Browsers refuse to load
 *    ES modules from file:// URLs, so the app would otherwise show a blank page.
 *
 * This file cannot use `import`, so it reads localStorage directly. The key and
 * the data shape must match js/core/store.js.
 */
(function () {
  var STORAGE_KEY = 'wdl.state';

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    var theme = saved && saved.settings && saved.settings.theme;
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (err) {
    // Storage blocked or data unreadable: fall back to the system theme.
  }

  if (location.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', function () {
      var main = document.getElementById('main');
      if (!main) return;
      main.innerHTML =
        '<div class="page"><div class="callout callout--mistake">' +
        '<p class="callout__label">Start a local server</p>' +
        '<p>This app uses ES modules, which browsers block on <code>file://</code> pages.</p>' +
        '<p>In a terminal, inside the project folder, run <code>python3 -m http.server 8000</code> ' +
        'and open <code>http://localhost:8000</code>. (Or use VS Code’s “Live Server” extension.)</p>' +
        '</div></div>';
    });
  }
})();
