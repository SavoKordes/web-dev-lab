/*
 * events.js — a tiny publish/subscribe ("pub/sub") event bus.
 *
 * Why: parts of the app need to react to things that happen elsewhere without
 * importing each other. Example: when progress is saved, the dashboard should
 * refresh — but the code that saves progress should not need to know the
 * dashboard exists. One side calls emit('name'), the other side calls on('name').
 *
 *   const stop = on('store:change', (detail) => console.log(detail));
 *   emit('store:change', { section: 'settings' });
 *   stop(); // unsubscribe
 */

// Map of event name → Set of listener functions.
// A Set prevents the same function from being registered twice.
const listeners = new Map();

/**
 * Listen for an event.
 * @param {string} name - Event name, e.g. 'store:change'.
 * @param {(detail: any) => void} fn - Called with the event's detail object.
 * @returns {() => void} A function that removes this listener again.
 */
export function on(name, fn) {
  if (!listeners.has(name)) {
    listeners.set(name, new Set());
  }
  listeners.get(name).add(fn);
  return () => off(name, fn);
}

/** Stop listening for an event. */
export function off(name, fn) {
  listeners.get(name)?.delete(fn);
}

/**
 * Announce that something happened. Every listener for `name` is called.
 * One failing listener must not stop the others, so each call is wrapped in try/catch.
 */
export function emit(name, detail) {
  const fns = listeners.get(name);
  if (!fns) return;

  for (const fn of fns) {
    try {
      fn(detail);
    } catch (err) {
      console.error(`Listener for "${name}" failed:`, err);
    }
  }
}
