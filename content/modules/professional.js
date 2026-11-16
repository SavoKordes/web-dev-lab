/*
 * professional.js — Module 7: Professional JavaScript.
 *
 * The habits that turn working code into maintainable code, and the checklist
 * for reviewing code (including AI-generated code) before you accept it.
 * Most exercises are refactorings: the tests check that the behavior stays
 * EXACTLY the same while the structure improves.
 */

import { FAKE_API } from '../shared/fake-services.js';

const css = 'body { font-family: system-ui, sans-serif; padding: 1rem; } button, input { font: inherit; padding: 4px 8px; }';

/* ───────────────────────── 1. Separation of concerns ───────────────────────── */

const separation = {
  slug: 'separation-of-concerns',
  title: 'Separation of concerns',
  minutes: 25,
  summary: 'Keeping calculations, data and the page apart, and why that makes code easier to change.',
  sections: [
    {
      kind: 'text',
      text: `A function that reads the page, calculates, formats and writes the result back does four jobs. Change any one of them (a new input field, a different number format) and you must understand all four. Testing the calculation means setting up a whole page.

**Separation of concerns** means each piece of code has one job:
- **Logic**: pure functions that take values and return values. No DOM, no storage, no network.
- **Presentation**: code that reads from and writes to the page.
- **Data access**: code that loads and saves (storage, APIs).

You already know this from earlier modules: \`calculateShare\` and \`update\` in the tip calculator, \`validate\` and the submit handler, \`loadFavorites\`/\`saveFavorites\`. This app is built the same way: \`content/\` (data), \`js/services/\` (logic), \`js/ui/\` and \`js/views/\` (presentation), \`js/core/store.js\` (storage).

Why it matters professionally: separated code is easier to **test**, to **reuse** (the same calculation on another page or a server), to **change** safely, and to **review**.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.separation.temperature',
        type: 'code',
        title: 'Split a do-everything function',
        skills: ['pro.separation', 'js.functions.return'],
        prompt: `\`handleConvert\` reads the input, converts, formats and writes, all in one. Refactor it into:

- \`celsiusToFahrenheit(celsius)\`: a pure function that returns a **number**
- \`formatFahrenheit(value)\`: returns text with one decimal, e.g. \`'98.6 °F'\`
- \`handleConvert()\`: only reads the input, calls the two functions, and writes the result

The page must behave exactly as before.`,
        files: ['js'],
        given: {
          html: '<label>Celsius <input id="celsius" type="number" value="37"></label>\n<button id="convert" type="button">Convert</button>\n<p id="result"></p>',
          css,
        },
        starter: {
          js: `function handleConvert() {
  const input = document.querySelector('#celsius');
  const c = Number(input.value);
  document.querySelector('#result').textContent = (c * 9 / 5 + 32).toFixed(1) + ' °F';
}

document.querySelector('#convert').addEventListener('click', handleConvert);
`,
        },
        tests: [
          { name: 'celsiusToFahrenheit(100) returns 212', run: ({ expect }) => expect(celsiusToFahrenheit(100)).toBe(212) },
          { name: 'celsiusToFahrenheit(-40) returns -40', run: ({ expect }) => expect(celsiusToFahrenheit(-40)).toBe(-40) },
          { name: "formatFahrenheit(98.6) returns '98.6 °F'", run: ({ expect }) => expect(formatFahrenheit(98.6)).toBe('98.6 °F') },
          { name: "formatFahrenheit(212) returns '212.0 °F'", run: ({ expect }) => expect(formatFahrenheit(212)).toBe('212.0 °F') },
          {
            name: 'The page still works',
            run: ({ expect, $, click }) => {
              click($('#convert'));
              expect($('#result').textContent).toBe('98.6 °F');
            },
          },
          {
            name: 'The calculation does not touch the page',
            run: ({ expect }) => expect(/document|querySelector/.test(celsiusToFahrenheit.toString()), 'Keep celsiusToFahrenheit pure').toBe(false),
          },
        ],
        hints: [
          'Move the formula into `celsiusToFahrenheit` and return it; move the `toFixed` and the unit into `formatFahrenheit`.',
          '`handleConvert` then becomes: read, convert, format, write. Four short lines.',
        ],
        solution: {
          js: `function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function formatFahrenheit(value) {
  return \`\${value.toFixed(1)} °F\`;
}

function handleConvert() {
  const celsius = Number(document.querySelector('#celsius').value);
  document.querySelector('#result').textContent = formatFahrenheit(celsiusToFahrenheit(celsius));
}

document.querySelector('#convert').addEventListener('click', handleConvert);
`,
        },
        explanation: 'The first four checks tested the logic with plain numbers, without a page: that is what separation buys you. If tomorrow the result should also appear in a chart, or the input comes from a URL, only `handleConvert` changes.',
        takeaway: 'When a function mixes DOM access and calculation, pull the calculation out into a pure function. Ask: could this run without a web page?',
      },
    },
  ],
  keyPoints: [
    'Logic (pure functions), presentation (DOM) and data access (storage, network) in separate places.',
    'Separated code is easier to test, reuse, change and review.',
    'Refactoring = changing structure without changing behavior.',
  ],
};

/* ───────────────────────── 2. Clean code ───────────────────────── */

const cleanCode = {
  slug: 'clean-code',
  title: 'Reusable functions and clean code',
  minutes: 30,
  summary: 'Names, constants, small functions and flat conditions: code that explains itself.',
  sections: [
    {
      kind: 'text',
      text: `Code is read far more often than it is written. A few habits make the biggest difference:

- **Names that explain**: \`priceWithShipping(subtotal, isMember)\` instead of \`calc(a, b)\`. If you need a comment to explain a name, choose a better name.
- **Named constants instead of magic numbers**: \`FREE_SHIPPING_FROM = 50\` says what 50 means, and lets you change it in one place.
- **Small functions that do one thing**, named after that thing.
- **Flat conditions**: early returns instead of deep \`if/else\` nesting.
- **No boolean comparisons**: \`if (isMember)\`, not \`if (isMember == true)\`.
- **DRY ("don't repeat yourself") with care**: extract repeated logic into a function, but do not merge things that only look alike by accident.
- **Comments explain why**, not what: \`// Members pay shipping because of the 2024 contract\` is useful; \`// add 4.95\` is noise.

When refactoring, **behavior must not change**. Write down a few input/output pairs first, and check them again afterwards.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.clean.refactor',
        type: 'code',
        title: 'Refactor without changing behavior',
        skills: ['pro.clean-code', 'pro.refactoring'],
        prompt: `Refactor \`calc\` into readable code:

- Rename it to \`priceWithShipping(subtotal, isMember)\`.
- Replace the magic numbers with the constants \`MEMBER_DISCOUNT\` (0.15), \`SHIPPING_COST\` (4.95) and \`FREE_SHIPPING_FROM\` (50).
- Remove the nesting and the \`== true\`.

**The results must stay exactly the same**, including the existing rules: members always pay shipping, and free shipping starts **above** 50.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `function calc(a, b) {
  if (b == true) {
    return a - a * 0.15 + 4.95;
  } else {
    if (a > 50) {
      return a;
    } else {
      return a + 4.95;
    }
  }
}
`,
        },
        tests: [
          {
            name: 'The constants are defined',
            run: ({ expect }) => expect([MEMBER_DISCOUNT, SHIPPING_COST, FREE_SHIPPING_FROM]).toEqual([0.15, 4.95, 50]),
          },
          {
            name: 'Same results as before, in every case',
            run: ({ expect }) => {
              const cases = [[100, true, 89.95], [20, true, 21.95], [60, false, 60], [50, false, 54.95], [10, false, 14.95]];
              const results = cases.map(([subtotal, member]) => Math.round(priceWithShipping(subtotal, member) * 100) / 100);
              expect(results, 'The behavior changed. Compare each case with the old function').toEqual(cases.map((c) => c[2]));
            },
          },
          {
            name: 'No magic numbers or == true left in the function',
            run: ({ expect }) => {
              const source = priceWithShipping.toString();
              expect(/0\.15|4\.95|\b50\b|== ?true/.test(source), 'Use the constants inside the function').toBe(false);
            },
          },
        ],
        hints: [
          'Start by writing the constants at the top. Then translate the function line by line, keeping each condition exactly as it is.',
          'With early returns: handle the member case first and return; then the free-shipping case; then the rest.',
          'Careful: "above 50" means `>`, exactly like the old code. A refactoring that "fixes" the boundary changes behavior; that would be a separate, deliberate change.',
        ],
        solution: {
          js: `const MEMBER_DISCOUNT = 0.15;
const SHIPPING_COST = 4.95;
const FREE_SHIPPING_FROM = 50;

function priceWithShipping(subtotal, isMember) {
  if (isMember) {
    return subtotal * (1 - MEMBER_DISCOUNT) + SHIPPING_COST;
  }
  if (subtotal > FREE_SHIPPING_FROM) {
    return subtotal;
  }
  return subtotal + SHIPPING_COST;
}
`,
        },
        explanation: 'The new version reads like the business rules. Note what was **not** changed: members still pay shipping, and exactly €50 still pays it. These might be bugs, but a refactoring keeps behavior identical. Behavior changes are separate decisions, ideally made with whoever owns the rules.',
        takeaway: 'Refactor in small steps and keep a list of input/output pairs to recheck. Never mix "make it cleaner" with "make it behave differently" in one change.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.clean.choice',
        type: 'choice',
        title: 'Which improvement matters most?',
        skills: ['pro.clean-code', 'pro.code-review'],
        prompt: 'You review this function from a colleague. Which **two** changes improve it the most?',
        multiple: true,
        code: `// get the data
function getData(x) {
  let r = [];
  for (let i = 0; i < x.length; i++) {
    if (x[i].s == 'active') {
      if (x[i].age >= 18) {
        r.push(x[i].email);
      }
    }
  }
  return r;
}`,
        options: [
          { text: 'Descriptive names: e.g. `getAdultActiveEmails(users)`, `user.status`', correct: true, feedback: 'Yes. Right now you have to read the whole body to know what it returns. Good names make the comment unnecessary too.' },
          { text: 'Replace the nested loop and ifs with `filter` and `map`', correct: true, feedback: 'Yes: `users.filter((u) => u.status === \'active\' && u.age >= 18).map((u) => u.email)` says the intent in one readable line.' },
          { text: 'Add more comments explaining each line', correct: false, feedback: 'Comments that repeat what the code does go out of date. Better names and structure remove the need for them.' },
          { text: 'Convert it to an arrow function', correct: false, feedback: 'That only changes the syntax, not the readability. Both forms are fine.' },
        ],
        hints: ['Imagine reading only the first line in six months. What would help you most?'],
      },
    },
  ],
  keyPoints: [
    'Names that explain; constants instead of magic numbers.',
    'Small functions, flat conditions, no `== true`.',
    'Refactoring keeps behavior identical; check input/output pairs before and after.',
  ],
};

/* ───────────────────────── 3. State management ───────────────────────── */

const stateManagement = {
  slug: 'state-management',
  title: 'State management fundamentals',
  minutes: 30,
  summary: 'One source of truth, changes through one door, and automatic re-rendering.',
  sections: [
    {
      kind: 'text',
      text: `As apps grow, state gets scattered: some in variables, some in the DOM, some in localStorage, each updated in different places. Bugs follow: the counter says 3, the list shows 4.

The fundamentals behind every state library (Redux, Zustand, Vue's and React's state):

1. **One source of truth**: all app state in one object.
2. **One door for changes**: state changes only through one function, \`setState\`, never by assigning from anywhere.
3. **Subscribers**: parts of the app register a function that runs after every change, usually \`render\`.
4. **Derive, do not duplicate**: anything computable from the state is computed, not stored.

\`\`\`js
const store = createStore({ todos: [], filter: 'all' });
store.subscribe(render);
store.setState({ filter: 'done' });   // render runs automatically
\`\`\`

This app's \`js/core/store.js\` plus \`js/core/events.js\` work exactly this way.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.state.store',
        type: 'code',
        title: 'Build a tiny store',
        skills: ['pro.state', 'js.closures', 'js.objects'],
        prompt: `Write \`createStore(initialState)\`, which returns an object with:

- \`getState()\`: returns the current state
- \`setState(changes)\`: merges \`changes\` into the state (a **new** object, the old one is not modified), then calls every subscriber with the new state
- \`subscribe(listener)\`: registers a function, and **returns a function that unsubscribes it**`,
        files: ['js'],
        preview: false,
        starter: {
          js: `function createStore(initialState) {
  // your code here
}

const store = createStore({ count: 0, theme: 'light' });
store.subscribe((state) => console.log('changed:', state));
store.setState({ count: 1 });
`,
        },
        tests: [
          { name: 'getState returns the initial state', run: ({ expect }) => expect(createStore({ a: 1 }).getState()).toEqual({ a: 1 }) },
          {
            name: 'setState merges the changes',
            run: ({ expect }) => {
              const s = createStore({ count: 0, theme: 'light' });
              s.setState({ count: 2 });
              expect(s.getState()).toEqual({ count: 2, theme: 'light' });
            },
          },
          {
            name: 'setState creates a new object',
            run: ({ expect }) => {
              const s = createStore({ count: 0 });
              const before = s.getState();
              s.setState({ count: 1 });
              expect([before.count, s.getState() !== before], 'Do not modify the old state object').toEqual([0, true]);
            },
          },
          {
            name: 'Subscribers are called with the new state',
            run: ({ expect }) => {
              const s = createStore({ count: 0 });
              const seen = [];
              s.subscribe((state) => seen.push(state.count));
              s.setState({ count: 1 });
              s.setState({ count: 5 });
              expect(seen).toEqual([1, 5]);
            },
          },
          {
            name: 'The returned function unsubscribes',
            run: ({ expect }) => {
              const s = createStore({ count: 0 });
              let calls = 0;
              const unsubscribe = s.subscribe(() => { calls += 1; });
              s.setState({ count: 1 });
              unsubscribe();
              s.setState({ count: 2 });
              expect(calls).toBe(1);
            },
          },
          {
            name: 'Two stores are independent',
            run: ({ expect }) => {
              const a = createStore({ n: 1 });
              const b = createStore({ n: 1 });
              a.setState({ n: 2 });
              expect(b.getState().n).toBe(1);
            },
          },
        ],
        hints: [
          'Inside `createStore`, keep `let state = initialState;` and `const listeners = new Set();`, like the counter closure in Module 3.',
          'Merge with spread: `state = { ...state, ...changes };`. Then call each listener with `state`.',
          '`subscribe` adds to the set and returns `() => listeners.delete(listener)`.',
        ],
        solution: {
          js: `function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    setState(changes) {
      state = { ...state, ...changes };
      for (const listener of listeners) {
        listener(state);
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const store = createStore({ count: 0, theme: 'light' });
store.subscribe((state) => console.log('changed:', state));
store.setState({ count: 1 });
`,
        },
        explanation: 'About 20 lines, and it is the core idea of most state libraries. The state is private (a closure), so the only way to change it is `setState`, which always notifies subscribers. Creating a new object on each change also makes it easy to compare "before" and "after".',
        takeaway: 'If you can name the single place where a piece of state lives, and the single function that changes it, the app stays understandable as it grows.',
      },
    },
  ],
  keyPoints: [
    'One source of truth; one function that changes it; subscribers that react.',
    'Derive what you can compute; do not store duplicates.',
    'Return an unsubscribe function from subscribe.',
  ],
};

/* ───────────────────────── 4. Errors and validation at the boundaries ───────────────────────── */

const boundaries = {
  slug: 'errors-and-validation',
  title: 'Error handling and validation at the boundaries',
  minutes: 30,
  summary: 'Where to validate, where to catch, and how to turn failures into clear results.',
  sections: [
    {
      kind: 'text',
      text: `Data enters your app at **boundaries**: forms, URLs, localStorage, APIs. That is where it should be checked. Inside, your functions can then trust their inputs.

A professional pattern for operations that can fail in expected ways is to **return a result object** instead of throwing:

\`\`\`js
{ ok: true, data: product }
{ ok: false, reason: 'not-found' }
{ ok: false, reason: 'network' }
\`\`\`

The caller then handles each case explicitly, and cannot forget that failure is possible. Use exceptions for unexpected problems (bugs); use result objects for expected ones (a missing product, an offline user).

Different failures deserve different messages: "This product no longer exists" is useful; "Something went wrong" for every case is not.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.boundaries.result',
        type: 'code',
        title: 'Distinguish the failures',
        skills: ['pro.error-handling', 'js.fetch', 'js.async'],
        prompt: `Write \`async function getProduct(id)\` using the fake product API (\`fetch('/api/products/ID')\`). It never throws; it returns:

- \`{ ok: true, data: product }\` on success
- \`{ ok: false, reason: 'not-found' }\` for a 404
- \`{ ok: false, reason: 'server' }\` for any other non-ok status
- \`{ ok: false, reason: 'network' }\` when the request itself fails`,
        files: ['js'],
        preview: false,
        given: { setup: FAKE_API },
        starter: { js: "async function getProduct(id) {\n  // your code here\n}\n\ngetProduct(1).then((result) => console.log(result));\n" },
        tests: [
          { name: 'Success returns the data', run: async ({ expect }) => expect(await getProduct(2)).toEqual({ ok: true, data: { id: 2, name: 'Pen', price: 1.5 } }) },
          { name: 'A missing product is "not-found"', run: async ({ expect }) => expect(await getProduct(999)).toEqual({ ok: false, reason: 'not-found' }) },
          {
            name: 'A network failure is "network", without throwing',
            run: async ({ expect }) => {
              window.apiDown = true;
              let result;
              try { result = await getProduct(1); } finally { window.apiDown = false; }
              expect(result).toEqual({ ok: false, reason: 'network' });
            },
          },
          {
            name: 'Another status is "server"',
            run: async ({ expect }) => {
              const realFetch = window.fetch;
              window.fetch = async () => new Response('{}', { status: 500 });
              let result;
              try { result = await getProduct(1); } finally { window.fetch = realFetch; }
              expect(result).toEqual({ ok: false, reason: 'server' });
            },
          },
        ],
        hints: [
          'Wrap only the `fetch` call in `try/catch`: a rejection there means the network failed.',
          'After that, check `response.status === 404`, then `!response.ok`, then return the data.',
        ],
        solution: {
          js: `async function getProduct(id) {
  let response;
  try {
    response = await fetch(\`/api/products/\${id}\`);
  } catch (error) {
    return { ok: false, reason: 'network' };
  }

  if (response.status === 404) {
    return { ok: false, reason: 'not-found' };
  }
  if (!response.ok) {
    return { ok: false, reason: 'server' };
  }
  return { ok: true, data: await response.json() };
}

getProduct(1).then((result) => console.log(result));
`,
        },
        explanation: 'Catching only around `fetch` keeps the network failure separate from the HTTP statuses. The caller can now show "This product no longer exists" for not-found, and "You seem to be offline" for network, instead of one vague error for everything.',
        takeaway: 'Expected failures → result objects with a clear reason; unexpected ones → exceptions. Validate where data enters the app.',
      },
    },
  ],
  keyPoints: [
    'Validate data where it enters: forms, URLs, storage, APIs.',
    'Expected failures as result objects (`{ ok, reason }`); bugs as exceptions.',
    'Different failures → different, helpful messages.',
  ],
};

/* ───────────────────────── 5. API communication ───────────────────────── */

const apiClient = {
  slug: 'api-client',
  title: 'API communication',
  minutes: 30,
  summary: 'One small module for all requests: base URL, JSON, status checks and typed errors.',
  sections: [
    {
      kind: 'text',
      text: `Scattering \`fetch\` calls through an app repeats the same details everywhere: the base URL, headers, the \`ok\` check, JSON parsing, error handling. When the API changes, you have to find them all.

Instead, put them in **one API client module**:

\`\`\`js
const api = createApiClient('https://api.example.com');
const products = await api.get('/products');
\`\`\`

A **custom error class** carries the details callers need:

\`\`\`js
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
\`\`\`

Callers can then write \`if (error.status === 404)\`, and logs show a meaningful error name. Later additions (an auth header, retries, a timeout) go in one place.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.api.client',
        type: 'code',
        title: 'Write an API client',
        skills: ['pro.api', 'js.fetch', 'js.error-handling'],
        prompt: `Write:

- a class \`ApiError\` that extends \`Error\`, with \`name = 'ApiError'\` and a \`status\` property
- \`createApiClient(baseUrl)\`, which returns \`{ get(path) }\`. \`get\` fetches \`baseUrl + path\`, returns the parsed JSON, and for a non-ok response throws an \`ApiError\` with the status and the message \`Request failed with status 404\` (the real status).

The fake API runs at the base URL \`/api\`.`,
        files: ['js'],
        preview: false,
        given: { setup: FAKE_API },
        starter: {
          js: `class ApiError extends Error {
  // your code here
}

function createApiClient(baseUrl) {
  // your code here
}

const api = createApiClient('/api');
api.get('/products').then((products) => console.log(products.length, 'products'));
`,
        },
        tests: [
          { name: "get('/products') returns the list", run: async ({ expect }) => expect((await createApiClient('/api').get('/products')).length).toBe(3) },
          { name: "get('/products/3') returns one product", run: async ({ expect }) => expect((await createApiClient('/api').get('/products/3')).name).toBe('Backpack') },
          {
            name: 'A 404 throws an ApiError with status and message',
            run: async ({ expect }) => {
              let error;
              try { await createApiClient('/api').get('/products/999'); } catch (e) { error = e; }
              expect(error instanceof ApiError, 'Throw new ApiError(…)').toBe(true);
              expect(error instanceof Error, 'ApiError should extend Error').toBe(true);
              expect([error.name, error.status, error.message]).toEqual(['ApiError', 404, 'Request failed with status 404']);
            },
          },
        ],
        hints: [
          'In the class: a `constructor(status, message)` that calls `super(message)`, then sets `this.name` and `this.status`.',
          '`get` is an async function: `await fetch(baseUrl + path)`, check `response.ok`, then `return response.json()`.',
        ],
        solution: {
          js: `class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function createApiClient(baseUrl) {
  return {
    async get(path) {
      const response = await fetch(baseUrl + path);
      if (!response.ok) {
        throw new ApiError(response.status, \`Request failed with status \${response.status}\`);
      }
      return response.json();
    },
  };
}

const api = createApiClient('/api');
api.get('/products').then((products) => console.log(products.length, 'products'));
`,
        },
        explanation: 'Every request in the app now goes through `get`, so the `ok` check can never be forgotten again. `super(message)` sets up the normal Error parts (message, stack trace); the class adds what is specific to API failures.',
        takeaway: 'One module for all API calls. When you review AI-generated code with `fetch` scattered across many files, suggest this structure.',
      },
    },
  ],
  keyPoints: [
    'Put base URL, JSON handling and status checks in one API client.',
    'A custom error class (`extends Error`) carries the status to callers.',
    'Future changes (auth, retries, timeouts) then happen in one place.',
  ],
};

/* ───────────────────────── 6. Architecture and reviewing AI code ───────────────────────── */

const reviewCode = `// AI-generated: show search results
let results = [];

async function search(query) {
  const res = await fetch('https://api.example.com/search?q=' + query + '&key=sk_live_51H…');
  results = await res.json();
  document.getElementById('list').innerHTML = results
    .map((r) => '<li>' + r.title + '</li>')
    .join('');
  document.getElementById('count').innerText = results.length + ' results';
}

document.getElementById('q').addEventListener('keyup', (e) => search(e.target.value));`;

const architecture = {
  slug: 'architecture-and-review',
  title: 'Architecture and reviewing AI code',
  minutes: 35,
  summary: 'How a small app is organized, and a checklist for reviewing code before you accept it.',
  sections: [
    {
      kind: 'text',
      text: `**A basic architecture** for a front-end app without a framework, the one this app uses:

- **\`content/\` or \`data/\`**: static data and configuration
- **\`core/\`**: infrastructure without UI: routing, storage, events
- **\`services/\`**: logic and data access: calculations, validation, the API client
- **\`ui/\`**: reusable interface pieces (components)
- **\`views/\`**: one module per page, combining the pieces above
- **\`main.js\`**: the entry point that wires everything together

Dependencies point **one way**: views use ui and services; services never import views. That keeps each layer replaceable.

**Reviewing AI-generated code.** AI tools write plausible code quickly, and you are responsible for what you ship. Check:
1. **Does it work?** Run it, including edge cases: empty, wrong input, offline.
2. **Security**: \`innerHTML\` with data (XSS), secrets in front-end code, unvalidated input.
3. **Errors**: \`response.ok\` checked? Loading and error states? Failures visible to the user?
4. **Accessibility**: real buttons and labels, keyboard use, focus.
5. **Structure**: separated concerns? Global state? Duplication? Names?
6. **Performance**: a request on every keystroke? Awaits in a loop?
7. **Do you understand every line?** If not, find out before accepting it. That is the whole point of this program.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.review.ai-code',
        type: 'choice',
        title: 'Review AI-generated code',
        skills: ['pro.code-review', 'html.accessibility', 'js.fetch'],
        prompt: 'An AI tool produced this search feature. Which of these are real problems you should fix before accepting it?',
        multiple: true,
        code: reviewCode,
        options: [
          { text: 'A secret API key is in the front-end code, where every visitor can read it', correct: true, feedback: 'Yes, and it is the most serious one. Keys for paid or private APIs belong on a server that makes the request on the browser\'s behalf.' },
          { text: '`innerHTML` with titles from the API allows HTML/script injection (XSS)', correct: true, feedback: 'Yes. Build the `<li>` elements with `createElement` and `textContent`.' },
          { text: 'There is no `response.ok` check and no error handling or loading state', correct: true, feedback: 'Yes. A failed request leaves stale results or an "Uncaught (in promise)", and the user gets no feedback.' },
          { text: 'A request on every `keyup` (and the query is not encoded)', correct: true, feedback: 'Yes. Every key press sends a request, and responses can arrive out of order, showing results for an older query. Debounce the input, use `encodeURIComponent(query)`, and prefer the `input` event (keyup misses paste).' },
          { text: 'Using `async/await` instead of `.then()` is a problem', correct: false, feedback: 'No. Both are fine; async/await is usually more readable.' },
          { text: 'The arrow functions should be regular functions', correct: false, feedback: 'No: a matter of style, not a problem.' },
        ],
        hints: ['Go through the review checklist: security, errors, performance, structure.'],
        takeaway: 'Plausible is not the same as correct. Use the checklist on every piece of generated code, especially the security and error-handling items.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.architecture.placement',
        type: 'choice',
        title: 'Where does this code belong?',
        skills: ['pro.architecture', 'pro.separation'],
        prompt: 'In the architecture described above, where should a function `formatPrice(amount, currency)` go? It is used by the cart page, the product page and the order confirmation.',
        options: [
          { text: 'In a module in `services/` (or a `utils` module), imported by all three views', correct: true, feedback: 'Yes. It is pure logic used by several views, so it belongs in one shared place below the views.' },
          { text: 'Copied into each of the three view files', correct: false, feedback: 'Three copies drift apart: someone fixes a rounding bug in one and forgets the others.' },
          { text: 'In `main.js`', correct: false, feedback: '`main.js` wires the app together. Putting logic there makes it a dumping ground, and views would import from the entry point, which creates circular dependencies.' },
          { text: 'In the cart view, and the other views import it from there', correct: false, feedback: 'Then two views depend on a third view. Views should depend on shared layers, not on each other.' },
        ],
        hints: ['Is it presentation of one page, or logic used by several?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'pro.review.explain',
        type: 'explain',
        title: 'Write the review comment',
        skills: ['pro.code-review', 'pro.architecture'],
        prompt: 'Write the review comment you would give for the search code above: what must change before it is accepted, and why. Be specific, as you would to a colleague.',
        code: reviewCode,
        minLength: 150,
        keyPoints: [
          'Remove the API key from the front end; requests that need it go through a server.',
          'Replace `innerHTML` with `createElement` + `textContent` to prevent XSS.',
          'Check `response.ok`, catch failures, and show loading and error states.',
          'Debounce the input (or search on submit), encode the query, and ignore outdated responses.',
          'Separate the concerns: an API function, a render function, and the event wiring; avoid the global `results` variable.',
        ],
        modelAnswer: `Thanks, the feature works in the happy path, but it cannot ship like this:

1. **Security:** the API key is visible to every visitor. Move the request to our server, which adds the key. Also, \`innerHTML\` with titles from the API allows script injection; please build the list with \`createElement\` and \`textContent\`.
2. **Errors:** there is no \`response.ok\` check and no \`try/catch\`. If the API fails, the user sees stale results or nothing. Please add loading and error states.
3. **Performance and correctness:** a request on every keyup floods the API, and slow responses can overwrite newer ones. Debounce (around 300 ms), use \`encodeURIComponent\`, and ignore responses for outdated queries.
4. **Structure:** please split it into \`searchApi(query)\`, \`renderResults(results)\` and the listener, and drop the global \`results\` variable.`,
        hints: ['Use the review checklist from the lesson as the structure for your comment.'],
      },
    },
  ],
  keyPoints: [
    'Layers: content, core, services, ui, views, main. Dependencies point one way.',
    'Review checklist: works, security, errors, accessibility, structure, performance, understanding.',
    'You are responsible for code you accept, including code an AI wrote.',
  ],
};

export const professionalLessons = [
  separation,
  cleanCode,
  stateManagement,
  boundaries,
  apiClient,
  architecture,
];
