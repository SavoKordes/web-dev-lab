/*
 * shell.js — behavior of the app frame around the views:
 * the mobile navigation drawer, the active nav link and the top-bar title.
 */

import { qs } from '../core/dom.js';

const app = qs('#app');
const sidebar = qs('#sidebar');
const openButton = qs('[data-action="open-nav"]');
const titleEl = qs('#topbar-title');

// Same breakpoint as the @media rule in layout.css.
const mobileQuery = window.matchMedia('(max-width: 899px)');

/* ───────────── Mobile navigation drawer ───────────── */

function isOpen() {
  return app.classList.contains('nav-open');
}

export function openNav() {
  app.classList.add('nav-open');
  openButton.setAttribute('aria-expanded', 'true');
  syncInert();
  // Move keyboard focus into the drawer so Tab continues from there.
  qs('.nav-link', sidebar)?.focus();
}

export function closeNav({ returnFocus = false } = {}) {
  if (!isOpen()) return;
  app.classList.remove('nav-open');
  openButton.setAttribute('aria-expanded', 'false');
  syncInert();
  if (returnFocus) openButton.focus();
}

/**
 * On mobile, a closed drawer is off-screen but its links would still receive
 * Tab focus — confusing for keyboard users. The `inert` attribute makes the
 * whole sidebar unfocusable and invisible to screen readers while it is closed.
 */
function syncInert() {
  sidebar.inert = mobileQuery.matches && !isOpen();
}

export function initShell() {
  // One click listener for the whole document handles every [data-action] button,
  // including ones added later. This is called "event delegation".
  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    if (actionEl.dataset.action === 'open-nav') openNav();
    if (actionEl.dataset.action === 'close-nav') closeNav({ returnFocus: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) closeNav({ returnFocus: true });
  });

  // Resizing from mobile to desktop width: reset the drawer state.
  mobileQuery.addEventListener('change', () => {
    closeNav();
    syncInert();
  });

  syncInert();
}

/* ───────────── Per-page updates (called by main.js on navigation) ───────────── */

/** Highlight the nav link for the current section with aria-current="page". */
export function setActiveSection(section) {
  for (const link of document.querySelectorAll('.nav-link')) {
    if (link.dataset.section === section) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

export function setPageTitle(title) {
  titleEl.textContent = title;
  document.title = title ? `${title} · Web Dev Lab` : 'Web Dev Lab';
}
