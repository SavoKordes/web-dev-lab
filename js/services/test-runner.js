/*
 * test-runner.js — checks your code automatically with small tests.
 *
 * Exercises describe their tests as plain functions in content files:
 *
 *   tests: [
 *     {
 *       name: 'getInitials("Ada Lovelace") returns "AL"',
 *       run: ({ expect }) => {
 *         expect(getInitials('Ada Lovelace')).toBe('AL');
 *       },
 *     },
 *   ]
 *
 * The tests must run INSIDE the sandbox, next to your code, because that is
 * where your functions and your page exist. Functions cannot be sent through
 * postMessage, so we send their SOURCE TEXT (fn.toString()) and the sandbox
 * turns it back into code. Consequence for test authors: a test function can
 * only use its parameters and globals — not variables from the content file.
 *
 * What each test receives:
 *   expect(value, hint?)  assertions (see below); `hint` replaces the default message
 *   $(selector)           document.querySelector
 *   $$(selector)          document.querySelectorAll, as an array
 *   style(el, property)   getComputedStyle(el)[property]
 *   logs                  everything your code printed with console.log, as strings
 *   click(el), type(el, text), submit(form), wait(ms)   simulate a user
 */

/** Turn test objects into JavaScript source text that recreates them. */
export function serializeTests(tests) {
  const items = tests.map((test) =>
    `{ name: ${JSON.stringify(test.name)}, run: (${test.run.toString()}) }`);
  return `[${items.join(',\n')}]`;
}

/*
 * ─────────── Runs INSIDE the sandbox (turned into text by sandbox.js) ───────────
 * config.source / config.runId identify our messages, exactly like the bridge.
 */
export function sandboxTestRunner(config, tests) {
  const send = (message) =>
    parent.postMessage({ source: config.source, runId: config.runId, ...message }, '*');

  class AssertionError extends Error {}

  /* ── Readable descriptions of values for failure messages ── */
  function show(value) {
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'function') return `a function`;
    if (value instanceof Element) return `<${value.tagName.toLowerCase()}> element`;
    if (value === undefined) return 'undefined';
    try {
      const json = JSON.stringify(value);
      return json && json.length > 120 ? `${json.slice(0, 117)}...` : json ?? String(value);
    } catch {
      return String(value);
    }
  }

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  /* ── The assertions ── */
  function expect(actual, hint) {
    const check = (ok, defaultMessage) => {
      if (!ok) throw new AssertionError(hint ? `${hint} (${defaultMessage})` : defaultMessage);
    };
    return {
      toBe: (expected) => check(Object.is(actual, expected), `expected ${show(expected)}, got ${show(actual)}`),
      toEqual: (expected) => check(deepEqual(actual, expected), `expected ${show(expected)}, got ${show(actual)}`),
      toBeCloseTo: (expected, digits = 2) =>
        check(typeof actual === 'number' && Math.abs(actual - expected) < 10 ** -digits / 2,
          `expected about ${expected}, got ${show(actual)}`),
      toContain: (item) =>
        check(actual != null && typeof actual.includes === 'function' && actual.includes(item),
          `expected ${show(actual)} to contain ${show(item)}`),
      toHaveLength: (length) =>
        check(actual != null && actual.length === length,
          `expected length ${length}, got ${actual == null ? show(actual) : actual.length}`),
      toBeTruthy: () => check(Boolean(actual), `expected a truthy value, got ${show(actual)}`),
      toBeFalsy: () => check(!actual, `expected a falsy value, got ${show(actual)}`),
      toBeTypeOf: (type) => check(typeof actual === type, `expected type ${type}, got ${typeof actual}`),
      toThrow: () => {
        let threw = false;
        try { actual(); } catch { threw = true; }
        check(threw, 'expected an error to be thrown, but none was');
      },
    };
  }

  /* ── Helpers that simulate a user ── */
  const helpers = {
    expect,
    $: (selector) => document.querySelector(selector),
    $$: (selector) => [...document.querySelectorAll(selector)],
    style: (el, property) => (el ? getComputedStyle(el)[property] : undefined),
    get logs() { return window.__wdlLogs || []; },
    click: (el) => {
      if (!el) throw new AssertionError('could not click: the element does not exist');
      el.click();
    },
    type: (el, text) => {
      if (!el) throw new AssertionError('could not type: the input does not exist');
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    submit: (form) => {
      if (!form) throw new AssertionError('could not submit: the form does not exist');
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
    },
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };

  /** Run one test with a time limit. Returns { name, passed, message }. */
  async function runOne(test) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new AssertionError('took too long (more than 2 seconds)')), 2000));
    try {
      await Promise.race([Promise.resolve().then(() => test.run(helpers)), timeout]);
      return { name: test.name, passed: true };
    } catch (error) {
      // An AssertionError is a failed check. Anything else (e.g. ReferenceError)
      // usually means a name is missing or misspelled in your code.
      const message = error instanceof AssertionError ? error.message : `${error.name}: ${error.message}`;
      return { name: test.name, passed: false, message };
    }
  }

  async function runAll() {
    const results = [];
    for (const test of tests) results.push(await runOne(test)); // one after another, in order
    send({ type: 'tests', results, errors: window.__wdlErrors || [] });
  }

  // Wait until the page (and your code) has fully loaded, plus a moment for
  // anything your code does right after loading.
  const start = () => setTimeout(runAll, 30);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
}
