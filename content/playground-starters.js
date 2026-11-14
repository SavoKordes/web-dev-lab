/*
 * playground-starters.js — example projects you can load in Code mode.
 *
 * Each starter is plain data: { id, title, description, html, css, js }.
 * The HTML is the content of <body>; the lab adds <html>, <head> and <body> itself.
 */

export const starters = [
  {
    id: 'welcome',
    title: 'Getting started',
    description: 'How the editors, preview and console work together.',
    html: `<main class="card">
  <h1>Hello!</h1>
  <p id="message">Click the button.</p>
  <button id="greet-button" type="button">Greet me</button>
</main>`,
    css: `body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #f4f5f7;
}

.card {
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.08);
}

button {
  padding: 0.5rem 1rem;
  font: inherit;
  cursor: pointer;
}`,
    js: `// 1. Find the elements we need in the page.
const button = document.querySelector('#greet-button');
const message = document.querySelector('#message');

// 2. console.log prints values in the Console panel below the preview.
console.log('The button element:', button);

let clicks = 0;

// 3. Run a function every time the button is clicked.
button.addEventListener('click', () => {
  clicks = clicks + 1;
  message.textContent = \`Hello! You clicked \${clicks} time(s).\`;
  console.log('clicks is now', clicks);
});

// Try: change the text, the colors, or what happens on click.
// Press Ctrl+Enter (Cmd+Enter on a Mac) to run, or turn on Auto-run.`,
  },

  {
    id: 'counter',
    title: 'Counter with state',
    description: 'Keep data in one variable, and update the page from it with one render function.',
    html: `<div class="counter">
  <button type="button" data-action="decrement" aria-label="Decrease">−</button>
  <output id="value">0</output>
  <button type="button" data-action="increment" aria-label="Increase">+</button>
</div>
<button type="button" data-action="reset" class="reset">Reset</button>`,
    css: `body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-content: center;
  gap: 1rem;
  min-height: 100vh;
  margin: 0;
  text-align: center;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter button {
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  cursor: pointer;
}

output {
  min-width: 3ch;
  font-size: 2.5rem;
  font-variant-numeric: tabular-nums;
}

.negative { color: crimson; }`,
    js: `// STATE: the single source of truth. Everything on screen is derived from it.
let count = 0;

const output = document.querySelector('#value');

// RENDER: make the page match the state. Called after every change.
function render() {
  output.textContent = count;
  output.classList.toggle('negative', count < 0);
}

// EVENTS: one listener for all buttons ("event delegation").
document.addEventListener('click', (event) => {
  const action = event.target.dataset.action;

  if (action === 'increment') count += 1;
  if (action === 'decrement') count -= 1;
  if (action === 'reset') count = 0;

  render();
});

render();`,
  },

  {
    id: 'filter-list',
    title: 'Search and filter a list',
    description: 'An array of objects, filter() and map(), and re-rendering on every keystroke.',
    html: `<label for="search">Search books</label>
<input id="search" type="search" placeholder="Type a title or author">
<p id="summary"></p>
<ul id="results"></ul>`,
    css: `body {
  font-family: system-ui, sans-serif;
  max-width: 480px;
  margin: 2rem auto;
  padding: 0 1rem;
}

label { display: block; font-weight: 600; margin-bottom: 0.25rem; }

input {
  width: 100%;
  padding: 0.5rem;
  font: inherit;
  box-sizing: border-box;
}

ul { padding: 0; list-style: none; }

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

.author { color: #666; font-size: 0.9em; }`,
    js: `const books = [
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', year: 2018 },
  { title: "Don't Make Me Think", author: 'Steve Krug', year: 2014 },
  { title: 'Refactoring', author: 'Martin Fowler', year: 2018 },
  { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', year: 2019 },
  { title: 'Clean Code', author: 'Robert C. Martin', year: 2008 },
];

const searchInput = document.querySelector('#search');
const results = document.querySelector('#results');
const summary = document.querySelector('#summary');

function matches(book, query) {
  const text = \`\${book.title} \${book.author}\`.toLowerCase();
  return text.includes(query.toLowerCase());
}

function render(query) {
  const found = books.filter((book) => matches(book, query));

  summary.textContent = \`\${found.length} of \${books.length} books\`;

  // Build each <li> with createElement + textContent, not innerHTML:
  // text typed by a user can then never be run as HTML.
  results.replaceChildren(...found.map((book) => {
    const li = document.createElement('li');
    li.textContent = \`\${book.title} \`;
    const author = document.createElement('span');
    author.className = 'author';
    author.textContent = \`— \${book.author}, \${book.year}\`;
    li.append(author);
    return li;
  }));
}

searchInput.addEventListener('input', () => render(searchInput.value.trim()));

render('');`,
  },

  {
    id: 'notes-storage',
    title: 'Notes saved in localStorage',
    description: 'Save data with JSON.stringify, load it with JSON.parse, and survive a reload.',
    html: `<form id="note-form">
  <label for="note">New note</label>
  <input id="note" required maxlength="80" autocomplete="off">
  <button type="submit">Add</button>
</form>
<ul id="notes"></ul>`,
    css: `body {
  font-family: system-ui, sans-serif;
  max-width: 420px;
  margin: 2rem auto;
  padding: 0 1rem;
}

form { display: flex; gap: 0.5rem; align-items: end; flex-wrap: wrap; }
label { width: 100%; font-weight: 600; }
input { flex: 1; padding: 0.5rem; font: inherit; }
button { padding: 0.5rem 0.75rem; font: inherit; cursor: pointer; }

ul { padding: 0; list-style: none; }
li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}`,
    js: `const STORAGE_KEY = 'notes';

// Load: localStorage only stores strings, so the array was saved as JSON text.
// If nothing is saved yet, getItem returns null — then start with an empty array.
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch (error) {
    console.warn('Saved notes were unreadable, starting fresh.', error);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

let notes = loadNotes();
console.log('Loaded notes:', notes);

const form = document.querySelector('#note-form');
const input = document.querySelector('#note');
const list = document.querySelector('#notes');

function render() {
  list.replaceChildren(...notes.map((text, index) => {
    const li = document.createElement('li');
    li.textContent = text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      notes.splice(index, 1);
      saveNotes();
      render();
    });
    li.append(remove);
    return li;
  }));
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the browser from reloading the page
  notes.push(input.value.trim());
  saveNotes();
  render();
  form.reset();
});

render();
// Add a note, then press Run again: the notes are still there.`,
  },

  {
    id: 'fetch-weather',
    title: 'Fetch data from an API',
    description: 'async/await, fetch(), checking response.ok, and handling errors.',
    html: `<h1>Weather in Berlin</h1>
<p id="status">Loading…</p>
<dl id="weather" hidden>
  <dt>Temperature</dt><dd id="temp"></dd>
  <dt>Wind</dt><dd id="wind"></dd>
</dl>`,
    css: `body {
  font-family: system-ui, sans-serif;
  max-width: 420px;
  margin: 2rem auto;
  padding: 0 1rem;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
}

dt { font-weight: 600; }
dd { margin: 0; }

.error { color: crimson; }`,
    js: `// Open-Meteo is a free weather API that needs no key.
const URL = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m';

const statusEl = document.querySelector('#status');

async function loadWeather() {
  try {
    const response = await fetch(URL);

    // fetch() only fails on network problems. A 404 or 500 is still a "response",
    // so we must check response.ok ourselves.
    if (!response.ok) {
      throw new Error(\`The server answered with status \${response.status}\`);
    }

    const data = await response.json();
    console.log('Data from the API:', data.current);

    document.querySelector('#temp').textContent = \`\${data.current.temperature_2m} °C\`;
    document.querySelector('#wind').textContent = \`\${data.current.wind_speed_10m} km/h\`;
    document.querySelector('#weather').hidden = false;
    statusEl.textContent = \`Updated \${new Date().toLocaleTimeString()}\`;
  } catch (error) {
    statusEl.textContent = \`Could not load the weather: \${error.message}\`;
    statusEl.classList.add('error');
    console.error(error);
  }
}

loadWeather();`,
  },

  {
    id: 'broken',
    title: 'Broken on purpose',
    description: 'A small bug to practise reading error messages.',
    html: `<p>Total: <strong id="total">?</strong></p>`,
    css: `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
}`,
    js: `// This code has a bug. Do not read it closely yet!
// 1. Press Run.
// 2. Read the error in the Console. Open "What does this mean?".
// 3. Click the line number to jump to the problem, then fix it.

const prices = [4.5, 12, 7.25];

function sum(numbers) {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

const result = sum(prices);
document.querySelector('#totl').textContent = result.toFixed(2);`,
  },

  {
    id: 'blank',
    title: 'Blank',
    description: 'Empty editors.',
    html: '',
    css: '',
    js: '',
  },
];

export function getStarter(id) {
  return starters.find((s) => s.id === id) ?? starters[0];
}
