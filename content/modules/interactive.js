/*
 * interactive.js — Module 6: DOM and interactive applications.
 *
 * Every component in this module follows the same pattern:
 *   STATE   (plain data in variables)
 *   RENDER  (one function that makes the page match the state)
 *   EVENTS  (listeners that change the state, then call render)
 * The exercises get bigger: the to-do list is built in two lessons, the second
 * starting from the solution of the first.
 */

const css = `body { font-family: system-ui, sans-serif; padding: 1rem; font-size: 15px; }
button, input, select { font: inherit; padding: 4px 8px; }`;

/* ───────────────────────── 1. Components: tabs ───────────────────────── */

const tabsLesson = {
  slug: 'tabs',
  title: 'The component pattern: tabs',
  minutes: 35,
  summary: 'State, render, events: the pattern behind every interactive component, built as accessible tabs.',
  sections: [
    {
      kind: 'text',
      text: `Interactive components get confusing quickly when every event handler changes the page directly. A simple pattern keeps them manageable:

1. **State**: the data that describes the component right now, kept in variables. For tabs: which tab is selected.
2. **Render**: one function that makes the page match the state. It sets **everything** that depends on the state, in both directions.
3. **Events**: listeners only **change the state** and then call render. They do not change the page themselves.

The page then always looks the same for the same state, no matter how you got there. You will use this pattern for every component in this module.

**Accessible tabs** follow the ARIA tabs pattern:
- the tab buttons have \`role="tab"\` and \`aria-selected="true"\` or \`"false"\`
- only the selected tab is in the Tab order (\`tabindex="0"\`, the others \`-1\`)
- the **arrow keys** move between tabs
- each panel has \`role="tabpanel"\`, and the panels that are not selected are \`hidden\``,
    },
    {
      kind: 'example',
      language: 'js',
      code: `let selectedId = 'tab-menu';                    // STATE

function render() {                             // RENDER
  for (const tab of tabs) {
    const isSelected = tab.id === selectedId;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  }
}

tablist.addEventListener('click', (event) => {  // EVENTS
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  selectedId = tab.id;
  render();
});`,
      notes: [
        { lines: [1], text: 'The only state of the component: the id of the selected tab.' },
        { lines: [3, 10], text: 'Render sets aria-selected, tabindex and the panel\'s visibility for **every** tab: true for one, false for all others.' },
        { lines: [8], text: '`aria-controls` holds the id of the panel that belongs to the tab, so the HTML connects them.' },
        { lines: [12, 17], text: 'The event handler only changes the state and calls render.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.tabs',
        type: 'code',
        title: 'Build accessible tabs',
        skills: ['interactive.components', 'js.events', 'html.accessibility'],
        prompt: `Make the tabs work, using state → render → events:

1. Clicking a tab selects it: \`aria-selected="true"\` and \`tabindex="0"\` on it, \`"false"\` and \`-1\` on the others. Its panel is shown; the other panels are \`hidden\`.
2. With focus on a tab, **ArrowRight** and **ArrowLeft** select and focus the next or previous tab, wrapping around at the ends.`,
        files: ['js'],
        given: {
          html: `<div role="tablist" aria-label="Café information">
  <button role="tab" id="tab-menu" aria-controls="panel-menu" aria-selected="true">Menu</button>
  <button role="tab" id="tab-hours" aria-controls="panel-hours" aria-selected="false" tabindex="-1">Hours</button>
  <button role="tab" id="tab-location" aria-controls="panel-location" aria-selected="false" tabindex="-1">Location</button>
</div>
<section role="tabpanel" id="panel-menu" aria-labelledby="tab-menu">Coffee, tea and cake.</section>
<section role="tabpanel" id="panel-hours" aria-labelledby="tab-hours" hidden>Daily 8:00–18:00.</section>
<section role="tabpanel" id="panel-location" aria-labelledby="tab-location" hidden>Harbour Street 12.</section>`,
          css: `${css}
[role=tablist] { display: flex; gap: 4px; border-bottom: 2px solid #ddd; }
[role=tab] { border: 0; background: none; padding: 8px 12px; cursor: pointer; }
[role=tab][aria-selected=true] { border-bottom: 2px solid #2563eb; margin-bottom: -2px; font-weight: 600; }
[role=tabpanel] { padding: 12px 4px; }`,
        },
        starter: {
          js: `const tablist = document.querySelector('[role="tablist"]');
const tabs = [...document.querySelectorAll('[role="tab"]')];

let selectedId = 'tab-menu';

function render() {
  // make the page match selectedId
}

// events: click and arrow keys
`,
        },
        tests: [
          {
            name: 'Clicking "Hours" selects it and shows its panel',
            run: ({ expect, $, click }) => {
              click($('#tab-hours'));
              expect($('#tab-hours').getAttribute('aria-selected')).toBe('true');
              expect($('#tab-menu').getAttribute('aria-selected')).toBe('false');
              expect([$('#panel-menu').hidden, $('#panel-hours').hidden, $('#panel-location').hidden]).toEqual([true, false, true]);
            },
          },
          {
            name: 'Only the selected tab is in the Tab order',
            run: ({ expect, $$ }) => expect($$('[role=tab]').map((t) => t.tabIndex)).toEqual([-1, 0, -1]),
          },
          {
            name: 'ArrowRight moves to the next tab and focuses it',
            run: ({ expect, $ }) => {
              $('#tab-hours').focus();
              $('#tab-hours').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
              expect($('#tab-location').getAttribute('aria-selected')).toBe('true');
              expect(document.activeElement.id, 'Move focus to the new tab').toBe('tab-location');
            },
          },
          {
            name: 'ArrowRight on the last tab wraps to the first',
            run: ({ expect, $ }) => {
              $('#tab-location').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
              expect($('#tab-menu').getAttribute('aria-selected')).toBe('true');
              expect($('#panel-menu').hidden).toBe(false);
            },
          },
          {
            name: 'ArrowLeft on the first tab wraps to the last',
            run: ({ expect, $ }) => {
              $('#tab-menu').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
              expect($('#tab-location').getAttribute('aria-selected')).toBe('true');
            },
          },
        ],
        hints: [
          'First write `render()` like in the example. Then a click listener on `tablist`. Then a keydown listener.',
          'For the arrow keys: find the index of the selected tab in `tabs`, add or subtract 1, and wrap with `(index + tabs.length) % tabs.length`.',
          `\`\`\`js
tablist.addEventListener('keydown', (event) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  if (!step) return;
  const index = tabs.findIndex((tab) => tab.id === selectedId);
  const next = tabs[(index + step + tabs.length) % tabs.length];
  // update the state, render, and focus next
});
\`\`\``,
        ],
        solution: {
          js: `const tablist = document.querySelector('[role="tablist"]');
const tabs = [...document.querySelectorAll('[role="tab"]')];

let selectedId = 'tab-menu';

function render() {
  for (const tab of tabs) {
    const isSelected = tab.id === selectedId;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  }
}

tablist.addEventListener('click', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  selectedId = tab.id;
  render();
});

tablist.addEventListener('keydown', (event) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  const index = tabs.findIndex((tab) => tab.id === selectedId);
  const next = tabs[(index + step + tabs.length) % tabs.length];
  selectedId = next.id;
  render();
  next.focus();
});

render();
`,
        },
        explanation: 'Both event handlers only set `selectedId` and call `render()`, which updates every tab and panel. The keyboard support costs a few lines, but without it keyboard users can only reach the first tab. `(index + step + length) % length` is the standard trick for wrapping around in both directions.',
        takeaway: 'State → render → events: handlers change data, and one render function updates the page. Check every component for keyboard use too.',
      },
    },
  ],
  keyPoints: [
    'State (data) → render (page matches data) → events (change data, call render).',
    'Render sets every dependent part, in both directions.',
    'Tabs: `role`, `aria-selected`, roving `tabindex`, and arrow keys.',
  ],
};

/* ───────────────────────── 2. Modals ───────────────────────── */

const modalLesson = {
  slug: 'modal',
  title: 'Modal dialogs',
  minutes: 25,
  summary: 'Confirmation dialogs with the native dialog element: opening, closing and reading the answer.',
  sections: [
    {
      kind: 'text',
      text: `A **modal** dialog blocks the rest of the page until the user answers. Building one from \`<div>\`s is surprisingly hard: you need to trap keyboard focus inside it, close it with Escape, hide the rest of the page from screen readers, and return focus afterwards.

The native \`<dialog>\` element does all of that:
- \`dialog.showModal()\` opens it as a modal, with a backdrop.
- \`dialog.close(value)\` closes it. The value ends up in \`dialog.returnValue\`.
- Pressing **Escape** closes it too, with an empty return value.
- When it closes, the \`close\` event fires, however it was closed. Handle the answer **there**, in one place.
- Focus returns to the element that opened it.

Give it a heading and connect it with \`aria-labelledby\`, so screen readers announce what the dialog is about.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.modal',
        type: 'code',
        title: 'A confirmation dialog',
        skills: ['interactive.modal', 'js.events', 'html.accessibility'],
        prompt: `Make the delete confirmation work:

1. "Delete account" opens the dialog with \`showModal()\`.
2. "Cancel" closes it with the value \`'cancel'\`; "Delete" closes it with \`'delete'\`.
3. In **one** \`close\` event listener, set \`#result\` to \`Account deleted\` when the return value is \`'delete'\`, and to \`Cancelled\` otherwise (that includes Escape).`,
        files: ['js'],
        given: {
          html: `<button id="open-dialog" type="button">Delete account</button>
<p id="result" role="status"></p>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete your account?</h2>
  <p>This cannot be undone.</p>
  <button id="cancel" type="button">Cancel</button>
  <button id="confirm-delete" type="button">Delete</button>
</dialog>`,
          css: `${css} dialog { border: 0; border-radius: 10px; padding: 1.5rem; box-shadow: 0 10px 40px rgb(0 0 0 / 0.25); } dialog::backdrop { background: rgb(0 0 0 / 0.4); }`,
        },
        starter: {
          js: `const dialog = document.querySelector('#confirm');
const result = document.querySelector('#result');

// your code here
`,
        },
        tests: [
          {
            name: '"Delete account" opens the dialog as a modal',
            run: ({ expect, $, click }) => {
              click($('#open-dialog'));
              expect($('#confirm').open, 'Call dialog.showModal()').toBe(true);
              expect($('#confirm').matches(':modal'), 'Use showModal(), not show()').toBe(true);
            },
          },
          {
            // The dialog's close event fires a moment after close(), so these tests wait briefly.
            name: '"Cancel" closes it and shows "Cancelled"',
            run: async ({ expect, $, click, wait }) => {
              click($('#cancel'));
              await wait(20);
              expect($('#confirm').open).toBe(false);
              expect($('#result').textContent).toBe('Cancelled');
            },
          },
          {
            name: '"Delete" closes it and shows "Account deleted"',
            run: async ({ expect, $, click, wait }) => {
              click($('#open-dialog'));
              click($('#confirm-delete'));
              await wait(20);
              expect($('#confirm').open).toBe(false);
              expect($('#result').textContent).toBe('Account deleted');
            },
          },
          {
            name: 'Closing without a value (like Escape) shows "Cancelled"',
            run: async ({ expect, $, click, wait }) => {
              click($('#open-dialog'));
              $('#confirm').close();
              await wait(20);
              expect($('#result').textContent, 'Handle the result in the dialog\'s close event').toBe('Cancelled');
            },
          },
        ],
        hints: [
          'Three small listeners for the buttons (open, cancel, delete), and one `close` listener on the dialog.',
          '`dialog.close(\'delete\')` sets `dialog.returnValue` to "delete". After `close()` without a value, `returnValue` is an empty string.',
        ],
        solution: {
          js: `const dialog = document.querySelector('#confirm');
const result = document.querySelector('#result');

document.querySelector('#open-dialog').addEventListener('click', () => {
  dialog.returnValue = '';
  dialog.showModal();
});

document.querySelector('#cancel').addEventListener('click', () => dialog.close('cancel'));
document.querySelector('#confirm-delete').addEventListener('click', () => dialog.close('delete'));

dialog.addEventListener('close', () => {
  result.textContent = dialog.returnValue === 'delete' ? 'Account deleted' : 'Cancelled';
});
`,
        },
        explanation: 'Handling the answer in the `close` event means all three ways of closing (Cancel, Delete, Escape) go through the same code. (Note: the browser fires `close` a moment **after** `close()` is called, not immediately.) Resetting `returnValue` when opening matters: otherwise, after a Delete, a later Escape would still read "delete".',
        takeaway: 'Use `<dialog>` with `showModal()` instead of building modals from divs, and handle the result in its `close` event.',
      },
    },
  ],
  keyPoints: [
    '`<dialog>` + `showModal()` gives focus handling, Escape and a backdrop for free.',
    'Close with a value; read `returnValue` in one `close` listener.',
    'Label the dialog with `aria-labelledby`.',
  ],
};

/* ───────────────────────── 3. Calculators ───────────────────────── */

const calculatorLesson = {
  slug: 'calculator',
  title: 'Calculators and live updates',
  minutes: 30,
  summary: 'Reading inputs, calculating in a pure function, and updating the result as the user types.',
  sections: [
    {
      kind: 'text',
      text: `A calculator is a small app with a clear structure:

- A **pure function** does the math: numbers in, a number out. It knows nothing about the page, which makes it easy to test.
- An **update** function reads the inputs, converts them (\`Number()\`), validates them, calls the pure function, and shows the result or a message.
- **Listeners** call the update function whenever an input changes. The \`input\` event fires on every keystroke, so the result is always live; there is no "Calculate" button.

Validate before calculating. An empty field gives \`Number('') === 0\`, which is a valid number but usually not a valid input. Show a clear message instead of a wrong result or \`NaN\`.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.tip-calculator',
        type: 'code',
        title: 'A tip calculator',
        skills: ['interactive.calculator', 'js.forms', 'js.functions.return'],
        prompt: `Build a live tip calculator:

1. A pure function \`calculateShare(bill, tipPercent, people)\` returns each person's share, including the tip, rounded to 2 decimals (a **number**).
2. Whenever any input changes, update \`#share\` with the formatted share, e.g. \`€24.00\`.
3. If the bill is not above 0, or people is less than 1, show \`—\` in \`#share\` and a message in \`#error\`: \`Enter a bill amount.\` or \`Enter at least 1 person.\` When the input is valid, \`#error\` is empty.`,
        files: ['js'],
        given: {
          html: `<form id="calc">
  <label>Bill (€) <input id="bill" type="number" min="0" step="0.01"></label>
  <label>Tip
    <select id="tip">
      <option value="10">10%</option>
      <option value="15" selected>15%</option>
      <option value="20">20%</option>
    </select>
  </label>
  <label>People <input id="people" type="number" min="1" value="1"></label>
</form>
<p>Each person pays: <output id="share">—</output></p>
<p id="error" role="alert"></p>`,
          css: `${css} form { display: grid; gap: 8px; max-width: 240px; } #error { color: crimson; }`,
        },
        starter: {
          js: `function calculateShare(bill, tipPercent, people) {
  // pure math: return a number
}

const billInput = document.querySelector('#bill');
const tipSelect = document.querySelector('#tip');
const peopleInput = document.querySelector('#people');
const shareOutput = document.querySelector('#share');
const errorEl = document.querySelector('#error');

function update() {
  // read, convert, validate, calculate, show
}

// listen for changes
`,
        },
        tests: [
          { name: 'calculateShare(100, 15, 2) → 57.5', run: ({ expect }) => expect(calculateShare(100, 15, 2)).toBe(57.5) },
          { name: 'calculateShare(50, 10, 3) → 18.33 (rounded)', run: ({ expect }) => expect(calculateShare(50, 10, 3)).toBe(18.33) },
          {
            name: 'Typing updates the share live',
            run: ({ expect, $, type }) => {
              type($('#bill'), '60');
              $('#tip').value = '20';
              $('#tip').dispatchEvent(new Event('change', { bubbles: true }));
              $('#tip').dispatchEvent(new Event('input', { bubbles: true }));
              type($('#people'), '3');
              expect($('#share').textContent).toBe('€24.00');
              expect($('#error').textContent).toBe('');
            },
          },
          {
            name: '0 people shows a message instead of a result',
            run: ({ expect, $, type }) => {
              type($('#people'), '0');
              expect($('#share').textContent).toBe('—');
              expect($('#error').textContent).toBe('Enter at least 1 person.');
            },
          },
          {
            name: 'An empty bill shows a message',
            run: ({ expect, $, type }) => {
              type($('#people'), '2');
              type($('#bill'), '');
              expect($('#share').textContent).toBe('—');
              expect($('#error').textContent).toBe('Enter a bill amount.');
            },
          },
        ],
        hints: [
          '`calculateShare`: bill × (1 + tip / 100) / people. Round to 2 decimals with `Math.round(x * 100) / 100`.',
          'In `update`: `Number(billInput.value)` and so on. Check the bill first, then the people, each with an early return after showing the message.',
          'Listen on the form: `document.querySelector(\'#calc\').addEventListener(\'input\', update);`. Input and change events from the fields bubble up to it.',
        ],
        solution: {
          js: `function calculateShare(bill, tipPercent, people) {
  const total = bill * (1 + tipPercent / 100);
  return Math.round((total / people) * 100) / 100;
}

const billInput = document.querySelector('#bill');
const tipSelect = document.querySelector('#tip');
const peopleInput = document.querySelector('#people');
const shareOutput = document.querySelector('#share');
const errorEl = document.querySelector('#error');

function update() {
  const bill = Number(billInput.value);
  const tip = Number(tipSelect.value);
  const people = Number(peopleInput.value);

  if (!(bill > 0)) {
    shareOutput.textContent = '—';
    errorEl.textContent = 'Enter a bill amount.';
    return;
  }
  if (!(people >= 1)) {
    shareOutput.textContent = '—';
    errorEl.textContent = 'Enter at least 1 person.';
    return;
  }

  errorEl.textContent = '';
  shareOutput.textContent = \`€\${calculateShare(bill, tip, people).toFixed(2)}\`;
}

const form = document.querySelector('#calc');
form.addEventListener('input', update);
form.addEventListener('change', update);
`,
        },
        explanation: 'The math lives in `calculateShare`, which the tests could check directly with numbers, without any page. `update` handles everything about the page. `!(bill > 0)` is a compact way to reject 0, negative numbers **and** `NaN` at once, since every comparison with NaN is false.',
        takeaway: 'Keep calculations in pure functions; keep reading, validating and displaying in a separate update function.',
      },
    },
  ],
  keyPoints: [
    'Pure function for the math; update function for the page.',
    'The `input` event gives live updates; listen on the form to cover every field.',
    'Validate before calculating, and show a message instead of NaN.',
  ],
};

/* ───────────────────────── 4. To-do list, part 1 ───────────────────────── */

const todoStarter = `let todos = [];
let nextId = 1;

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');

function render() {
  // one <li> per todo: a checkbox, the text, and a Delete button
}

// add, toggle and delete
`;

const todoPart1Solution = `let todos = [];
let nextId = 1;

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');

function render() {
  list.replaceChildren(...todos.map((todo) => {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    li.classList.toggle('done', todo.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.setAttribute('aria-label', \`Mark "\${todo.text}" as done\`);

    const text = document.createElement('span');
    text.textContent = todo.text;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';

    li.append(checkbox, text, remove);
    return li;
  }));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;
  todos.push({ id: nextId++, text, done: false });
  input.value = '';
  render();
});

list.addEventListener('change', (event) => {
  const id = Number(event.target.closest('li').dataset.id);
  const todo = todos.find((t) => t.id === id);
  todo.done = event.target.checked;
  render();
});

list.addEventListener('click', (event) => {
  if (!event.target.closest('.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  todos = todos.filter((t) => t.id !== id);
  render();
});

render();
`;

const todoHtml = `<form id="todo-form">
  <label for="todo-input">New task</label>
  <input id="todo-input" autocomplete="off">
  <button>Add</button>
</form>
<ul id="todo-list"></ul>`;

const todoCss = `${css}
#todo-list { list-style: none; padding: 0; }
#todo-list li { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
#todo-list li.done span { text-decoration: line-through; color: #888; }
.filters button[aria-pressed=true] { background: #1f2937; color: white; }`;

const todoPart1 = {
  slug: 'todo-list',
  title: 'A to-do list, part 1',
  minutes: 40,
  summary: 'An array of objects as state: adding, completing and deleting items.',
  sections: [
    {
      kind: 'text',
      text: `A to-do list is the classic exercise because it contains the core of most web apps: a **list of records** that can be added, changed and deleted.

The state is an array of objects:

\`\`\`js
let todos = [
  { id: 1, text: 'Buy coffee', done: false },
];
\`\`\`

Each todo gets a unique, unchanging **id**. The page stores it in a \`data-id\` attribute on each \`<li>\`, so an event handler can find the matching object: \`Number(li.dataset.id)\`. (Using the array index instead breaks as soon as items are deleted or filtered.)

- **Add**: push a new object, then render.
- **Toggle**: find the object by id, change \`done\`, then render.
- **Delete**: filter the object out, then render.

With event delegation, two listeners on the list handle every checkbox and button, including ones created later.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.todo.part1',
        type: 'code',
        title: 'Add, complete and delete',
        skills: ['interactive.todo', 'interactive.components', 'js.array-methods'],
        prompt: `Build the to-do list:

1. Submitting the form adds a todo \`{ id, text, done: false }\` (text trimmed; empty text is ignored) and clears the input.
2. \`render()\` shows each todo as an \`<li data-id="…">\` with a checkbox, a \`<span>\` with the text, and a button with class \`delete\`. Completed todos get the class \`done\` on the \`<li>\`.
3. Checking a checkbox toggles the todo; "Delete" removes it. Use event delegation on the list.`,
        files: ['js'],
        given: { html: todoHtml, css: todoCss },
        starter: { js: todoStarter },
        tests: [
          {
            name: 'Adding "Buy coffee" shows it in the list',
            run: ({ expect, $, $$, type, submit }) => {
              type($('#todo-input'), '  Buy coffee ');
              submit($('#todo-form'));
              expect($$('#todo-list li span').map((s) => s.textContent)).toEqual(['Buy coffee']);
              expect($('#todo-input').value, 'Clear the input after adding').toBe('');
            },
          },
          {
            name: 'Empty text is ignored',
            run: ({ expect, $, $$, type, submit }) => {
              type($('#todo-input'), '   ');
              submit($('#todo-form'));
              expect($$('#todo-list li').length).toBe(1);
            },
          },
          {
            name: 'Checking a todo marks it as done',
            run: ({ expect, $, $$, type, submit, click }) => {
              type($('#todo-input'), 'Read code');
              submit($('#todo-form'));
              click($$('#todo-list input[type=checkbox]')[0]);
              expect($$('#todo-list li').map((li) => li.classList.contains('done'))).toEqual([true, false]);
              expect($$('#todo-list input[type=checkbox]')[0].checked).toBe(true);
            },
          },
          {
            name: 'Delete removes the right todo',
            run: ({ expect, $$, click }) => {
              click($$('#todo-list .delete')[0]);
              expect($$('#todo-list li span').map((s) => s.textContent)).toEqual(['Read code']);
            },
          },
          {
            name: 'Each <li> has a data-id',
            run: ({ expect, $$ }) => expect($$('#todo-list li').every((li) => li.dataset.id), 'Set li.dataset.id = todo.id').toBe(true),
          },
          {
            name: 'Text is shown as text, not HTML',
            run: ({ expect, $, type, submit }) => {
              type($('#todo-input'), '<img src=x>');
              submit($('#todo-form'));
              expect($('#todo-list img'), 'Use textContent').toBe(null);
            },
          },
        ],
        hints: [
          'Do it in order: first render with a hard-coded todo in the array, then adding, then toggling, then deleting. Run after each step.',
          'In the listeners on the list: `event.target.closest(\'li\')` gives the item, `Number(li.dataset.id)` its id, and `todos.find(…)` the object.',
          'Toggle in a `change` listener (checkboxes fire `change`), delete in a `click` listener that ignores clicks not on `.delete`.',
        ],
        solution: { js: todoPart1Solution },
        explanation: 'Every action changes `todos` and calls `render()`; no handler touches the list items directly. Because the handlers find todos by id, deleting or (in part 2) filtering never mixes up which item a click belongs to.',
        takeaway: 'For lists of records: unique ids in the data, `data-id` in the HTML, and event delegation to connect them.',
      },
    },
  ],
  keyPoints: [
    'State = an array of objects with unique ids.',
    'Add → push; toggle → find and change; delete → filter. Then render.',
    'Store the id in `data-id`; never rely on positions.',
  ],
};

/* ───────────────────────── 5. To-do list, part 2 ───────────────────────── */

const todoPart2 = {
  slug: 'todo-list-2',
  title: 'A to-do list, part 2',
  minutes: 40,
  summary: 'Filters, a live counter, and saving to localStorage: derived state and persistence.',
  sections: [
    {
      kind: 'text',
      text: `Part 2 extends your list. Two new ideas:

**Derived state.** The number of open tasks, and the list of visible tasks for the current filter, can always be **calculated** from \`todos\` and \`filter\`. Do not store them in separate variables that you have to keep in sync; compute them inside \`render()\`.

\`\`\`js
const visible = todos.filter((todo) =>
  filter === 'all' || (filter === 'done' ? todo.done : !todo.done));
\`\`\`

**Persistence.** Save after every change, and load once at the start. A small \`save()\` function called at the end of each action (or at the top of \`render()\`) keeps it in one place. Remember from Module 3: load with a fallback, in case nothing or something broken is saved.

The starter code is the solution to part 1.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.todo.part2',
        type: 'code',
        title: 'Filters, counter and saving',
        skills: ['interactive.todo', 'interactive.state', 'js.local-storage'],
        prompt: `Extend the to-do list:

1. **Filters**: the buttons All / Active / Done (\`data-filter\`) show only matching todos. The current filter's button has \`aria-pressed="true"\`, the others \`"false"\`.
2. **Counter**: \`#count\` shows \`2 items left\` (open todos), or \`1 item left\` for one.
3. **Saving**: after every change, save \`todos\` as JSON under the key \`'todos'\` in localStorage. When the page loads, start from the saved todos (or an empty list).`,
        files: ['js'],
        given: {
          html: `${todoHtml}
<div class="filters" aria-label="Filter">
  <button type="button" data-filter="all" aria-pressed="true">All</button>
  <button type="button" data-filter="active" aria-pressed="false">Active</button>
  <button type="button" data-filter="done" aria-pressed="false">Done</button>
</div>
<p id="count"></p>`,
          css: todoCss,
        },
        starter: { js: todoPart1Solution },
        tests: [
          {
            name: 'The counter shows open todos, with the right word',
            run: ({ expect, $, $$, type, submit, click }) => {
              for (const text of ['One', 'Two', 'Three']) { type($('#todo-input'), text); submit($('#todo-form')); }
              click($$('#todo-list input[type=checkbox]')[0]);
              expect($('#count').textContent).toBe('2 items left');
              click($$('#todo-list input[type=checkbox]')[1]);
              expect($('#count').textContent, 'Use "item" for exactly 1').toBe('1 item left');
            },
          },
          {
            name: 'The Active filter shows only open todos',
            run: ({ expect, $, $$, click }) => {
              click($('[data-filter=active]'));
              expect($$('#todo-list li span').map((s) => s.textContent)).toEqual(['Three']);
              expect($$('.filters button').map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
            },
          },
          {
            name: 'The Done filter shows only completed todos',
            run: ({ expect, $, $$, click }) => {
              click($('[data-filter=done]'));
              expect($$('#todo-list li span').map((s) => s.textContent)).toEqual(['One', 'Two']);
            },
          },
          {
            name: 'All shows everything again',
            run: ({ expect, $, $$, click }) => {
              click($('[data-filter=all]'));
              expect($$('#todo-list li').length).toBe(3);
            },
          },
          {
            name: 'The todos are saved in localStorage',
            run: ({ expect }) => {
              const saved = JSON.parse(localStorage.getItem('todos') ?? 'null');
              expect(Array.isArray(saved), 'Save JSON.stringify(todos) under the key "todos"').toBe(true);
              expect(saved.map((t) => [t.text, t.done])).toEqual([['One', true], ['Two', true], ['Three', false]]);
            },
          },
          {
            name: 'Deleting is saved too',
            run: ({ expect, $$, click }) => {
              click($$('#todo-list .delete')[2]);
              expect(JSON.parse(localStorage.getItem('todos')).length, 'Save after every change').toBe(2);
            },
          },
        ],
        hints: [
          'Add `let filter = \'all\';` to the state. In `render`, compute the visible todos and the open count from `todos` and `filter`.',
          'Saving: `localStorage.setItem(\'todos\', JSON.stringify(todos))` at the end of `render()` covers every change. Loading: replace `let todos = [];` with a safe load, and set `nextId` past the highest saved id.',
          `\`\`\`js
function loadTodos() {
  try { return JSON.parse(localStorage.getItem('todos')) ?? []; }
  catch { return []; }
}
let todos = loadTodos();
let nextId = Math.max(0, ...todos.map((t) => t.id)) + 1;
\`\`\``,
        ],
        solution: {
          js: `function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem('todos')) ?? [];
  } catch {
    return [];
  }
}

let todos = loadTodos();
let nextId = Math.max(0, ...todos.map((t) => t.id)) + 1;
let filter = 'all';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const countEl = document.querySelector('#count');
const filterButtons = document.querySelectorAll('[data-filter]');

function render() {
  const visible = todos.filter((todo) =>
    filter === 'all' || (filter === 'done' ? todo.done : !todo.done));

  list.replaceChildren(...visible.map((todo) => {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    li.classList.toggle('done', todo.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.setAttribute('aria-label', \`Mark "\${todo.text}" as done\`);

    const text = document.createElement('span');
    text.textContent = todo.text;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';

    li.append(checkbox, text, remove);
    return li;
  }));

  const open = todos.filter((todo) => !todo.done).length;
  countEl.textContent = \`\${open} \${open === 1 ? 'item' : 'items'} left\`;

  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  }

  localStorage.setItem('todos', JSON.stringify(todos));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;
  todos.push({ id: nextId++, text, done: false });
  input.value = '';
  render();
});

list.addEventListener('change', (event) => {
  const id = Number(event.target.closest('li').dataset.id);
  const todo = todos.find((t) => t.id === id);
  todo.done = event.target.checked;
  render();
});

list.addEventListener('click', (event) => {
  if (!event.target.closest('.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  todos = todos.filter((t) => t.id !== id);
  render();
});

document.querySelector('.filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  render();
});

render();
`,
        },
        explanation: 'The counter and the visible list are **derived** inside `render`, so they can never disagree with `todos`. Saving at the end of `render` means every action is saved, including future ones you add. Note that `filter` is not saved: it is view state, not data, and starting on "All" is fine.',
        takeaway: 'Store the minimum state; compute everything else in render. Save data in one place that every change passes through.',
      },
    },
  ],
  keyPoints: [
    'Derived state (counts, filtered lists) is computed in render, never stored separately.',
    'Save after every change through one path; load once with a safe fallback.',
    'Toggle buttons show their state with `aria-pressed`.',
  ],
};

/* ───────────────────────── 6. Search and filtering ───────────────────────── */

const searchLesson = {
  slug: 'search-and-filter',
  title: 'Search and filtering',
  minutes: 35,
  summary: 'Combining a text search, a category filter and sorting on one list.',
  sections: [
    {
      kind: 'text',
      text: `Search and filter controls are just **more state**. Each control has a variable (or you read it directly from the control), and render combines them:

\`\`\`js
const visible = products
  .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  .filter((p) => category === 'all' || p.category === category)
  .sort((a, b) => a.price - b.price);
\`\`\`

Chaining \`filter\` calls keeps each condition readable on its own. Sort a **copy** (\`filter\` already returns one), never the source data.

Always handle the **empty result**: "No products found" is much better than an empty area that looks broken. And show how many results there are, in an element with \`aria-live\` so screen-reader users hear the count change.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.search',
        type: 'code',
        title: 'A searchable product list',
        skills: ['interactive.filtering', 'js.array-methods', 'js.dom'],
        prompt: `The array \`PRODUCTS\` is provided (see "Provided JS"). Show it as a filterable list:

1. Each visible product is an \`<li>\` in \`#results\` with the text \`Name – €price\` (price with 2 decimals), e.g. \`Notebook – €4.00\`.
2. \`#search\` filters by name (case-insensitive, while typing); \`#category\` filters by category (\`all\` shows everything). Both apply together.
3. Results are sorted by price, cheapest first.
4. \`#count\` shows \`3 products\` / \`1 product\`; with no results, \`#results\` is empty and \`#count\` shows \`No products found.\``,
        files: ['js'],
        given: {
          html: `<label>Search <input id="search" type="search"></label>
<label>Category
  <select id="category">
    <option value="all">All</option>
    <option value="paper">Paper</option>
    <option value="bags">Bags</option>
  </select>
</label>
<p id="count" aria-live="polite"></p>
<ul id="results"></ul>`,
          css,
          setup: `const PRODUCTS = [
  { name: 'Notebook', price: 4, category: 'paper' },
  { name: 'Backpack', price: 35, category: 'bags' },
  { name: 'Sticky notes', price: 2.5, category: 'paper' },
  { name: 'Tote bag', price: 12, category: 'bags' },
  { name: 'Planner', price: 18, category: 'paper' },
];`,
        },
        starter: {
          js: `const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const results = document.querySelector('#results');
const countEl = document.querySelector('#count');

function render() {
  // filter, sort, show, count
}

render();
`,
        },
        tests: [
          {
            name: 'At the start, all products are shown, cheapest first',
            run: ({ expect, $, $$ }) => {
              expect($$('#results li').map((li) => li.textContent)).toEqual(['Sticky notes – €2.50', 'Notebook – €4.00', 'Tote bag – €12.00', 'Planner – €18.00', 'Backpack – €35.00']);
              expect($('#count').textContent).toBe('5 products');
            },
          },
          {
            name: 'Searching "NOTE" finds both notes products',
            run: ({ expect, $, $$, type }) => {
              type($('#search'), 'NOTE');
              expect($$('#results li').map((li) => li.textContent)).toEqual(['Sticky notes – €2.50', 'Notebook – €4.00']);
              expect($('#count').textContent).toBe('2 products');
            },
          },
          {
            name: 'Search and category work together',
            run: ({ expect, $, $$, type }) => {
              type($('#search'), 'a');
              $('#category').value = 'bags';
              $('#category').dispatchEvent(new Event('change', { bubbles: true }));
              expect($$('#results li').map((li) => li.textContent)).toEqual(['Tote bag – €12.00', 'Backpack – €35.00']);
            },
          },
          {
            name: 'One result says "1 product"',
            run: ({ expect, $, type }) => {
              type($('#search'), 'tote');
              expect($('#count').textContent).toBe('1 product');
            },
          },
          {
            name: 'No results shows a message',
            run: ({ expect, $, $$, type }) => {
              type($('#search'), 'xyz');
              expect($$('#results li').length).toBe(0);
              expect($('#count').textContent).toBe('No products found.');
            },
          },
          {
            name: 'PRODUCTS itself is not reordered',
            run: ({ expect }) => expect(PRODUCTS.map((p) => p.name)[0], 'Sort a filtered copy, not PRODUCTS').toBe('Notebook'),
          },
        ],
        hints: [
          'In `render`: read the search text and the category, filter `PRODUCTS` twice, sort, then build the list and the count.',
          'Call `render` on `input` from the search field and on `change` from the select.',
          '`.sort((a, b) => a.price - b.price)` after `filter` sorts a copy, because `filter` returns a new array.',
        ],
        solution: {
          js: `const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const results = document.querySelector('#results');
const countEl = document.querySelector('#count');

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const visible = PRODUCTS
    .filter((p) => p.name.toLowerCase().includes(query))
    .filter((p) => category === 'all' || p.category === category)
    .sort((a, b) => a.price - b.price);

  results.replaceChildren(...visible.map((p) => {
    const li = document.createElement('li');
    li.textContent = \`\${p.name} – €\${p.price.toFixed(2)}\`;
    return li;
  }));

  countEl.textContent = visible.length === 0
    ? 'No products found.'
    : \`\${visible.length} \${visible.length === 1 ? 'product' : 'products'}\`;
}

searchInput.addEventListener('input', render);
categorySelect.addEventListener('change', render);
render();
`,
        },
        explanation: 'Here the controls themselves hold the state (the input\'s value and the select\'s value), and render reads them. Every filter is one line, so adding a third (for example a maximum price) means adding one more `filter` call.',
      },
    },
  ],
  keyPoints: [
    'Every control is a piece of state; render combines them with chained `filter` calls.',
    'Sort a copy, never the source data.',
    'Handle the empty result, and announce the count with `aria-live`.',
  ],
};

/* ───────────────────────── 7. Form validation ───────────────────────── */

const validationLesson = {
  slug: 'validation',
  title: 'Interactive form validation',
  minutes: 40,
  summary: 'Validation rules in a pure function, accessible error messages next to each field.',
  sections: [
    {
      kind: 'text',
      text: `Good validation tells the user **what** is wrong, **where**, and **how to fix it**:

- Each field has its own error element, connected with \`aria-describedby\`, so screen readers read the message together with the field.
- An invalid field gets \`aria-invalid="true"\`, which you can also use for styling.
- After a failed submit, move focus to the **first** invalid field.
- Messages say how to fix it: "Password needs at least 8 characters", not "Invalid input".

Keep the **rules** in a pure function that takes the values and returns the errors:

\`\`\`js
validate({ email: 'ada' })  // → { email: 'Enter a valid email address.' }
\`\`\`

It is easy to test, can be reused, and the page code only has to display what it returns.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'interactive.validation',
        type: 'code',
        title: 'A registration form',
        skills: ['interactive.validation', 'js.forms', 'html.accessibility'],
        prompt: `Validate the registration form:

1. Write a pure function \`validate(values)\` that receives \`{ name, email, password }\` and returns an object with a message per invalid field (empty object = valid):
   - name empty (after trim): \`Enter your name.\`
   - email without \`@\`: \`Enter a valid email address.\`
   - password shorter than 8 characters, or without a digit: \`Use at least 8 characters, including a number.\`
2. On submit: show each message in its error element (\`#name-error\` …), set \`aria-invalid="true"\` on invalid fields (\`"false"\` on valid ones), and focus the first invalid field.
3. If everything is valid: show \`Account created.\` in \`#success\`, and reset the form.`,
        files: ['js'],
        given: {
          html: `<form id="register" novalidate>
  <label for="name">Name</label>
  <input id="name" name="name" aria-describedby="name-error">
  <p id="name-error" class="error"></p>

  <label for="email">Email</label>
  <input id="email" name="email" aria-describedby="email-error">
  <p id="email-error" class="error"></p>

  <label for="password">Password</label>
  <input id="password" name="password" type="password" aria-describedby="password-error">
  <p id="password-error" class="error"></p>

  <button>Create account</button>
</form>
<p id="success" role="status"></p>`,
          css: `${css} form { display: grid; gap: 4px; max-width: 280px; } .error { color: crimson; margin: 0 0 6px; font-size: 0.9em; } [aria-invalid=true] { border: 2px solid crimson; }`,
        },
        starter: {
          js: `function validate(values) {
  const errors = {};
  // add a message for each invalid field
  return errors;
}

const form = document.querySelector('#register');
const fields = ['name', 'email', 'password'];

form.addEventListener('submit', (event) => {
  event.preventDefault();
  // read values, validate, show errors or success
});
`,
        },
        tests: [
          {
            name: 'validate reports every invalid field',
            run: ({ expect }) => expect(validate({ name: ' ', email: 'ada', password: 'short' })).toEqual({
              name: 'Enter your name.', email: 'Enter a valid email address.', password: 'Use at least 8 characters, including a number.',
            }),
          },
          { name: 'A password without a digit is invalid', run: ({ expect }) => expect(Object.keys(validate({ name: 'Ada', email: 'a@b.c', password: 'longpassword' }))).toEqual(['password']) },
          { name: 'Valid values give an empty object', run: ({ expect }) => expect(validate({ name: 'Ada', email: 'ada@example.com', password: 'engines1843' })).toEqual({}) },
          {
            name: 'Submitting invalid data shows messages, marks fields and focuses the first',
            run: ({ expect, $, type, submit }) => {
              type($('#name'), 'Ada');
              type($('#email'), 'ada');
              type($('#password'), 'short');
              submit($('#register'));
              expect($('#email-error').textContent).toBe('Enter a valid email address.');
              expect($('#name-error').textContent, 'Clear messages of valid fields').toBe('');
              expect([$('#name'), $('#email'), $('#password')].map((f) => f.getAttribute('aria-invalid'))).toEqual(['false', 'true', 'true']);
              expect(document.activeElement.id, 'Focus the first invalid field').toBe('email');
            },
          },
          {
            name: 'Valid data shows success and resets the form',
            run: ({ expect, $, type, submit }) => {
              type($('#email'), 'ada@example.com');
              type($('#password'), 'engines1843');
              submit($('#register'));
              expect($('#success').textContent).toBe('Account created.');
              expect($('#email-error').textContent).toBe('');
              expect($('#name').value).toBe('');
            },
          },
        ],
        hints: [
          'In `validate`, one `if` per rule. A digit check: `/\\d/.test(password)`.',
          'On submit: build `values` from the fields, call `validate`, then loop over `fields` to set each message (or an empty string) and `aria-invalid`.',
          'The first invalid field: `fields.find((name) => errors[name])`. Focus it with `document.getElementById(name).focus()`.',
        ],
        solution: {
          js: `function validate(values) {
  const errors = {};
  if (values.name.trim() === '') {
    errors.name = 'Enter your name.';
  }
  if (!values.email.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length < 8 || !/\\d/.test(values.password)) {
    errors.password = 'Use at least 8 characters, including a number.';
  }
  return errors;
}

const form = document.querySelector('#register');
const fields = ['name', 'email', 'password'];

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const values = Object.fromEntries(fields.map((name) => [name, form.elements[name].value]));
  const errors = validate(values);

  for (const name of fields) {
    document.getElementById(\`\${name}-error\`).textContent = errors[name] ?? '';
    form.elements[name].setAttribute('aria-invalid', String(Boolean(errors[name])));
  }

  const firstInvalid = fields.find((name) => errors[name]);
  if (firstInvalid) {
    form.elements[firstInvalid].focus();
    return;
  }

  document.querySelector('#success').textContent = 'Account created.';
  form.reset();
});
`,
        },
        explanation: 'The rules live in `validate`, which was tested on its own in the first three checks. The submit handler only translates its result into the page: messages, `aria-invalid`, focus. Looping over the field names avoids writing the same three lines three times.',
        takeaway: 'Rules in a pure function; display in the handler. Every field: a message element, `aria-describedby`, `aria-invalid`, and focus on the first error.',
      },
    },
  ],
  keyPoints: [
    'Validation rules in a pure function that returns errors per field.',
    'Accessible errors: `aria-describedby`, `aria-invalid`, focus on the first invalid field.',
    'Messages explain how to fix the problem.',
  ],
};

export const interactiveLessons = [
  tabsLesson,
  modalLesson,
  calculatorLesson,
  todoPart1,
  todoPart2,
  searchLesson,
  validationLesson,
];
