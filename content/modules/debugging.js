/*
 * debugging.js — Module 5: Debugging workshop.
 *
 * Bug challenges are code exercises with `debug: true` and a `bugCategory`.
 * The starter code contains real bugs; the tests describe correct behavior.
 * After solving, the shell shows a post-mortem:
 *   explanation → "Why the bug happened"
 *   takeaway    → "How to recognize it next time"
 */

import { FAKE_API } from '../shared/fake-services.js';

const css = 'body { font-family: system-ui, sans-serif; padding: 1rem; } button, input { font: inherit; padding: 4px 8px; }';

/** Builds the standard task text: what should happen, and what happens instead. */
const task = (expected, symptom, extra = '') =>
  `**What should happen:** ${expected}\n\n**What happens instead:** ${symptom}${extra ? `\n\n${extra}` : ''}`;

/* ───────────────────────── 1. A debugging method ───────────────────────── */

const method = {
  slug: 'method',
  title: 'A systematic debugging method',
  minutes: 20,
  summary: 'Stop guessing: a repeatable process for finding any bug, and the tools that help.',
  sections: [
    {
      kind: 'text',
      text: `Debugging by randomly changing things (or by asking AI to "fix it" again and again) is slow, and often adds new bugs. A method works better:

1. **Reproduce.** Find the exact steps that make the bug happen. A bug you cannot reproduce, you cannot confirm as fixed.
2. **Read the error.** The message and line number in the console are the best clue you will get. Read them completely.
3. **Locate.** Narrow down where it goes wrong. Find the last point where the data is still correct and the first where it is wrong. \`console.log\` the values in between.
4. **Form one hypothesis.** "The selector finds nothing, because the id is spelled differently." A concrete, testable statement.
5. **Change one thing** to test it. Changing five things at once tells you nothing.
6. **Verify.** Reproduce the original steps again, and check nothing else broke.
7. **Prevent.** Ask why it happened, and how you would recognize it next time.

**Tools:**
- \`console.log('label', value)\`: always with a label, so you know which log is which.
- \`console.log(typeof value, value)\` when a type might be wrong.
- The **debugger**: write \`debugger;\` in your code, or click a line number in DevTools → Sources. Execution pauses there, and you can inspect every variable. Then step through line by line.
- DevTools → **Elements** shows the real DOM; **Network** shows every request and its status.

**No error, but the result is wrong?** Then the code does what you wrote, not what you meant. Compare what you expect with what each line actually produces.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.method.order',
        type: 'order',
        title: 'The debugging steps',
        skills: ['debug.method'],
        prompt: 'A user reports: "Sometimes the total in the cart is wrong." Put the steps of a systematic approach in order.',
        steps: [
          'Find the exact steps that reproduce the wrong total',
          'Read the console for errors and the line they point to',
          'Log the values between the input and the total, to see where they go wrong',
          'Form one hypothesis about the cause',
          'Change one thing to test the hypothesis',
          'Reproduce the original steps again to verify the fix',
        ],
        hints: ['You cannot confirm a fix for a bug you cannot reproduce. And you should look at the evidence before guessing.'],
        explanation: 'Each step builds on the previous one: reproducing gives you a test, the error and the logs give you evidence, the hypothesis gives you a single change to try, and repeating the steps proves the fix.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.method.first-step',
        type: 'choice',
        title: 'What do you do first?',
        skills: ['debug.method', 'debug.reading-errors'],
        prompt: 'You click "Save" and nothing happens. The console shows: `Uncaught TypeError: Cannot read properties of null (reading \'value\') at saveForm (form.js:14)`. What is the best first step?',
        options: [
          { text: 'Open form.js at line 14, and find which value is null there: probably a `querySelector` that found nothing', correct: true, feedback: 'Yes. The message tells you **what** (something is null), **where** (line 14) and **in which function**. Start there.' },
          { text: 'Ask an AI tool to rewrite the save function', correct: false, feedback: 'Possible later, but you would not know what was wrong, or whether the rewrite fixed the actual cause.' },
          { text: 'Reload the page a few times to see if it goes away', correct: false, feedback: 'A clear error with a line number is a reproducible bug. Reloading hides it until next time.' },
          { text: 'Add `try/catch` around the whole function', correct: false, feedback: 'That would hide the error, not fix it. The form still would not save.' },
        ],
        hints: ['What three pieces of information does the error message give you?'],
      },
    },
  ],
  keyPoints: [
    'Reproduce → read the error → locate → one hypothesis → change one thing → verify → prevent.',
    'Log with labels; use `debugger;` or breakpoints to pause and inspect.',
    'No error but a wrong result: compare what each line produces with what you expect.',
  ],
};

/* ───────────────────────── 2. Selector and DOM bugs ───────────────────────── */

const domBugs = {
  slug: 'dom-bugs',
  title: 'Selector and DOM bugs',
  minutes: 25,
  summary: 'Elements that are not found, and pages that do not update the way they should.',
  sections: [
    {
      kind: 'text',
      text: `Most DOM bugs fall into a few groups:

- **The selector finds nothing**: a missing \`.\` or \`#\`, a typo, or a different name in the HTML. The result is \`null\`, and the next line fails with "Cannot read properties of null".
- **The selector finds the wrong element**: \`querySelector\` returns only the **first** match.
- **The page is not rebuilt correctly**: items are added again and again instead of replacing the old ones, or the data changes but nothing re-renders it.

**How to check a selector:** copy it into the browser console, \`document.querySelector('…')\`, and look at what comes back. In the lab, you can \`console.log\` it in your code.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.dom.password-toggle',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect selectors',
        title: 'The password toggle',
        skills: ['debug.selectors', 'js.dom'],
        prompt: task(
          'Clicking "Show" reveals the password and changes the button to "Hide". Clicking again hides it.',
          'Nothing happens on click, and there is an error in the console. (There are **two** selector bugs.)',
        ),
        files: ['js'],
        given: {
          html: `<label for="password">Password</label>
<input id="password" type="password" value="secret123">
<button id="toggle-password" type="button">Show</button>`,
          css,
        },
        starter: {
          js: `const toggle = document.querySelector('#password-toggle');
const input = document.querySelector('password');

toggle.addEventListener('click', () => {
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  toggle.textContent = isHidden ? 'Hide' : 'Show';
});
`,
        },
        tests: [
          {
            name: 'The first click shows the password',
            run: ({ expect, $, click }) => {
              click($('#toggle-password'));
              expect($('#password').type).toBe('text');
              expect($('#toggle-password').textContent).toBe('Hide');
            },
          },
          {
            name: 'The second click hides it again',
            run: ({ expect, $, click }) => {
              click($('#toggle-password'));
              expect($('#password').type).toBe('password');
              expect($('#toggle-password').textContent).toBe('Show');
            },
          },
        ],
        hints: [
          'The console error is on line 4, but the real cause is earlier: what does `toggle` contain?',
          'Compare each selector with the HTML tab, character by character. Ids need a `#`.',
          'The button\'s id is `toggle-password`, not `password-toggle`. And `\'password\'` without `#` looks for a `<password>` element.',
        ],
        solution: {
          js: `const toggle = document.querySelector('#toggle-password');
const input = document.querySelector('#password');

toggle.addEventListener('click', () => {
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  toggle.textContent = isHidden ? 'Hide' : 'Show';
});
`,
        },
        explanation: 'Both selectors matched nothing, so both variables were `null`. The error appeared on line 4 (`null.addEventListener`) even though the mistakes were on lines 1 and 2: the line in an error message is where the problem **showed up**, not always where it was **made**. After fixing the first selector, the second bug appeared at the click. Bugs often hide behind each other like this.',
        takeaway: '"Cannot read properties of null" right after a `querySelector`: compare the selector with the HTML, including `#`/`.` and word order. Log the result of each `querySelector` when in doubt.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.dom.duplicates',
        type: 'code',
        debug: true,
        bugCategory: 'DOM manipulation',
        title: 'The growing shopping list',
        skills: ['debug.dom', 'js.dom'],
        prompt: task(
          'Adding "Bread" shows a list with Milk and Bread.',
          'The list shows Milk, Milk, Bread. Every addition repeats the whole list again. No error appears.',
        ),
        files: ['js'],
        given: {
          html: `<form id="add-form">
  <input aria-label="New item">
  <button>Add</button>
</form>
<ul id="items"></ul>`,
          css,
        },
        starter: {
          js: `const items = ['Milk'];
const list = document.querySelector('#items');
const form = document.querySelector('#add-form');

function render() {
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  items.push(input.value.trim());
  input.value = '';
  render();
});

render();
`,
        },
        tests: [
          {
            name: 'At the start the list shows only Milk',
            run: ({ expect, $$ }) => expect($$('#items li').map((li) => li.textContent)).toEqual(['Milk']),
          },
          {
            name: 'Adding Bread shows Milk and Bread',
            run: ({ expect, $, $$, type, submit }) => {
              type($('#add-form input'), 'Bread');
              submit($('#add-form'));
              expect($$('#items li').map((li) => li.textContent)).toEqual(['Milk', 'Bread']);
            },
          },
          {
            name: 'Adding Eggs shows three items',
            run: ({ expect, $, $$, type, submit }) => {
              type($('#add-form input'), 'Eggs');
              submit($('#add-form'));
              expect($$('#items li').map((li) => li.textContent)).toEqual(['Milk', 'Bread', 'Eggs']);
            },
          },
        ],
        hints: [
          'There is no error, so the code does what it says. Follow `render()`: what is in the list **before** the loop starts?',
          'The second time `render` runs, the old `<li>`s are still in the list, and all items are appended again.',
          'Empty the list at the start of `render`.',
        ],
        solution: {
          js: `const items = ['Milk'];
const list = document.querySelector('#items');
const form = document.querySelector('#add-form');

function render() {
  list.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  items.push(input.value.trim());
  input.value = '';
  render();
});

render();
`,
        },
        explanation: '`render` builds the list from the `items` array, which is the right idea. But it appended to the existing `<li>`s instead of replacing them, so each call added a full copy.',
        takeaway: 'Duplicates that grow with every action → a render function that appends without clearing first. A render function should produce the same page no matter how often it runs.',
      },
    },
  ],
  keyPoints: [
    'null after `querySelector` → compare the selector with the HTML.',
    'An error line shows where a problem surfaced; the cause may be earlier.',
    'Render functions must clear before rebuilding.',
  ],
};

/* ───────────────────────── 3. Event bugs ───────────────────────── */

const eventBugs = {
  slug: 'event-bugs',
  title: 'Event bugs',
  minutes: 25,
  summary: 'Clicks that do nothing: missing, misnamed and misplaced event listeners.',
  sections: [
    {
      kind: 'text',
      text: `When "clicking does nothing", check in this order:

1. **Is the listener registered at all?** Put \`console.log('clicked')\` as the first line of the handler. No log → the listener never runs.
2. **The event name**: \`'click'\`, \`'submit'\`, \`'input'\`, without "on". \`'onclick'\` is silently ignored: no error, no event.
3. **The right element**: did the listener go on the element you click? A \`submit\` listener belongs on the **form**.
4. **Did the element exist when the listener was added?** Elements created later (for example by a render function) do not have listeners added earlier. Use event delegation on a parent.
5. **Called instead of passed**: \`addEventListener('click', save())\` runs \`save\` once immediately.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.events.counter',
        type: 'code',
        debug: true,
        bugCategory: 'Missing event listeners',
        title: 'The silent button',
        skills: ['debug.events', 'js.events'],
        prompt: task(
          'Each click on "Add one" increases the number by 1.',
          'Nothing happens, and the console shows no error at all.',
        ),
        files: ['js'],
        given: {
          html: '<button id="add" type="button">Add one</button>\n<output id="value">0</output>',
          css,
        },
        starter: {
          js: `const button = document.querySelector('#add');
const output = document.querySelector('#value');
let value = 0;

function increase() {
  value++;
  output.textContent = value;
}

button.addEventListener('onclick', increase);
`,
        },
        tests: [
          {
            name: 'One click shows 1',
            run: ({ expect, $, click }) => {
              click($('#add'));
              expect($('#value').textContent).toBe('1');
            },
          },
          {
            name: 'Two more clicks show 3',
            run: ({ expect, $, click }) => {
              click($('#add'));
              click($('#add'));
              expect($('#value').textContent).toBe('3');
            },
          },
        ],
        hints: [
          'No error usually means the code runs fine, but something is never triggered. Is `increase` ever called? Add a `console.log` inside it.',
          'Look at the first argument of `addEventListener`.',
        ],
        solution: {
          js: `const button = document.querySelector('#add');
const output = document.querySelector('#value');
let value = 0;

function increase() {
  value++;
  output.textContent = value;
}

button.addEventListener('click', increase);
`,
        },
        explanation: '`addEventListener` accepts any event name, including ones that never happen. There is no "onclick" event (that is the name of an HTML attribute and a property), so the listener waited forever without any error.',
        takeaway: 'Silent failure + no error → check that the code runs at all (a log as the first line), then check event names character by character.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.events.late-elements',
        type: 'code',
        debug: true,
        bugCategory: 'Missing event listeners',
        title: 'Delete buttons that do not delete',
        skills: ['debug.events', 'js.events', 'js.dom'],
        prompt: task(
          'Each "Delete" button removes its task from the list.',
          'The Delete buttons do nothing, and there is no error.',
        ),
        files: ['js'],
        given: { html: '<ul id="list"></ul>', css },
        starter: {
          js: `let todos = ['Write tests', 'Fix the bug', 'Deploy'];
const list = document.querySelector('#list');

document.querySelectorAll('.delete').forEach((button) => {
  button.addEventListener('click', () => {
    todos.splice(Number(button.dataset.index), 1);
    render();
  });
});

function render() {
  list.replaceChildren(...todos.map((text, index) => {
    const li = document.createElement('li');
    li.textContent = text + ' ';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete';
    button.dataset.index = index;
    button.textContent = 'Delete';
    li.append(button);
    return li;
  }));
}

render();
`,
        },
        tests: [
          {
            name: 'Deleting the first task removes it',
            run: ({ expect, $$, click }) => {
              click($$('#list .delete')[0]);
              expect($$('#list li').map((li) => li.firstChild.textContent.trim())).toEqual(['Fix the bug', 'Deploy']);
            },
          },
          {
            name: 'Delete still works after the list was re-rendered',
            run: ({ expect, $$, click }) => {
              click($$('#list .delete')[1]);
              expect($$('#list li').map((li) => li.firstChild.textContent.trim()), 'Use one listener on the list').toEqual(['Fix the bug']);
            },
          },
        ],
        hints: [
          'When the `querySelectorAll(\'.delete\')` line runs, how many delete buttons exist on the page?',
          'The buttons are created by `render()`, which runs later, and is called again after every change. Listeners on old buttons disappear with them.',
          'Listen on `list` instead, and find the button with `event.target.closest(\'.delete\')`.',
        ],
        solution: {
          js: `let todos = ['Write tests', 'Fix the bug', 'Deploy'];
const list = document.querySelector('#list');

list.addEventListener('click', (event) => {
  const button = event.target.closest('.delete');
  if (!button) return;
  todos.splice(Number(button.dataset.index), 1);
  render();
});

function render() {
  list.replaceChildren(...todos.map((text, index) => {
    const li = document.createElement('li');
    li.textContent = text + ' ';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete';
    button.dataset.index = index;
    button.textContent = 'Delete';
    li.append(button);
    return li;
  }));
}

render();
`,
        },
        explanation: 'When the listener loop ran, `render()` had not created any buttons yet, so `forEach` looped over nothing. Even in the right order, every render replaces the buttons, and their listeners are lost. One listener on the list, which is never replaced, covers every current and future button.',
        takeaway: 'Listeners added with `querySelectorAll(…).forEach` + a list that is rendered or changed later = buttons that stop working. Use event delegation on the stable parent.',
      },
    },
  ],
  keyPoints: [
    'First check whether the handler runs at all (log as its first line).',
    'Event names have no "on": `click`, `submit`, `input`.',
    'Elements created or replaced later need event delegation.',
  ],
};

/* ───────────────────────── 4. Names and undefined values ───────────────────────── */

const undefinedBugs = {
  slug: 'undefined-values',
  title: 'Wrong names and undefined values',
  minutes: 25,
  summary: 'Typos in names, missing returns, and the long journey of an undefined value.',
  sections: [
    {
      kind: 'text',
      text: `\`undefined\` is the most common value in bug reports. Where it usually comes from:

- **A misspelled property**: \`user.firstname\` instead of \`user.firstName\`. JavaScript does not complain; it just gives \`undefined\`.
- **A missing \`return\`**: the function computes the right value and then throws it away.
- **A missing object**: \`find()\` found nothing, an API left out a field, an index was out of range.
- **A misspelled variable name**: this one at least gives an error (\`ReferenceError: … is not defined\`).

An \`undefined\` often travels far before it causes a visible problem: "Hello, undefined!", \`NaN\` in a total, or an error three functions later. **Work backwards**: log the value at each step until you find where it first became \`undefined\`.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.undefined.greeting',
        type: 'code',
        debug: true,
        bugCategory: 'Undefined values',
        title: 'Hello, undefined!',
        skills: ['debug.undefined', 'js.functions.return', 'js.objects'],
        prompt: task(
          '`greeting(user)` returns `\'Hello, Ada Lovelace!\'` for the user in the code.',
          'It returns `\'Hello, undefined!\'`. (There are **two** bugs.)',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `const user = { firstName: 'Ada', lastName: 'Lovelace' };

function formatName(person) {
  const full = \`\${person.first} \${person.last}\`;
}

function greeting(person) {
  return 'Hello, ' + formatName(person) + '!';
}

console.log(greeting(user));
`,
        },
        tests: [
          { name: "greeting returns 'Hello, Ada Lovelace!'", run: ({ expect }) => expect(greeting({ firstName: 'Ada', lastName: 'Lovelace' })).toBe('Hello, Ada Lovelace!') },
          { name: 'It works for any user', run: ({ expect }) => expect(greeting({ firstName: 'Grace', lastName: 'Hopper' })).toBe('Hello, Grace Hopper!') },
          { name: 'formatName returns the full name', run: ({ expect }) => expect(formatName({ firstName: 'A', lastName: 'B' })).toBe('A B') },
        ],
        hints: [
          'Work backwards from the output. What does `formatName(user)` return? Log it.',
          'Look at the last line of `formatName`. And compare the property names with the object on line 1.',
        ],
        solution: {
          js: `const user = { firstName: 'Ada', lastName: 'Lovelace' };

function formatName(person) {
  return \`\${person.firstName} \${person.lastName}\`;
}

function greeting(person) {
  return 'Hello, ' + formatName(person) + '!';
}

console.log(greeting(user));
`,
        },
        explanation: 'Bug 1: `formatName` built the text but never returned it, so it returned `undefined`, and that ended up in the greeting. Bug 2 only became visible after fixing bug 1: the properties are `firstName` and `lastName`, so `person.first` was `undefined` too, giving "Hello, undefined undefined!".',
        takeaway: '"undefined" in visible text → work backwards: which function produced it? Check for a missing `return` first, then for property names that do not match the data.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.undefined.nan-total',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect variable names',
        title: 'A total of NaN',
        skills: ['debug.undefined', 'debug.reading-errors', 'js.array-methods'],
        prompt: task(
          '`orderTotal(items)` returns the sum of price × quantity: 14 for the order in the code.',
          'First an error in the console. (Fix it, and a second problem appears: the total is `NaN`.)',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `const order = [
  { name: 'Notebook', price: 4, quantity: 2 },
  { name: 'Pen', price: 1.5, quantity: 4 },
];

function orderTotal(items) {
  let totalPrice = 0;
  for (const item of items) {
    totalprice += item.price * item.qty;
  }
  return totalPrice;
}

console.log(orderTotal(order));
`,
        },
        tests: [
          { name: 'orderTotal returns 14 for the example order', run: ({ expect }) => expect(orderTotal([{ price: 4, quantity: 2 }, { price: 1.5, quantity: 4 }])).toBe(14) },
          { name: 'An empty order costs 0', run: ({ expect }) => expect(orderTotal([])).toBe(0) },
        ],
        hints: [
          'Read the ReferenceError: which name does it say is not defined? Compare it letter by letter with the declaration.',
          'After that fix, `NaN` means a calculation used `undefined`. Which property of `item` does not exist in the data?',
        ],
        solution: {
          js: `const order = [
  { name: 'Notebook', price: 4, quantity: 2 },
  { name: 'Pen', price: 1.5, quantity: 4 },
];

function orderTotal(items) {
  let totalPrice = 0;
  for (const item of items) {
    totalPrice += item.price * item.quantity;
  }
  return totalPrice;
}

console.log(orderTotal(order));
`,
        },
        explanation: 'JavaScript names are case-sensitive: `totalprice` is a different, undeclared variable, so it gives a ReferenceError. The property typo is quieter: `item.qty` is simply `undefined`, and any calculation with `undefined` gives `NaN`, which then spreads through the total.',
        takeaway: 'ReferenceError → compare the spelling and capitalization of the name with its declaration. `NaN` → some value in the calculation was `undefined` or not a number; log each operand.',
      },
    },
  ],
  keyPoints: [
    'Misspelled variables throw; misspelled properties silently give `undefined`.',
    'A missing `return` is the classic source of `undefined`.',
    'Work backwards from where `undefined` or `NaN` appears.',
  ],
};

/* ───────────────────────── 5. Logic bugs ───────────────────────── */

const logicBugs = {
  slug: 'logic-bugs',
  title: 'Wrong conditions and broken function calls',
  minutes: 30,
  summary: 'Code that runs without errors but makes the wrong decision.',
  sections: [
    {
      kind: 'text',
      text: `Logic bugs are the hardest kind, because nothing crashes. Typical causes:

- **\`=\` instead of \`===\`** in a condition: it **assigns**, and the condition is then usually truthy.
- **Wrong boundary**: \`>\` where \`>=\` was meant.
- **Wrong combination**: \`&&\` and \`||\` mixed up, or missing parentheses.
- **Arguments in the wrong order**: \`calculate(quantity, price)\` for a function defined as \`calculate(price, quantity)\`. Nothing tells you, because both are numbers.
- **Wrong units**: a discount of \`10\` where the function expects \`0.1\`.

For these bugs, test with **specific inputs where you know the right answer**, especially boundary values, and compare.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.logic.find-user',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect conditions',
        title: 'Everyone is an admin',
        skills: ['debug.conditions', 'js.conditions', 'js.array-methods'],
        prompt: task(
          '`describeUser(users, 2)` returns `\'Grace (editor)\'`, and only real admins get "(admin)".',
          'It returns `\'Ada (admin)\'` for every id. (Two lines contain the same kind of bug.)',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `const users = [
  { id: 1, name: 'Ada', role: 'admin' },
  { id: 2, name: 'Grace', role: 'editor' },
  { id: 3, name: 'Alan', role: 'viewer' },
];

function describeUser(list, id) {
  const user = list.find((u) => u.id = id);
  if (user.role = 'admin') {
    return \`\${user.name} (admin)\`;
  }
  return \`\${user.name} (\${user.role})\`;
}

console.log(describeUser(users, 2));
`,
        },
        tests: [
          { name: "describeUser(users, 2) → 'Grace (editor)'", run: ({ expect }) => expect(describeUser([{ id: 1, name: 'Ada', role: 'admin' }, { id: 2, name: 'Grace', role: 'editor' }], 2)).toBe('Grace (editor)') },
          { name: "describeUser(users, 1) → 'Ada (admin)'", run: ({ expect }) => expect(describeUser([{ id: 1, name: 'Ada', role: 'admin' }, { id: 2, name: 'Grace', role: 'editor' }], 1)).toBe('Ada (admin)') },
          {
            name: 'The data is not changed',
            run: ({ expect }) => {
              const list = [{ id: 1, name: 'Ada', role: 'viewer' }, { id: 2, name: 'Grace', role: 'editor' }];
              describeUser(list, 2);
              expect(list, 'A condition must compare, not assign').toEqual([{ id: 1, name: 'Ada', role: 'viewer' }, { id: 2, name: 'Grace', role: 'editor' }]);
            },
          },
        ],
        hints: [
          'Log `users` after calling the function. Has the data changed?',
          'How many `=` signs does a comparison need?',
        ],
        solution: {
          js: `const users = [
  { id: 1, name: 'Ada', role: 'admin' },
  { id: 2, name: 'Grace', role: 'editor' },
  { id: 3, name: 'Alan', role: 'viewer' },
];

function describeUser(list, id) {
  const user = list.find((u) => u.id === id);
  if (user.role === 'admin') {
    return \`\${user.name} (admin)\`;
  }
  return \`\${user.name} (\${user.role})\`;
}

console.log(describeUser(users, 2));
`,
        },
        explanation: '`u.id = id` **assigns** the id to the first user and returns it (2, which is truthy), so `find` stopped at the first user, after overwriting its id. `user.role = \'admin\'` then made that user an admin and was always true. Both lines silently **changed the data**, which can break other parts of the program too.',
        takeaway: 'A condition that is "always true", or data that changes after a check → look for `=` where `===` was meant.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.logic.arguments',
        type: 'code',
        debug: true,
        bugCategory: 'Broken function calls',
        title: 'A discount that costs extra',
        skills: ['debug.function-calls', 'js.functions.return'],
        prompt: task(
          '3 items at €20 with a 10% discount cost €54.',
          'The checkout shows a negative price. The function `discountedTotal` itself is correct: the bugs are in **how it is called**.',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `// Correct: price per item, number of items, discount as a fraction (0.1 = 10%).
function discountedTotal(price, quantity, discount) {
  return price * quantity * (1 - discount);
}

function checkout(cart) {
  return discountedTotal(cart.quantity, cart.price, cart.discountPercent);
}

console.log(checkout({ price: 20, quantity: 3, discountPercent: 10 }));
`,
        },
        tests: [
          { name: '3 × €20 with 10% off → 54', run: ({ expect }) => expect(checkout({ price: 20, quantity: 3, discountPercent: 10 })).toBeCloseTo(54) },
          { name: '1 × €100 with 25% off → 75', run: ({ expect }) => expect(checkout({ price: 100, quantity: 1, discountPercent: 25 })).toBeCloseTo(75) },
          { name: 'No discount → full price', run: ({ expect }) => expect(checkout({ price: 5, quantity: 4, discountPercent: 0 })).toBeCloseTo(20) },
        ],
        pitfalls: [
          { pattern: /function discountedTotal\(price, quantity, discount\) \{\s*return price \* quantity \* \(1 - discount\);/, absent: true, message: 'The task says `discountedTotal` is correct. Fix the call in `checkout` instead of changing the function.' },
        ],
        hints: [
          'Compare the order of the arguments in the call with the order of the parameters in the definition.',
          'Swapping price and quantity happens not to change the result here. What about the discount: the data says 10, the function expects…?',
          'Convert the percentage with `cart.discountPercent / 100`.',
        ],
        solution: {
          js: `// Correct: price per item, number of items, discount as a fraction (0.1 = 10%).
function discountedTotal(price, quantity, discount) {
  return price * quantity * (1 - discount);
}

function checkout(cart) {
  return discountedTotal(cart.price, cart.quantity, cart.discountPercent / 100);
}

console.log(checkout({ price: 20, quantity: 3, discountPercent: 10 }));
`,
        },
        explanation: 'Arguments are matched by **position**, not by name. Swapped price and quantity happen to give the same product, which hides that bug for now (it would show up as soon as the function changes). The visible bug was the unit: 10 instead of 0.1 gives `1 - 10 = -9`.',
        takeaway: 'A function that is correct in isolation but wrong in use → compare the call with the definition: order, units (percent or fraction, cents or euros), and types.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.logic.boundaries',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect conditions',
        title: 'Free shipping, almost',
        skills: ['debug.conditions', 'js.conditions'],
        prompt: task(
          'Orders of €50 or more ship free. Members ship free on any order. Everyone else pays €4.95.',
          'Customers with exactly €50 are charged, and members are charged on small orders.',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `function shippingCost(total, isMember) {
  if (total > 50 && isMember) {
    return 0;
  }
  return 4.95;
}
`,
        },
        tests: [
          { name: '€50, not a member → free', run: ({ expect }) => expect(shippingCost(50, false)).toBe(0) },
          { name: '€80, not a member → free', run: ({ expect }) => expect(shippingCost(80, false)).toBe(0) },
          { name: '€10, member → free', run: ({ expect }) => expect(shippingCost(10, true)).toBe(0) },
          { name: '€49.99, not a member → 4.95', run: ({ expect }) => expect(shippingCost(49.99, false)).toBe(4.95) },
        ],
        hints: [
          'Test the rule with the exact boundary: what does `50 > 50` give?',
          'The rule has the word "or" in it. What does the code use?',
        ],
        solution: {
          js: `function shippingCost(total, isMember) {
  if (total >= 50 || isMember) {
    return 0;
  }
  return 4.95;
}
`,
        },
        explanation: 'Two small differences from the requirement: `>` excluded exactly €50, and `&&` required both conditions where either one should be enough. Neither causes an error, which is why boundary tests matter.',
        takeaway: 'Translate the requirement word by word: "or more" → `>=`, "or" → `||`, "and" → `&&`. Then test exactly on the boundary.',
      },
    },
  ],
  keyPoints: [
    '`=` in a condition assigns; use `===`.',
    'Arguments match by position; check the order and the units.',
    'Translate requirements word by word, and test the boundaries.',
  ],
};

/* ───────────────────────── 6. Array bugs ───────────────────────── */

const arrayBugs = {
  slug: 'array-bugs',
  title: 'Array bugs',
  minutes: 25,
  summary: 'Off-by-one loops, sorting surprises and arrays changed by accident.',
  sections: [
    {
      kind: 'text',
      text: `Arrays cause a few very common bugs:

- **Off by one**: \`i <= list.length\` visits one index too many (the last one is \`undefined\`).
- **\`sort()\` sorts as text** by default: \`[10, 9, 100].sort()\` gives \`[10, 100, 9]\`. For numbers, pass a compare function: \`(a, b) => a - b\`.
- **\`sort()\` and \`reverse()\` change the original array.** If other code still uses that array, it suddenly sees a different order. Copy first: \`[...list].sort(…)\`.
- **\`map\` without \`return\`** in a callback with \`{ }\` gives an array of \`undefined\`.
- **\`splice\` versus \`slice\`**: \`splice\` changes the array, \`slice\` returns a copy of a part.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.arrays.top-scores',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect array handling',
        title: 'The top three',
        skills: ['debug.arrays', 'js.array-methods'],
        prompt: task(
          '`topThree(scores)` returns the three highest scores, highest first, and leaves the original `scores` array unchanged.',
          'The order is strange, and after calling it, the original scores are in a different order too.',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `const scores = [12, 100, 9, 45, 7];

function topThree(list) {
  return list.sort().reverse().slice(0, 3);
}

console.log(topThree(scores));
console.log(scores);
`,
        },
        tests: [
          { name: 'Returns [100, 45, 12]', run: ({ expect }) => expect(topThree([12, 100, 9, 45, 7])).toEqual([100, 45, 12]) },
          {
            name: 'The original array is not changed',
            run: ({ expect }) => {
              const list = [12, 100, 9, 45, 7];
              topThree(list);
              expect(list, 'Sort a copy, not the original').toEqual([12, 100, 9, 45, 7]);
            },
          },
          { name: 'Works with fewer than three scores', run: ({ expect }) => expect(topThree([5, 50])).toEqual([50, 5]) },
        ],
        hints: [
          'Log the result of `list.sort()` on its own. Is it sorted the way numbers should be?',
          'There are two problems: how `sort` compares, and which array it changes.',
          '`[...list].sort((a, b) => b - a)` sorts a copy, from high to low.',
        ],
        solution: {
          js: `const scores = [12, 100, 9, 45, 7];

function topThree(list) {
  return [...list].sort((a, b) => b - a).slice(0, 3);
}

console.log(topThree(scores));
console.log(scores);
`,
        },
        explanation: '`sort()` without a compare function converts the numbers to text and sorts alphabetically ("100" < "12" < "45" < "7" < "9"). And it sorts **in place**, so `scores` itself was reordered. With `(a, b) => b - a` and a copy, both problems disappear.',
        takeaway: 'Odd order with numbers → `sort()` without a compare function. Data that changed "by itself" → look for `sort`, `reverse`, `splice` or `push` on an array that other code also uses.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.arrays.average',
        type: 'code',
        debug: true,
        bugCategory: 'Incorrect array handling',
        title: 'An average of NaN',
        skills: ['debug.arrays', 'js.loops', 'reading.edge-cases'],
        prompt: task(
          '`average([2, 4, 6])` returns 4, and `average([])` returns 0.',
          '`average([2, 4, 6])` returns `NaN`.',
        ),
        files: ['js'],
        preview: false,
        starter: {
          js: `function average(numbers) {
  let sum = 0;
  for (let i = 0; i <= numbers.length; i++) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}

console.log(average([2, 4, 6]));
`,
        },
        tests: [
          { name: 'average([2, 4, 6]) → 4', run: ({ expect }) => expect(average([2, 4, 6])).toBe(4) },
          { name: 'average([5]) → 5', run: ({ expect }) => expect(average([5])).toBe(5) },
          { name: 'average([]) → 0', run: ({ expect }) => expect(average([]), 'An empty list needs its own rule').toBe(0) },
        ],
        hints: [
          'Trace the loop for `[2, 4, 6]`: which values does `i` take, and what is `numbers[3]`?',
          'After fixing the loop, what is `0 / 0`?',
        ],
        solution: {
          js: `function average(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}

console.log(average([2, 4, 6]));
`,
        },
        explanation: 'With `<=`, the loop also visits index 3, where `numbers[3]` is `undefined`, and `12 + undefined` is `NaN`. The empty list is a separate edge case: `0 / 0` is also `NaN`. (A `for…of` loop avoids the first bug entirely.)',
        takeaway: '`NaN` from a loop over an array → check `<` versus `<=`, and the empty case.',
      },
    },
  ],
  keyPoints: [
    'Indexes go from 0 to `length - 1`: loop with `<`, or use `for…of`.',
    '`sort()` needs `(a, b) => a - b` for numbers, and changes the original.',
    'Copy before sorting or reversing data that other code uses.',
  ],
};

/* ───────────────────────── 7. Async bugs ───────────────────────── */

const asyncBugs = {
  slug: 'async-bugs',
  title: 'Asynchronous bugs',
  minutes: 30,
  summary: 'Missing awaits, unhandled failures, and loading states that never end.',
  sections: [
    {
      kind: 'text',
      text: `Asynchronous bugs look strange because the code runs in a different order than it reads:

- **Missing \`await\`**: you get a Promise instead of the value. Symptoms: \`[object Promise]\` on the page, \`Promise {<pending>}\` in the console, or \`undefined\` when you read a property like \`.length\`.
- **\`response.json()\` without \`await\`**: the same, one step later.
- **No error handling**: a failed request leaves "Loading…" on screen forever, and "Uncaught (in promise)" in the console.
- **\`forEach\` with an async callback**: \`forEach\` does not wait, so code after it runs before the work is done. Use \`for…of\` with \`await\`, or \`Promise.all\`.

Debugging tip: DevTools → **Network** shows whether a request was made, its status, and its response.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.async.missing-await',
        type: 'code',
        debug: true,
        bugCategory: 'Asynchronous mistakes',
        title: 'Products that never arrive',
        skills: ['debug.async', 'js.async', 'js.fetch'],
        prompt: task(
          '`loadProductNames()` returns `[\'Notebook\', \'Pen\', \'Backpack\']`. (The fetch is a fake product API, see "Provided JS".)',
          'There is an error about `map`, or the result is not the list of names.',
        ),
        files: ['js'],
        preview: false,
        given: { setup: FAKE_API },
        starter: {
          js: `async function loadProductNames() {
  const response = fetch('/api/products');
  const products = response.json();
  return products.map((product) => product.name);
}

loadProductNames().then((names) => console.log(names));
`,
        },
        tests: [
          { name: 'Returns the three product names', run: async ({ expect }) => expect(await loadProductNames()).toEqual(['Notebook', 'Pen', 'Backpack']) },
        ],
        hints: [
          'Log `response` right after the first line. Is it a Response, or something else?',
          '`fetch` and `response.json()` both return promises. What turns a promise into its value?',
        ],
        solution: {
          js: `async function loadProductNames() {
  const response = await fetch('/api/products');
  const products = await response.json();
  return products.map((product) => product.name);
}

loadProductNames().then((names) => console.log(names));
`,
        },
        explanation: 'Without `await`, `response` was a Promise, and a Promise has no `json` method, hence the TypeError. Adding the first `await` alone is not enough: `products` would be a Promise too, and promises have no `map`. Both awaits are needed.',
        takeaway: '"x is not a function" or `undefined` right after an asynchronous call → log the value. If it shows `Promise {…}`, an `await` is missing.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.async.loading-forever',
        type: 'code',
        debug: true,
        bugCategory: 'Asynchronous mistakes',
        title: 'Loading… forever',
        skills: ['debug.async', 'js.error-handling', 'js.fetch'],
        prompt: task(
          'While loading, the button is disabled and shows "Loading…". Afterwards it is enabled again and shows "Load products", **also when loading fails**. On failure, `#error` shows "Could not load products."',
          'When the network is down, the button stays disabled on "Loading…" forever.',
        ),
        files: ['js'],
        given: {
          html: '<button id="load" type="button">Load products</button>\n<p id="error" role="alert"></p>\n<ul id="list"></ul>',
          css,
          setup: FAKE_API,
        },
        starter: {
          js: `const button = document.querySelector('#load');
const errorEl = document.querySelector('#error');
const list = document.querySelector('#list');

async function loadProducts() {
  button.disabled = true;
  button.textContent = 'Loading…';
  errorEl.textContent = '';

  const response = await fetch('/api/products');
  const products = await response.json();
  list.replaceChildren(...products.map((p) => Object.assign(document.createElement('li'), { textContent: p.name })));

  button.disabled = false;
  button.textContent = 'Load products';
}

button.addEventListener('click', loadProducts);
`,
        },
        tests: [
          {
            name: 'On success, the list is filled and the button is reset',
            run: async ({ expect, $, $$ }) => {
              await loadProducts();
              expect($$('#list li').length).toBe(3);
              expect([$('#load').disabled, $('#load').textContent]).toEqual([false, 'Load products']);
            },
          },
          {
            name: 'On a network failure, the button is reset and the error is shown',
            run: async ({ expect, $ }) => {
              window.apiDown = true;
              try {
                await loadProducts();
              } catch (error) {
                // the fixed code should not throw
              } finally {
                window.apiDown = false;
              }
              expect([$('#load').disabled, $('#load').textContent], 'Reset the button in a finally block').toEqual([false, 'Load products']);
              expect($('#error').textContent).toBe('Could not load products.');
            },
          },
        ],
        hints: [
          'Follow the failure path: when `fetch` rejects, which lines after the `await` still run?',
          'Put the request in `try`, the error message in `catch`, and the button reset in `finally`, which runs in both cases.',
        ],
        solution: {
          js: `const button = document.querySelector('#load');
const errorEl = document.querySelector('#error');
const list = document.querySelector('#list');

async function loadProducts() {
  button.disabled = true;
  button.textContent = 'Loading…';
  errorEl.textContent = '';

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
    const products = await response.json();
    list.replaceChildren(...products.map((p) => Object.assign(document.createElement('li'), { textContent: p.name })));
  } catch (error) {
    errorEl.textContent = 'Could not load products.';
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = 'Load products';
  }
}

button.addEventListener('click', loadProducts);
`,
        },
        explanation: 'When the `await` rejected, the function stopped right there, so the lines that reset the button never ran. `finally` runs whether the `try` succeeded or failed, which makes it the right place for "always undo the loading state".',
        takeaway: 'A loading state that sometimes never ends → follow the failure path. Every "start loading" needs a matching "stop loading" in `finally`.',
      },
    },
  ],
  keyPoints: [
    '`Promise {<pending>}` or a missing method on a promise → a missing `await`.',
    'A rejected `await` skips the rest of the function: reset UI state in `finally`.',
    'Check DevTools → Network for request status and responses.',
  ],
};

/* ───────────────────────── 8. HTML and CSS bugs ───────────────────────── */

const cssBugs = {
  slug: 'css-bugs',
  title: 'HTML and CSS bugs',
  minutes: 25,
  summary: 'Styles that do not apply: typos, wrong targets and lost specificity battles.',
  sections: [
    {
      kind: 'text',
      text: `CSS never throws errors. An invalid declaration is simply **ignored**, so CSS bugs are silent:

- **A typo in a property or value**: \`colour\`, \`justify-content: centre\`. DevTools → Styles shows such lines **crossed out with a warning icon**.
- **The rule targets the wrong element**: layout properties on the child instead of the parent, or a selector that matches nothing.
- **Another rule wins**: DevTools → Styles shows the losing declaration crossed out (without a warning icon), and the winning rule above it.
- **Invalid HTML**: an unclosed tag puts elements inside the wrong parent; DevTools → Elements shows the real tree.

The method: select the element in DevTools, look at the Styles panel, and check whether your rule is (1) there at all, (2) crossed out, (3) crossed out with a warning.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.css.centered-card',
        type: 'code',
        debug: true,
        bugCategory: 'CSS bugs',
        title: 'The card that will not center',
        skills: ['debug.css', 'css.flexbox'],
        prompt: task(
          'The card is centered horizontally and vertically in the gray area, with white text on teal.',
          'The card sits in the top-left corner, and the text is black. (There are **three** bugs, and none of them gives an error.)',
        ),
        files: ['css'],
        given: {
          html: `<div class="stage">
  <div class="card">Centered</div>
</div>`,
        },
        starter: {
          css: `.stage {
  min-height: 260px;
  background: #e5e7eb;
}

.card {
  display: flex;
  justify-content: centre;
  align-items: center;
  padding: 1rem 2rem;
  background: teal;
  colour: white;
}
`,
        },
        tests: [
          {
            name: 'The card is centered horizontally and vertically',
            run: ({ expect, $ }) => {
              const stage = $('.stage').getBoundingClientRect();
              const card = $('.card').getBoundingClientRect();
              const dx = Math.abs(stage.left + stage.width / 2 - (card.left + card.width / 2));
              const dy = Math.abs(stage.top + stage.height / 2 - (card.top + card.height / 2));
              expect(dx < 2 && dy < 2, `The card is ${Math.round(dx)}px / ${Math.round(dy)}px off center`).toBe(true);
            },
          },
          {
            name: 'The text is white',
            run: ({ expect, $, style }) => expect(style($('.card'), 'color')).toBe('rgb(255, 255, 255)'),
          },
        ],
        hints: [
          'Which element should be the flex container: the one being centered, or the one it is centered in?',
          'Look for spelling: CSS uses American English, and an unknown property or value is silently ignored.',
          'Move `display: flex`, `justify-content` and `align-items` to `.stage`; fix `centre` and `colour`.',
        ],
        solution: {
          css: `.stage {
  min-height: 260px;
  background: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  padding: 1rem 2rem;
  background: teal;
  color: white;
}
`,
        },
        explanation: 'The flex properties were on the card, so they would center the card\'s **text**, not the card. And `centre` and `colour` are not valid CSS, so the browser dropped those declarations without a word. In DevTools, both would appear crossed out with a warning sign.',
        takeaway: 'A style that "does nothing" → inspect the element: is the declaration crossed out with a warning (invalid), crossed out without one (lost to another rule), or on the wrong element entirely?',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'debug.html.unclosed',
        type: 'code',
        debug: true,
        bugCategory: 'HTML bugs',
        title: 'Everything is a link',
        skills: ['debug.html', 'html.links'],
        prompt: task(
          'Only "our menu" is a link. The two paragraphs are separate, and "Opening hours" is a normal heading.',
          'Everything after "our menu" is part of the link.',
        ),
        files: ['html'],
        given: { css: 'body { font-family: system-ui, sans-serif; padding: 1rem; }' },
        starter: {
          html: `<p>Have a look at <a href="/menu">our menu.</p>

<h2>Opening hours</h2>
<p>Daily from 8:00 to 18:00.</p>
`,
        },
        tests: [
          { name: 'There is exactly one link, with the text "our menu"', run: ({ expect, $$ }) => expect($$('a').map((a) => a.textContent.trim().replace(/\.$/, ''))).toEqual(['our menu']) },
          { name: 'The heading is not inside a link', run: ({ expect, $ }) => expect($('a h2'), 'Close the <a> before the paragraph ends').toBe(null) },
        ],
        hints: [
          'Count the opening and closing tags of each element. Is every one closed?',
          'The `<a>` needs its own `</a>`, before the `</p>`.',
        ],
        solution: {
          html: `<p>Have a look at <a href="/menu">our menu</a>.</p>

<h2>Opening hours</h2>
<p>Daily from 8:00 to 18:00.</p>
`,
        },
        explanation: 'A missing `</a>` does not produce an error. The browser repairs the HTML by its own rules, and here it kept the link open, wrapping the following content too. DevTools → Elements shows the "repaired" tree, which is how you spot it.',
        takeaway: 'Unexpected nesting or styling spreading too far → check that every opened tag is closed in the right order, and compare with the tree in DevTools → Elements.',
      },
    },
  ],
  keyPoints: [
    'CSS and HTML errors are silent: invalid parts are ignored or repaired.',
    'DevTools → Styles: crossed out with a warning = invalid; without = lost to another rule.',
    'DevTools → Elements shows the real tree after the browser repaired your HTML.',
  ],
};

export const debuggingLessons = [
  method,
  domBugs,
  eventBugs,
  undefinedBugs,
  logicBugs,
  arrayBugs,
  asyncBugs,
  cssBugs,
];
