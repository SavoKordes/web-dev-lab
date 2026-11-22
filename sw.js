/*
 * sw.js — the service worker that makes Web Dev Lab work offline.
 *
 * A service worker is a script the browser runs in the background, between the
 * app and the network. Every request the app makes passes through its `fetch`
 * handler, which decides where the answer comes from.
 *
 * Strategy: NETWORK FIRST, CACHE AS BACKUP.
 *   - Online: the file comes from the network (so you always get the newest
 *     version after an update), and a copy is stored in the cache.
 *   - Offline (or the network is too slow): the stored copy is used.
 *
 * Which files are stored? Instead of a hand-written list of every file (which
 * someone would forget to update), the app tells this worker which files it
 * loaded (see js/core/offline.js), and the worker stores exactly those.
 *
 * Service workers only run on https:// pages and on http://localhost.
 */

const CACHE = 'web-dev-lab-v1';
const NETWORK_TIMEOUT = 4000; // ms before falling back to the cached copy

// Install: store the entry point right away, so even the very first offline
// start finds the app shell. Activate immediately instead of waiting.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest', './icons/icon.svg']))
      .then(() => self.skipWaiting()),
  );
});

// Activate: delete caches from older versions of this worker, and take control
// of pages that are already open.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// The app sends the list of files it has loaded; store each of them.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-urls') return;
  const sameOrigin = event.data.urls.filter((url) => new URL(url).origin === self.location.origin);
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.all(sameOrigin.map((url) =>
      cache.match(url).then((hit) => hit || cache.add(url).catch(() => {}))))),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Only this app's own files. Other sites (like the weather API) are never cached.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT);
    if (response.ok) cache.put(request, response.clone()); // keep the copy up to date
    return response;
  } catch (error) {
    // Offline or too slow: use the stored copy. Page navigations fall back to
    // the app's start page, which works for every route (they are all #hash routes).
    const cached = await cache.match(request, { ignoreSearch: true })
      ?? (request.mode === 'navigate' ? await cache.match('./') : undefined);
    if (cached) return cached;
    throw error;
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}
