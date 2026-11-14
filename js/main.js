/*
 * main.js — the application's entry point.
 *
 * It does three things:
 *   1. Defines the routes: which URL shows which view.
 *   2. Starts the theme toggle and the navigation drawer.
 *   3. Starts the router, and renders a view each time the URL changes.
 *
 * ─── The view contract ───
 * Every view module exports:  render(root, params, path)
 *   root   – an empty element to put the page into
 *   params – values captured from the URL, e.g. { moduleId: 'js' }
 * render() MAY return a "cleanup" function. It is called just before the next
 * view is shown, so a view can remove listeners or timers it created.
 * Without cleanup, a listener from an old page would keep running in the background.
 */

import { createRouter } from './core/router.js';
import { on } from './core/events.js';
import { qs, toast } from './core/dom.js';
import { initTheme } from './ui/theme.js';
import { initShell, closeNav, setActiveSection, setPageTitle } from './ui/shell.js';

import * as dashboard from './views/dashboard.js';
import * as curriculum from './views/curriculum.js';
import * as progress from './views/progress.js';
import * as learn from './views/learn.js';
import * as code from './views/code.js';
import * as debug from './views/debug.js';
import * as understand from './views/understand.js';
import * as projects from './views/projects.js';
import * as settings from './views/settings.js';
import * as styleguide from './views/styleguide.js';
import * as notFound from './views/not-found.js';

/*
 * The route table. `section` decides which nav link is highlighted.
 * More specific routes (e.g. '/learn/:moduleId/:lessonId') are added in later stages.
 */
const routes = [
  { path: '/',           view: dashboard,  title: 'Dashboard',        section: 'dashboard' },
  { path: '/curriculum', view: curriculum, title: 'Curriculum',       section: 'curriculum' },
  { path: '/progress',   view: progress,   title: 'Progress',         section: 'progress' },
  { path: '/learn',      view: learn,      title: 'Learn',            section: 'learn' },
  { path: '/code',       view: code,       title: 'Code',             section: 'code', wide: true },
  { path: '/debug',      view: debug,      title: 'Debug',            section: 'debug' },
  { path: '/understand', view: understand, title: 'Understand',       section: 'understand' },
  { path: '/projects',   view: projects,   title: 'Projects',         section: 'projects' },
  { path: '/settings',   view: settings,   title: 'Settings',         section: 'settings' },
  { path: '/styleguide', view: styleguide, title: 'Design reference', section: 'settings' },
];

const main = qs('#main');
let cleanupCurrentView = null;

/** Called by the router whenever the URL changes. */
function showRoute({ route, params, path }) {
  // 1. Let the previous view clean up after itself.
  if (typeof cleanupCurrentView === 'function') cleanupCurrentView();
  cleanupCurrentView = null;

  const view = route ? route.view : notFound;

  // 2. Update the frame around the view.
  setPageTitle(route ? route.title : 'Not found');
  setActiveSection(route ? route.section : null);
  closeNav();

  // 3. Render the new view into a fresh page container.
  const page = document.createElement('div');
  page.className = route?.wide ? 'page page--wide' : 'page';
  main.replaceChildren(page);

  try {
    cleanupCurrentView = view.render(page, params, path);
  } catch (err) {
    // A bug in one view should not leave a blank screen with no explanation.
    console.error(err);
    page.replaceChildren();
    page.innerHTML = '<div class="callout callout--mistake"><p class="callout__label">Something went wrong</p><p>This page failed to load. The browser console has the details.</p></div>';
  }

  // 4. Accessibility: start at the top and move focus to the new page's heading,
  //    so screen-reader and keyboard users know the page changed.
  window.scrollTo(0, 0);
  const heading = page.querySelector('h1');
  (heading ?? main).focus({ preventScroll: true });
}

/* ───────── Start the app ───────── */

initTheme(qs('#theme-toggle'));
initShell();

// If saving fails (storage full or blocked), tell the user once instead of failing silently.
let storageWarningShown = false;
on('store:error', () => {
  if (storageWarningShown) return;
  storageWarningShown = true;
  toast('Your progress could not be saved in this browser. Check that site storage is allowed.', 6000);
});

createRouter(routes, showRoute).start();
