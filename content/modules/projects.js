/*
 * projects.js — Module 8: Mini projects.
 *
 * Each project is a "lesson" with: a brief, requirements, three milestones and
 * a final review. Milestones are code exercises whose tests are the functional
 * ACCEPTANCE CRITERIA. From milestone 2 on, `continuesFrom` makes a milestone
 * start from the learner's own solved code of the previous one.
 *
 * The HTML of each project is provided (with the ids the acceptance criteria
 * rely on); the learner writes the CSS and JavaScript.
 */

import { FAKE_WEATHER, ORDERS_DATA } from '../shared/fake-services.js';

const baseCss = `body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; background: #f4f5f7; color: #1f2937; }
button, input, select, textarea { font: inherit; padding: 6px 8px; }`;

/** Builds a milestone exercise with the settings all project milestones share. */
function milestone(project, number, definition) {
  return {
    kind: 'exercise',
    exercise: {
      id: `project.${project.id}.m${number}`,
      type: 'code',
      files: ['css', 'js'],
      downloadable: true,
      continuesFrom: number > 1 ? `project.${project.id}.m${number - 1}` : undefined,
      given: { html: project.html, ...(project.setup ? { setup: project.setup } : {}) },
      skills: project.skills,
      ...definition,
      title: `Milestone ${number}: ${definition.title}`,
    },
  };
}

function review(project, items) {
  return {
    kind: 'exercise',
    exercise: {
      id: `project.${project.id}.review`,
      type: 'checklist',
      title: 'Final review',
      skills: ['pro.code-review', ...project.skills],
      prompt: 'Review your finished project the way a senior developer would review a colleague\'s work. Open the preview, use it with the keyboard, try wrong input, and read your code once more from top to bottom.',
      items,
    },
  };
}

/** Review points that apply to every project. */
const commonReview = [
  'Everything works with the **keyboard** only: Tab, Enter, Space, and the focus is always visible.',
  'Every input has a **label**, and error messages are shown as text next to the problem.',
  'Text from users or data is inserted with **`textContent`**, never with `innerHTML`.',
  'The code is **separated**: pure functions for logic, a render function for the page, listeners that change state.',
  'Names say what things are; there are no magic numbers and no leftover `console.log` or commented-out code.',
  'I can explain **every line** of my code to someone else.',
];

/* ═════════════════════════ Project 1: Personal dashboard ═════════════════════════ */

const dashboard = {
  id: 'dashboard',
  skills: ['project.dashboard', 'js.dom', 'css.grid', 'js.local-storage'],
  html: `<header class="topbar">
  <h1 id="greeting">Hello!</h1>
  <label class="name-field">Your name <input id="name" autocomplete="given-name"></label>
</header>
<main class="dashboard">
  <section class="widget" aria-labelledby="time-title">
    <h2 id="time-title">Time</h2>
    <p id="clock" class="big">--:--</p>
    <p id="date"></p>
  </section>
  <section class="widget" aria-labelledby="week-title">
    <h2 id="week-title">This week</h2>
    <p id="weekend" class="big"></p>
  </section>
  <section class="widget" aria-labelledby="notes-title">
    <h2 id="notes-title">Notes</h2>
    <label for="notes" class="visually-hidden">Notes</label>
    <textarea id="notes" rows="5" placeholder="Anything to remember today?"></textarea>
  </section>
</main>`,
};

const dashboardM1 = `${baseCss}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.widget {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}

.widget h2 { margin: 0 0 0.5rem; font-size: 1rem; color: #6b7280; }
.big { margin: 0; font-size: 2rem; font-weight: 700; }
.widget textarea { width: 100%; box-sizing: border-box; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
`;

const dashboardM1Js = `function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function renderGreeting() {
  document.querySelector('#greeting').textContent = \`\${greetingFor(new Date().getHours())}!\`;
}

renderGreeting();
`;

const dashboardM2Js = `function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function renderGreeting() {
  document.querySelector('#greeting').textContent = \`\${greetingFor(new Date().getHours())}!\`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return \`\${hours}:\${minutes}\`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function daysUntilWeekend(date) {
  const day = date.getDay(); // 0 = Sunday … 6 = Saturday
  if (day === 0 || day === 6) return 0;
  return 6 - day;
}

function weekendText(days) {
  if (days === 0) return 'Weekend!';
  return \`\${days} \${days === 1 ? 'day' : 'days'} until the weekend\`;
}

function renderTime() {
  const now = new Date();
  document.querySelector('#clock').textContent = formatTime(now);
  document.querySelector('#date').textContent = formatDate(now);
  document.querySelector('#weekend').textContent = weekendText(daysUntilWeekend(now));
}

renderGreeting();
renderTime();
setInterval(renderTime, 1000);
`;

const dashboardSections = [
  {
    kind: 'text',
    title: 'The brief',
    text: `Build a small personal start page: a greeting that changes with the time of day, a live clock and date, a countdown to the weekend, and a notes field that remembers what you typed, even after closing the browser.

**Requirements**
- A responsive grid of widgets: several columns on wide screens, one column on phones.
- A greeting that depends on the time of day and includes the user's name, if they entered one.
- A clock (HH:MM) that updates every second, today's date in words, and the number of days until the weekend.
- The name and the notes are saved in localStorage and restored when the page opens.

You work in three milestones. Each has acceptance criteria (the checks). Use the **Download** button at any time to save your project as one HTML file.`,
  },
  milestone(dashboard, 1, {
    title: 'Layout and greeting',
    prompt: `1. **CSS**: make \`.dashboard\` a grid with \`repeat(auto-fit, minmax(220px, 1fr))\` columns and a gap of at least 12px. Style \`.widget\` as cards.
2. **JS**: write \`greetingFor(hour)\`: \`'Good morning'\` from 5 to 11, \`'Good afternoon'\` from 12 to 17, otherwise \`'Good evening'\`.
3. Show the greeting for the current hour in \`#greeting\`, followed by \`!\`.`,
    starter: { css: `${baseCss}\n\n/* your layout here */\n`, js: '// your code here\n' },
    tests: [
      {
        name: '.dashboard is a grid with a gap of at least 12px',
        run: ({ expect, $, style }) => {
          expect(style($('.dashboard'), 'display')).toBe('grid');
          expect(parseFloat(style($('.dashboard'), 'columnGap')) >= 12, 'Add a gap').toBe(true);
        },
      },
      {
        name: 'The columns adapt to the width',
        run: ({ expect, rules }) => {
          const rule = rules.find((r) => r.selector.includes('.dashboard') && r.style.gridTemplateColumns);
          expect(Boolean(rule) && /auto-(fit|fill)/.test(rule.style.gridTemplateColumns), 'Use repeat(auto-fit, minmax(220px, 1fr))').toBe(true);
        },
      },
      {
        name: 'greetingFor gives the right greeting at the boundaries',
        run: ({ expect }) => expect([4, 5, 11, 12, 17, 18, 23].map(greetingFor)).toEqual(['Good evening', 'Good morning', 'Good morning', 'Good afternoon', 'Good afternoon', 'Good evening', 'Good evening']),
      },
      {
        name: '#greeting shows the greeting for now',
        run: ({ expect, $ }) => expect($('#greeting').textContent).toBe(`${greetingFor(new Date().getHours())}!`),
      },
    ],
    hints: [
      'Grid: three declarations on `.dashboard`. Greeting: two `if` checks with early returns, from morning to afternoon, and a final `return`.',
      '`new Date().getHours()` gives the current hour (0–23).',
    ],
    solution: { css: dashboardM1, js: dashboardM1Js },
    explanation: '`auto-fit` with `minmax` gives as many columns as fit, without any media query. The greeting logic is a pure function, so the checks could test every boundary hour without changing the clock.',
  }),
  milestone(dashboard, 2, {
    title: 'Clock, date and weekend countdown',
    prompt: `1. \`formatTime(date)\` returns \`'HH:MM'\` with leading zeros, e.g. \`'09:05'\`.
2. \`formatDate(date)\` returns e.g. \`'Monday 2 March'\` (use \`toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })\`).
3. \`daysUntilWeekend(date)\`: 0 on Saturday and Sunday, otherwise the days until Saturday (Monday → 5, Friday → 1).
4. Show them in \`#clock\`, \`#date\` and \`#weekend\` (\`'Weekend!'\`, \`'1 day until the weekend'\`, \`'3 days until the weekend'\`), and update every second.`,
    starter: { css: dashboardM1, js: dashboardM1Js },
    tests: [
      { name: "formatTime pads with zeros: '09:05'", run: ({ expect }) => expect(formatTime(new Date(2026, 0, 5, 9, 5))).toBe('09:05') },
      { name: "formatTime(23:59) → '23:59'", run: ({ expect }) => expect(formatTime(new Date(2026, 0, 5, 23, 59))).toBe('23:59') },
      { name: "formatDate → 'Monday 2 March'", run: ({ expect }) => expect(formatDate(new Date(2026, 2, 2))).toBe('Monday 2 March') },
      {
        name: 'daysUntilWeekend for every day of a week',
        run: ({ expect }) => expect([1, 2, 3, 4, 5, 6, 7].map((d) => daysUntilWeekend(new Date(2026, 5, d)))).toEqual([5, 4, 3, 2, 1, 0, 0]),
      },
      {
        name: 'The widgets show the current time, date and countdown',
        run: async ({ expect, $, wait }) => {
          await wait(1100);
          const now = new Date();
          expect($('#clock').textContent, 'Update #clock every second').toBe(formatTime(now));
          expect($('#date').textContent).toBe(formatDate(now));
          const days = daysUntilWeekend(now);
          const expected = days === 0 ? 'Weekend!' : `${days} ${days === 1 ? 'day' : 'days'} until the weekend`;
          expect($('#weekend').textContent).toBe(expected);
        },
      },
    ],
    hints: [
      '`String(n).padStart(2, \'0\')` turns 5 into "05". `date.getDay()` is 0 for Sunday up to 6 for Saturday.',
      'Write one `renderTime()` that fills all three elements, call it once, and then with `setInterval(renderTime, 1000)`.',
    ],
    solution: { css: dashboardM1, js: dashboardM2Js },
    explanation: 'Every formatting rule is a small pure function that the checks tested with fixed dates. Only `renderTime` reads the real clock. That split is what makes time-based code testable at all.',
  }),
  milestone(dashboard, 3, {
    title: 'Name and notes that are remembered',
    prompt: `1. Typing in \`#name\` updates the greeting immediately: \`'Good morning, Sam!'\` (without a name: \`'Good morning!'\`). Save the name in localStorage under \`'dashboard-name'\`.
2. Typing in \`#notes\` saves the text under \`'dashboard-notes'\`.
3. Write \`init()\`, which reads both values from localStorage, puts them into the fields, and renders the greeting. Call it at startup.`,
    starter: { css: dashboardM1, js: dashboardM2Js },
    tests: [
      {
        name: 'Typing a name updates the greeting and saves it',
        run: ({ expect, $, type }) => {
          type($('#name'), 'Sam');
          expect($('#greeting').textContent).toBe(`${greetingFor(new Date().getHours())}, Sam!`);
          expect(localStorage.getItem('dashboard-name')).toBe('Sam');
        },
      },
      {
        name: 'An empty name gives the greeting without a name',
        run: ({ expect, $, type }) => {
          type($('#name'), '  ');
          expect($('#greeting').textContent).toBe(`${greetingFor(new Date().getHours())}!`);
        },
      },
      {
        name: 'Notes are saved while typing',
        run: ({ expect, $, type }) => {
          type($('#notes'), 'Call the bakery');
          expect(localStorage.getItem('dashboard-notes')).toBe('Call the bakery');
        },
      },
      {
        name: 'init() restores the saved name and notes',
        run: ({ expect, $ }) => {
          localStorage.setItem('dashboard-name', 'Ada');
          localStorage.setItem('dashboard-notes', 'Finish the engine');
          init();
          expect([$('#name').value, $('#notes').value]).toEqual(['Ada', 'Finish the engine']);
          expect($('#greeting').textContent).toBe(`${greetingFor(new Date().getHours())}, Ada!`);
        },
      },
    ],
    hints: [
      'Change `renderGreeting` so it reads the name from `#name` (trimmed) and adds it when it is not empty.',
      'Two `input` listeners: one on `#name` (save, then render the greeting), one on `#notes` (save).',
      'In `init`: `nameInput.value = localStorage.getItem(\'dashboard-name\') ?? \'\';`, the same for notes, then `renderGreeting()`.',
    ],
    solution: {
      css: dashboardM1,
      js: dashboardM2Js.replace(`function renderGreeting() {
  document.querySelector('#greeting').textContent = \`\${greetingFor(new Date().getHours())}!\`;
}`, `const nameInput = document.querySelector('#name');
const notesInput = document.querySelector('#notes');

function renderGreeting() {
  const name = nameInput.value.trim();
  const greeting = greetingFor(new Date().getHours());
  document.querySelector('#greeting').textContent = name ? \`\${greeting}, \${name}!\` : \`\${greeting}!\`;
}

nameInput.addEventListener('input', () => {
  localStorage.setItem('dashboard-name', nameInput.value.trim());
  renderGreeting();
});

notesInput.addEventListener('input', () => {
  localStorage.setItem('dashboard-notes', notesInput.value);
});

function init() {
  nameInput.value = localStorage.getItem('dashboard-name') ?? '';
  notesInput.value = localStorage.getItem('dashboard-notes') ?? '';
  renderGreeting();
}`).replace(`renderGreeting();
renderTime();`, `init();
renderTime();`),
    },
    explanation: 'The page now restores itself from storage at startup. `init()` being a separate function made that testable: the check put values into storage and called it, which is exactly what a page reload does.',
  }),
  review(dashboard, [
    ...commonReview,
    'The layout works from 320px wide up to a wide screen, without horizontal scrolling.',
  ]),
];

/* ═════════════════════════ Project 2: Task manager ═════════════════════════ */

const tasks = {
  id: 'tasks',
  skills: ['project.tasks', 'interactive.todo', 'js.array-methods', 'js.local-storage'],
  html: `<h1>Tasks</h1>
<form id="task-form" novalidate>
  <label>Task <input id="task-title" autocomplete="off"></label>
  <label>Priority
    <select id="task-priority">
      <option value="high">High</option>
      <option value="medium" selected>Medium</option>
      <option value="low">Low</option>
    </select>
  </label>
  <label>Due <input id="task-due" type="date"></label>
  <button>Add task</button>
</form>
<p id="form-error" role="alert"></p>
<div class="toolbar">
  <label>Show
    <select id="filter-priority">
      <option value="all">All priorities</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
  </label>
  <p id="task-count" aria-live="polite"></p>
</div>
<ul id="task-list"></ul>`,
};

const tasksCss = `${baseCss}
form { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
form label, .toolbar label { display: grid; gap: 2px; font-size: 0.9rem; }
#form-error { color: #b91c1c; min-height: 1.2em; }
.toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; justify-content: space-between; }
#task-list { list-style: none; padding: 0; display: grid; gap: 6px; }
#task-list li { display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: white; border-radius: 8px; border-left: 4px solid #cbd5e1; }
#task-list li.priority-high { border-left-color: #dc2626; }
#task-list li.done .task-title { text-decoration: line-through; color: #9ca3af; }
#task-list li.overdue .task-meta { color: #b91c1c; font-weight: 600; }
.task-meta { margin-left: auto; font-size: 0.85rem; color: #6b7280; }
`;

const tasksM1Js = `let tasks = [];
let nextId = 1;

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const priorityInput = document.querySelector('#task-priority');
const dueInput = document.querySelector('#task-due');
const errorEl = document.querySelector('#form-error');
const list = document.querySelector('#task-list');

const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

// Tasks with a due date first (earliest first), tasks without one at the end.
function byDueDate(a, b) {
  if (a.due === b.due) return 0;
  if (!a.due) return 1;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

function metaText(task) {
  return \`\${PRIORITY_LABELS[task.priority]} · \${task.due ? \`due \${task.due}\` : 'no due date'}\`;
}

function render() {
  const sorted = [...tasks].sort(byDueDate);
  list.replaceChildren(...sorted.map((task) => {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.className = \`priority-\${task.priority}\`;
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    const meta = document.createElement('span');
    meta.className = 'task-meta';
    meta.textContent = metaText(task);
    li.append(title, meta);
    return li;
  }));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === '') {
    errorEl.textContent = 'Enter a task title.';
    titleInput.focus();
    return;
  }
  errorEl.textContent = '';
  tasks.push({ id: nextId++, title, priority: priorityInput.value, due: dueInput.value, done: false });
  form.reset();
  render();
});

render();
`;

const tasksM2Js = `let tasks = [];
let nextId = 1;
let priorityFilter = 'all';

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const priorityInput = document.querySelector('#task-priority');
const dueInput = document.querySelector('#task-due');
const errorEl = document.querySelector('#form-error');
const list = document.querySelector('#task-list');
const filterSelect = document.querySelector('#filter-priority');
const countEl = document.querySelector('#task-count');

const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

// Tasks with a due date first (earliest first), tasks without one at the end.
function byDueDate(a, b) {
  if (a.due === b.due) return 0;
  if (!a.due) return 1;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

function metaText(task) {
  return \`\${PRIORITY_LABELS[task.priority]} · \${task.due ? \`due \${task.due}\` : 'no due date'}\`;
}

function render() {
  const visible = tasks
    .filter((task) => priorityFilter === 'all' || task.priority === priorityFilter)
    .sort(byDueDate);

  list.replaceChildren(...visible.map((task) => {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.className = \`priority-\${task.priority}\`;
    li.classList.toggle('done', task.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', \`Mark "\${task.title}" as done\`);

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('span');
    meta.className = 'task-meta';
    meta.textContent = metaText(task);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', \`Delete "\${task.title}"\`);

    li.append(checkbox, title, meta, remove);
    return li;
  }));

  const open = tasks.filter((task) => !task.done).length;
  countEl.textContent = \`\${open} open \${open === 1 ? 'task' : 'tasks'}\`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === '') {
    errorEl.textContent = 'Enter a task title.';
    titleInput.focus();
    return;
  }
  errorEl.textContent = '';
  tasks.push({ id: nextId++, title, priority: priorityInput.value, due: dueInput.value, done: false });
  form.reset();
  render();
});

list.addEventListener('change', (event) => {
  const task = tasks.find((t) => t.id === Number(event.target.closest('li').dataset.id));
  task.done = event.target.checked;
  render();
});

list.addEventListener('click', (event) => {
  if (!event.target.closest('.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  tasks = tasks.filter((t) => t.id !== id);
  render();
});

filterSelect.addEventListener('change', () => {
  priorityFilter = filterSelect.value;
  render();
});

render();
`;

const tasksSections = [
  {
    kind: 'text',
    title: 'The brief',
    text: `Build a task manager that goes beyond a simple to-do list: tasks have a **priority** and an optional **due date**, they are sorted by due date, can be filtered by priority, are saved, and overdue tasks stand out.

**Requirements**
- Adding a task requires a title; otherwise an error message appears and focus returns to the title field.
- The list is sorted by due date, earliest first; tasks without a due date come last.
- Tasks can be completed and deleted. A filter shows one priority at a time. A counter shows the open tasks.
- Tasks are saved in localStorage. Open tasks whose due date has passed are marked as overdue.`,
  },
  milestone(tasks, 1, {
    title: 'Adding and sorting',
    prompt: `1. Submitting the form adds \`{ id, title, priority, due, done: false }\` (\`due\` is the date input's value, \`'YYYY-MM-DD'\` or \`''\`). An empty title shows \`Enter a task title.\` in \`#form-error\`; on success the error is cleared and the form reset.
2. \`render()\` shows each task as \`<li data-id>\` with a \`.task-title\` and a \`.task-meta\` like \`High · due 2026-03-01\` or \`Medium · no due date\`.
3. Sort by due date: earliest first, tasks without a date last.`,
    starter: { css: tasksCss, js: '// your code here\n' },
    tests: [
      {
        name: 'An empty title shows an error and adds nothing',
        run: ({ expect, $, $$, type, submit }) => {
          type($('#task-title'), '   ');
          submit($('#task-form'));
          expect($('#form-error').textContent).toBe('Enter a task title.');
          expect($$('#task-list li').length).toBe(0);
        },
      },
      {
        name: 'Tasks are added with their meta text',
        run: ({ expect, $, $$, type, submit }) => {
          type($('#task-title'), 'Write report'); $('#task-priority').value = 'high'; type($('#task-due'), '2026-03-10'); submit($('#task-form'));
          expect($('#form-error').textContent, 'Clear the error after a valid task').toBe('');
          expect($$('#task-list .task-meta').map((m) => m.textContent)).toEqual(['High · due 2026-03-10']);
        },
      },
      {
        name: 'The list is sorted by due date, undated tasks last',
        run: ({ expect, $, $$, type, submit }) => {
          type($('#task-title'), 'No date'); type($('#task-due'), ''); submit($('#task-form'));
          type($('#task-title'), 'Earlier'); type($('#task-due'), '2026-02-01'); submit($('#task-form'));
          expect($$('#task-list .task-title').map((t) => t.textContent)).toEqual(['Earlier', 'Write report', 'No date']);
          expect($$('#task-list .task-meta')[2].textContent).toBe('Medium · no due date');
        },
      },
      { name: 'Each item has a data-id', run: ({ expect, $$ }) => expect($$('#task-list li').every((li) => li.dataset.id)).toBe(true) },
    ],
    hints: [
      'Use the to-do list from Module 6 as your model: state array, render, submit listener.',
      'A compare function for `sort` that puts empty due dates last: if one of them has no date, return 1 or -1; otherwise compare the strings (`\'2026-02-01\' < \'2026-03-10\'` works for this date format).',
    ],
    solution: { css: tasksCss, js: tasksM1Js },
    explanation: 'Dates in the `YYYY-MM-DD` format sort correctly as plain text, which keeps the compare function simple. Sorting a copy (`[...tasks]`) keeps the state in the order it was added.',
  }),
  milestone(tasks, 2, {
    title: 'Complete, delete, filter and count',
    prompt: `1. Each item gets a checkbox (toggles \`done\`, \`<li>\` gets class \`done\`) and a button with class \`delete\`. Use event delegation.
2. \`#filter-priority\` shows only tasks of that priority (\`all\` = every task).
3. \`#task-count\` shows the **open** tasks of all priorities: \`2 open tasks\`, \`1 open task\`.`,
    starter: { css: tasksCss, js: tasksM1Js },
    tests: [
      {
        name: 'Completing a task marks it and updates the counter',
        run: ({ expect, $, $$, type, submit, click }) => {
          for (const [title, priority] of [['A', 'high'], ['B', 'low'], ['C', 'high']]) {
            type($('#task-title'), title); $('#task-priority').value = priority; submit($('#task-form'));
          }
          expect($('#task-count').textContent).toBe('3 open tasks');
          click($$('#task-list input[type=checkbox]')[0]);
          expect($$('#task-list li')[0].classList.contains('done')).toBe(true);
          expect($('#task-count').textContent).toBe('2 open tasks');
        },
      },
      {
        name: 'The priority filter shows only matching tasks',
        run: ({ expect, $, $$ }) => {
          $('#filter-priority').value = 'high';
          $('#filter-priority').dispatchEvent(new Event('change', { bubbles: true }));
          expect($$('#task-list .task-title').map((t) => t.textContent)).toEqual(['A', 'C']);
          expect($('#task-count').textContent, 'The counter counts all open tasks').toBe('2 open tasks');
        },
      },
      {
        name: 'Deleting removes the task',
        run: ({ expect, $, $$, click }) => {
          click($$('#task-list .delete')[1]);
          expect($$('#task-list .task-title').map((t) => t.textContent)).toEqual(['A']);
          expect($('#task-count').textContent).toBe('1 open task');
        },
      },
    ],
    hints: [
      'Add `priorityFilter` to the state and filter before sorting in `render`. The counter is derived from all tasks.',
      'Two delegated listeners on the list: `change` for checkboxes, `click` for `.delete`.',
    ],
    solution: { css: tasksCss, js: tasksM2Js },
    explanation: 'The filter only changes what is **shown**; the counter is computed from all tasks. Keeping "what exists" and "what is visible" apart avoids a whole class of bugs.',
  }),
  milestone(tasks, 3, {
    title: 'Saving and overdue tasks',
    prompt: `1. \`isOverdue(task, today)\` (pure): true when the task is not done, has a due date, and the due date is **before** \`today\` (both \`'YYYY-MM-DD'\`).
2. Overdue tasks get the class \`overdue\` on their \`<li>\` (use today's date as \`new Date().toISOString().slice(0, 10)\`).
3. Save \`tasks\` under \`'tasks'\` in localStorage after every change. \`init()\` loads them (with a safe fallback) and renders; call it at startup.`,
    starter: { css: tasksCss, js: tasksM2Js },
    tests: [
      {
        name: 'isOverdue follows the rules',
        run: ({ expect }) => {
          const today = '2026-03-10';
          expect([
            isOverdue({ due: '2026-03-09', done: false }, today),
            isOverdue({ due: '2026-03-10', done: false }, today),
            isOverdue({ due: '2026-03-01', done: true }, today),
            isOverdue({ due: '', done: false }, today),
          ]).toEqual([true, false, false, false]);
        },
      },
      {
        name: 'Tasks are saved after every change',
        run: ({ expect, $, type, submit }) => {
          type($('#task-title'), 'Saved task'); submit($('#task-form'));
          const saved = JSON.parse(localStorage.getItem('tasks') ?? 'null');
          expect(Array.isArray(saved) && saved.some((t) => t.title === 'Saved task'), 'Save JSON.stringify(tasks) under "tasks"').toBe(true);
        },
      },
      {
        name: 'init() restores saved tasks and marks overdue ones',
        run: ({ expect, $$ }) => {
          localStorage.setItem('tasks', JSON.stringify([
            { id: 7, title: 'Old', priority: 'low', due: '2020-01-01', done: false },
            { id: 8, title: 'Future', priority: 'low', due: '2999-01-01', done: false },
          ]));
          init();
          expect($$('#task-list .task-title').map((t) => t.textContent)).toEqual(['Old', 'Future']);
          expect($$('#task-list li').map((li) => li.classList.contains('overdue'))).toEqual([true, false]);
        },
      },
      {
        name: 'init() survives corrupted data',
        run: ({ expect, $$ }) => {
          localStorage.setItem('tasks', '{oops');
          init();
          expect($$('#task-list li').length).toBe(0);
        },
      },
    ],
    hints: [
      'For `isOverdue`, three conditions joined with `&&`. Date strings compare correctly with `<`.',
      'Save at the end of `render()`. In `init`, load with `try/catch` and `?? []`, set `nextId` past the highest id, then render.',
    ],
    solution: {
      css: tasksCss,
      js: tasksM2Js
        .replace('let tasks = [];\nlet nextId = 1;', 'let tasks = [];\nlet nextId = 1;\n\nfunction isOverdue(task, today) {\n  return !task.done && Boolean(task.due) && task.due < today;\n}')
        .replace("    li.classList.toggle('done', task.done);", "    li.classList.toggle('done', task.done);\n    li.classList.toggle('overdue', isOverdue(task, new Date().toISOString().slice(0, 10)));")
        .replace("  countEl.textContent = `${open} open ${open === 1 ? 'task' : 'tasks'}`;\n}", "  countEl.textContent = `${open} open ${open === 1 ? 'task' : 'tasks'}`;\n\n  localStorage.setItem('tasks', JSON.stringify(tasks));\n}")
        .replace(/\nrender\(\);\n$/, `
function init() {
  try {
    tasks = JSON.parse(localStorage.getItem('tasks')) ?? [];
  } catch {
    tasks = [];
  }
  nextId = Math.max(0, ...tasks.map((t) => t.id)) + 1;
  render();
}

init();
`),
    },
    explanation: 'Overdue is **derived**: computed during render from the due date and today, never stored, so it is always correct even days after saving. The pure `isOverdue` could be tested with a fixed "today".',
  }),
  review(tasks, [
    ...commonReview,
    'Adding, completing, deleting and filtering all work after a page reload (download the file and try it).',
  ]),
];

/* ═════════════════════════ Project 3: Contact manager ═════════════════════════ */

const contacts = {
  id: 'contacts',
  skills: ['project.contacts', 'interactive.validation', 'js.local-storage'],
  html: `<h1>Contacts</h1>
<form id="contact-form" novalidate>
  <input id="contact-id" type="hidden">
  <label>Name <input id="contact-name" autocomplete="off"></label>
  <label>Email <input id="contact-email" type="email" autocomplete="off"></label>
  <label>Phone <input id="contact-phone" type="tel" autocomplete="off"></label>
  <button id="save-contact">Add contact</button>
</form>
<p id="contact-error" role="alert"></p>
<label>Search <input id="contact-search" type="search"></label>
<p id="contact-count" aria-live="polite"></p>
<ul id="contact-list"></ul>`,
};

const contactsCss = `${baseCss}
form { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
form label { display: grid; gap: 2px; font-size: 0.9rem; }
#contact-error { color: #b91c1c; min-height: 1.2em; }
#contact-list { list-style: none; padding: 0; display: grid; gap: 6px; }
#contact-list li { display: grid; grid-template-columns: 1fr auto auto; gap: 4px 10px; align-items: center; padding: 8px 12px; background: white; border-radius: 8px; }
.contact-name { font-weight: 600; }
.contact-email, .contact-phone { grid-column: 1; font-size: 0.9rem; color: #4b5563; }
`;

const contactsM1Js = `let contacts = [];
let nextId = 1;

const form = document.querySelector('#contact-form');
const nameInput = document.querySelector('#contact-name');
const emailInput = document.querySelector('#contact-email');
const phoneInput = document.querySelector('#contact-phone');
const errorEl = document.querySelector('#contact-error');
const list = document.querySelector('#contact-list');

function validateContact({ name, email }) {
  if (name === '') return 'Enter a name.';
  if (!email.includes('@')) return 'Enter a valid email address.';
  return '';
}

function contactItem(contact) {
  const li = document.createElement('li');
  li.dataset.id = contact.id;
  for (const field of ['name', 'email', 'phone']) {
    const span = document.createElement('span');
    span.className = \`contact-\${field}\`;
    span.textContent = contact[field];
    li.append(span);
  }
  return li;
}

function render() {
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  list.replaceChildren(...sorted.map(contactItem));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const contact = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
  };
  const error = validateContact(contact);
  errorEl.textContent = error;
  if (error) return;
  contacts.push({ id: nextId++, ...contact });
  form.reset();
  render();
});

render();
`;

const contactsM2Js = contactsM1Js
  .replace("const list = document.querySelector('#contact-list');", "const list = document.querySelector('#contact-list');\nconst searchInput = document.querySelector('#contact-search');\nconst countEl = document.querySelector('#contact-count');")
  .replace(`    li.append(span);
  }
  return li;`, `    li.append(span);
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', \`Delete \${contact.name}\`);
  li.append(remove);
  return li;`)
  .replace(`function render() {
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  list.replaceChildren(...sorted.map(contactItem));
}`, `function matches(contact, query) {
  const q = query.toLowerCase();
  return contact.name.toLowerCase().includes(q) || contact.email.toLowerCase().includes(q);
}

function render() {
  const query = searchInput.value.trim();
  const visible = contacts
    .filter((contact) => matches(contact, query))
    .sort((a, b) => a.name.localeCompare(b.name));
  list.replaceChildren(...visible.map(contactItem));
  countEl.textContent = \`\${visible.length} \${visible.length === 1 ? 'contact' : 'contacts'}\`;
}

searchInput.addEventListener('input', render);

list.addEventListener('click', (event) => {
  if (!event.target.closest('.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  contacts = contacts.filter((c) => c.id !== id);
  render();
});`);

const contactsM3Js = contactsM2Js
  .replace("const form = document.querySelector('#contact-form');", "const form = document.querySelector('#contact-form');\nconst idInput = document.querySelector('#contact-id');\nconst saveButton = document.querySelector('#save-contact');")
  .replace(`  const remove = document.createElement('button');`, `  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'edit';
  edit.textContent = 'Edit';
  edit.setAttribute('aria-label', \`Edit \${contact.name}\`);
  li.append(edit);

  const remove = document.createElement('button');`)
  .replace(`  countEl.textContent = \`\${visible.length} \${visible.length === 1 ? 'contact' : 'contacts'}\`;
}`, `  countEl.textContent = \`\${visible.length} \${visible.length === 1 ? 'contact' : 'contacts'}\`;
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function startEditing(contact) {
  idInput.value = contact.id;
  nameInput.value = contact.name;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
  saveButton.textContent = 'Save changes';
  nameInput.focus();
}

function stopEditing() {
  form.reset();
  idInput.value = '';
  saveButton.textContent = 'Add contact';
}`)
  .replace(`  contacts.push({ id: nextId++, ...contact });
  form.reset();
  render();`, `  const editingId = Number(idInput.value);
  if (editingId) {
    contacts = contacts.map((c) => (c.id === editingId ? { ...c, ...contact } : c));
  } else {
    contacts.push({ id: nextId++, ...contact });
  }
  stopEditing();
  render();`)
  .replace(`list.addEventListener('click', (event) => {
  if (!event.target.closest('.delete')) return;`, `list.addEventListener('click', (event) => {
  const id = Number(event.target.closest('li')?.dataset.id);
  if (event.target.closest('.edit')) {
    startEditing(contacts.find((c) => c.id === id));
    return;
  }
  if (!event.target.closest('.delete')) return;`)
  // The delete code from milestone 2 declared its own id; it now uses the one above.
  .replace(`  if (!event.target.closest('.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  contacts = contacts.filter`, `  if (!event.target.closest('.delete')) return;
  contacts = contacts.filter`)
  .replace(/\nrender\(\);\n$/, `
function init() {
  try {
    contacts = JSON.parse(localStorage.getItem('contacts')) ?? [];
  } catch {
    contacts = [];
  }
  nextId = Math.max(0, ...contacts.map((c) => c.id)) + 1;
  render();
}

init();
`);

const contactsSections = [
  {
    kind: 'text',
    title: 'The brief',
    text: `Build a contact manager that keeps its data in the browser.

**Requirements**
- Add contacts with name, email and phone. Name and email are validated, with a clear message.
- The list is alphabetical, searchable by name or email, with a live count.
- Contacts can be deleted and **edited**: editing fills the form, the button changes to "Save changes", and saving updates the existing contact instead of adding a new one.
- Everything is saved in localStorage and restored on load.`,
  },
  milestone(contacts, 1, {
    title: 'Adding with validation',
    prompt: `1. On submit, read and trim name, email and phone. An empty name shows \`Enter a name.\`, an email without \`@\` shows \`Enter a valid email address.\` in \`#contact-error\`. Valid input clears the error, adds \`{ id, name, email, phone }\` and resets the form.
2. \`render()\` shows each contact as \`<li data-id>\` with \`.contact-name\`, \`.contact-email\` and \`.contact-phone\`, sorted alphabetically by name (\`localeCompare\`).`,
    starter: { css: contactsCss, js: '// your code here\n' },
    tests: [
      {
        name: 'Validation messages',
        run: ({ expect, $, type, submit }) => {
          type($('#contact-name'), ''); type($('#contact-email'), 'ada@example.com'); submit($('#contact-form'));
          expect($('#contact-error').textContent).toBe('Enter a name.');
          type($('#contact-name'), 'Ada'); type($('#contact-email'), 'ada'); submit($('#contact-form'));
          expect($('#contact-error').textContent).toBe('Enter a valid email address.');
        },
      },
      {
        name: 'Contacts are added and sorted alphabetically',
        run: ({ expect, $, $$, type, submit }) => {
          for (const [name, email] of [['Grace Hopper', 'grace@example.com'], ['Ada Lovelace', 'ada@example.com'], ['Alan Turing', 'alan@example.com']]) {
            type($('#contact-name'), name); type($('#contact-email'), email); type($('#contact-phone'), '123'); submit($('#contact-form'));
          }
          expect($('#contact-error').textContent).toBe('');
          expect($$('#contact-list .contact-name').map((n) => n.textContent)).toEqual(['Ada Lovelace', 'Alan Turing', 'Grace Hopper']);
          expect($$('#contact-list .contact-email')[0].textContent).toBe('ada@example.com');
        },
      },
    ],
    hints: [
      'Put the rules in a pure `validateContact(contact)` that returns a message or an empty string.',
      'Sort a copy: `[...contacts].sort((a, b) => a.name.localeCompare(b.name))`.',
    ],
    solution: { css: contactsCss, js: contactsM1Js },
    explanation: '`localeCompare` sorts names the way people expect, including accents and case, which `<` on strings does not.',
  }),
  milestone(contacts, 2, {
    title: 'Search, delete and count',
    prompt: `1. \`#contact-search\` filters while typing, by name **or** email, case-insensitive.
2. Each contact gets a button with class \`delete\` (event delegation).
3. \`#contact-count\` shows the number of visible contacts: \`3 contacts\`, \`1 contact\`.`,
    starter: { css: contactsCss, js: contactsM1Js },
    tests: [
      {
        name: 'Search finds by name or email',
        run: ({ expect, $, $$, type, submit }) => {
          for (const [name, email] of [['Grace Hopper', 'grace@navy.example'], ['Ada Lovelace', 'ada@example.com'], ['Alan Turing', 'alan@example.com']]) {
            type($('#contact-name'), name); type($('#contact-email'), email); submit($('#contact-form'));
          }
          expect($('#contact-count').textContent).toBe('3 contacts');
          type($('#contact-search'), 'NAVY');
          expect($$('#contact-list .contact-name').map((n) => n.textContent)).toEqual(['Grace Hopper']);
          expect($('#contact-count').textContent).toBe('1 contact');
          type($('#contact-search'), 'al');
          expect($$('#contact-list .contact-name').map((n) => n.textContent)).toEqual(['Alan Turing']);
        },
      },
      {
        name: 'Delete removes the contact',
        run: ({ expect, $, $$, type, click }) => {
          type($('#contact-search'), '');
          click($$('#contact-list .delete')[0]);
          expect($$('#contact-list .contact-name').map((n) => n.textContent)).toEqual(['Alan Turing', 'Grace Hopper']);
        },
      },
    ],
    hints: [
      'Read the search text inside `render` and filter before sorting.',
      'One `click` listener on the list that ignores clicks outside `.delete`.',
    ],
    solution: { css: contactsCss, js: contactsM2Js },
    explanation: 'Search is just another filter inside `render`. Because it checks the email too, "navy" finds Grace through her address. Testing with concrete queries like "al" catches mistakes such as searching only the start of a name.',
  }),
  milestone(contacts, 3, {
    title: 'Editing and saving',
    prompt: `1. Each contact gets a button with class \`edit\`. Clicking it fills the form with that contact, stores its id in \`#contact-id\`, and changes \`#save-contact\` to \`Save changes\`.
2. Submitting while editing **updates** that contact (same id, no new entry), then resets the form and the button text to \`Add contact\`.
3. Save \`contacts\` under \`'contacts'\` after every change; \`init()\` restores them (safely) and renders. Call it at startup.`,
    starter: { css: contactsCss, js: contactsM2Js },
    tests: [
      {
        name: 'Edit fills the form and changes the button',
        run: ({ expect, $, $$, type, submit, click }) => {
          type($('#contact-name'), 'Ada Lovelace'); type($('#contact-email'), 'ada@example.com'); type($('#contact-phone'), '111'); submit($('#contact-form'));
          click($$('#contact-list .edit')[0]);
          expect([$('#contact-name').value, $('#contact-email').value, $('#save-contact').textContent]).toEqual(['Ada Lovelace', 'ada@example.com', 'Save changes']);
          expect($('#contact-id').value !== '', 'Store the id in #contact-id').toBe(true);
        },
      },
      {
        name: 'Saving updates the contact instead of adding one',
        run: ({ expect, $, $$, type, submit }) => {
          type($('#contact-phone'), '999');
          submit($('#contact-form'));
          expect($$('#contact-list li').length, 'Update, do not add').toBe(1);
          expect($$('#contact-list .contact-phone')[0].textContent).toBe('999');
          expect([$('#save-contact').textContent, $('#contact-id').value]).toEqual(['Add contact', '']);
        },
      },
      {
        name: 'Contacts are saved and restored by init()',
        run: ({ expect, $$ }) => {
          expect(JSON.parse(localStorage.getItem('contacts') ?? '[]').length, 'Save under "contacts"').toBe(1);
          localStorage.setItem('contacts', JSON.stringify([{ id: 4, name: 'Margaret', email: 'm@example.com', phone: '' }]));
          init();
          expect($$('#contact-list .contact-name').map((n) => n.textContent)).toEqual(['Margaret']);
        },
      },
    ],
    hints: [
      'Edit mode is state too: the hidden `#contact-id` field holds the id being edited, or is empty.',
      'In the submit handler: if `Number(idInput.value)` is set, replace that contact with `contacts.map(…)`; otherwise push a new one.',
    ],
    solution: { css: contactsCss, js: contactsM3Js },
    explanation: 'The form now has two modes, decided by one piece of state: the hidden id. Updating with `map` and a spread keeps the id and replaces only the changed fields.',
  }),
  review(contacts, [
    ...commonReview,
    'Editing can be cancelled or finished without leaving the form in a confusing state.',
  ]),
];

/* ═════════════════════════ Project 4: Weather app ═════════════════════════ */

const weather = {
  id: 'weather',
  skills: ['project.weather', 'js.fetch', 'js.async', 'pro.api'],
  setup: FAKE_WEATHER,
  html: `<h1>Weather</h1>
<form id="city-form">
  <label for="city">City</label>
  <input id="city" autocomplete="off" required>
  <button>Show weather</button>
</form>
<p id="status" role="status"></p>
<section id="current" aria-live="polite">
  <h2 id="location"></h2>
  <p><span id="temperature"></span> <span id="condition"></span></p>
  <p id="wind"></p>
</section>
<ul id="forecast"></ul>`,
};

const weatherCss = `${baseCss}
form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#current { margin-top: 1rem; padding: 1rem; border-radius: 12px; background: white; }
#current:empty, #location:empty { display: none; }
#temperature { font-size: 2.5rem; font-weight: 700; }
#forecast { list-style: none; padding: 0; display: grid; gap: 6px; }
#forecast li { padding: 8px 12px; background: white; border-radius: 8px; }
`;

const weatherM1Js = `const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  return response.json();
}

async function findCity(name) {
  const data = await getJson(\`\${GEOCODING_URL}?name=\${encodeURIComponent(name)}&count=1\`);
  const place = data.results?.[0];
  if (!place) return null;
  return { name: place.name, country: place.country, latitude: place.latitude, longitude: place.longitude };
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude, longitude,
    current: 'temperature_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });
  const data = await getJson(\`\${FORECAST_URL}?\${params}\`);
  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    code: data.current.weather_code,
    daily: data.daily.time.map((date, i) => ({
      date,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      code: data.daily.weather_code[i],
    })),
  };
}
`;

const weatherM2Js = `${weatherM1Js}
const form = document.querySelector('#city-form');
const cityInput = document.querySelector('#city');
const statusEl = document.querySelector('#status');

function showWeather(place, weather) {
  document.querySelector('#location').textContent = \`\${place.name}, \${place.country}\`;
  document.querySelector('#temperature').textContent = \`\${Math.round(weather.temperature)} °C\`;
  document.querySelector('#wind').textContent = \`Wind \${Math.round(weather.windSpeed)} km/h\`;
}

async function search(name) {
  statusEl.textContent = 'Loading…';
  try {
    const place = await findCity(name);
    if (!place) {
      statusEl.textContent = 'City not found.';
      return;
    }
    const weather = await getWeather(place.latitude, place.longitude);
    showWeather(place, weather);
    statusEl.textContent = '';
  } catch (error) {
    statusEl.textContent = 'Could not load the weather. Please try again.';
    console.error(error);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = cityInput.value.trim();
  if (name) search(name);
});
`;

const weatherM3Js = weatherM2Js
  .replace('function showWeather(place, weather) {', `function describeWeather(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function forecastItem(day) {
  const li = document.createElement('li');
  // Parse at local noon: new Date('2026-03-02') would be midnight UTC, which is
  // still the previous day in time zones west of UTC.
  const weekday = new Date(\`\${day.date}T12:00\`).toLocaleDateString('en-GB', { weekday: 'short' });
  li.textContent = \`\${weekday}: \${Math.round(day.max)}° / \${Math.round(day.min)}° · \${describeWeather(day.code)}\`;
  return li;
}

function showWeather(place, weather) {
  document.querySelector('#condition').textContent = describeWeather(weather.code);
  document.querySelector('#forecast').replaceChildren(...weather.daily.slice(0, 3).map(forecastItem));`)
  .replace(`    showWeather(place, weather);
    statusEl.textContent = '';`, `    showWeather(place, weather);
    localStorage.setItem('weather-city', place.name);
    statusEl.textContent = '';`)
  .concat(`
function init() {
  const lastCity = localStorage.getItem('weather-city');
  if (!lastCity) return Promise.resolve();
  cityInput.value = lastCity;
  return search(lastCity);
}

init();
`);

const weatherSections = [
  {
    kind: 'text',
    title: 'The brief',
    text: `Build a weather app that uses a real public API: **Open-Meteo** (open-meteo.com). It is free and needs no API key.

Two endpoints are needed:
- **Geocoding**: \`https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=1\` gives a place's coordinates, in \`results[0]\` (no \`results\` when nothing is found).
- **Forecast**: \`https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=temperature_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto\`

**In the lab**, these URLs are answered by a fake with the same response format (see "Provided JS"), so the checks can test errors and work offline. **The Download button leaves the fake out**: the downloaded file talks to the real API.

**Requirements**
- Search a city; show its name, temperature, wind and a description; then a 3-day forecast.
- Clear loading, "city not found" and network-error states.
- The last city is remembered and loaded when the app opens.`,
  },
  milestone(weather, 1, {
    title: 'Talking to the API',
    setupInDownload: false,
    prompt: `Write the data layer (no page code yet):

1. \`async findCity(name)\` → \`{ name, country, latitude, longitude }\` of the first result, or \`null\` if there is none. Encode the name with \`encodeURIComponent\`.
2. \`async getWeather(latitude, longitude)\` → \`{ temperature, windSpeed, code, daily: [{ date, max, min, code }, …] }\` from the forecast endpoint.
3. Both throw an Error when the response is not ok.`,
    starter: { css: weatherCss, js: '// your code here\n' },
    tests: [
      { name: "findCity('Berlin') returns its coordinates", run: async ({ expect }) => expect(await findCity('Berlin')).toEqual({ name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.41 }) },
      { name: 'findCity encodes the name', run: async ({ expect }) => expect((await findCity('São Paulo'))?.country, 'Use encodeURIComponent(name)').toBe('Brazil') },
      { name: 'An unknown city gives null', run: async ({ expect }) => expect(await findCity('Atlantis')).toBe(null) },
      {
        name: 'getWeather returns current values and the daily forecast',
        run: async ({ expect }) => {
          const weather = await getWeather(52.52, 13.41);
          expect([weather.temperature, weather.windSpeed, weather.code]).toEqual([12.4, 18.2, 2]);
          expect(weather.daily[0]).toEqual({ date: '2026-03-02', max: 14.1, min: 5.6, code: 2 });
          expect(weather.daily.length).toBe(3);
        },
      },
      {
        name: 'A failed response throws',
        run: async ({ expect }) => {
          let threw = false;
          try { await getWeather(999, 999); } catch { threw = true; }
          expect(threw, 'Check response.ok and throw').toBe(true);
        },
      },
    ],
    hints: [
      'One helper `getJson(url)` with the `ok` check saves repeating it. `data.results?.[0]` is undefined when there are no results.',
      '`new URLSearchParams({ latitude, longitude, current: \'…\' })` builds and encodes the query string for you.',
      'For `daily`, map over `data.daily.time` and use the index to take the matching max, min and code.',
    ],
    solution: { css: weatherCss, js: weatherM1Js },
    explanation: 'The data layer translates the API\'s format (`temperature_2m`, parallel arrays) into the shape the rest of the app wants. If the API changes, only these functions change.',
  }),
  milestone(weather, 2, {
    title: 'Searching with loading and error states',
    setupInDownload: false,
    prompt: `On submit (non-empty city):

1. \`#status\` shows \`Loading…\` while waiting.
2. Success: \`#location\` = \`Berlin, Germany\`, \`#temperature\` = \`12 °C\` (rounded), \`#wind\` = \`Wind 18 km/h\` (rounded); \`#status\` is emptied.
3. No such city: \`#status\` = \`City not found.\`
4. Network or server error: \`#status\` = \`Could not load the weather. Please try again.\`

Put this in \`async search(name)\`, called from the submit handler.`,
    starter: { css: weatherCss, js: weatherM1Js },
    tests: [
      {
        name: 'Shows "Loading…" while waiting',
        run: async ({ expect, $ }) => {
          const done = search('Berlin');
          expect($('#status').textContent).toBe('Loading…');
          await done;
        },
      },
      {
        name: 'Shows the weather for Berlin',
        run: async ({ expect, $ }) => {
          await search('Berlin');
          expect([$('#location').textContent, $('#temperature').textContent, $('#wind').textContent, $('#status').textContent])
            .toEqual(['Berlin, Germany', '12 °C', 'Wind 18 km/h', '']);
        },
      },
      {
        name: 'Submitting the form searches',
        run: async ({ expect, $, type, submit, wait }) => {
          type($('#city'), 'Lisbon');
          submit($('#city-form'));
          await wait(400);
          expect($('#location').textContent).toBe('Lisbon, Portugal');
        },
      },
      { name: 'An unknown city shows "City not found."', run: async ({ expect, $ }) => { await search('Atlantis'); expect($('#status').textContent).toBe('City not found.'); } },
      {
        name: 'A network failure shows the error message',
        run: async ({ expect, $ }) => {
          window.apiDown = true;
          try { await search('Berlin'); } finally { window.apiDown = false; }
          expect($('#status').textContent).toBe('Could not load the weather. Please try again.');
        },
      },
    ],
    hints: [
      'Set the loading text first, then `try { … } catch { … }` around both requests.',
      'After `findCity`, return early with the "not found" message if it gave `null`.',
    ],
    solution: { css: weatherCss, js: weatherM2Js },
    explanation: 'Three outcomes, three messages: success, an expected "not found", and an unexpected failure. Each is visible to the user, and the loading text never stays behind.',
  }),
  milestone(weather, 3, {
    title: 'Descriptions, forecast and memory',
    setupInDownload: false,
    prompt: `1. \`describeWeather(code)\`: \`0\` Clear sky · \`1–3\` Partly cloudy · \`45, 48\` Fog · \`51–67\` Rain · \`71–77\` Snow · \`80–82\` Showers · \`95–99\` Thunderstorm · otherwise Unknown. Show it in \`#condition\`.
2. \`#forecast\` shows 3 items like \`Mon: 14° / 6° · Partly cloudy\` (weekday from \`toLocaleDateString('en-GB', { weekday: 'short' })\`, rounded temperatures). Parse each date as \`new Date(date + 'T12:00')\`: without a time, a date is read as midnight UTC, which is the previous day in time zones west of UTC.
3. After a successful search, save the city under \`'weather-city'\`. \`init()\` searches the saved city (if any) and returns that promise. Call it at startup.`,
    starter: { css: weatherCss, js: weatherM2Js },
    tests: [
      {
        name: 'describeWeather maps the codes',
        run: ({ expect }) => expect([0, 2, 45, 61, 73, 81, 95, 100].map(describeWeather)).toEqual(['Clear sky', 'Partly cloudy', 'Fog', 'Rain', 'Snow', 'Showers', 'Thunderstorm', 'Unknown']),
      },
      {
        name: 'The condition and a 3-day forecast are shown',
        run: async ({ expect, $, $$ }) => {
          await search('Berlin');
          expect($('#condition').textContent).toBe('Partly cloudy');
          expect($$('#forecast li').map((li) => li.textContent)).toEqual(['Mon: 14° / 6° · Partly cloudy', 'Tue: 11° / 4° · Rain', 'Wed: 9° / 2° · Snow']);
        },
      },
      { name: 'The city is remembered', run: ({ expect }) => expect(localStorage.getItem('weather-city')).toBe('Berlin') },
      {
        name: 'init() loads the remembered city',
        run: async ({ expect, $ }) => {
          localStorage.setItem('weather-city', 'Lisbon');
          await init();
          expect($('#location').textContent).toBe('Lisbon, Portugal');
        },
      },
    ],
    hints: [
      'A chain of `if` checks with early returns, like the grades exercise in Module 3.',
      'For the forecast: `weather.daily.slice(0, 3).map(…)` into `<li>` elements with `textContent`.',
    ],
    solution: { css: weatherCss, js: weatherM3Js },
    explanation: 'Download the finished project and open it: it now calls the real Open-Meteo API, because the download leaves the lab\'s fake out. Your code did not need to change, since the fake used the same URLs and response format.',
  }),
  review(weather, [
    ...commonReview,
    'Loading, "not found" and network errors are each shown clearly, and the loading text never stays behind.',
    'I downloaded the project and tested it against the real API.',
  ]),
];

/* ═════════════════════════ Project 5: Business admin dashboard ═════════════════════════ */

const admin = {
  id: 'admin',
  skills: ['project.admin', 'js.array-methods', 'interactive.filtering', 'pro.separation'],
  setup: ORDERS_DATA,
  html: `<h1>Café Lumen · Admin</h1>
<section class="kpis" aria-label="Key figures">
  <div class="kpi"><p class="kpi__label">Revenue</p><p id="kpi-revenue" class="kpi__value"></p></div>
  <div class="kpi"><p class="kpi__label">Orders</p><p id="kpi-orders" class="kpi__value"></p></div>
  <div class="kpi"><p class="kpi__label">Average order</p><p id="kpi-average" class="kpi__value"></p></div>
  <div class="kpi"><p class="kpi__label">Top product</p><p id="kpi-top" class="kpi__value"></p></div>
</section>
<label>Status
  <select id="status-filter">
    <option value="all">All</option>
    <option value="paid">Paid</option>
    <option value="shipped">Shipped</option>
    <option value="refunded">Refunded</option>
  </select>
</label>
<table id="orders">
  <caption>Orders</caption>
  <thead>
    <tr>
      <th scope="col"><button type="button" data-sort="date">Date</button></th>
      <th scope="col"><button type="button" data-sort="customer">Customer</button></th>
      <th scope="col"><button type="button" data-sort="total">Total</button></th>
      <th scope="col">Status</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>
<h2>Revenue per month</h2>
<div id="chart"></div>`,
};

const adminCss = `${baseCss}
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 1rem; }
.kpi { padding: 12px 16px; background: white; border-radius: 10px; }
.kpi__label { margin: 0; font-size: 0.85rem; color: #6b7280; }
.kpi__value { margin: 4px 0 0; font-size: 1.4rem; font-weight: 700; }
table { width: 100%; margin-top: 1rem; border-collapse: collapse; background: white; }
caption { text-align: left; font-weight: 600; padding: 6px 0; }
th, td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
th button { border: 0; background: none; font-weight: 600; cursor: pointer; padding: 0; }
#chart { display: flex; align-items: flex-end; gap: 16px; height: 160px; padding: 8px; background: white; border-radius: 10px; }
.bar { flex: 1; background: #3b82f6; border-radius: 4px 4px 0 0; position: relative; }
.bar span { position: absolute; bottom: -1.4em; left: 0; right: 0; text-align: center; font-size: 0.8rem; }
`;

const adminM1Js = `const euro = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

// Refunded orders do not count as revenue.
const counted = (orders) => orders.filter((order) => order.status !== 'refunded');

function revenue(orders) {
  return counted(orders).reduce((sum, order) => sum + order.total, 0);
}

function averageOrder(orders) {
  const valid = counted(orders);
  if (valid.length === 0) return 0;
  return Math.round((revenue(orders) / valid.length) * 100) / 100;
}

function topProduct(orders) {
  const counts = {};
  for (const order of counted(orders)) {
    counts[order.product] = (counts[order.product] ?? 0) + 1;
  }
  let best = null;
  for (const [product, count] of Object.entries(counts)) {
    if (best === null || count > counts[best]) best = product;
  }
  return best;
}

function renderKpis(orders) {
  document.querySelector('#kpi-revenue').textContent = euro.format(revenue(orders));
  document.querySelector('#kpi-orders').textContent = String(counted(orders).length);
  document.querySelector('#kpi-average').textContent = euro.format(averageOrder(orders));
  document.querySelector('#kpi-top').textContent = topProduct(orders) ?? '—';
}

renderKpis(ORDERS);
`;

const adminM2Js = adminM1Js.replace('renderKpis(ORDERS);\n', `let orders = ORDERS.map((order) => ({ ...order }));
let statusFilter = 'all';
let sort = { key: 'date', direction: 'ascending' };

const tbody = document.querySelector('#orders tbody');

function compare(a, b) {
  const factor = sort.direction === 'ascending' ? 1 : -1;
  const x = a[sort.key];
  const y = b[sort.key];
  if (x === y) return 0;
  return (x < y ? -1 : 1) * factor;
}

function visibleOrders() {
  return orders
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .sort(compare);
}

function orderRow(order) {
  const tr = document.createElement('tr');
  tr.dataset.id = order.id;
  for (const text of [order.date, order.customer, euro.format(order.total), order.status]) {
    const td = document.createElement('td');
    td.textContent = text;
    tr.append(td);
  }
  tr.append(document.createElement('td'));
  return tr;
}

function render() {
  const visible = visibleOrders();
  tbody.replaceChildren(...visible.map(orderRow));
  renderKpis(visible);
  for (const button of document.querySelectorAll('[data-sort]')) {
    const th = button.closest('th');
    if (button.dataset.sort === sort.key) th.setAttribute('aria-sort', sort.direction);
    else th.removeAttribute('aria-sort');
  }
}

document.querySelector('#orders thead').addEventListener('click', (event) => {
  const button = event.target.closest('[data-sort]');
  if (!button) return;
  const key = button.dataset.sort;
  sort = sort.key === key && sort.direction === 'ascending'
    ? { key, direction: 'descending' }
    : { key, direction: 'ascending' };
  render();
});

document.querySelector('#status-filter').addEventListener('change', (event) => {
  statusFilter = event.target.value;
  render();
});

render();
`);

const adminM3Js = adminM2Js
  .replace(`function renderKpis(orders) {`, `function revenueByMonth(orders) {
  const totals = {};
  for (const order of counted(orders)) {
    const month = order.date.slice(0, 7);
    totals[month] = (totals[month] ?? 0) + order.total;
  }
  return Object.keys(totals).sort().map((month) => ({ month, total: totals[month] }));
}

function renderChart(orders) {
  const months = revenueByMonth(orders);
  const max = Math.max(0, ...months.map((m) => m.total));
  document.querySelector('#chart').replaceChildren(...months.map(({ month, total }) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = \`\${max ? (total / max) * 100 : 0}%\`;
    const label = new Date(\`\${month}-15T12:00\`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', \`\${label}: \${euro.format(total)}\`);
    const caption = document.createElement('span');
    caption.textContent = label.split(' ')[0].slice(0, 3);
    bar.append(caption);
    return bar;
  }));
}

function renderKpis(orders) {`)
  .replace(`  tr.append(document.createElement('td'));
  return tr;`, `  const actionCell = document.createElement('td');
  if (order.status === 'paid') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ship';
    button.textContent = 'Mark shipped';
    button.setAttribute('aria-label', \`Mark order \${order.id} as shipped\`);
    actionCell.append(button);
  }
  tr.append(actionCell);
  return tr;`)
  .replace(`  renderKpis(visible);`, `  renderKpis(visible);
  renderChart(orders);`)
  .replace(`document.querySelector('#status-filter')`, `tbody.addEventListener('click', (event) => {
  if (!event.target.closest('.ship')) return;
  const id = Number(event.target.closest('tr').dataset.id);
  orders = orders.map((order) => (order.id === id ? { ...order, status: 'shipped' } : order));
  render();
});

document.querySelector('#status-filter')`);

const adminSections = [
  {
    kind: 'text',
    title: 'The brief',
    text: `Build the admin dashboard of a small business: key figures, an orders table, and a revenue chart. The order data is provided as \`ORDERS\` (see "Provided JS"): \`{ id, date, customer, product, total, status }\`, with status \`paid\`, \`shipped\` or \`refunded\`.

**Requirements**
- Key figures: revenue, number of orders, average order value and the top product. **Refunded orders do not count.**
- An orders table that can be sorted by date, customer or total (click the header again to reverse), and filtered by status. The key figures follow the filter.
- A bar chart of revenue per month, built with HTML elements, accessible to screen readers.
- Paid orders can be marked as shipped.

This project is mostly about **data**: pure functions that calculate, and a render function that shows the results.`,
  },
  milestone(admin, 1, {
    title: 'Key figures',
    prompt: `Write pure functions (refunded orders never count):

1. \`revenue(orders)\`: the sum of the totals.
2. \`averageOrder(orders)\`: revenue ÷ number of counted orders, rounded to 2 decimals (0 when there are none).
3. \`topProduct(orders)\`: the product that appears in the most counted orders (\`null\` when none).

Then show them in the four \`#kpi-…\` elements; money formatted like \`€1,234.50\` (\`new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' })\`).`,
    starter: { css: adminCss, js: '// ORDERS is provided. Your code here.\n' },
    tests: [
      {
        name: 'revenue ignores refunded orders',
        run: ({ expect }) => expect(revenue([{ total: 10, status: 'paid' }, { total: 5.5, status: 'shipped' }, { total: 100, status: 'refunded' }])).toBe(15.5),
      },
      {
        name: 'averageOrder is rounded, and 0 for no orders',
        run: ({ expect }) => {
          expect(averageOrder([{ total: 10, status: 'paid' }, { total: 10, status: 'paid' }, { total: 5, status: 'paid' }])).toBe(8.33);
          expect(averageOrder([{ total: 9, status: 'refunded' }])).toBe(0);
        },
      },
      {
        name: 'topProduct counts orders per product',
        run: ({ expect }) => {
          expect(topProduct([{ product: 'Tea', status: 'paid' }, { product: 'Cake', status: 'paid' }, { product: 'Cake', status: 'shipped' }, { product: 'Tea', status: 'refunded' }, { product: 'Tea', status: 'refunded' }])).toBe('Cake');
          expect(topProduct([])).toBe(null);
        },
      },
      {
        name: 'The key figures are shown for ORDERS',
        run: ({ expect, $ }) => expect(['#kpi-revenue', '#kpi-orders', '#kpi-average', '#kpi-top'].map((s) => $(s).textContent)).toEqual(['€1,234.50', '10', '€123.45', 'Coffee beans']),
      },
    ],
    hints: [
      'A helper that removes refunded orders keeps every function short: `orders.filter((o) => o.status !== \'refunded\')`.',
      '`topProduct`: count into an object (Module 3, objects lesson), then find the key with the highest count.',
    ],
    solution: { css: adminCss, js: adminM1Js },
    explanation: 'Every figure is a pure function of the orders array, which is why the checks could use tiny hand-made arrays. The display formatting (`Intl.NumberFormat`) happens only in `renderKpis`.',
  }),
  milestone(admin, 2, {
    title: 'A sortable, filterable orders table',
    prompt: `1. Show each order as a \`<tr data-id>\` in the table body: date, customer, total (formatted), status, and an empty action cell.
2. Clicking a header button (\`data-sort\`) sorts by that column, ascending; clicking the **same** one again sorts descending. Set \`aria-sort="ascending"\` or \`"descending"\` on the sorted column's \`<th>\` (and remove it from the others). Start sorted by date, ascending.
3. \`#status-filter\` filters the rows, and the key figures show the **filtered** orders.`,
    starter: { css: adminCss, js: adminM1Js },
    tests: [
      {
        name: 'All orders are shown, sorted by date',
        run: ({ expect, $$ }) => {
          const dates = $$('#orders tbody tr').map((tr) => tr.cells[0].textContent);
          expect(dates.length).toBe(12);
          expect(dates, 'Start sorted by date, ascending').toEqual([...dates].sort());
          expect($$('th[aria-sort]').map((th) => th.getAttribute('aria-sort'))).toEqual(['ascending']);
        },
      },
      {
        name: 'Clicking "Total" twice sorts by total, descending',
        run: ({ expect, $, $$, click }) => {
          click($('[data-sort=total]'));
          click($('[data-sort=total]'));
          const first = $$('#orders tbody tr')[0];
          expect(first.cells[2].textContent).toBe('€310.00');
          expect($('[data-sort=total]').closest('th').getAttribute('aria-sort')).toBe('descending');
          expect($$('th[aria-sort]').length, 'Only one column has aria-sort').toBe(1);
        },
      },
      {
        name: 'The status filter applies to rows and key figures',
        run: ({ expect, $, $$ }) => {
          $('#status-filter').value = 'refunded';
          $('#status-filter').dispatchEvent(new Event('change', { bubbles: true }));
          expect($$('#orders tbody tr').map((tr) => tr.cells[3].textContent)).toEqual(['refunded', 'refunded']);
          expect($('#kpi-revenue').textContent, 'Refunded orders bring no revenue').toBe('€0.00');
          $('#status-filter').value = 'all';
          $('#status-filter').dispatchEvent(new Event('change', { bubbles: true }));
        },
      },
    ],
    hints: [
      'State: `statusFilter` and `sort = { key, direction }`. One compare function reads `sort` and multiplies by -1 for descending.',
      'Dates in `YYYY-MM-DD` and customer names compare with `<`; totals are numbers. One compare function works for all three.',
    ],
    solution: { css: adminCss, js: adminM2Js },
    explanation: '`aria-sort` tells screen-reader users which column is sorted and how, which they cannot see from the order of the rows. The KPIs are now derived from the visible rows, so the filter and the figures always agree.',
  }),
  milestone(admin, 3, {
    title: 'Revenue chart and shipping orders',
    prompt: `1. \`revenueByMonth(orders)\` (pure): \`[{ month: '2026-01', total }, …]\`, sorted by month, refunded orders excluded.
2. Render one \`.bar\` per month into \`#chart\`, with \`style.height\` as a percentage of the highest month (the highest is \`100%\`). Give each bar \`role="img"\` and an \`aria-label\` like \`January 2026: €410.00\`.
3. Paid orders get a button with class \`ship\` in the action cell. Clicking it changes that order's status to \`shipped\` and re-renders everything.`,
    starter: { css: adminCss, js: adminM2Js },
    tests: [
      {
        name: 'revenueByMonth groups and sorts by month',
        run: ({ expect }) => expect(revenueByMonth([
          { date: '2026-02-03', total: 5, status: 'paid' }, { date: '2026-01-09', total: 10, status: 'shipped' },
          { date: '2026-02-20', total: 7, status: 'paid' }, { date: '2026-01-10', total: 99, status: 'refunded' },
        ])).toEqual([{ month: '2026-01', total: 10 }, { month: '2026-02', total: 12 }]),
      },
      {
        name: 'One accessible bar per month, the highest at 100%',
        run: ({ expect, $$ }) => {
          const bars = $$('#chart .bar');
          expect(bars.length).toBe(3);
          expect(bars.map((b) => b.style.height).includes('100%'), 'The highest month should be 100% high').toBe(true);
          expect(bars[0].getAttribute('aria-label')).toBe('January 2026: €410.00');
        },
      },
      {
        name: '"Mark shipped" changes the status',
        run: ({ expect, $$, click }) => {
          const row = $$('#orders tbody tr').find((tr) => tr.querySelector('.ship'));
          const id = row.dataset.id;
          click(row.querySelector('.ship'));
          const updated = $$('#orders tbody tr').find((tr) => tr.dataset.id === id);
          expect(updated.cells[3].textContent).toBe('shipped');
          expect(updated.querySelector('.ship'), 'Shipped orders have no button').toBe(null);
        },
      },
      {
        name: 'Only paid orders have the button',
        run: ({ expect, $$ }) => expect($$('#orders tbody tr').every((tr) => Boolean(tr.querySelector('.ship')) === (tr.cells[3].textContent === 'paid'))).toBe(true),
      },
    ],
    hints: [
      '`order.date.slice(0, 7)` gives the month as `\'2026-01\'`. Count into an object, then turn its sorted keys into the array.',
      'Bar height: `(total / max) * 100` + `\'%\'`. A delegated click listener on the table body handles every `.ship` button.',
    ],
    solution: { css: adminCss, js: adminM3Js },
    explanation: 'The chart is plain HTML: a flex container with bars whose height is a percentage. `role="img"` with an `aria-label` makes each bar\'s value available to screen-reader users. Shipping an order changes the state, and `render()` updates the table, the figures and the chart together.',
  }),
  review(admin, [
    ...commonReview,
    'Every figure on the page can be traced back to one pure function, and the figures agree with the table.',
  ]),
];

/* ─────────────────────────────────────────────────────────────────────────── */

export const projectLessons = [
  { slug: 'personal-dashboard', title: 'Project 1: Interactive personal dashboard', minutes: 120, summary: 'A start page with a responsive grid, a live clock and date, and saved notes.', sections: dashboardSections, keyPoints: ['Pure functions for every rule; one function that reads the clock.', 'init() restores saved state at startup.'] },
  { slug: 'task-manager', title: 'Project 2: Task management application', minutes: 150, summary: 'Tasks with priorities and due dates: sorting, filtering, saving and overdue warnings.', sections: tasksSections, keyPoints: ['Separate what exists (state) from what is visible (filters).', 'Derive values like "overdue" during render instead of storing them.'] },
  { slug: 'contact-manager', title: 'Project 3: Contact manager with local storage', minutes: 150, summary: 'Adding, searching, editing and deleting contacts, saved in the browser.', sections: contactsSections, keyPoints: ['Form modes (add or edit) are state too.', 'Update records with map and spread; keep their ids.'] },
  { slug: 'weather-app', title: 'Project 4: Weather app with a public API', minutes: 150, summary: 'Searching a city and showing current weather and a forecast from Open-Meteo.', sections: weatherSections, keyPoints: ['A data layer translates the API format for the rest of the app.', 'Every request has loading, success, expected-failure and error states.'] },
  { slug: 'admin-dashboard', title: 'Project 5: Small business administration dashboard', minutes: 180, summary: 'Key figures, a sortable orders table and a revenue chart from order data.', sections: adminSections, keyPoints: ['Figures are pure functions of the data.', 'Accessible tables (aria-sort) and charts (role="img" with labels).'] },
];
