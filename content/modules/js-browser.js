/*
 * js-browser.js — Module 3, part 2: JavaScript in the browser.
 *
 * DOM, events, forms, errors, JSON, storage, modules and asynchronous code.
 *
 * The network exercises use a FAKE fetch (FAKE_API below), given to the sandbox
 * as setup code. It behaves like a small real API, works offline, answers
 * instantly, and lets tests simulate failures (404, network down) on purpose.
 */

import { FAKE_USERS, FAKE_API } from '../shared/fake-services.js';

const basicCss = 'body { font-family: system-ui, sans-serif; padding: 1rem; }';

/* ───────────────────────── 13. The DOM ───────────────────────── */

const dom = {
  slug: 'dom',
  title: 'The DOM: selecting and changing elements',
  minutes: 30,
  summary: 'Finding elements on the page and changing their text, classes and attributes.',
  sections: [
    {
      kind: 'text',
      text: `The browser turns your HTML into a tree of objects: the **DOM** (Document Object Model). JavaScript changes the page by changing these objects. The HTML file itself never changes.

**Selecting**
- \`document.querySelector('.card')\` → the **first** match, or \`null\` if nothing matches
- \`document.querySelectorAll('.card')\` → **all** matches, as a NodeList (use \`for…of\`, or \`[...list]\` to get a real array)
- Selectors are the same as in CSS: \`.class\`, \`#id\`, \`nav a\`

**Changing**
- \`el.textContent = 'New text'\`: replace the text (safe: shown as text, never run as HTML)
- \`el.classList.add('active')\`, \`.remove()\`, \`.toggle('active', condition)\`: change classes, and let CSS do the styling
- \`el.hidden = true\`, \`el.disabled = true\`, \`el.value\`, \`el.href\`: most attributes are properties
- \`document.createElement('li')\`, then \`list.append(li)\`: create and insert new elements
- \`el.remove()\` removes an element; \`list.replaceChildren()\` empties a list

**\`innerHTML\` versus \`textContent\`.** \`innerHTML\` parses its value as HTML. With text a user typed, that lets them inject HTML and scripts (**XSS**). Use \`textContent\` for text, and \`createElement\` for structure.`,
    },
    {
      kind: 'example',
      language: 'js',
      html: `<h2 id="title">Orders</h2>
<p class="status">Loading…</p>
<ul id="orders"></ul>`,
      css: `${basicCss} .status.is-done { color: seagreen; }`,
      preview: true,
      previewHeight: 170,
      code: `const title = document.querySelector('#title');
const status = document.querySelector('.status');
const list = document.querySelector('#orders');

title.textContent = 'Your orders (2)';

for (const item of ['Notebook', 'Pen']) {
  const li = document.createElement('li');
  li.textContent = item;
  list.append(li);
}

status.textContent = 'Up to date';
status.classList.add('is-done');`,
      notes: [
        { lines: [1, 3], text: 'Select each element once and keep it in a well-named variable.' },
        { lines: [5], text: '`textContent` replaces the text inside the element.' },
        { lines: [7, 11], text: 'Create an element, fill it, and insert it. The `<li>` exists only in memory until `append` puts it into the page.' },
        { lines: [14], text: 'Changing a class lets CSS decide what "done" looks like. Prefer this over setting `el.style.color` in JavaScript.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'A selector that matches nothing', text: '`querySelector` returns `null`, and the next line fails with "Cannot read properties of null". Check the `.` or `#` and the spelling against the HTML.' },
        { title: 'innerHTML with user data', text: '`li.innerHTML = comment` lets a visitor insert `<img src=x onerror=…>` and run code on your page. Use `textContent`. This is one of the most important things to check in AI-generated code.' },
        { title: 'Treating a NodeList like an array', text: '`querySelectorAll(…).map(…)` fails with "map is not a function". Use `for…of`, or convert: `[...document.querySelectorAll(…)]`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'sample.choice.null-selector',
        type: 'choice',
        title: 'Why is the button null?',
        skills: ['debug.selectors', 'js.dom'],
        prompt: "This code throws `TypeError: Cannot read properties of null (reading 'addEventListener')`. What is the cause?",
        language: 'html',
        code: `<button class="save-button">Save</button>

    <script>
      const button = document.querySelector('save-button');
      button.addEventListener('click', save);
    </script>`,
        options: [
          {
            text: "The selector has no dot: `'save-button'` looks for an element **named** `<save-button>`, not for the class.",
            correct: true,
            feedback: '`querySelector` uses CSS selector syntax: `.save-button` for a class, `#save` for an id, `button` for a tag. When nothing matches, it returns `null`.',
          },
          {
            text: '`addEventListener` is misspelled.',
            correct: false,
            feedback: 'It is spelled correctly. A misspelled method gives a different error: `… is not a function`. Read the message again: it says the value **before** `.addEventListener` is `null`.',
          },
          {
            text: 'The function `save` does not exist.',
            correct: false,
            feedback: 'That could also be a bug, but it would cause `ReferenceError: save is not defined`. This error is about a `null` value.',
          },
          {
            text: 'The script runs before the button exists.',
            correct: false,
            feedback: 'Good thinking: that is a very common cause of `null`. But here the `<script>` comes **after** the button, so the button already exists when the script runs.',
          },
        ],
        hints: [
          "The error says the value before `.addEventListener` is `null`. Which line produces that value?",
          '`querySelector` returns `null` when no element matches the selector.',
        ],
        takeaway: '"Cannot read properties of null" after a `querySelector` almost always means the selector matched nothing. Check the `.` or `#` and the spelling first.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.dom.profile',
        type: 'code',
        title: 'Fill in a profile card',
        skills: ['js.dom'],
        prompt: `Write \`showProfile(user)\`, which fills in the card in the HTML tab:

- the name goes into \`.profile__name\`, the role into \`.profile__role\`
- if \`user.online\` is true, show the "Online" badge (it has the \`hidden\` attribute) and add the class \`profile--online\` to the card; if false, hide the badge and remove the class

The function will be called several times with different users.`,
        files: ['js'],
        given: {
          html: `<article class="profile">
  <h2 class="profile__name">Name</h2>
  <p class="profile__role">Role</p>
  <span class="badge" hidden>Online</span>
</article>`,
          css: `${basicCss}
.profile { padding: 1rem; border: 2px solid #cbd5e1; border-radius: 10px; max-width: 260px; }
.profile--online { border-color: #16a34a; }
.profile h2 { margin: 0 0 4px; }
.badge { background: #16a34a; color: white; padding: 2px 8px; border-radius: 99px; font-size: 0.8rem; }`,
        },
        starter: {
          js: `function showProfile(user) {
  // your code here
}

showProfile({ name: 'Ada Lovelace', role: 'Engineer', online: true });
`,
        },
        tests: [
          {
            name: 'The name and role are shown',
            run: ({ expect, $ }) => {
              showProfile({ name: 'Grace Hopper', role: 'Admiral', online: false });
              expect($('.profile__name').textContent).toBe('Grace Hopper');
              expect($('.profile__role').textContent).toBe('Admiral');
            },
          },
          {
            name: 'An online user shows the badge and the class',
            run: ({ expect, $ }) => {
              showProfile({ name: 'Ada', role: 'Engineer', online: true });
              expect($('.badge').hidden, 'Set badge.hidden = false for online users').toBe(false);
              expect($('.profile').classList.contains('profile--online'), 'Add the class profile--online').toBe(true);
            },
          },
          {
            name: 'An offline user hides the badge and removes the class',
            run: ({ expect, $ }) => {
              showProfile({ name: 'Ada', role: 'Engineer', online: true });
              showProfile({ name: 'Alan', role: 'Mathematician', online: false });
              expect($('.badge').hidden, 'The badge must be hidden again').toBe(true);
              expect($('.profile').classList.contains('profile--online'), 'Remove the class again').toBe(false);
            },
          },
          {
            name: 'Names are shown as text, never as HTML',
            run: ({ expect, $ }) => {
              showProfile({ name: '<b>Bold</b>', role: 'x', online: false });
              expect($('.profile__name b'), 'Use textContent, not innerHTML').toBe(null);
            },
          },
        ],
        pitfalls: [
          { pattern: /innerHTML/, message: '`innerHTML` interprets the text as HTML. For text from data (or users), use `textContent`.' },
        ],
        hints: [
          'Select the elements you need (the card, the name, the role, the badge). Then set the text, and handle `online` both ways.',
          '`badge.hidden = !user.online;` handles both cases in one line. `classList.toggle(\'name\', condition)` adds the class when the condition is true and removes it when false.',
          `\`\`\`js
const card = document.querySelector('.profile');
card.querySelector('.profile__name').textContent = user.name;
// … role, badge, and the class
\`\`\``,
        ],
        solution: {
          js: `function showProfile(user) {
  const card = document.querySelector('.profile');
  card.querySelector('.profile__name').textContent = user.name;
  card.querySelector('.profile__role').textContent = user.role;
  card.querySelector('.badge').hidden = !user.online;
  card.classList.toggle('profile--online', user.online);
}

showProfile({ name: 'Ada Lovelace', role: 'Engineer', online: true });
`,
        },
        explanation: 'Writing `hidden = !user.online` and `toggle(…, user.online)` makes the function correct in **both** directions. A version with only `if (user.online) { show }` works the first time, but never hides the badge again. The third test catches that.',
        takeaway: 'A function that updates the page should set every part of it, in both directions. Then it gives the right result no matter what the page looked like before.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.dom.render-list',
        type: 'code',
        title: 'Render a list',
        skills: ['js.dom', 'js.loops'],
        prompt: 'Write `renderList(items)`, which shows every string of the array as an `<li>` in `#todo-list`. When called again, it **replaces** the old items instead of adding to them.',
        files: ['js'],
        given: {
          html: '<ul id="todo-list"></ul>',
          css: basicCss,
        },
        starter: {
          js: `function renderList(items) {
  const list = document.querySelector('#todo-list');
  // your code here
}

renderList(['Buy coffee', 'Write code', 'Read code']);
`,
        },
        tests: [
          {
            name: 'Shows one <li> per item, in order',
            run: ({ expect, $$ }) => {
              renderList(['a', 'b', 'c']);
              expect($$('#todo-list li').map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
            },
          },
          {
            name: 'Calling it again replaces the old items',
            run: ({ expect, $$ }) => {
              renderList(['a', 'b']);
              renderList(['c']);
              expect($$('#todo-list li').map((li) => li.textContent), 'Empty the list before adding the new items').toEqual(['c']);
            },
          },
          {
            name: 'An empty array gives an empty list',
            run: ({ expect, $$ }) => {
              renderList([]);
              expect($$('#todo-list li').length).toBe(0);
            },
          },
          {
            name: 'Items are shown as text, not as HTML',
            run: ({ expect, $ }) => {
              renderList(['<img src=x>']);
              expect($('#todo-list img'), 'Use textContent').toBe(null);
            },
          },
        ],
        pitfalls: [
          { pattern: /innerHTML\s*\+=/, message: '`innerHTML +=` re-parses the whole list every time and runs any HTML inside the items. Create elements with `createElement` and set `textContent`.' },
        ],
        hints: [
          'Two steps: first empty the list, then create one `<li>` per item.',
          '`list.replaceChildren()` empties an element. Inside a `for…of` loop: `createElement`, `textContent`, `append`.',
        ],
        solution: {
          js: `function renderList(items) {
  const list = document.querySelector('#todo-list');
  list.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  }
}

renderList(['Buy coffee', 'Write code', 'Read code']);
`,
        },
        explanation: 'This "empty, then rebuild from the data" pattern is called **rendering**. The data (the array) is the truth, and the page is redrawn from it. You will build every interactive component in Module 6 this way.',
      },
    },
  ],
  keyPoints: [
    '`querySelector` gives one element or `null`; `querySelectorAll` gives a NodeList.',
    'Use `textContent` for text and `classList` for appearance; avoid `innerHTML` with data.',
    'Render: empty the container, then rebuild it from the data.',
  ],
};

/* ───────────────────────── 14. Events ───────────────────────── */

const events = {
  slug: 'events',
  title: 'Events',
  minutes: 30,
  summary: 'Reacting to clicks, typing and keys, and listening on a parent for many children.',
  sections: [
    {
      kind: 'text',
      text: `An **event** is something that happens: a click, a key press, typing in an input, a form being submitted. You register a function to run when it happens:

\`\`\`js
button.addEventListener('click', handleClick);
\`\`\`

Pass the function **itself** (\`handleClick\`), not its result (\`handleClick()\`). The browser calls it later, each time the event happens.

The function receives an **event object** with details:
- \`event.target\`: the element where the event started (e.g. the exact element clicked)
- \`event.key\`: which key was pressed, for keyboard events
- \`event.preventDefault()\`: stops the browser's default action, such as following a link or submitting a form

**Events bubble.** A click on a button inside a list is also a click on the list, and on the body. So you can put **one** listener on a parent and find out which child was clicked with \`event.target.closest('…')\`. This is called **event delegation**. It also works for elements added **later**, which separate listeners would miss.

Common events: \`click\`, \`input\` (every change in a text field), \`change\` (select, checkbox), \`submit\` (forms), \`keydown\`.`,
    },
    {
      kind: 'example',
      language: 'js',
      html: `<ul id="tasks">
  <li>Buy coffee <button class="done">Done</button></li>
  <li>Read code <button class="done">Done</button></li>
</ul>
<input id="filter" placeholder="Type to see the input event">
<p id="echo"></p>`,
      css: `${basicCss} .is-done { text-decoration: line-through; color: #888; }`,
      preview: true,
      previewHeight: 200,
      code: `const tasks = document.querySelector('#tasks');

tasks.addEventListener('click', (event) => {
  const button = event.target.closest('.done');
  if (!button) return;
  button.closest('li').classList.toggle('is-done');
});

const filter = document.querySelector('#filter');
filter.addEventListener('input', () => {
  document.querySelector('#echo').textContent = filter.value;
});`,
      notes: [
        { lines: [3], text: 'One listener on the list handles clicks on every button inside it, including buttons added later.' },
        { lines: [4, 5], text: '`closest(\'.done\')` walks up from the clicked element. If the click was not on (or inside) a Done button, it returns `null` and we stop.' },
        { lines: [6], text: 'From the button, find its own list item and toggle a class on it.' },
        { lines: [10, 12], text: '`input` fires on every change in the field: typing, pasting, deleting.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Calling the function instead of passing it', text: '`addEventListener(\'click\', save())` runs `save` once, immediately, and registers its return value (usually `undefined`). Write `save` without parentheses, or `() => save(id)` when you need arguments.' },
        { title: 'Listeners on elements that do not exist yet', text: 'Items added after `querySelectorAll(…).forEach(…addEventListener…)` get no listener. Event delegation on the parent fixes this.' },
        { title: 'Using event.target when the click was on a child', text: 'Clicking the icon inside a button makes the icon the `target`. `event.target.closest(\'button\')` finds the button either way.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.events.likes',
        type: 'code',
        title: 'A like button',
        skills: ['js.events', 'js.dom'],
        prompt: 'Make the button work: every click increases the number shown in `#count` by 1. When the count reaches **10**, disable the button.',
        files: ['js'],
        given: {
          html: `<button id="like" type="button">👍 Like</button>
<span id="count">0</span>`,
          css: `${basicCss} button { font: inherit; padding: 6px 12px; }`,
        },
        starter: { js: '// your code here\n' },
        tests: [
          {
            name: 'One click shows 1',
            run: ({ expect, $, click }) => {
              click($('#like'));
              expect($('#count').textContent).toBe('1');
            },
          },
          {
            name: 'Two more clicks show 3',
            run: ({ expect, $, click }) => {
              click($('#like')); click($('#like'));
              expect($('#count').textContent, 'Each click should add exactly 1').toBe('3');
            },
          },
          {
            name: 'The button is still enabled at 3',
            run: ({ expect, $ }) => expect($('#like').disabled).toBe(false),
          },
          {
            name: 'At 10 the button is disabled',
            run: ({ expect, $, click }) => {
              for (let i = 0; i < 7; i++) click($('#like'));
              expect($('#count').textContent).toBe('10');
              expect($('#like').disabled, 'Set button.disabled = true at 10').toBe(true);
            },
          },
        ],
        pitfalls: [
          { pattern: /addEventListener\(\s*['"]click['"]\s*,\s*\w+\(\)/, message: 'You are **calling** the function inside `addEventListener`. Pass it without parentheses, so the browser can call it on each click.' },
          { pattern: /textContent\s*\+\+|textContent\s*\+=\s*1/, message: '`textContent` is a string, so `+= 1` joins text ("01"). Keep the count in a number variable and write it into the page.' },
        ],
        hints: [
          'Keep the count in a `let` variable, not in the page. In the click listener: increase it, show it, and check the limit.',
          'Select the button and the counter, then `button.addEventListener(\'click\', () => { … })`.',
          `\`\`\`js
let count = 0;
button.addEventListener('click', () => {
  count++;
  // show count, and disable the button when count reaches 10
});
\`\`\``,
        ],
        solution: {
          js: `const button = document.querySelector('#like');
const countEl = document.querySelector('#count');
let count = 0;

button.addEventListener('click', () => {
  count++;
  countEl.textContent = count;
  button.disabled = count >= 10;
});
`,
        },
        explanation: 'The number lives in a variable (the **state**), and the page only shows it. Reading the number back from the page would give you a string, and mixes up data and display.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.events.delegation',
        type: 'code',
        title: 'Remove items with one listener',
        skills: ['js.events', 'js.dom'],
        prompt: `Clicking a "×" button should remove its list item. Use **one** listener on \`#list\` (event delegation), so that it also works for items added later.`,
        files: ['js'],
        given: {
          html: `<ul id="list">
  <li>Tea <button class="remove" type="button" aria-label="Remove Tea">×</button></li>
  <li>Coffee <button class="remove" type="button" aria-label="Remove Coffee">×</button></li>
  <li>Juice <button class="remove" type="button" aria-label="Remove Juice">×</button></li>
</ul>`,
          css: basicCss,
        },
        starter: { js: "const list = document.querySelector('#list');\n\n// your code here\n" },
        tests: [
          {
            name: 'Clicking × removes that item',
            run: ({ expect, $$, click }) => {
              click($$('#list .remove')[1]);
              expect($$('#list li').map((li) => li.firstChild.textContent.trim())).toEqual(['Tea', 'Juice']);
            },
          },
          {
            name: 'It works for an item added after the page loaded',
            run: ({ expect, $, $$, click }) => {
              const li = document.createElement('li');
              li.innerHTML = 'Water <button class="remove" type="button">×</button>';
              $('#list').append(li);
              click(li.querySelector('.remove'));
              expect($$('#list li').some((item) => item.textContent.includes('Water')), 'Listen on the list, not on each button').toBe(false);
            },
          },
          {
            name: 'Clicking the list itself removes nothing',
            run: ({ expect, $, $$, click }) => {
              const before = $$('#list li').length;
              click($('#list'));
              expect($$('#list li').length).toBe(before);
            },
          },
        ],
        pitfalls: [
          { pattern: /querySelectorAll\(\s*['"]\.remove['"]\s*\)/, message: 'A listener on each `.remove` button misses buttons added later. Put **one** listener on `list` and use `event.target.closest(\'.remove\')`.' },
        ],
        hints: [
          'Listen for clicks on `list`. Inside, find out whether the click was on a remove button.',
          '`event.target.closest(\'.remove\')` gives the button, or `null`. From the button, `closest(\'li\')` gives its item.',
        ],
        solution: {
          js: `const list = document.querySelector('#list');

list.addEventListener('click', (event) => {
  const button = event.target.closest('.remove');
  if (!button) return;
  button.closest('li').remove();
});
`,
        },
        explanation: 'The click on a × bubbles up to the list, where the single listener catches it. The `if (!button) return;` guard ignores clicks anywhere else in the list. Delegation means fewer listeners, and it automatically covers new items.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.events.called-too-early',
        type: 'choice',
        title: 'Saved too early',
        skills: ['js.events', 'debug.reading-code'],
        prompt: 'With this code, "Saved!" is logged once as soon as the page loads, and clicking the button does nothing. Why?',
        code: `function save() {
  console.log('Saved!');
}

document.querySelector('#save').addEventListener('click', save());`,
        options: [
          { text: '`save()` **calls** the function immediately and passes its return value (`undefined`) as the listener', correct: true, feedback: 'Yes. Pass the function itself: `addEventListener(\'click\', save)`. Then the browser calls it on every click.' },
          { text: 'The selector `#save` is wrong', correct: false, feedback: 'Then `querySelector` would return `null` and you would get an error. Here "Saved!" is logged, so the function does run, just at the wrong time.' },
          { text: '`click` should be `onclick`', correct: false, feedback: '`addEventListener` takes the event name without "on": `\'click\'` is right.' },
          { text: 'A function declaration cannot be used as a listener', correct: false, feedback: 'Any function can be a listener, whether a declaration or an arrow function.' },
        ],
        hints: ['When exactly does `save()` with parentheses run?'],
      },
    },
  ],
  keyPoints: [
    'Pass the function, do not call it: `addEventListener(\'click\', save)`.',
    '`event.target.closest(selector)` finds the relevant element, even when a child was clicked.',
    'One listener on a parent (delegation) covers all children, including future ones.',
  ],
};

/* ───────────────────────── 15. Form handling ───────────────────────── */

const formHandling = {
  slug: 'forms',
  title: 'Form handling',
  minutes: 30,
  summary: 'Handling submit, reading values with FormData, validating, and showing errors.',
  sections: [
    {
      kind: 'text',
      text: `Handle forms with the form's **\`submit\`** event, not with a click on the button. Submit fires for a button click **and** for pressing Enter in a field.

By default, submitting a form loads a new page. To handle it in JavaScript, call **\`event.preventDefault()\`** first.

Reading values:
- One field: \`input.value\`. It is always a **string**; convert with \`Number()\` where needed.
- The whole form: \`new FormData(form)\`. \`data.get('email')\` reads a field by its \`name\` attribute; \`data.getAll('extras')\` reads several checkboxes with the same name.

**Validation** checks input before using it. Give feedback **next to the form**, in an element with \`role="alert"\` so screen readers announce it. Trim text first: \`'   '\` is not a real name.

After success: show a confirmation, and \`form.reset()\` to clear the fields.`,
    },
    {
      kind: 'example',
      language: 'js',
      html: `<form id="newsletter" novalidate>
  <label for="email">Email</label>
  <input id="email" name="email">
  <button>Subscribe</button>
  <p id="message" role="alert"></p>
</form>`,
      css: `${basicCss} form { display: grid; gap: 6px; max-width: 260px; } input, button { font: inherit; padding: 4px; }`,
      preview: true,
      previewHeight: 190,
      code: `const form = document.querySelector('#newsletter');
const message = document.querySelector('#message');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = data.get('email').trim();

  if (!email.includes('@')) {
    message.textContent = 'Please enter a valid email address.';
    return;
  }

  message.textContent = \`Thanks! We will write to \${email}.\`;
  form.reset();
});`,
      notes: [
        { lines: [4], text: 'Listen for `submit` on the **form**: it covers button clicks and the Enter key.' },
        { lines: [5], text: 'Stops the browser from loading a new page, so JavaScript can handle the data.' },
        { lines: [7, 8], text: '`FormData` reads fields by their `name` attribute. Trim before checking.' },
        { lines: [10, 13], text: 'Invalid: show a message and `return` early, so nothing below runs.' },
        { lines: [15, 16], text: 'Valid: confirm, then clear the form.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting preventDefault', text: 'The page reloads, your message flashes and disappears, and the console is cleared. If a form "does nothing", check this first.' },
        { title: 'Listening for click on the button', text: 'Pressing Enter in a field submits the form without clicking, so a click listener misses it.' },
        { title: 'Validating only in the browser', text: 'Browser-side checks are for the user\'s convenience. A server must always check the data again, because anyone can send requests without your form.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.forms.signup',
        type: 'code',
        title: 'Validate a sign-up form',
        skills: ['js.forms', 'js.events', 'js.conditions'],
        prompt: `Handle the form's submit event:

1. Stop the page from reloading.
2. Read the name and email, **trimmed**.
3. Empty name → show \`Please enter your name.\` in \`#error\`.
4. Otherwise, an email without \`@\` → show \`Please enter a valid email address.\`
5. Otherwise: empty \`#error\`, show \`Thanks, NAME!\` in \`#success\` (with the real name), and reset the form.`,
        files: ['js'],
        given: {
          html: `<form id="signup" novalidate>
  <label for="name">Name</label>
  <input id="name" name="name">
  <label for="email">Email</label>
  <input id="email" name="email">
  <button>Sign up</button>
</form>
<p id="error" role="alert"></p>
<p id="success"></p>`,
          css: `${basicCss} form { display: grid; gap: 6px; max-width: 260px; } input, button { font: inherit; padding: 4px; } #error { color: crimson; }`,
        },
        starter: {
          js: `const form = document.querySelector('#signup');
const errorEl = document.querySelector('#error');
const successEl = document.querySelector('#success');

// your code here
`,
        },
        tests: [
          {
            name: 'An empty name shows the name error',
            run: ({ expect, $, type, submit }) => {
              type($('#name'), '   ');
              type($('#email'), 'ada@example.com');
              submit($('#signup'));
              expect($('#error').textContent, 'A name with only spaces counts as empty: trim it').toBe('Please enter your name.');
            },
          },
          {
            name: 'An email without @ shows the email error',
            run: ({ expect, $, type, submit }) => {
              type($('#name'), 'Ada');
              type($('#email'), 'ada.example.com');
              submit($('#signup'));
              expect($('#error').textContent).toBe('Please enter a valid email address.');
            },
          },
          {
            name: 'Valid input shows the thank-you message',
            run: ({ expect, $, type, submit }) => {
              type($('#name'), '  Ada ');
              type($('#email'), 'ada@example.com');
              submit($('#signup'));
              expect($('#success').textContent).toBe('Thanks, Ada!');
              expect($('#error').textContent, 'Clear the old error message').toBe('');
            },
          },
          {
            name: 'The form is reset after success',
            run: ({ expect, $ }) => expect($('#name').value, 'Call form.reset()').toBe(''),
          },
        ],
        pitfalls: [
          { pattern: /preventDefault/, absent: true, message: 'Without `event.preventDefault()`, submitting reloads the page and your code\'s result disappears.' },
          { pattern: /addEventListener\(\s*['"]click['"]/, message: 'Listen for `submit` on the form, not `click` on the button: Enter in a field submits too.' },
        ],
        hints: [
          '`form.addEventListener(\'submit\', (event) => { … })`. The first line inside is `event.preventDefault();`.',
          'Read the values with `form.elements.name.value.trim()` or `new FormData(form)`. Then check the name, then the email, each with an early `return`.',
          `\`\`\`js
if (name === '') {
  errorEl.textContent = 'Please enter your name.';
  return;
}
\`\`\``,
        ],
        solution: {
          js: `const form = document.querySelector('#signup');
const errorEl = document.querySelector('#error');
const successEl = document.querySelector('#success');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get('name').trim();
  const email = data.get('email').trim();

  if (name === '') {
    errorEl.textContent = 'Please enter your name.';
    return;
  }
  if (!email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email address.';
    return;
  }

  errorEl.textContent = '';
  successEl.textContent = \`Thanks, \${name}!\`;
  form.reset();
});
`,
        },
        explanation: 'Each check returns early with its own message, so the success code at the bottom only runs when everything is valid. The form has `novalidate`, which turns off the browser\'s own messages so that you can test your JavaScript validation.',
        takeaway: 'Form handler checklist: submit event on the form → `preventDefault` → read and trim → validate with early returns → act → reset.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.forms.formdata',
        type: 'code',
        title: 'Read a whole form with FormData',
        skills: ['js.forms', 'js.objects'],
        prompt: `Write \`getOrder(form)\`, which reads the order form and returns an object:

\`\`\`js
{ size: 'medium', quantity: 2, extras: ['oat-milk', 'syrup'] }
\`\`\`

\`quantity\` must be a **number**; \`extras\` is an array of the checked checkboxes' values (empty if none).`,
        files: ['js'],
        given: {
          html: `<form id="order">
  <select name="size">
    <option value="small">Small</option>
    <option value="medium" selected>Medium</option>
    <option value="large">Large</option>
  </select>
  <input name="quantity" type="number" value="1" min="1">
  <label><input type="checkbox" name="extras" value="oat-milk"> Oat milk</label>
  <label><input type="checkbox" name="extras" value="syrup"> Syrup</label>
  <label><input type="checkbox" name="extras" value="extra-shot"> Extra shot</label>
</form>`,
          css: `${basicCss} form { display: grid; gap: 6px; max-width: 220px; }`,
        },
        starter: {
          js: `function getOrder(form) {
  const data = new FormData(form);
  // your code here
}

console.log(getOrder(document.querySelector('#order')));
`,
        },
        tests: [
          {
            name: 'Reads the default order',
            run: ({ expect, $ }) => expect(getOrder($('#order'))).toEqual({ size: 'medium', quantity: 1, extras: [] }),
          },
          {
            name: 'quantity is a number',
            run: ({ expect, $ }) => {
              $('[name=quantity]').value = '3';
              expect(getOrder($('#order')).quantity, 'Convert with Number()').toBe(3);
            },
          },
          {
            name: 'extras contains every checked box',
            run: ({ expect, $, $$ }) => {
              $('[name=size]').value = 'large';
              $$('[name=extras]')[0].checked = true;
              $$('[name=extras]')[2].checked = true;
              expect(getOrder($('#order'))).toEqual({ size: 'large', quantity: 3, extras: ['oat-milk', 'extra-shot'] });
            },
          },
        ],
        hints: [
          '`data.get(\'size\')` reads one field by its name. Form values are always strings.',
          'For the checkboxes with the same name, `data.getAll(\'extras\')` returns an array of the checked values.',
        ],
        solution: {
          js: `function getOrder(form) {
  const data = new FormData(form);
  return {
    size: data.get('size'),
    quantity: Number(data.get('quantity')),
    extras: data.getAll('extras'),
  };
}

console.log(getOrder(document.querySelector('#order')));
`,
        },
        explanation: '`FormData` collects all named fields in one go. Unchecked checkboxes are simply not included, which is why `getAll` gives exactly the checked ones. Turning a form into a clean data object is usually the first step of a submit handler.',
      },
    },
  ],
  keyPoints: [
    'Handle `submit` on the form, and call `event.preventDefault()` first.',
    'Form values are strings: trim text and convert numbers.',
    '`new FormData(form)`: `get(name)` for one value, `getAll(name)` for checkbox groups.',
  ],
};

/* ───────────────────────── 16. Error handling ───────────────────────── */

const errorHandling = {
  slug: 'error-handling',
  title: 'Error handling',
  minutes: 25,
  summary: 'Throwing errors on purpose, catching them, and deciding where to handle them.',
  sections: [
    {
      kind: 'text',
      text: `When something goes wrong, JavaScript **throws** an error. If nothing catches it, the current code stops and the error appears in the console.

**Catching** errors:

\`\`\`js
try {
  riskyThing();          // if this throws…
  console.log('done');   // …this line is skipped
} catch (error) {
  console.log(error.message);   // …and this runs instead
} finally {
  console.log('always runs');   // optional: runs in both cases
}
\`\`\`

**Throwing** your own errors makes problems visible early, with a clear message:

\`\`\`js
if (quantity < 1) {
  throw new Error('Quantity must be at least 1');
}
\`\`\`

**Where to catch?** Not everywhere. Catch where you can **do something useful**: show a message to the user, use a default value, try again. A \`catch\` that silently ignores the error hides bugs. The function that discovers a problem should usually just throw, and the code that talks to the user decides what to show.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function parseQuantity(text) {
  const quantity = Number(text);
  if (Number.isNaN(quantity)) {
    throw new Error(\`"\${text}" is not a number\`);
  }
  return quantity;
}

for (const input of ['3', 'three']) {
  try {
    const quantity = parseQuantity(input);
    console.log('Quantity:', quantity);
  } catch (error) {
    console.log('Could not read input:', error.message);
  }
}`,
      notes: [
        { lines: [3, 5], text: '`Number(\'three\')` is `NaN` (Not a Number). Instead of returning a broken value, the function throws an error with a clear message.' },
        { lines: [10, 12], text: 'The code that **uses** the function decides how to handle a failure.' },
        { lines: [13, 14], text: 'For "three", line 12 is skipped and the catch block runs. The loop continues with the next input.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Empty catch blocks', text: '`catch (error) {}` makes errors disappear, and the bug resurfaces somewhere else, much harder to trace. At least log it: `console.error(error)`.' },
        { title: 'Throwing strings', text: '`throw \'Oops\'` has no `message` and no stack trace. Always throw `new Error(\'…\')`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.errors.predict',
        type: 'predict',
        title: 'The path through try, catch and finally',
        skills: ['js.error-handling'],
        prompt: 'What does this code print?',
        code: `function run() {
  try {
    console.log('A');
    throw new Error('oops');
    console.log('B');
  } catch (error) {
    console.log('C: ' + error.message);
  } finally {
    console.log('D');
  }
  console.log('E');
}

run();`,
        expected: 'A\nC: oops\nD\nE',
        hints: [
          'After `throw`, the rest of the `try` block is skipped.',
          'The error is caught, so the function continues normally after `finally`.',
        ],
        explanation: '"A" is printed, then the error jumps straight to `catch`: "B" never runs. `finally` always runs. Because the error was caught, the function continues and prints "E".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.errors.throw',
        type: 'code',
        title: 'Throw a clear error',
        skills: ['js.error-handling', 'js.conditions'],
        prompt: `Write \`parseAge(text)\`, which turns a form value into an age:

- Not a number → throw an Error with the message \`Age must be a number\`
- Below 0 or above 130 → throw an Error with the message \`Age must be between 0 and 130\`
- Otherwise → return the age as a number`,
        files: ['js'],
        preview: false,
        starter: { js: 'function parseAge(text) {\n  // your code here\n}\n\nconsole.log(parseAge(\'42\'));\n' },
        tests: [
          { name: "parseAge('42') returns 42", run: ({ expect }) => expect(parseAge('42')).toBe(42) },
          { name: "parseAge('0') returns 0", run: ({ expect }) => expect(parseAge('0')).toBe(0) },
          {
            name: "parseAge('abc') throws 'Age must be a number'",
            run: ({ expect }) => {
              let message = null;
              try { parseAge('abc'); } catch (error) { message = error.message; }
              expect(message, 'Throw new Error(\'Age must be a number\')').toBe('Age must be a number');
            },
          },
          {
            name: "parseAge('-1') and parseAge('131') throw the range error",
            run: ({ expect }) => {
              const messages = ['-1', '131'].map((value) => {
                try { parseAge(value); return null; } catch (error) { return error.message; }
              });
              expect(messages).toEqual(['Age must be between 0 and 130', 'Age must be between 0 and 130']);
            },
          },
          {
            name: 'It throws real Error objects',
            run: ({ expect }) => {
              let thrown;
              try { parseAge('abc'); } catch (error) { thrown = error; }
              expect(thrown instanceof Error, 'Use throw new Error(…), not throw \'…\'').toBe(true);
            },
          },
        ],
        hints: [
          'Convert with `Number(text)`. The result for "abc" is `NaN`, which you detect with `Number.isNaN(…)`.',
          'Two checks, each with `throw new Error(\'…\')`, then `return` the number.',
        ],
        solution: {
          js: `function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age)) {
    throw new Error('Age must be a number');
  }
  if (age < 0 || age > 130) {
    throw new Error('Age must be between 0 and 130');
  }
  return age;
}

console.log(parseAge('42'));
`,
        },
        explanation: 'Note: `age === NaN` is always false, even when age is NaN, because NaN is not equal to anything (not even itself). That is why `Number.isNaN()` exists.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.errors.catch',
        type: 'code',
        title: 'Catch and report',
        skills: ['js.error-handling'],
        prompt: `\`parseAge(text)\` is provided: it returns a number or throws an error (see the Provided JS tab). Write \`checkAge(text)\` that **never throws**. Instead it returns:

- \`{ ok: true, age: 42 }\` on success
- \`{ ok: false, error: 'Age must be a number' }\` (the error's message) on failure`,
        files: ['js'],
        preview: false,
        given: {
          setup: `function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age)) throw new Error('Age must be a number');
  if (age < 0 || age > 130) throw new Error('Age must be between 0 and 130');
  return age;
}`,
        },
        starter: { js: 'function checkAge(text) {\n  // your code here\n}\n\nconsole.log(checkAge(\'42\'));\nconsole.log(checkAge(\'abc\'));\n' },
        tests: [
          { name: 'Success returns { ok: true, age }', run: ({ expect }) => expect(checkAge('42')).toEqual({ ok: true, age: 42 }) },
          { name: 'A text returns the error message', run: ({ expect }) => expect(checkAge('abc')).toEqual({ ok: false, error: 'Age must be a number' }) },
          { name: 'Out of range returns that message', run: ({ expect }) => expect(checkAge('200')).toEqual({ ok: false, error: 'Age must be between 0 and 130' }) },
        ],
        pitfalls: [
          { pattern: /catch\s*(\(\s*\w*\s*\))?\s*\{\s*\}/, message: 'An empty `catch` hides the error. Use the caught error\'s `message` in the returned object.' },
        ],
        hints: [
          'Call `parseAge` inside a `try` block, and return the success object right there.',
          'In `catch (error)`, return the failure object with `error.message`.',
        ],
        solution: {
          js: `function checkAge(text) {
  try {
    const age = parseAge(text);
    return { ok: true, age };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

console.log(checkAge('42'));
console.log(checkAge('abc'));
`,
        },
        explanation: '`parseAge` only discovers problems and throws; `checkAge` turns them into data that a form can display. Splitting "detect" and "handle" like this keeps both functions simple. `{ ok: true, age }` is shorthand for `{ ok: true, age: age }`.',
      },
    },
  ],
  keyPoints: [
    '`throw new Error(\'clear message\')` when something is wrong; never throw strings.',
    '`try/catch` where you can do something useful; `finally` always runs.',
    'Never leave a `catch` block empty.',
  ],
};

/* ───────────────────────── 17. JSON ───────────────────────── */

const json = {
  slug: 'json',
  title: 'JSON',
  minutes: 20,
  summary: 'Turning data into text and back, for storage and for APIs.',
  sections: [
    {
      kind: 'text',
      text: `**JSON** (JavaScript Object Notation) is a text format for data. APIs send it, localStorage stores it, and configuration files use it.

\`\`\`json
{ "name": "Ada", "age": 36, "tags": ["math", "engines"], "active": true }
\`\`\`

It looks like a JavaScript object, with stricter rules: keys in **double** quotes, strings in double quotes, no trailing commas, no comments, no functions, no \`undefined\`.

- \`JSON.stringify(value)\` → text. \`JSON.stringify(value, null, 2)\` formats it nicely.
- \`JSON.parse(text)\` → a new value (object, array…). Invalid text **throws** a SyntaxError, so parse untrusted text inside \`try/catch\`.

A parsed object is always a **new** object, not the original. And some types do not survive the round trip: dates become strings, and \`undefined\` values disappear.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const settings = { theme: 'dark', fontSize: 18 };

const text = JSON.stringify(settings);
console.log(text);            // {"theme":"dark","fontSize":18}
console.log(typeof text);     // "string"

const copy = JSON.parse(text);
console.log(copy.fontSize);   // 18

try {
  JSON.parse("{ theme: 'dark' }");
} catch (error) {
  console.log('Invalid JSON:', error.message);
}`,
      notes: [
        { lines: [3, 5], text: 'The object becomes one string, ready to be stored or sent.' },
        { lines: [7, 8], text: 'Parsing gives back an object that works like the original.' },
        { lines: [10, 14], text: 'Single quotes and unquoted keys are fine in JavaScript, but not in JSON, so this throws.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.json.predict',
        type: 'predict',
        title: 'There and back again',
        skills: ['js.json'],
        prompt: 'What does this code print?',
        code: `const user = { name: 'Ada', age: 36, tags: ['math'], nickname: undefined };

const text = JSON.stringify(user);
console.log(text);
console.log(typeof text);

const back = JSON.parse(text);
console.log(back.tags[0]);
console.log(back === user);`,
        expected: '{"name":"Ada","age":36,"tags":["math"]}\nstring\nmath\nfalse',
        answerHelp: 'Write the JSON exactly as JSON.stringify produces it: no spaces',
        hints: [
          'JSON cannot represent `undefined`. What happens to that key?',
          '`JSON.parse` creates a brand-new object.',
        ],
        explanation: '`nickname: undefined` is left out entirely. The result of `stringify` is a string. Parsing creates a new object with the same content, so it is not the same object as `user` (`===` compares identity for objects).',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.json.settings',
        type: 'code',
        title: 'Load settings safely',
        skills: ['js.json', 'js.error-handling', 'js.objects'],
        prompt: `Write \`parseSettings(text)\`. The defaults are \`{ theme: 'light', fontSize: 16 }\`.

- Valid JSON → return the defaults **merged** with the parsed values: \`'{"theme":"dark"}'\` gives \`{ theme: 'dark', fontSize: 16 }\`.
- Invalid JSON, or \`null\` (nothing saved yet) → return the defaults.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const DEFAULT_SETTINGS = { theme: 'light', fontSize: 16 };

function parseSettings(text) {
  // your code here
}

console.log(parseSettings('{"theme":"dark"}'));
`,
        },
        tests: [
          { name: 'Merges saved values with the defaults', run: ({ expect }) => expect(parseSettings('{"theme":"dark"}')).toEqual({ theme: 'dark', fontSize: 16 }) },
          { name: 'Saved values override every default', run: ({ expect }) => expect(parseSettings('{"theme":"dark","fontSize":20}')).toEqual({ theme: 'dark', fontSize: 20 }) },
          { name: 'Invalid JSON gives the defaults', run: ({ expect }) => expect(parseSettings('{oops')).toEqual({ theme: 'light', fontSize: 16 }) },
          { name: 'null gives the defaults', run: ({ expect }) => expect(parseSettings(null)).toEqual({ theme: 'light', fontSize: 16 }) },
          {
            name: 'The defaults object is never changed',
            run: ({ expect }) => {
              const result = parseSettings('{"theme":"dark"}');
              result.theme = 'changed';
              expect(DEFAULT_SETTINGS, 'Return a new object, e.g. with { ...DEFAULT_SETTINGS, ...parsed }').toEqual({ theme: 'light', fontSize: 16 });
            },
          },
        ],
        hints: [
          'Parse inside `try`. In `catch`, return a copy of the defaults.',
          'Merge with the spread syntax: `{ ...DEFAULT_SETTINGS, ...parsed }`. Later keys win. Note: `JSON.parse(null)` returns `null` without throwing, and spreading `null` adds nothing.',
        ],
        solution: {
          js: `const DEFAULT_SETTINGS = { theme: 'light', fontSize: 16 };

function parseSettings(text) {
  try {
    const parsed = JSON.parse(text);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

console.log(parseSettings('{"theme":"dark"}'));
`,
        },
        explanation: 'Merging with defaults means older saved data, which lacks a newer setting, still produces a complete settings object. This app\'s own `js/core/store.js` does exactly this in its `migrate()` function.',
      },
    },
  ],
  keyPoints: [
    '`JSON.stringify` → text; `JSON.parse` → new value.',
    'JSON needs double quotes, and has no undefined, functions or comments.',
    'Parse untrusted text inside `try/catch`, with a sensible default.',
  ],
};

/* ───────────────────────── 18. Local storage ───────────────────────── */

const localStorageLesson = {
  slug: 'local-storage',
  title: 'Local storage',
  minutes: 20,
  summary: 'Saving data in the browser so it survives a reload.',
  sections: [
    {
      kind: 'text',
      text: `\`localStorage\` keeps data in the browser, per website, even after closing the tab. This lab saves your progress there.

\`\`\`js
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');     // "dark"
localStorage.getItem('missing');   // null
localStorage.removeItem('theme');
\`\`\`

The rules that cause most bugs:
- It stores **strings only**. A number comes back as a string; an object stored directly becomes \`"[object Object]"\`. Store objects and arrays as JSON.
- \`getItem\` returns \`null\` when nothing is saved: always have a default.
- Saved data can be **corrupted** or from an older version of your app: parse it in \`try/catch\`.
- It can be **unavailable** (some private modes) or **full** (about 5 MB): \`setItem\` can throw.
- Never store passwords or tokens in it. Any script on the page can read it.

A clean pattern: one \`load\` function and one \`save\` function, and the rest of the code never touches \`localStorage\` directly.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const KEY = 'recently-viewed';

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

const recent = loadRecent();
recent.unshift('Backpack');
saveRecent(recent.slice(0, 5));`,
      notes: [
        { lines: [1], text: 'The key in one constant, so a typo cannot create a second, different key.' },
        { lines: [5], text: 'Nothing saved: `getItem` gives `null`, `JSON.parse(null)` gives `null`, and `?? []` turns that into an empty list.' },
        { lines: [6, 8], text: 'Corrupted data would make `JSON.parse` throw. Fall back to an empty list instead of crashing.' },
        { lines: [12], text: 'Arrays and objects are stored as JSON text.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.storage.favorites',
        type: 'code',
        title: 'Save favorites',
        skills: ['js.local-storage', 'js.json', 'js.arrays'],
        prompt: `Store a list of favorite product ids under the key \`'favorites'\`:

- \`loadFavorites()\` returns the saved array, or \`[]\` if nothing is saved **or** the data is corrupted.
- \`saveFavorites(list)\` saves the array.
- \`toggleFavorite(id)\` adds the id if it is not in the list, removes it if it is, saves, and returns the new list.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const KEY = 'favorites';

function loadFavorites() {
}

function saveFavorites(list) {
}

function toggleFavorite(id) {
}
`,
        },
        tests: [
          {
            name: 'loadFavorites() returns [] when nothing is saved',
            run: ({ expect }) => { localStorage.clear(); expect(loadFavorites()).toEqual([]); },
          },
          {
            name: 'toggleFavorite adds and saves',
            run: ({ expect }) => {
              localStorage.clear();
              expect(toggleFavorite(3)).toEqual([3]);
              expect(toggleFavorite(5)).toEqual([3, 5]);
              expect(localStorage.getItem('favorites'), 'Save the list as JSON').toBe('[3,5]');
            },
          },
          {
            name: 'toggleFavorite removes an existing id',
            run: ({ expect }) => {
              localStorage.setItem('favorites', '[3,5]');
              expect(toggleFavorite(3)).toEqual([5]);
              expect(loadFavorites()).toEqual([5]);
            },
          },
          {
            name: 'Corrupted data gives []',
            run: ({ expect }) => {
              localStorage.setItem('favorites', 'not json{');
              expect(loadFavorites(), 'Wrap JSON.parse in try/catch').toEqual([]);
            },
          },
        ],
        hints: [
          'Load = `getItem` + `JSON.parse` (in `try/catch`, with `?? []`). Save = `JSON.stringify` + `setItem`.',
          'In `toggleFavorite`: load the list, then either `filter` the id out or `push` it, then save and return.',
          `\`\`\`js
let list = loadFavorites();
if (list.includes(id)) {
  list = list.filter((item) => item !== id);
} else {
  list.push(id);
}
\`\`\``,
        ],
        solution: {
          js: `const KEY = 'favorites';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function toggleFavorite(id) {
  let list = loadFavorites();
  if (list.includes(id)) {
    list = list.filter((item) => item !== id);
  } else {
    list.push(id);
  }
  saveFavorites(list);
  return list;
}
`,
        },
        explanation: 'Only `loadFavorites` and `saveFavorites` know that `localStorage` and JSON exist. If you later save favorites on a server, only those two functions change. The rest of the code keeps calling `toggleFavorite`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.storage.string-bug',
        type: 'choice',
        title: 'The counter that counts wrong',
        skills: ['js.local-storage', 'js.data-types'],
        prompt: 'After visiting the page four times, this shows "Visits: 1111" instead of 4. Why?',
        code: `const visits = localStorage.getItem('visits') ?? 0;
localStorage.setItem('visits', visits + 1);
console.log('Visits: ' + localStorage.getItem('visits'));`,
        options: [
          { text: '`getItem` returns a **string**, so `visits + 1` joins text: "1" + 1 = "11"', correct: true, feedback: 'Yes. Convert first: `Number(localStorage.getItem(\'visits\') ?? 0) + 1`.' },
          { text: 'localStorage is cleared on every reload', correct: false, feedback: 'Then it would always show 1. The growing number shows the data is kept, just in the wrong form.' },
          { text: '`??` should be `||`', correct: false, feedback: 'Both give 0 on the first visit. The problem appears from the second visit on.' },
          { text: 'setItem appends to the existing value', correct: false, feedback: '`setItem` replaces the value. The joining happens in `visits + 1`.' },
        ],
        hints: ['What type does `getItem` return?'],
      },
    },
  ],
  keyPoints: [
    'localStorage stores strings: use JSON for objects and arrays, `Number()` for numbers.',
    '`getItem` returns `null` when empty; always provide a default.',
    'Keep storage access in one load and one save function.',
  ],
};

/* ───────────────────────── 19. Modules ───────────────────────── */

const modulesLesson = {
  slug: 'modules',
  title: 'Modules',
  minutes: 20,
  summary: 'Splitting code into files with import and export, as this app does.',
  sections: [
    {
      kind: 'text',
      text: `As programs grow, you split them into files called **modules**. Each module has its **own scope**: nothing in it is visible to other files unless it is **exported**.

\`\`\`js
// format.js
export function formatPrice(amount) { … }
export const CURRENCY = '€';

// main.js
import { formatPrice, CURRENCY } from './format.js';
\`\`\`

- **Named exports** (\`export function x\`) are imported with curly braces and the **same name**.
- A file can also have one **default export** (\`export default function …\`), imported **without** braces, under any name: \`import formatPrice from './format.js'\`.
- In the browser, the path starts with \`./\` or \`../\` and includes \`.js\`.
- Load the first module with \`<script type="module" src="main.js">\`. Module scripts run after the HTML is parsed, like \`defer\`.
- Browsers refuse to load modules from \`file://\` pages, which is why this lab needs a local server.

This whole app is built from modules. Open \`js/main.js\`: its first lines import from \`core/\`, \`ui/\` and \`views/\`.`,
    },
    {
      kind: 'example',
      title: 'From this app: js/core/events.js and how it is used',
      language: 'js',
      code: `// js/core/events.js
const listeners = new Map();

export function on(name, fn) { /* … */ }
export function emit(name, detail) { /* … */ }

// js/core/store.js
import { emit } from './events.js';

// js/views/settings.js
import { on } from '../core/events.js';`,
      notes: [
        { lines: [2], text: '`listeners` is **not** exported, so it is private to this file. No other module can touch it directly.' },
        { lines: [4, 5], text: 'Only these two functions are the public interface of the module.' },
        { lines: [8], text: 'store.js and events.js are in the same folder: `./`.' },
        { lines: [11], text: 'settings.js is in `views/`, so it goes up one folder first: `../core/`.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Braces that do not match the export', text: '`import formatPrice from…` for a **named** export gives "does not provide an export named default". Named exports need `{ }`.' },
        { title: 'Missing ./ or .js', text: '`import { x } from \'format\'` works with build tools like Vite, but a browser needs the real path: `\'./format.js\'`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.modules.import',
        type: 'choice',
        title: 'The right import',
        skills: ['js.modules'],
        prompt: 'The file `utils/format.js` contains `export function formatPrice(amount) { … }`. Which line, in `main.js` (in the folder **above** `utils/`), imports it correctly in the browser?',
        options: [
          { text: "`import { formatPrice } from './utils/format.js';`", correct: true, feedback: 'Yes: a named export in braces, a path starting with `./`, and the `.js` extension.' },
          { text: "`import formatPrice from './utils/format.js';`", correct: false, feedback: 'Without braces, you import the **default** export, but the file only has a named export.' },
          { text: "`import { formatPrice } from 'utils/format';`", correct: false, feedback: 'Browsers need a relative path (`./`) and the file extension.' },
          { text: "`import { formatPrice } from '../utils/format.js';`", correct: false, feedback: '`../` goes **up** a folder, but `utils/` is inside the folder of `main.js`.' },
        ],
        hints: ['Check three things: braces or not, the start of the path, and the extension.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.modules.order',
        type: 'order',
        title: 'In which order do modules run?',
        skills: ['js.modules', 'reading.execution-order'],
        prompt: 'The page has `<script type="module" src="main.js">`. `main.js` imports `store.js`, and `store.js` imports `events.js`. Each file logs its name when it runs. Put the events in order.',
        steps: [
          'The browser parses the whole HTML (module scripts are deferred)',
          '`events.js` runs',
          '`store.js` runs',
          '`main.js` runs',
        ],
        hints: [
          'A module can only run once everything it imports is ready.',
          'Follow the chain to the module that imports nothing.',
        ],
        explanation: 'The browser first loads all files in the import chain, then runs them **dependencies first**: `events.js` (imports nothing), then `store.js` (needs events), then `main.js`. That is why `main.js` can safely use everything it imports.',
      },
    },
  ],
  keyPoints: [
    'Each module has its own scope; share things with `export`, use them with `import`.',
    'Named exports with `{ }` and the same name; one default export without braces.',
    'In the browser: `./relative/path.js`, `<script type="module">`, and a local server.',
  ],
};

/* ───────────────────────── 20. Promises ───────────────────────── */

const promises = {
  slug: 'promises',
  title: 'Asynchronous code and promises',
  minutes: 30,
  summary: 'Code that finishes later: timers, promises, then and catch.',
  sections: [
    {
      kind: 'text',
      text: `Some operations take time: loading data, waiting for a timer, reading a file. JavaScript does not stop and wait for them. It starts them, **continues with the next lines**, and runs a callback when the result is ready. That is **asynchronous** code.

\`\`\`js
console.log('1');
setTimeout(() => console.log('3'), 1000);
console.log('2');
\`\`\`

A **Promise** is an object for a result that will arrive later. It is first **pending**, and then either **fulfilled** (with a value) or **rejected** (with an error).

\`\`\`js
fetchUser(1)
  .then((user) => console.log(user.name))
  .catch((error) => console.log('Failed:', error.message));
\`\`\`

- \`.then(fn)\` runs \`fn\` with the value when the promise is fulfilled. It returns a new promise, so calls can be **chained**.
- \`.catch(fn)\` runs when anything in the chain before it failed.
- \`new Promise((resolve, reject) => { … })\` creates your own promise: call \`resolve(value)\` on success, \`reject(error)\` on failure.

**Order of execution:** all synchronous code runs first. Then promise callbacks. Then timer callbacks, even with a delay of 0.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

console.log('Starting');
wait(500)
  .then(() => {
    console.log('Half a second later');
    return 42;
  })
  .then((value) => console.log('Got', value));
console.log('This runs before both');`,
      notes: [
        { lines: [1, 5], text: 'Wraps `setTimeout` in a promise that is fulfilled after `ms` milliseconds.' },
        { lines: [8, 12], text: 'The callback runs after the wait. Whatever it **returns** is passed to the next `.then`.' },
        { lines: [14], text: 'Not waiting: this line runs immediately, right after `wait(500)` has **started** the timer.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Using the result too early', text: '`let user; fetchUser(1).then((u) => { user = u; }); console.log(user);` logs `undefined`: the log runs before the promise is fulfilled. Use the value inside `.then`, or use `await` (next lesson).' },
        { title: 'Forgetting to return in a chain', text: 'Inside `.then`, a value that is not returned does not reach the next `.then`.' },
        { title: 'No catch', text: 'A rejected promise without `.catch` gives "Uncaught (in promise)" in the console, and your interface may wait forever in a loading state.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.promises.order',
        type: 'predict',
        title: 'Which runs first?',
        skills: ['js.async', 'reading.execution-order'],
        prompt: 'What does this code print?',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
        expected: 'A\nD\nC\nB',
        hints: [
          'All synchronous lines run first, before any callback.',
          'Promise callbacks run before timer callbacks, even with a 0 ms timer.',
        ],
        explanation: '"A" and "D" are synchronous and run first. Then the waiting promise callback ("C"), and only after that the timer callback ("B"). The 0 in `setTimeout` means "as soon as possible", not "immediately".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.promises.wait',
        type: 'code',
        title: 'Build your own promise',
        skills: ['js.async', 'js.promises'],
        prompt: 'Write `wait(ms)`, which returns a Promise that is fulfilled after `ms` milliseconds. Use `new Promise` and `setTimeout`.',
        files: ['js'],
        preview: false,
        starter: { js: "function wait(ms) {\n  // your code here\n}\n\nwait(300).then(() => console.log('300 ms later'));\n" },
        tests: [
          {
            name: 'wait returns a Promise',
            run: ({ expect }) => expect(wait(10) instanceof Promise, 'Return new Promise(…)').toBe(true),
          },
          {
            name: 'It is fulfilled after the given time',
            run: async ({ expect }) => {
              const start = Date.now();
              await wait(150);
              const elapsed = Date.now() - start;
              expect(elapsed >= 140 && elapsed < 600, `It took ${elapsed} ms`).toBe(true);
            },
          },
        ],
        hints: [
          'The promise\'s function receives `resolve`. Call it when the timer is done.',
          '`return new Promise((resolve) => { setTimeout(…, ms); });`',
        ],
        solution: {
          js: `function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

wait(300).then(() => console.log('300 ms later'));
`,
        },
        explanation: '`setTimeout(resolve, ms)` passes the `resolve` function itself to the timer, which calls it after `ms` milliseconds. That fulfills the promise. This tiny helper is handy in tests, animations and retry logic.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.promises.then',
        type: 'code',
        title: 'then and catch',
        skills: ['js.promises', 'js.error-handling'],
        prompt: `\`fetchUser(id)\` is provided. It returns a Promise for a user object like \`{ id: 1, name: 'Ada' }\`, and rejects for unknown ids.

Write \`getUserName(id)\`, which returns a Promise for the user's name **in upper case** (\`'ADA'\`), or for \`'Unknown'\` if loading fails. Use \`.then\` and \`.catch\` (no async/await yet).`,
        files: ['js'],
        preview: false,
        given: { setup: FAKE_USERS },
        starter: { js: "function getUserName(id) {\n  // your code here\n}\n\ngetUserName(1).then((name) => console.log(name));\n" },
        tests: [
          { name: "getUserName(1) gives 'ADA'", run: async ({ expect }) => expect(await getUserName(1)).toBe('ADA') },
          { name: "getUserName(2) gives 'GRACE'", run: async ({ expect }) => expect(await getUserName(2)).toBe('GRACE') },
          { name: "getUserName(99) gives 'Unknown'", run: async ({ expect }) => expect(await getUserName(99), 'Add .catch(() => \'Unknown\')').toBe('Unknown') },
          {
            name: 'getUserName returns a Promise',
            run: ({ expect }) => {
              const result = getUserName(1);
              expect(result instanceof Promise, 'Return the promise chain').toBe(true);
            },
          },
        ],
        pitfalls: [
          { pattern: /return/, absent: true, message: 'Return the promise chain (`return fetchUser(id).then(…)`), so the caller can wait for the result.' },
        ],
        hints: [
          'Start with `return fetchUser(id)`, then chain onto it.',
          'In `.then`, return the transformed name. In `.catch`, return `\'Unknown\'`: a value returned in `catch` becomes the result.',
          "`return fetchUser(id).then((user) => user.name.toUpperCase()).catch(() => 'Unknown');`",
        ],
        solution: {
          js: `function getUserName(id) {
  return fetchUser(id)
    .then((user) => user.name.toUpperCase())
    .catch(() => 'Unknown');
}

getUserName(1).then((name) => console.log(name));
`,
        },
        explanation: 'Each `.then` returns a new promise for whatever its callback returns. `.catch` handles a rejection anywhere above it, and the value it returns becomes a normal result, so the caller always receives a name.',
      },
    },
  ],
  keyPoints: [
    'Asynchronous code finishes later; the following lines do not wait.',
    'A Promise is pending, then fulfilled or rejected. `.then` for the value, `.catch` for errors.',
    'Order: synchronous code → promise callbacks → timer callbacks.',
  ],
};

/* ───────────────────────── 21. async / await ───────────────────────── */

const asyncAwait = {
  slug: 'async-await',
  title: 'async and await',
  minutes: 25,
  summary: 'Writing asynchronous code that reads like normal code.',
  sections: [
    {
      kind: 'text',
      text: `\`async\` and \`await\` are a more readable way to work with promises:

\`\`\`js
async function showUser(id) {
  try {
    const user = await fetchUser(id);
    console.log(user.name);
  } catch (error) {
    console.log('Failed:', error.message);
  }
}
\`\`\`

- \`await promise\` pauses **this function** until the promise settles, and gives you its value. A rejected promise **throws** at the \`await\`, so you use normal \`try/catch\`.
- \`await\` only works inside an \`async\` function (or at the top level of a module).
- An \`async\` function **always returns a promise**. Its \`return value\` becomes the promise's result. So callers also need \`await\` or \`.then\`.
- Only the async function pauses. The rest of the program keeps running.

**Sequential or parallel?** Two \`await\`s in a row run one **after** the other. If the requests do not depend on each other, start them together and wait for all of them with \`Promise.all\`:

\`\`\`js
const [user, settings] = await Promise.all([fetchUser(1), fetchSettings(1)]);
\`\`\``,
    },
    {
      kind: 'example',
      language: 'js',
      code: `async function loadDashboard(userId) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(user.id);
  return \`\${user.name}: \${orders.length} orders\`;
}

loadDashboard(1).then((text) => console.log(text));
console.log('Loading…');`,
      notes: [
        { lines: [2, 3], text: 'The orders request needs the user\'s id, so it has to wait for the first request. Sequential awaits are right here.' },
        { lines: [4], text: 'The returned text becomes the result of the promise that `loadDashboard` returns.' },
        { lines: [7, 8], text: 'The caller gets a promise. "Loading…" is printed **first**, because only `loadDashboard` pauses, not the whole program.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting await', text: '`const user = fetchUser(1); console.log(user.name);` logs `undefined`: `user` is a Promise, not the user. In the console it shows as `Promise {<pending>}`.' },
        { title: 'Waiting one by one without need', text: 'A loop with `await` inside makes 10 independent requests wait for each other. Use `Promise.all` with `map`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.async.predict',
        type: 'predict',
        title: 'Where does await pause?',
        skills: ['js.async', 'reading.execution-order'],
        prompt: 'What does this code print?',
        code: `async function load() {
  console.log('2');
  await null;
  console.log('4');
}

console.log('1');
load();
console.log('3');`,
        expected: '1\n2\n3\n4',
        hints: [
          'An async function runs synchronously until its first `await`.',
          'At the `await`, `load` pauses and the code that called it continues.',
        ],
        explanation: '`load()` starts right away and prints "2". At `await` it pauses, so the caller continues and prints "3". Then `load` resumes and prints "4". `await` pauses only its own function, never the whole program.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.async.summary',
        type: 'code',
        title: 'Rewrite with async and await',
        skills: ['js.async', 'js.error-handling'],
        prompt: `\`fetchUser(id)\` and \`fetchOrders(userId)\` are provided (both return promises).

Write \`async function getSummary(id)\` that returns \`'Ada has 2 orders'\` for user 1. If anything fails, it returns \`'Could not load summary'\`. Use \`await\` and \`try/catch\`.`,
        files: ['js'],
        preview: false,
        given: { setup: FAKE_USERS },
        starter: { js: "async function getSummary(id) {\n  // your code here\n}\n\ngetSummary(1).then((text) => console.log(text));\n" },
        tests: [
          { name: "getSummary(1) gives 'Ada has 2 orders'", run: async ({ expect }) => expect(await getSummary(1)).toBe('Ada has 2 orders') },
          { name: "getSummary(3) gives 'Alan has 0 orders'", run: async ({ expect }) => expect(await getSummary(3)).toBe('Alan has 0 orders') },
          { name: 'An unknown user gives the error text', run: async ({ expect }) => expect(await getSummary(42), 'Wrap the awaits in try/catch').toBe('Could not load summary') },
        ],
        pitfalls: [
          { pattern: /await/, absent: true, message: 'Use `await` before `fetchUser(…)` and `fetchOrders(…)`. Without it, you get a Promise instead of the data.' },
        ],
        hints: [
          'Two awaits: the user first, then their orders (`fetchOrders(user.id)`).',
          'Put both awaits and the `return` inside `try`. Return the error text in `catch`.',
        ],
        solution: {
          js: `async function getSummary(id) {
  try {
    const user = await fetchUser(id);
    const orders = await fetchOrders(user.id);
    return \`\${user.name} has \${orders.length} orders\`;
  } catch (error) {
    return 'Could not load summary';
  }
}

getSummary(1).then((text) => console.log(text));
`,
        },
        explanation: 'This reads top to bottom like synchronous code, but each `await` waits for its request. A rejection at either `await` jumps straight to `catch`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.async.parallel',
        type: 'code',
        title: 'Load in parallel',
        skills: ['js.async', 'js.array-methods'],
        prompt: 'Write `async function getNames(ids)` that loads every user with the provided `fetchUser(id)` and returns their names in the same order. Each request takes 100 ms, and the check expects **5 users in under 300 ms**: load them in parallel.',
        files: ['js'],
        preview: false,
        given: {
          setup: FAKE_USERS,
        },
        starter: {
          js: `async function getNames(ids) {
  const names = [];
  for (const id of ids) {
    const user = await fetchUser(id);
    names.push(user.name);
  }
  return names;
}

getNames([1, 2, 3]).then((names) => console.log(names));
`,
        },
        tests: [
          {
            name: 'Returns the names in order',
            run: async ({ expect }) => expect(await getNames([3, 1, 2])).toEqual(['Alan', 'Ada', 'Grace']),
          },
          {
            name: 'Loads 5 users in under 300 ms',
            run: async ({ expect }) => {
              const start = Date.now();
              await getNames([1, 2, 3, 4, 5]);
              const elapsed = Date.now() - start;
              expect(elapsed < 300, `Took ${elapsed} ms: the requests wait for each other. Start them all, then await Promise.all`).toBe(true);
            },
          },
        ],
        hints: [
          'The starter is correct, but slow: each `await` in the loop waits 100 ms before starting the next request.',
          'Start all requests at once with `ids.map((id) => fetchUser(id))`, which gives an array of promises. Then `await Promise.all(thatArray)`.',
          `\`\`\`js
const users = await Promise.all(ids.map((id) => fetchUser(id)));
return users.map((user) => user.name);
\`\`\``,
        ],
        solution: {
          js: `async function getNames(ids) {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users.map((user) => user.name);
}

getNames([1, 2, 3]).then((names) => console.log(names));
`,
        },
        explanation: '`map` starts all five requests immediately, so they wait **at the same time**: about 100 ms in total instead of 500 ms. `Promise.all` keeps the results in the same order as the input, whichever request finishes first.',
        takeaway: 'An `await` inside a loop is a performance smell when the requests are independent. Look for it when reviewing code.',
      },
    },
  ],
  keyPoints: [
    '`await` pauses only its own `async` function and gives you the value or throws the error.',
    'An `async` function always returns a promise.',
    'Independent requests: `await Promise.all(items.map(…))`.',
  ],
};

/* ───────────────────────── 22. Fetch ───────────────────────── */

const fetchLesson = {
  slug: 'fetch',
  title: 'The Fetch API',
  minutes: 30,
  summary: 'Loading data from a server, checking the response, and showing loading and error states.',
  sections: [
    {
      kind: 'text',
      text: `\`fetch(url)\` requests data from a server and returns a promise for a **Response**.

\`\`\`js
const response = await fetch('/api/products');
if (!response.ok) {
  throw new Error(\`Request failed: \${response.status}\`);
}
const products = await response.json();
\`\`\`

Three things that are easy to get wrong:
1. **Two awaits.** The first gives the Response (status, headers). The body arrives separately: \`await response.json()\` reads and parses it.
2. **fetch does not reject on HTTP errors.** A 404 or 500 is still a successful *response*. Only network failures (offline, blocked) reject. So **always check \`response.ok\`** (true for status 200–299).
3. **The interface needs three states:** loading, success and error. Show something while waiting, and always end the loading state, also when it fails.

**In this lab's exercises**, \`fetch\` is a fake: a small pretend API (see "Provided JS"). It works offline, answers the same way every time, and lets the checks simulate a broken network. Your code is exactly the code you would write for a real API.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `async function loadProducts() {
  const status = document.querySelector('#status');
  status.textContent = 'Loading…';

  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(\`Server answered \${response.status}\`);
    }
    const products = await response.json();
    render(products);
    status.textContent = '';
  } catch (error) {
    status.textContent = 'Could not load products. Please try again.';
    console.error(error);
  }
}`,
      notes: [
        { lines: [3], text: 'Loading state: shown before the request starts.' },
        { lines: [6], text: 'First await: the Response object, with `status` and `ok`.' },
        { lines: [7, 9], text: 'Turn HTTP errors (404, 500) into a thrown error, so they are handled in the same `catch`.' },
        { lines: [10], text: 'Second await: read and parse the body as JSON.' },
        { lines: [13, 16], text: 'Error state: a message for the user, plus the details in the console for you.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Not checking response.ok', text: 'A 404 page or an error message is parsed and displayed as if it were data, or `response.json()` fails with a confusing JSON error.' },
        { title: 'A loading state that never ends', text: 'If the error path forgets to remove "Loading…", the user waits forever. Handle every path, or reset the state in `finally`.' },
        { title: 'Secret API keys in front-end code', text: 'Everything in the browser can be read by visitors. Keys for paid services belong on a server.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.fetch.ok',
        type: 'choice',
        title: 'Does catch run?',
        skills: ['js.fetch', 'js.error-handling'],
        prompt: 'The product with id 999 does not exist, and the server answers with status 404. What happens?',
        code: `try {
  const response = await fetch('/api/products/999');
  const product = await response.json();
  showProduct(product);
} catch (error) {
  showError('Product not found');
}`,
        options: [
          { text: '`showProduct` is called with the error data from the server, because fetch does not reject on a 404', correct: true, feedback: 'Yes. A 404 is a valid response, so no error is thrown and `catch` never runs. Check `if (!response.ok) throw new Error(…)` after the first await.' },
          { text: '`catch` runs and shows "Product not found"', correct: false, feedback: 'That is what most people expect. But fetch only rejects when the request itself fails (e.g. offline). An HTTP error status is still a successful response.' },
          { text: 'The browser shows an error page', correct: false, feedback: 'fetch runs in the background; it never changes the page by itself.' },
          { text: '`response.json()` always throws for a 404', correct: false, feedback: 'Many APIs send a JSON error body with a 404, like `{ "error": "Not found" }`, which parses fine.' },
        ],
        hints: ['When exactly does the promise from `fetch` reject?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.fetch.product',
        type: 'code',
        title: 'Load one product',
        skills: ['js.fetch', 'js.async', 'js.error-handling'],
        prompt: `Write \`async function loadProduct(id)\`:

- fetch \`/api/products/ID\`
- if the response is not ok, **throw** an Error with the message \`Request failed: 404\` (with the real status)
- otherwise return the parsed product object`,
        files: ['js'],
        preview: false,
        given: { setup: FAKE_API },
        starter: { js: "async function loadProduct(id) {\n  // your code here\n}\n\nloadProduct(1).then((product) => console.log(product));\n" },
        tests: [
          { name: 'loadProduct(1) gives the Notebook', run: async ({ expect }) => expect(await loadProduct(1)).toEqual({ id: 1, name: 'Notebook', price: 4 }) },
          { name: 'loadProduct(3) gives the Backpack', run: async ({ expect }) => expect((await loadProduct(3)).name).toBe('Backpack') },
          {
            name: "A missing product throws 'Request failed: 404'",
            run: async ({ expect }) => {
              let message = null;
              try { await loadProduct(999); } catch (error) { message = error.message; }
              expect(message, 'Check response.ok and throw new Error(`Request failed: ${response.status}`)').toBe('Request failed: 404');
            },
          },
        ],
        hints: [
          'Build the URL with a template literal: the text `/api/products/` followed by the id.',
          'After the first await, check `response.ok`. If false, `throw new Error(…)` with `response.status`. Then `return await response.json()`.',
        ],
        solution: {
          js: `async function loadProduct(id) {
  const response = await fetch(\`/api/products/\${id}\`);
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  return response.json();
}

loadProduct(1).then((product) => console.log(product));
`,
        },
        explanation: 'This function does not catch anything: it reports problems by throwing. The code that shows the product decides what the user sees. `return response.json()` works without `await` because an async function returning a promise passes its result on.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.fetch.states',
        type: 'code',
        title: 'Loading, success and error',
        skills: ['js.fetch', 'js.dom', 'js.async'],
        prompt: `Write \`async function showProducts()\`:

1. Set \`#status\` to \`Loading…\` and start the request to \`/api/products\`.
2. On success: show each product's name as an \`<li>\` in \`#list\` (replacing old items), and empty \`#status\`.
3. On any error (network or HTTP): set \`#status\` to \`Could not load products.\``,
        files: ['js'],
        given: {
          html: `<p id="status"></p>
<ul id="list"></ul>
<button id="reload" type="button">Reload</button>`,
          css: basicCss,
          setup: FAKE_API,
        },
        starter: {
          js: `async function showProducts() {
  const status = document.querySelector('#status');
  const list = document.querySelector('#list');
  // your code here
}

document.querySelector('#reload').addEventListener('click', showProducts);
showProducts();
`,
        },
        tests: [
          {
            name: 'Shows "Loading…" while the request is running',
            run: async ({ expect, $ }) => {
              const done = showProducts();
              expect($('#status').textContent, 'Set the loading text before the first await').toBe('Loading…');
              await done;
            },
          },
          {
            name: 'Shows the three product names and clears the status',
            run: async ({ expect, $, $$ }) => {
              await showProducts();
              expect($$('#list li').map((li) => li.textContent)).toEqual(['Notebook', 'Pen', 'Backpack']);
              expect($('#status').textContent, 'Empty the status after success').toBe('');
            },
          },
          {
            name: 'Loading twice does not duplicate the list',
            run: async ({ expect, $$ }) => {
              await showProducts();
              await showProducts();
              expect($$('#list li').length, 'Replace the old items').toBe(3);
            },
          },
          {
            name: 'A network failure shows the error message',
            run: async ({ expect, $ }) => {
              window.apiDown = true;
              try {
                await showProducts();
              } catch (error) {
                window.apiDown = false;
                throw new Error('showProducts threw instead of handling the error itself');
              }
              window.apiDown = false;
              expect($('#status').textContent).toBe('Could not load products.');
            },
          },
        ],
        hints: [
          'Set the loading text first. Then put the request, the `response.ok` check, the parsing and the rendering in a `try` block.',
          'Render like in the DOM lesson: `list.replaceChildren()`, then one `<li>` with `textContent` per product. The error message goes in `catch`.',
        ],
        solution: {
          js: `async function showProducts() {
  const status = document.querySelector('#status');
  const list = document.querySelector('#list');
  status.textContent = 'Loading…';

  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(\`Request failed: \${response.status}\`);
    }
    const products = await response.json();

    list.replaceChildren();
    for (const product of products) {
      const li = document.createElement('li');
      li.textContent = product.name;
      list.append(li);
    }
    status.textContent = '';
  } catch (error) {
    status.textContent = 'Could not load products.';
    console.error(error);
  }
}

document.querySelector('#reload').addEventListener('click', showProducts);
showProducts();
`,
        },
        explanation: 'This function combines most of Module 3: async/await, fetch, the `ok` check, try/catch, rendering with `createElement`, and an event listener. You will see this exact shape in nearly every app that loads data. In Module 8 you will build it against a real weather API.',
        takeaway: 'For every request, ask: what does the user see while loading, on success, and on failure?',
      },
    },
  ],
  keyPoints: [
    'Two awaits: one for the Response, one for `response.json()`.',
    'fetch does not reject on 404 or 500: always check `response.ok`.',
    'Design all three states: loading, success, error.',
  ],
};

export const jsBrowserLessons = [
  dom,
  events,
  formHandling,
  errorHandling,
  json,
  localStorageLesson,
  modulesLesson,
  promises,
  asyncAwait,
  fetchLesson,
];
