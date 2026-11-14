/*
 * sandbox.js — runs your HTML, CSS and JavaScript in an isolated <iframe>.
 *
 * Why an iframe with the `sandbox` attribute?
 *   - Your code gets its own page, so it cannot break the app around it.
 *   - Without "allow-same-origin", it cannot read the app's localStorage or DOM.
 *
 * How we learn what happens inside:
 *   The iframe and the app can only talk with window.postMessage(). Before your
 *   code runs, we inject a small "bridge" script (sandboxBridge, below) that:
 *     1. wraps console.log / warn / error and sends each call to the app,
 *     2. catches uncaught errors and sends the message and line number,
 *     3. provides a working localStorage (the real one is blocked in a sandbox),
 *     4. defines __wdlLoopGuard, used by the infinite-loop protection.
 *
 *   App ──run()──► iframe.srcdoc = full HTML document
 *   iframe ──postMessage({ type: 'console' | 'error' | 'storage' })──► app ──► onMessage()
 */

import { addLoopGuards } from './loop-guard.js';

const MESSAGE_SOURCE = 'wdl-sandbox';

/**
 * Create a sandbox.
 * @param {object} options
 * @param {string} options.title - Accessible name for the iframe.
 * @param {(message: object) => void} options.onMessage - Receives console/error/storage messages.
 * @returns {{ element: HTMLIFrameElement, run: Function, destroy: Function }}
 */
export function createSandbox({ title = 'Preview', onMessage }) {
  const iframe = document.createElement('iframe');
  iframe.className = 'sandbox-frame';
  iframe.title = title;
  // allow-scripts: run JS. allow-modals: alert/confirm/prompt. allow-forms: submit events.
  // NOT allow-same-origin: that keeps the code isolated from the app.
  iframe.setAttribute('sandbox', 'allow-scripts allow-modals allow-forms');

  // Each run gets a number. Messages from an older run (e.g. a timer that fires
  // after you pressed Run again) carry the old number and are ignored.
  let currentRun = 0;

  function handleMessage(event) {
    if (event.source !== iframe.contentWindow) return; // not from our iframe
    const data = event.data;
    if (!data || data.source !== MESSAGE_SOURCE || data.runId !== currentRun) return;
    onMessage(data);
  }
  window.addEventListener('message', handleMessage);

  return {
    element: iframe,

    /**
     * Run code. Replaces whatever ran before.
     * @param {{html: string, css: string, js: string, storage?: object}} files
     */
    run({ html = '', css = '', js = '', storage = {} }) {
      currentRun += 1;
      iframe.srcdoc = buildDocument({ html, css, js, storage, runId: currentRun });
    },

    /** Remove the message listener. Call when the view that owns this sandbox is closed. */
    destroy() {
      window.removeEventListener('message', handleMessage);
    },
  };
}

/* ───────────────── Building the page that runs inside the iframe ───────────────── */

/**
 * Text inside <script> must not contain "</script" — the browser would end the
 * script there. Same for "</style" inside <style>. Writing "<\/script" means the
 * same thing in JavaScript, but no longer looks like a closing tag.
 */
function protectClosingTag(text, tag) {
  return text.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1');
}

function buildDocument({ html, css, js, storage, runId }) {
  const config = {
    source: MESSAGE_SOURCE,
    runId,
    storage,
    lineOffset: 0, // filled in below
    jsLineCount: js.split('\n').length,
  };

  const bridgeCall = () =>
    protectClosingTag(`(${sandboxBridge.toString()})(${JSON.stringify(config)});`, 'script');

  const before = (bridge) => [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<script>${bridge}</script>`,
    `<style>${protectClosingTag(css, 'style')}</style>`,
    '</head>',
    '<body>',
    html,
    '<script>',
    '', // your JavaScript starts on the line after this one
  ].join('\n');

  // Errors report a line number in the WHOLE document. To translate it into a
  // line number in your JS editor, we need to know how many lines come before it.
  config.lineOffset = before(bridgeCall()).split('\n').length - 1;

  const guardedJs = protectClosingTag(addLoopGuards(js), 'script');
  return `${before(bridgeCall())}${guardedJs}\n</script>\n</body>\n</html>`;
}

/*
 * ───────────────── The bridge: this function runs INSIDE the iframe ─────────────────
 *
 * It is never called in the app itself. buildDocument() turns it into text with
 * .toString() and puts that text in a <script> tag in the iframe. So it can only
 * use what exists inside the iframe, plus the `config` object passed to it.
 */
function sandboxBridge(config) {
  const send = (message) => {
    parent.postMessage({ source: config.source, runId: config.runId, ...message }, '*');
  };

  /* ── 1. Turn any value into readable text, similar to the browser console ── */
  function format(value, depth = 0, seen = new WeakSet()) {
    if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
    if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'function') return `ƒ ${value.name || '(anonymous)'}()`;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (typeof Element !== 'undefined' && value instanceof Element) {
      const id = value.id ? `#${value.id}` : '';
      const cls = value.classList.length ? `.${[...value.classList].join('.')}` : '';
      return `<${value.tagName.toLowerCase()}${id}${cls}>`;
    }
    if (value instanceof Date) return `Date(${value.toISOString()})`;
    if (value instanceof Promise) return 'Promise { … }';
    if (seen.has(value)) return '[Circular]';
    if (depth > 3) return Array.isArray(value) ? '[…]' : '{…}';
    seen.add(value);

    if (Array.isArray(value)) {
      const items = value.slice(0, 100).map((item) => format(item, depth + 1, seen));
      if (value.length > 100) items.push(`… ${value.length - 100} more`);
      return `[${items.join(', ')}]`;
    }
    if (value instanceof Map) {
      const entries = [...value].map(([k, v]) => `${format(k, depth + 1, seen)} => ${format(v, depth + 1, seen)}`);
      return `Map(${value.size}) {${entries.join(', ')}}`;
    }
    if (value instanceof Set) {
      return `Set(${value.size}) {${[...value].map((v) => format(v, depth + 1, seen)).join(', ')}}`;
    }

    const name = value.constructor && value.constructor !== Object ? `${value.constructor.name} ` : '';
    const entries = Object.keys(value).slice(0, 50)
      .map((key) => `${key}: ${format(value[key], depth + 1, seen)}`);
    return entries.length ? `${name}{ ${entries.join(', ')} }` : `${name}{}`;
  }

  /* ── 2. Forward console calls to the app (and still log them normally) ── */
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      send({ type: 'console', level, parts: args.map((arg) => format(arg)) });
      original(...args);
    };
  }
  console.table = (data) => console.log(data);
  console.clear = () => send({ type: 'clear' });

  /* ── 3. Report uncaught errors with a line number in YOUR code ── */
  function toEditorLine(documentLine) {
    const line = documentLine - config.lineOffset;
    return line >= 1 && line <= config.jsLineCount ? line : null;
  }

  window.addEventListener('error', (event) => {
    send({
      type: 'error',
      message: event.message || String(event.error),
      line: event.error?.editorLine ?? (event.lineno ? toEditorLine(event.lineno) : null),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const text = reason instanceof Error ? `${reason.name}: ${reason.message}` : format(reason);
    send({ type: 'error', message: `Uncaught (in promise) ${text}`, line: null });
  });

  /* ── 4. localStorage replacement ──
   * A sandboxed iframe without allow-same-origin may not use the real localStorage.
   * This object behaves the same way (getItem, setItem, …) and sends every change
   * to the app, which saves it, so your data survives the next run. */
  const data = new Map(Object.entries(config.storage || {}));
  const sync = () => send({ type: 'storage', data: Object.fromEntries(data) });
  const storage = {
    getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
    setItem: (key, value) => { data.set(String(key), String(value)); sync(); },
    removeItem: (key) => { data.delete(String(key)); sync(); },
    clear: () => { data.clear(); sync(); },
    key: (index) => [...data.keys()][index] ?? null,
    get length() { return data.size; },
  };
  try {
    Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
  } catch (err) {
    send({ type: 'console', level: 'warn', parts: ['localStorage is not available in this preview.'] });
  }

  /* ── 5. Infinite-loop protection (see js/services/loop-guard.js) ── */
  let loopStart = 0;
  let timerPending = false;
  window.__wdlLoopGuard = (line) => {
    if (!timerPending) {
      // A timer only fires after the current code finishes. If it never fires,
      // the code has been looping without a break for the whole time.
      timerPending = true;
      loopStart = Date.now();
      setTimeout(() => { timerPending = false; }, 0);
    } else if (Date.now() - loopStart > 1500) {
      timerPending = false;
      const error = new RangeError(`Loop on line ${line} ran too long and was stopped. Is its exit condition ever reached?`);
      error.editorLine = line; // the error is thrown here in the bridge, so its own line number is not useful
      throw error;
    }
  };
}
