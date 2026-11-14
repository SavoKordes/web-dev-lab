/*
 * sample-exercises.js — one or two exercises of every type.
 *
 * They show how the exercise engine works, and they are real exercises: they
 * move into their curriculum modules when those are written.
 *
 * Rules for writing tests (see js/services/test-runner.js):
 *   - A test's run() function is sent into the sandbox as text, so it may only use
 *     its parameters ({ expect, $, $$, style, logs, click, type, submit, wait })
 *     and globals (like the learner's functions). No variables from this file.
 *   - Give expect() a human message as its second argument. It is what the
 *     learner sees when the check fails.
 *   - Do not use the /g flag on pitfall patterns (a /g regex remembers its position).
 */

export const sampleExercises = [
  /* ────────────────────────── Code: JavaScript ────────────────────────── */
  {
    id: 'sample.js.initials',
    type: 'code',
    title: 'Initials from a full name',
    skills: ['js.functions.return', 'js.strings', 'js.array-methods'],
    prompt: `Write a function \`getInitials(fullName)\` that returns the initials of a name in capitals.

- \`getInitials('Ada Lovelace')\` returns \`'AL'\`
- \`getInitials('grace brewster hopper')\` returns \`'GBH'\`
- Extra spaces must not matter: \`getInitials('  Alan   Turing ')\` returns \`'AT'\``,
    files: ['js'],
    preview: false,
    starter: {
      js: `function getInitials(fullName) {
  // your code here
}

console.log(getInitials('Ada Lovelace'));
`,
    },
    tests: [
      {
        name: 'getInitials is a function',
        run: ({ expect }) => {
          expect(typeof getInitials, 'Define a function named exactly getInitials').toBe('function');
        },
      },
      {
        name: "getInitials('Ada Lovelace') returns 'AL'",
        run: ({ expect }) => expect(getInitials('Ada Lovelace')).toBe('AL'),
      },
      {
        name: "Works with three names: 'grace brewster hopper' → 'GBH'",
        run: ({ expect }) => expect(getInitials('grace brewster hopper')).toBe('GBH'),
      },
      {
        name: "Ignores extra spaces: '  Alan   Turing ' → 'AT'",
        run: ({ expect }) => expect(getInitials('  Alan   Turing ')).toBe('AT'),
      },
    ],
    pitfalls: [
      {
        pattern: /return/,
        absent: true,
        message: 'Your function has no `return`. `console.log` only **shows** a value; `return` **gives it back** to the code that called the function. The checks call your function and look at what it returns.',
      },
    ],
    hints: [
      'Start from the input: one string. You need its separate words. Which string method cuts a string into an array?',
      "`'a b'.split(' ')` gives `['a', 'b']`. The first character of a word is `word[0]`. `map()` transforms every item of an array, and `join('')` glues an array back into one string.",
      `One possible shape. Fill in the gap:
\`\`\`js
return fullName
  .split(' ')
  .filter((word) => word !== '')  // extra spaces create empty words
  .map((word) => /* the first letter */)
  .join('')
  .toUpperCase();
\`\`\``,
    ],
    solution: {
      js: `function getInitials(fullName) {
  return fullName
    .split(' ')
    .filter((word) => word !== '')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

console.log(getInitials('Ada Lovelace')); // "AL"
`,
    },
    explanation: `Follow the data: **string → array of words → array of first letters → string**.

- \`split(' ')\` turns \`'  Alan   Turing '\` into \`['', '', 'Alan', '', '', 'Turing', '']\`. The empty strings come from the extra spaces.
- \`filter\` removes the empty strings.
- \`map\` turns each word into its first letter.
- \`join('')\` and \`toUpperCase()\` produce the final string.

Without \`filter\`, the code happens to work too: \`''[0]\` is \`undefined\`, and \`join\` turns \`undefined\` into an empty string. Relying on that is fragile. Removing the empty words explicitly says what you mean.`,
    takeaway: 'When a function has to produce a value, it must `return` it. Many string problems follow the same pattern: split → transform each piece → join.',
  },

  /* ────────────────────────── Code: HTML ────────────────────────── */
  {
    id: 'sample.html.form-label',
    type: 'code',
    title: 'Make a sign-up form accessible',
    skills: ['html.forms', 'html.accessibility'],
    prompt: `This form looks fine, but a screen reader cannot tell what the input is for, the browser cannot validate it, and the button does nothing. Fix the HTML:

- Connect the label to the input (with \`for\` and \`id\`).
- Make the input an **email** input that is **required**.
- Make the button submit the form.`,
    files: ['html'],
    starter: {
      html: `<form id="signup">
  <label>Email address</label>
  <input name="email">
  <button type="button">Sign up</button>
</form>
`,
    },
    given: {
      css: `body { font-family: system-ui, sans-serif; padding: 1.5rem; }
form { display: grid; gap: 0.5rem; max-width: 320px; }
input, button { font: inherit; padding: 0.5rem; }`,
    },
    tests: [
      {
        name: 'The input has an id',
        run: ({ expect, $ }) => {
          const input = $('#signup input');
          expect(input, 'There should be an <input> inside the form').toBeTruthy();
          expect(input.id, 'Give the input an id attribute').toBeTruthy();
        },
      },
      {
        name: 'The label is connected to the input',
        run: ({ expect, $ }) => {
          const input = $('#signup input');
          expect(input.labels.length, "The label's for must be exactly the input's id").toBe(1);
        },
      },
      {
        name: 'The input is an email input',
        run: ({ expect, $ }) => expect($('#signup input').type, 'Set type="email"').toBe('email'),
      },
      {
        name: 'The input is required',
        run: ({ expect, $ }) => expect($('#signup input').required, 'Add the required attribute').toBe(true),
      },
      {
        name: 'The button submits the form',
        run: ({ expect, $ }) => expect($('#signup button').type, 'The button type should be submit').toBe('submit'),
      },
    ],
    pitfalls: [
      {
        file: 'html',
        pattern: /type\s*=\s*["']button["']/,
        message: 'A `type="button"` button does nothing on its own. Inside a form, buttons are `type="submit"` by default, so remove the type or set it to `submit`.',
      },
    ],
    hints: [
      'Look at how the `<label>` and the `<input>` refer to each other. At the moment nothing links them.',
      "A label's `for` attribute must contain exactly the input's `id`. Input types like `email` and the `required` attribute give you browser validation for free.",
      `The connection looks like this:
\`\`\`html
<label for="email">Email address</label>
<input id="email" name="email" …>
\`\`\``,
    ],
    solution: {
      html: `<form id="signup">
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Sign up</button>
</form>
`,
    },
    explanation: 'Clicking the label now focuses the input. A screen reader announces "Email address, edit text, required". The browser refuses to submit an empty or invalid address, before any JavaScript runs.',
    takeaway: 'Every input needs a connected label. Prefer the right input `type` and attributes like `required` before writing validation code.',
  },

  /* ────────────────────────── Code: CSS ────────────────────────── */
  {
    id: 'sample.css.center',
    type: 'code',
    title: 'Center a card',
    skills: ['css.flexbox', 'css.layout'],
    prompt: 'Center the card **horizontally and vertically** inside `.page`. The card should stay only as wide as its content. Look at the provided HTML tab to see the structure.',
    files: ['css'],
    given: {
      html: `<div class="page">
  <div class="card">I should be in the middle</div>
</div>`,
    },
    starter: {
      css: `body { margin: 0; font-family: system-ui, sans-serif; }

.page {
  min-height: 300px;
  background: #eef1f6;
  /* center the card here */
}

.card {
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 10px;
}
`,
    },
    tests: [
      {
        name: 'The card is only as wide as its content',
        run: ({ expect, $ }) => {
          const page = $('.page').getBoundingClientRect();
          const card = $('.card').getBoundingClientRect();
          expect(card.width < page.width * 0.8, 'The card still stretches across the page').toBeTruthy();
        },
      },
      {
        name: 'The card is centered horizontally',
        run: ({ expect, $ }) => {
          const page = $('.page').getBoundingClientRect();
          const card = $('.card').getBoundingClientRect();
          const offset = Math.abs((page.left + page.width / 2) - (card.left + card.width / 2));
          expect(offset < 2, `The card is ${Math.round(offset)}px away from the horizontal center`).toBeTruthy();
        },
      },
      {
        name: 'The card is centered vertically',
        run: ({ expect, $ }) => {
          const page = $('.page').getBoundingClientRect();
          const card = $('.card').getBoundingClientRect();
          const offset = Math.abs((page.top + page.height / 2) - (card.top + card.height / 2));
          expect(offset < 2, `The card is ${Math.round(offset)}px away from the vertical center`).toBeTruthy();
        },
      },
      {
        name: 'The page is still at least 300px tall',
        run: ({ expect, $ }) => expect($('.page').getBoundingClientRect().height >= 299, 'Keep min-height: 300px on .page').toBeTruthy(),
      },
    ],
    pitfalls: [
      {
        file: 'css',
        pattern: /text-align\s*:\s*center/,
        message: '`text-align: center` centers the **text inside** an element, not the element itself.',
      },
      {
        file: 'css',
        pattern: /margin\s*:\s*(0\s+)?auto/,
        message: '`margin: auto` centers a block horizontally, but in normal flow it cannot center vertically. To center in both directions, make the **parent** a flex or grid container.',
      },
    ],
    hints: [
      'The centering rules belong on the **parent** (`.page`), not on the card.',
      'With `display: flex` on the parent, `justify-content` aligns children along the main axis (horizontal by default) and `align-items` aligns them on the cross axis (vertical).',
      'Three declarations in `.page`: `display: flex;` and one property for each direction.',
    ],
    solution: {
      css: `body { margin: 0; font-family: system-ui, sans-serif; }

.page {
  min-height: 300px;
  background: #eef1f6;
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
}

.card {
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 10px;
}
`,
    },
    explanation: 'A flex container places its children side by side and can align them in both directions. The card also stops stretching to the full width, because flex items are only as wide as their content by default. `display: grid; place-items: center;` would work too.',
    takeaway: 'To position something, style its **parent**. Centering is a job for flexbox or grid on the container.',
  },

  /* ────────────────────────── Predict ────────────────────────── */
  {
    id: 'sample.predict.continue',
    type: 'predict',
    title: 'A loop with continue',
    skills: ['js.loops', 'js.strings'],
    prompt: 'Read the code carefully. What does it print? Work it out **before** running anything.',
    code: `const items = ['a', 'b', 'c'];
let result = '';

for (let i = 0; i < items.length; i++) {
  if (i === 1) {
    continue;
  }
  result += items[i].toUpperCase();
}

console.log(result);
console.log(items.length);`,
    expected: 'AC\n3',
    hints: [
      'Go through the loop one round at a time. Write down `i` and `result` after each round.',
      '`continue` jumps straight to the next round. The lines below it are skipped for that round only.',
      'Only the rounds with `i = 0` and `i = 2` add a letter.',
    ],
    explanation: `Round by round:
- \`i = 0\`: \`result\` becomes \`'A'\`.
- \`i = 1\`: \`continue\` skips the rest of the round.
- \`i = 2\`: \`result\` becomes \`'AC'\`.

\`toUpperCase()\` returns a new string and does not change the array, so \`items.length\` is still \`3\`.`,
    takeaway: 'To predict a loop, trace it on paper: one line per round, with the value of every variable.',
  },

  /* ────────────────────────── Order ────────────────────────── */
  {
    id: 'sample.order.call-order',
    type: 'order',
    title: 'Which function runs first?',
    skills: ['reading.execution-order', 'js.functions'],
    prompt: 'Put the events in the order they happen when this script runs.',
    code: `function formatPrice(amount) {
  return '€' + amount.toFixed(2);
}

function total(prices) {
  return prices.reduce((sum, price) => sum + price, 0);
}

function render(prices) {
  console.log('render starts');
  const text = formatPrice(total(prices));
  console.log('render ends: ' + text);
}

render([2.5, 4]);`,
    steps: [
      '`render([2.5, 4])` is called',
      '"render starts" is logged',
      '`total(prices)` runs and returns `6.5`',
      '`formatPrice(6.5)` runs and returns `"€6.50"`',
      '"render ends: €6.50" is logged',
    ],
    hints: [
      'Function definitions do nothing until they are called. Find the first line that actually **calls** something.',
      'In `formatPrice(total(prices))` the inner call must finish first, because its return value becomes the argument of the outer call.',
    ],
    explanation: 'The three `function` blocks only **define** functions. The last line is the first one that does anything. Inside `render`, `formatPrice(total(prices))` runs from the inside out: arguments are always evaluated before a function receives them.',
    takeaway: 'Read nested calls from the inside out.',
  },

  /* ────────────────────────── Choice ────────────────────────── */
  {
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

  /* ────────────────────────── Explain ────────────────────────── */
  {
    id: 'sample.explain.cart-total',
    type: 'explain',
    title: 'Explain a shopping cart total',
    skills: ['reading.data-flow', 'js.array-methods'],
    prompt: 'Explain what this code does and what value `total` ends up with. Say what each array method receives and returns.',
    code: `const cart = [
  { name: 'Notebook', price: 4, quantity: 3 },
  { name: 'Pen', price: 1.5, quantity: 2 },
];

const total = cart
  .filter((item) => item.quantity > 0)
  .reduce((sum, item) => sum + item.price * item.quantity, 0);`,
    minLength: 80,
    keyPoints: [
      '`filter` keeps the items with a quantity above 0 and returns a **new array** (here both items stay).',
      '`reduce` goes through the items and builds **one** value, starting from `0`.',
      'For each item it adds `price × quantity` to the running sum.',
      '`total` ends up as `15` (4 × 3 + 1.5 × 2).',
      'The original `cart` array is not changed.',
    ],
    modelAnswer: `The code calculates the total price of the cart.

\`filter\` receives the cart and returns a new array with only the items whose quantity is above 0. Both items qualify here.

\`reduce\` then walks through that array with a running sum that starts at \`0\`. For each item it returns \`sum + price × quantity\`, which becomes the \`sum\` for the next item: 0 + 12 = 12, then 12 + 3 = 15.

So \`total\` is \`15\`. Neither method changes the original \`cart\` array.`,
    hints: [
      "The callback of `reduce` receives the result so far (`sum`) and the current item. Whatever it returns becomes `sum` for the next item.",
    ],
  },
];
