/*
 * reading.js — Module 4: Reading and understanding code.
 *
 * Every exercise here is about code you did NOT write: working out what it does,
 * in which order it runs, which function calls which, how data moves, and what
 * a change would break. These are the skills you need to review AI-generated code.
 */

/* ───────────────────────── 1. A method for reading code ───────────────────────── */

const method = {
  slug: 'reading-method',
  title: 'A method for reading unfamiliar code',
  minutes: 20,
  summary: 'Five steps that turn "I have no idea what this does" into a clear summary.',
  sections: [
    {
      kind: 'text',
      text: `Reading code is a skill of its own, and it is different from writing it. Nobody reads code from the first line to the last like a book. Use this method instead:

1. **Find the entry point.** What actually runs first? Look for calls at the top level, event listeners, or the file that loads everything else (in this app: \`js/main.js\`).
2. **Skim the names.** Function and variable names tell you the intended roles. Treat them as claims to check: names can be wrong or outdated.
3. **Read the signature of each function**, and answer three questions:
   - **What goes in?** (parameters, plus anything it reads from outside)
   - **What comes out?** (the return value)
   - **What else changes?** (side effects: the page, storage, the network, objects that were passed in)
4. **Trace one concrete example** with real values. Do it on paper, line by line.
5. **Summarize in one sentence**: "Takes a list of orders and returns the total paid per customer."

If you cannot write the one-sentence summary, you have not understood the code yet. That is useful to know before approving it.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function applyDiscount(cart, code) {
  if (code !== 'AUTUMN10') {
    return false;
  }
  for (const item of cart.items) {
    item.price = item.price * 0.9;
  }
  cart.discountCode = code;
  localStorage.setItem('cart', JSON.stringify(cart));
  return true;
}`,
      notes: [
        { lines: [1], text: '**In:** a cart object and a code (text).' },
        { lines: [2, 4], text: 'An invalid code: nothing changes, and it returns `false`.' },
        { lines: [5, 8], text: '**Side effect:** it changes the cart object that was passed in. Every other variable pointing to that cart sees the new prices too.' },
        { lines: [9], text: '**Side effect:** it also saves to localStorage. The name `applyDiscount` does not say so: worth knowing when you call it.' },
        { lines: [10], text: '**Out:** `true` for success. Summary: "Applies a 10% discount to every item for the code AUTUMN10, saves the cart, and reports whether it worked."' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Reading every line with equal attention', text: 'Find the structure first (entry point, functions, what calls what), then zoom in. The details only make sense once you know where they fit.' },
        { title: 'Trusting names blindly', text: 'A function called `getUser` that also writes to the database is a real and common surprise. Check what it actually does.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.method.summarize',
        type: 'choice',
        title: 'What does it do?',
        skills: ['reading.summarize'],
        prompt: 'Which sentence describes this function correctly?',
        code: `function summarize(orders) {
  const result = {};
  for (const order of orders) {
    if (order.status !== 'paid') continue;
    result[order.customer] = (result[order.customer] ?? 0) + order.total;
  }
  return result;
}`,
        options: [
          { text: 'It returns an object with the **total amount paid per customer**', correct: true, feedback: 'Yes. Only paid orders count, and each customer\'s order totals are added under their name.' },
          { text: 'It counts the **number of orders** per customer', correct: false, feedback: 'Look at what is added on line 5: `order.total`, not 1. It sums amounts, not orders.' },
          { text: 'It returns the total of all paid orders as **one number**', correct: false, feedback: 'The result is an object with one key per customer (`result[order.customer]`), not a single number.' },
          { text: 'It marks every order as paid', correct: false, feedback: 'Line 4 only **reads** `order.status`; nothing is assigned to it. `continue` skips orders that are not paid.' },
        ],
        hints: [
          'Answer the three questions: what goes in, what comes out (line 7), what is added on line 5?',
          'Line 4 skips some orders. Which ones?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.method.side-effects',
        type: 'choice',
        title: 'Spot the side effects',
        skills: ['reading.side-effects'],
        prompt: 'Which of these functions have **side effects**, that is, change something outside themselves?',
        multiple: true,
        code: `function a(list, item) {
  list.push(item);
}

function b(list) {
  return list.filter((x) => x > 0);
}

function c(message) {
  document.querySelector('#status').textContent = message;
}

function d(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

function e(price, rate) {
  return price * (1 + rate);
}`,
        options: [
          { text: '`a`', correct: true, feedback: 'Yes: `push` changes the array the caller passed in.' },
          { text: '`b`', correct: false, feedback: '`filter` creates a **new** array; the original stays the same. `b` only returns a value.' },
          { text: '`c`', correct: true, feedback: 'Yes: it changes the page.' },
          { text: '`d`', correct: true, feedback: 'Yes: it writes to browser storage.' },
          { text: '`e`', correct: false, feedback: 'It only calculates and returns. It is a **pure** function: same input, same output, nothing else changes.' },
        ],
        hints: ['For each function, ask: after calling it, is anything different besides the returned value?'],
        takeaway: 'Functions without side effects (pure functions) are the easiest to read, test and reuse. When a function has side effects, its name should hint at them.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.method.explain-group',
        type: 'explain',
        title: 'Explain a grouping function',
        skills: ['reading.summarize', 'reading.data-flow'],
        prompt: 'Explain what this function receives, what it returns, and what happens to a product without a category. Finish with a one-sentence summary.',
        code: `function groupByCategory(products) {
  const groups = {};
  for (const product of products) {
    const key = product.category ?? 'Other';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(product);
  }
  return groups;
}`,
        minLength: 80,
        keyPoints: [
          'It receives an **array of product objects**.',
          'It returns an **object** whose keys are category names.',
          'Each key holds an **array** of the products in that category.',
          'A product without a category goes into the group "Other".',
          'A one-sentence summary, such as "groups products by category".',
        ],
        modelAnswer: `It receives an array of products and returns an object with one key per category. Each key holds an array of the products in that category.

For each product it determines the key: its category, or "Other" if it has none (\`??\`). If there is no array for that key yet, it creates one. Then it adds the product.

Summary: **it groups products by category**, putting uncategorized products under "Other".`,
        hints: ['Use the three questions: in, out, other changes. Then trace one product without a category.'],
      },
    },
  ],
  keyPoints: [
    'Entry point → names → signatures (in, out, side effects) → trace an example → one-sentence summary.',
    'Treat names as claims to verify.',
    'If you cannot summarize it in one sentence, you have not understood it yet.',
  ],
};

/* ───────────────────────── 2. Execution order ───────────────────────── */

const executionOrder = {
  slug: 'execution-order',
  title: 'Execution order',
  minutes: 25,
  summary: 'What runs when: definitions, calls, callbacks, events and asynchronous code.',
  sections: [
    {
      kind: 'text',
      text: `Code does not simply run from top to bottom. These rules decide the real order:

1. Statements run **top to bottom**, one after another.
2. A function **definition** runs nothing. Only a **call** jumps into the function. When it returns, execution continues right after the call.
3. A **callback** runs when someone calls it:
   - \`map\`, \`filter\` and \`forEach\` call it **immediately**, once per item, before the next line
   - \`addEventListener\` calls it **later**, each time the event happens (maybe never)
   - \`setTimeout\` calls it **later**, after the current code has finished
4. **Asynchronous code:** all synchronous code first, then promise callbacks, then timers. \`await\` pauses only its own function, so the caller continues.

When you read code, number the lines in the order they run. When the order surprises you, add \`console.log('1')\`, \`console.log('2')\`… and check.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `console.log('first');

function greet(name) {
  console.log('second: hello ' + name);
}

const names = ['Ada'];
names.forEach((name) => greet(name));

setTimeout(() => console.log('fourth: timer'), 0);
document.addEventListener('click', () => console.log('only on a click'));

console.log('third');`,
      notes: [
        { lines: [3, 5], text: 'A definition. Nothing is printed here.' },
        { lines: [8], text: '`forEach` calls the arrow function **right now**, which calls `greet`. So "second: hello Ada" is printed before the code continues to line 10.' },
        { lines: [10], text: 'The timer callback is only **scheduled**. It runs after all the synchronous code, so after "third".' },
        { lines: [11], text: 'Registered, not run. It runs each time someone clicks: maybe much later, maybe never.' },
        { lines: [13], text: 'The last synchronous line. After it, the timer callback gets its turn.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.order.event',
        type: 'order',
        title: 'Setup first, click later',
        skills: ['reading.execution-order', 'js.events'],
        prompt: 'The page loads this script, and a few seconds later the user clicks the button once. Put the events in order.',
        code: `const button = document.querySelector('#buy');

function updateTotal() {
  console.log('update total');
}

button.addEventListener('click', () => {
  console.log('clicked');
  updateTotal();
});

console.log('setup done');`,
        steps: [
          'The button is selected with `querySelector`',
          'The click listener is **registered** (it does not run yet)',
          '"setup done" is logged',
          'The user clicks: "clicked" is logged',
          '"update total" is logged',
        ],
        hints: [
          'Defining `updateTotal` does nothing by itself. Registering a listener does not run it either.',
          'Everything at the top level runs when the page loads. The listener\'s code only runs at the click.',
        ],
        explanation: 'Loading the page runs the three top-level statements: select, register, log. The listener body waits until the click, and then it calls `updateTotal`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.order.callbacks',
        type: 'predict',
        title: 'Immediate and later callbacks',
        skills: ['reading.execution-order', 'js.array-methods'],
        prompt: 'What does this code print?',
        code: `const names = ['ada', 'alan'];
console.log('start');

const upper = names.map((name) => {
  console.log('map: ' + name);
  return name.toUpperCase();
});
console.log(upper.join(', '));

setTimeout(() => console.log('timer'), 0);
console.log('end');`,
        expected: 'start\nmap: ada\nmap: alan\nADA, ALAN\nend\ntimer',
        hints: [
          '`map` calls its callback immediately, once per item, before moving on.',
          'The timer callback waits until all other lines have run.',
        ],
        explanation: '`map` runs its callback for both names before the next line, so both "map:" lines come before the joined result. The timer callback runs last, even with a delay of 0.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.order.await',
        type: 'predict',
        title: 'Saving in the background',
        skills: ['reading.execution-order', 'js.async'],
        prompt: 'What does this code print? (The numbers are labels; do not let them decide for you.)',
        code: `async function save() {
  console.log('saving');
  await Promise.resolve();
  console.log('saved');
  return 'ok';
}

console.log('click');
save().then((result) => console.log('result ' + result));
console.log('continue');`,
        expected: 'click\nsaving\ncontinue\nsaved\nresult ok',
        hints: [
          '`save()` runs immediately until its first `await`.',
          'At the `await`, the caller continues. `then` runs after `save` has returned.',
        ],
        explanation: '"saving" is printed as soon as `save()` is called. At the `await` it pauses, so "continue" comes next. Then `save` resumes ("saved") and returns "ok", which the `then` callback receives.',
      },
    },
  ],
  keyPoints: [
    'Definitions run nothing; calls jump in and come back.',
    '`map`/`forEach` callbacks run now; event and timer callbacks run later.',
    'Synchronous code first, then promise callbacks, then timers.',
  ],
};

/* ───────────────────────── 3. Call chains ───────────────────────── */

const callChains = {
  slug: 'call-chains',
  title: 'Call chains and stack traces',
  minutes: 25,
  summary: 'Following which function calls which, and reading error stack traces.',
  sections: [
    {
      kind: 'text',
      text: `When function A calls function B, A **waits** until B returns. If B calls C, both A and B wait. This stack of waiting functions is the **call stack**.

To follow a chain of calls, draw a **call tree**: each function on its own line, with the functions it calls indented below it.

\`\`\`
checkout()
  validateCart(cart)
  calculateTotal(cart)
    priceOf(item)    ← once per item
  showReceipt(total)
\`\`\`

Nested calls like \`format(total(items))\` run **from the inside out**: \`total\` first, because its result is the argument for \`format\`.

**Stack traces** show the call stack at the moment an error happened. The **top** line is where the error occurred; each line below is the function that called the one above it. Look for the first line that is in **your** code: built-in functions like \`Array.map\` are almost never where the bug is.`,
    },
    {
      kind: 'example',
      title: 'A stack trace, read top to bottom',
      language: 'js',
      code: `// Uncaught TypeError: Cannot read properties of undefined (reading 'price')
//     at priceOf (cart.js:12)
//     at Array.map (<anonymous>)
//     at calculateTotal (cart.js:20)
//     at renderCart (cart.js:35)
//     at HTMLButtonElement.<anonymous> (main.js:8)`,
      notes: [
        { lines: [1], text: 'What went wrong: something was `undefined` where an object with `price` was expected.' },
        { lines: [2], text: 'Where: in `priceOf`, line 12 of cart.js. Start reading the code there.' },
        { lines: [3, 4], text: '`calculateTotal` called `map`, which called `priceOf` for each item. One of the items was undefined: maybe the array has an empty slot or a wrong index.' },
        { lines: [5, 6], text: 'How we got here: a button click in main.js called `renderCart`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.calls.order',
        type: 'order',
        title: 'Which function is called when?',
        skills: ['reading.call-chains'],
        prompt: 'Put the function **calls** in the order they start.',
        code: `function main() {
  const order = buildOrder(['pen', 'book']);
  send(order);
}

function buildOrder(items) {
  return { items, total: total(items) };
}

function total(items) {
  return items.reduce((sum, item) => sum + price(item), 0);
}

function price(item) {
  return item === 'pen' ? 2 : 10;
}

function send(order) {
  console.log(order.total);
}

main();`,
        steps: [
          '`main()` is called',
          '`buildOrder` is called',
          '`total` is called',
          "`price('pen')` is called",
          "`price('book')` is called",
          '`send` is called',
        ],
        hints: [
          'Start at the last line. Then follow each call into its function.',
          '`send(order)` needs `order`, which only exists after `buildOrder` (and everything it calls) has returned.',
        ],
        explanation: 'The call tree is: main → buildOrder → total → price × 2, and then main → send. `send` must wait until the whole `buildOrder` branch has returned, because it needs the finished order. It logs 12.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.calls.stack-trace',
        type: 'choice',
        title: 'Read the stack trace',
        skills: ['reading.call-chains', 'debug.reading-errors'],
        prompt: 'Where did this error happen, and how did the program get there?',
        language: 'js',
        code: `Uncaught TypeError: Cannot read properties of null (reading 'textContent')
    at showMessage (ui.js:4)
    at handleSubmit (form.js:18)
    at HTMLFormElement.<anonymous> (form.js:25)`,
        options: [
          { text: 'In `showMessage` (ui.js, line 4), which `handleSubmit` called while handling the form\'s submit event', correct: true, feedback: 'Yes. The top line is where it failed; the lines below show the path. At ui.js:4 a `querySelector` probably returned null.' },
          { text: 'In form.js line 25, where the form listener is', correct: false, feedback: 'That is the **start** of the chain (the bottom line), not where the error happened.' },
          { text: 'In `handleSubmit`, because it is in the middle', correct: false, feedback: '`handleSubmit` only called `showMessage`. The error happened inside `showMessage`.' },
          { text: 'Somewhere in the browser\'s own code', correct: false, feedback: 'All three lines are in your own files. Built-in code would appear as `<anonymous>` or a browser function name.' },
        ],
        hints: ['The top line of a stack trace is where the error happened; read downward to see who called whom.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.calls.nested',
        type: 'predict',
        title: 'Inside out',
        skills: ['reading.call-chains', 'reading.execution-order'],
        prompt: 'What does this code print?',
        code: `function double(n) {
  console.log('double ' + n);
  return n * 2;
}

function addOne(n) {
  console.log('addOne ' + n);
  return n + 1;
}

console.log(double(addOne(double(3))));`,
        expected: 'double 3\naddOne 6\ndouble 7\n14',
        hints: [
          'Start with the innermost call: `double(3)`.',
          'Each result becomes the argument of the call around it.',
        ],
        explanation: 'Inside out: `double(3)` logs and returns 6, `addOne(6)` logs and returns 7, `double(7)` logs and returns 14, and finally the outer `console.log` prints 14.',
      },
    },
  ],
  keyPoints: [
    'A caller waits until the called function returns; draw a call tree to follow chains.',
    'Nested calls run from the inside out.',
    'Stack traces: top line = where it failed; lines below = who called it.',
  ],
};

/* ───────────────────────── 4. Data flow ───────────────────────── */

const dataFlow = {
  slug: 'data-flow',
  title: 'Data flow between functions',
  minutes: 25,
  summary: 'How values travel in and out of functions, and why objects behave differently.',
  sections: [
    {
      kind: 'text',
      text: `To understand a program, follow the **data**: where does a value come from, which functions receive it, and where does it end up?

**In:** an argument is passed into a parameter. The same data often gets a **different name** in each function: \`cart\` in one, \`items\` in the next, \`list\` in a third. Keep track of which names refer to the same thing.

**Out:** \`return\` is the normal way data comes back.

**The important difference:**
- **Primitive values** (numbers, strings, booleans) are **copied** into the parameter. Changing the parameter inside the function never affects the caller.
- **Objects and arrays** are **shared**. The parameter points to the same object, so changing its contents (\`user.name = …\`, \`list.push(…)\`) is visible to the caller.
- But **assigning** a new object to the parameter (\`user = { … }\`) only changes where the local name points. The caller still has the old object.

When AI-generated code has a bug where "the data changes unexpectedly", look for a function that changes an object it received.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function addItem(list, item) {
  list.push(item);
  return list.length;
}

function renameAll(list) {
  list = list.map((x) => x.toUpperCase());
  return list;
}

const cart = ['pen'];
const count = addItem(cart, 'book');   // cart is now ['pen', 'book']
const shouting = renameAll(cart);      // cart is still ['pen', 'book']`,
      notes: [
        { lines: [1, 2], text: '`list` and `cart` are two names for the **same** array, so `push` changes the caller\'s array.' },
        { lines: [7], text: '`map` creates a new array, and `list = …` only changes the local name. `cart` is not affected.' },
        { lines: [11, 13], text: 'Same data, different names: `cart` outside, `list` inside both functions.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.data.mutation',
        type: 'predict',
        title: 'Shared or copied?',
        skills: ['reading.data-flow', 'js.objects'],
        prompt: 'What does this code print?',
        code: `function rename(user, name) {
  user.name = name;
  name = 'changed';
}

function reset(user) {
  user = { name: 'nobody' };
}

const person = { name: 'Ada' };
let newName = 'Grace';

rename(person, newName);
console.log(person.name);
console.log(newName);

reset(person);
console.log(person.name);`,
        expected: 'Grace\nGrace\nGrace',
        hints: [
          '`user` and `person` point to the same object. `name` is a copy of the string in `newName`.',
          'In `reset`, `user = …` gives the local name a new object. Does that change `person`?',
        ],
        explanation: '`rename` changes the shared object, so `person.name` becomes "Grace". Changing the parameter `name` only changes the local copy, so `newName` stays "Grace". `reset` points its local `user` at a new object, and `person` is untouched.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.data.references',
        type: 'predict',
        title: 'Follow the array',
        skills: ['reading.data-flow', 'js.arrays'],
        prompt: 'What does this code print?',
        code: `const cart = ['pen'];

function addItem(list, item) {
  list.push(item);
  return list;
}

const updated = addItem(cart, 'book');
const copy = [...updated];
copy.push('lamp');

console.log(cart.length);
console.log(updated === cart);
console.log(copy.length);`,
        expected: '2\ntrue\n3',
        hints: [
          '`addItem` returns the same array it received.',
          '`[...updated]` creates a new array with the same items.',
        ],
        explanation: '`cart`, `list` and `updated` are three names for one array, which now has 2 items. `copy` is a separate array, so adding "lamp" to it does not change `cart`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.data.pipeline',
        type: 'trace',
        title: 'Trace a value through functions',
        skills: ['reading.data-flow'],
        prompt: 'Trace what each function **receives** and **returns** when the last line runs.',
        code: `function parsePrice(text) {
  return Number(text.replace('€', ''));
}

function addVat(amount) {
  return amount * 1.2;
}

function format(amount) {
  return '€' + amount.toFixed(2);
}

const label = format(addVat(parsePrice('€10')));`,
        columns: ['receives', 'returns'],
        rows: [
          { label: '`parsePrice`', values: ['€10', '10'] },
          { label: '`addVat`', values: ['10', '12'] },
          { label: '`format`', values: ['12', '€12.00'] },
        ],
        hints: [
          'Inside out: which function runs first?',
          '`parsePrice` removes the € sign and converts the text to a number.',
        ],
        explanation: 'The data changes type on the way: text "€10" → number 10 → number 12 → text "€12.00". Following the type at each step is often where bugs become visible.',
      },
    },
  ],
  keyPoints: [
    'Follow the data: where it comes from, which names it gets, where it ends up.',
    'Primitives are copied into parameters; objects and arrays are shared.',
    'Changing an object\'s contents is visible to the caller; assigning a new object to the parameter is not.',
  ],
};

/* ───────────────────────── 5. Trace tables ───────────────────────── */

const traceTables = {
  slug: 'trace-tables',
  title: 'Tracing loops and state',
  minutes: 30,
  summary: 'Trace tables: the paper method for loops and changing values.',
  sections: [
    {
      kind: 'text',
      text: `Loops are hard to read in your head, because several values change in every round. A **trace table** makes it mechanical:

- one **column** per variable that changes
- one **row** per step (usually per round of the loop)
- fill in each row by reading the loop body with the values from the row above

\`\`\`
for (let i = 1; i <= 3; i++) { total += i; }

step          i    total
before loop   -    0
round 1       1    1
round 2       2    3
round 3       3    6
\`\`\`

It feels slow, but it is the most reliable way to find off-by-one errors, wrong conditions, and accumulators in the wrong place. Professional developers do exactly this, on paper or in a debugger.

In this lab's trace exercises, the first row is often filled in for you. Write arrays like \`[a, b]\` and text without quotes.`,
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.trace.loop',
        type: 'trace',
        title: 'Trace a filtering loop',
        skills: ['reading.trace', 'js.loops'],
        prompt: 'Fill in the values after each round of the loop.',
        code: `const prices = [4, 10, 3];
let total = 0;
let count = 0;

for (const price of prices) {
  if (price > 3) {
    total += price;
    count++;
  }
}`,
        columns: ['price', 'total', 'count'],
        rows: [
          { label: 'Before the loop', values: ['—', '0', '0'], given: [0, 1, 2] },
          { label: 'After round 1', values: ['4', '4', '1'] },
          { label: 'After round 2', values: ['10', '14', '2'] },
          { label: 'After round 3', values: ['3', '14', '2'] },
        ],
        hints: [
          'In each round, `price` is the next item. Then check the condition with that value.',
          'In round 3, is `3 > 3`?',
        ],
        explanation: 'Round 3 is the interesting one: `3 > 3` is false, so nothing changes. If the requirement was "prices of 3 or more", the condition should be `>=`. A trace table makes exactly this kind of boundary visible.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.trace.while',
        type: 'trace',
        title: 'Trace a while loop',
        skills: ['reading.trace', 'js.loops', 'js.conditions'],
        prompt: 'Fill in `n` and `steps` after each round. How many rounds does it take?',
        code: `let n = 13;
let steps = 0;

while (n !== 1) {
  if (n % 2 === 0) {
    n = n / 2;
  } else {
    n = n + 1;
  }
  steps++;
}`,
        columns: ['n', 'steps'],
        rows: [
          { label: 'Before the loop', values: ['13', '0'], given: [0, 1] },
          { label: 'After round 1', values: ['14', '1'] },
          { label: 'After round 2', values: ['7', '2'] },
          { label: 'After round 3', values: ['8', '3'] },
          { label: 'After round 4', values: ['4', '4'] },
          { label: 'After round 5', values: ['2', '5'] },
          { label: 'After round 6', values: ['1', '6'] },
        ],
        hints: [
          '`n % 2 === 0` means "n is even". Even numbers are halved, odd numbers get 1 added.',
          'After round 6, `n` is 1, so the condition `n !== 1` is false and the loop ends.',
        ],
        explanation: '13 is odd → 14, even → 7, odd → 8, then 4, 2, 1. After 6 rounds `n` is 1 and the loop stops. Checking the condition after each row is how you know a `while` loop really ends.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.trace.state',
        type: 'trace',
        title: 'Trace changing objects',
        skills: ['reading.trace', 'js.objects', 'js.arrays'],
        prompt: 'An order system processes four orders against the stock. Fill in the state after each order.',
        code: `const stock = { pen: 2, book: 1 };
const failed = [];
const orders = ['pen', 'book', 'book', 'pen'];

for (const item of orders) {
  if (stock[item] > 0) {
    stock[item] -= 1;
  } else {
    failed.push(item);
  }
}`,
        columns: ['item', 'stock.pen', 'stock.book', 'failed'],
        rows: [
          { label: 'Before the loop', values: ['—', '2', '1', '[]'], given: [0, 1, 2, 3] },
          { label: 'After order 1', values: ['pen', '1', '1', '[]'] },
          { label: 'After order 2', values: ['book', '1', '0', '[]'] },
          { label: 'After order 3', values: ['book', '1', '0', '[book]'] },
          { label: 'After order 4', values: ['pen', '0', '0', '[book]'] },
        ],
        hints: [
          '`stock[item]` reads the stock of whichever item this order is for.',
          'Order 3 is a second book, but the stock of books is already 0.',
        ],
        explanation: 'The third order fails because the only book was sold in order 2, so "book" is added to `failed`. The fourth order takes the last pen. Tracing objects works the same way: one column per property that changes.',
      },
    },
  ],
  keyPoints: [
    'One column per changing variable, one row per step.',
    'Fill each row using only the values from the row above.',
    'Check the loop condition after every row, especially at the boundaries.',
  ],
};

/* ───────────────────────── 6. What-if changes ───────────────────────── */

const whatIf = {
  slug: 'what-if',
  title: 'What happens if…?',
  minutes: 25,
  summary: 'Predicting the effect of a change, and testing code with edge cases in your head.',
  sections: [
    {
      kind: 'text',
      text: `Before you change code, or accept a change from AI, ask **"what happens if…?"**:

- **What depends on this?** Search for every place that uses the function or variable you are changing.
- **Boundaries:** \`>\` versus \`>=\`, \`< length\` versus \`<= length\`. Try the exact boundary value.
- **Edge cases:** an empty array, 0, a negative number, an empty string, \`null\` or \`undefined\`, a duplicate, a very large value.
- **Order:** does it matter which condition is checked first, or which line runs first?

This is how you review code without running it. And when you do run it, these are the inputs to try.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function getDiscount(total, isMember) {
  if (isMember) return 0.1;
  if (total >= 100) return 0.05;
  return 0;
}

// What if…
getDiscount(150, true);   // 0.1, not 0.15: discounts do not add up
getDiscount(100, false);  // 0.05: exactly 100 qualifies (>=)
getDiscount(-20, false);  // 0: a negative total is accepted silently
getDiscount(undefined, false); // 0: no error, which might hide a bug`,
      notes: [
        { lines: [2, 3], text: 'The order of the checks decides which discount wins when both apply.' },
        { lines: [8], text: 'A business question hidden in the code: should members with large orders get both?' },
        { lines: [10, 11], text: 'Edge cases the function does not reject. Whether that is OK depends on where the input comes from.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.whatif.boundary',
        type: 'predict',
        title: 'Exactly on the boundary',
        skills: ['reading.what-if', 'js.conditions'],
        prompt: 'The shop promises: "Free shipping from €50". What does this code print?',
        code: `function shipping(total) {
  if (total > 50) return 0;
  if (total > 20) return 3.95;
  return 5.95;
}

console.log(shipping(50));
console.log(shipping(20));
console.log(shipping(0));`,
        highlight: [2, 3],
        expected: '3.95\n5.95\n5.95',
        hints: [
          'Is `50 > 50` true?',
          'Check each call against the conditions in order.',
        ],
        explanation: 'With `>`, exactly €50 is not free, which breaks the shop\'s promise "from €50". The fix is `>=`. Boundary values are where requirements and code most often disagree.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.whatif.reorder',
        type: 'predict',
        title: 'What if the checks are swapped?',
        skills: ['reading.what-if', 'js.conditions'],
        prompt: 'Someone "cleaned up" the function by putting the conditions in ascending order (highlighted). What does it print now?',
        code: `function shipping(total) {
  if (total >= 20) return 3.95;
  if (total >= 50) return 0;
  return 5.95;
}

console.log(shipping(80));
console.log(shipping(30));`,
        highlight: [2, 3],
        expected: '3.95\n3.95',
        hints: [
          'Only the first matching condition runs, because each branch returns.',
          'Is 80 >= 20?',
        ],
        explanation: 'Every total of 20 or more matches the first condition, so the free-shipping line can never be reached. A change that "only reorders" lines can change behavior completely.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.whatif.empty',
        type: 'choice',
        title: 'What if the list is empty?',
        skills: ['reading.what-if', 'reading.edge-cases'],
        prompt: 'What does `average([])` return, and what is the best fix?',
        code: `function average(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}`,
        options: [
          { text: '`NaN` (0 divided by 0). Return early for an empty array, e.g. `if (numbers.length === 0) return 0;` or `null`', correct: true, feedback: 'Yes. `0 / 0` is `NaN`, and NaN then spreads through every calculation that uses it ("Average: NaN"). Decide what an empty list should mean and handle it explicitly.' },
          { text: '`0`, so nothing needs fixing', correct: false, feedback: 'The sum is 0, but dividing by a length of 0 gives NaN, not 0.' },
          { text: 'It throws an error because `reduce` fails on an empty array', correct: false, feedback: 'With a start value (the `0`), `reduce` works on empty arrays. Without it, it would throw.' },
          { text: '`undefined`', correct: false, feedback: 'The function always returns the result of a division, which is a number, even if that number is NaN.' },
        ],
        hints: ['What is the sum of an empty array here? And its length? Divide the two.'],
        takeaway: 'Always ask "what if it is empty?" for every array your code receives.',
      },
    },
  ],
  keyPoints: [
    'Before a change: find everything that depends on it.',
    'Test boundaries (exactly 50) and edge cases (empty, 0, negative, missing) in your head.',
    'Reordering conditions can change behavior completely.',
  ],
};

/* ───────────────────────── 7. A realistic module ───────────────────────── */

const cartModuleCode = `const TAX_RATE = 0.19;
const cart = [];

function findItem(id) {
  return cart.find((item) => item.id === id);
}

export function addToCart(product, quantity = 1) {
  const existing = findItem(product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity });
  }
  render();
}

export function removeFromCart(id) {
  const index = cart.findIndex((item) => item.id === id);
  if (index !== -1) {
    cart.splice(index, 1);
  }
  render();
}

function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function render() {
  const list = document.querySelector('#cart');
  list.replaceChildren(...cart.map((item) => {
    const li = document.createElement('li');
    li.textContent = \`\${item.quantity} × \${item.name}\`;
    return li;
  }));
  const total = subtotal() * (1 + TAX_RATE);
  document.querySelector('#total').textContent = total.toFixed(2);
}`;

const realisticModule = {
  slug: 'realistic-module',
  title: 'Reading a complete module',
  minutes: 35,
  summary: 'Putting it together: a 40-line shopping cart module, read the way a reviewer would.',
  sections: [
    {
      kind: 'text',
      text: `Time to use everything on a realistic piece of code: a shopping cart module, the kind of file an AI tool might generate for you. Read it with the method from lesson 1 before doing the exercises:

1. **Entry points:** which functions can other files call?
2. **Names and roles** of the other functions and of the two constants at the top.
3. **For each function:** in, out, side effects.
4. **Trace** one call of \`addToCart\` with a real product.
5. **Summarize** the module in one sentence.

The same code is shown again in each exercise, so you do not have to scroll back.`,
    },
    {
      kind: 'example',
      title: 'cart.js',
      language: 'js',
      code: cartModuleCode,
      notes: [
        { lines: [1, 2], text: 'Module-level state: the cart array is private to this file, because it is not exported.' },
        { lines: [8], text: 'Exported: other files can call this. `quantity = 1` is a default parameter.' },
        { lines: [9, 14], text: 'Either increases the quantity of an existing item, or adds a new entry.' },
        { lines: [15], text: 'Every change ends with `render()`, so the page always shows the current state.' },
        { lines: [30, 38], text: 'Rebuilds the list from the data and writes the total, including tax.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.module.exports',
        type: 'choice',
        title: 'What can other files use?',
        skills: ['reading.module-structure', 'js.modules'],
        prompt: 'Another file imports from this module. Which functions can it call?',
        multiple: true,
        code: cartModuleCode,
        options: [
          { text: '`addToCart`', correct: true, feedback: 'Exported, so it is part of the module\'s public interface.' },
          { text: '`removeFromCart`', correct: true, feedback: 'Exported as well.' },
          { text: '`findItem`', correct: false, feedback: 'Not exported: an internal helper.' },
          { text: '`subtotal`', correct: false, feedback: 'Not exported. Other files cannot read the subtotal directly, only see it on the page.' },
          { text: '`render`', correct: false, feedback: 'Not exported. It is called automatically after every change.' },
        ],
        hints: ['Look for the word `export`.'],
        takeaway: 'The exports are the entry points. Start reading a module there.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.module.calls',
        type: 'order',
        title: 'Follow one call',
        skills: ['reading.call-chains', 'reading.execution-order'],
        prompt: 'The cart is empty. Another file calls `addToCart({ id: 1, name: \'Pen\', price: 2 })`. Put the steps in order.',
        code: cartModuleCode,
        steps: [
          '`addToCart` is called with quantity 1 (the default)',
          '`findItem(1)` is called and returns `undefined`',
          'A new item is pushed into `cart`',
          '`render()` is called and rebuilds the list',
          '`subtotal()` is called',
          'The total, with tax, is written into `#total`',
        ],
        hints: [
          'The cart is empty, so which branch of the `if` runs?',
          'Inside `render`, the list is rebuilt before the total is calculated.',
        ],
        explanation: 'The `else` branch runs because `findItem` finds nothing in the empty cart. `render` then rebuilds the list, and on line 37 calls `subtotal()` to calculate the total.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.module.total',
        type: 'predict',
        title: 'What does the page show?',
        skills: ['reading.trace', 'reading.data-flow'],
        prompt: `Starting with an empty cart, another file runs these calls:

\`\`\`js
addToCart({ id: 1, name: 'Pen', price: 2 });
addToCart({ id: 2, name: 'Book', price: 10 });
addToCart({ id: 1, name: 'Pen', price: 2 }, 3);
removeFromCart(2);
\`\`\`

What text is in \`#total\` at the end?`,
        code: cartModuleCode,
        expected: '9.52',
        answerLabel: 'The text in #total',
        answerHelp: 'Just the number, as shown on the page',
        hints: [
          'Track the cart after each call: which items, which quantities?',
          'At the end there are 4 pens at €2. Then the tax is added, and `toFixed(2)` formats it.',
        ],
        explanation: 'Pen ×1, then Book ×1, then 3 more pens (pen ×4), then the book is removed. Subtotal: 4 × 2 = 8. With 19% tax: 8 × 1.19 = 9.52.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'reading.module.explain',
        type: 'explain',
        title: 'Explain the "already in the cart" case',
        skills: ['reading.summarize', 'reading.data-flow'],
        prompt: 'Explain step by step what happens when `addToCart` is called for a product that is **already** in the cart. Mention which data changes, and what the user sees.',
        code: cartModuleCode,
        minLength: 100,
        keyPoints: [
          '`findItem` finds the existing entry in the `cart` array.',
          'The existing entry\'s `quantity` is increased by the `quantity` argument (1 by default).',
          'No new entry is added: the cart keeps one entry per product.',
          'Because `existing` is the same object as the one in `cart`, the change is visible in the cart without writing it back.',
          '`render()` rebuilds the list and recalculates the total with tax, so the page shows the new quantity.',
        ],
        modelAnswer: `\`findItem(product.id)\` looks through \`cart\` and returns the matching entry. Because the product is already there, \`existing\` is that entry: the **same object** that is in the array.

So \`existing.quantity += quantity\` directly changes the item inside the cart (by 1, unless a quantity was passed). No new entry is pushed, which keeps one line per product.

Finally \`render()\` rebuilds the list from the cart, so the user sees for example "4 × Pen", and it recalculates the total including 19% tax.`,
        hints: ['Trace it with a concrete example: the cart contains 1 pen, and you add 1 more.'],
      },
    },
  ],
  keyPoints: [
    'Start with the exports: they are the module\'s entry points.',
    'Track module-level state (here: `cart`), and which functions change it.',
    'Changes end in `render()`: the page is always rebuilt from the data.',
  ],
};

export const readingLessons = [
  method,
  executionOrder,
  callChains,
  dataFlow,
  traceTables,
  whatIf,
  realisticModule,
];
