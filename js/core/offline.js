/*
 * offline.js — registers the service worker (sw.js) so the app works offline.
 *
 * After the page has loaded, it sends the worker the list of files the page
 * actually loaded (from the browser's Resource Timing API), so the worker can
 * store exactly those. No hand-written file list to keep up to date.
 */

export function isOfflineSupported() {
  // Service workers need a secure context: https:// or http://localhost.
  return 'serviceWorker' in navigator && window.isSecureContext;
}

/** True when the app is running under the control of the service worker. */
export function isOfflineReady() {
  return isOfflineSupported() && Boolean(navigator.serviceWorker.controller);
}

export async function registerOffline() {
  if (!isOfflineSupported()) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
    const registration = await navigator.serviceWorker.ready;

    const sendLoadedFiles = () => {
      const urls = [
        location.href.split('#')[0],
        ...performance.getEntriesByType('resource').map((entry) => entry.name),
      ];
      registration.active?.postMessage({ type: 'cache-urls', urls });
    };

    if (document.readyState === 'complete') sendLoadedFiles();
    else window.addEventListener('load', sendLoadedFiles, { once: true });
  } catch (error) {
    // Offline support is an extra: if it fails, the app still works online.
    console.warn('Offline support could not be enabled.', error);
  }
}
