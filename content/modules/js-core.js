/*
 * js-core.js — Module 3, part 1: the JavaScript language.
 *
 * Order matters: functions come early (lesson 5), so from then on every
 * exercise is "write a function", which the tests can call with many inputs.
 *
 * Reminders for test authors (see js/services/test-runner.js):
 *   - Top-level `let`/`const`/`function` in the learner's code are visible to tests.
 *   - `logs` holds every console.log line as text, e.g. "Start: 10".
 *   - Assigning to a `const` throws a TypeError; tests use that to check const.
 */

/* ───────────────────────── 1. let and const ───────────────────────── */

const variables = {
  slug: 'variables',
  title: 'Variables: let and const',
  minutes: 15,
  summary: 'Giving values a name, and choosing between let and const.',
  sections: [
    {
      kind: 'text',
      text: `A **variable** is a name for a value, so you can use it later and change it in one place.

\`\`\`js
const city = 'Berlin';
let temperature = 12;
\`\`\`

- \`const\` creates a name that can **not** be assigned a new value. Use it by default: most values in a program never change, and \`const\` makes that clear to the reader.
- \`let\` creates a name whose value **can** change later: a counter, a running total, the current step.
- \`var\` is the old way. It has confusing rules, so do not use it. You will still see it in older code and tutorials.

Names use **camelCase** (\`totalPrice\`, \`isLoggedIn\`) and should say what the value means. \`x\` and \`data2\` force every reader to guess.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const vatRate = 0.19;
let total = 0;

total = total + 20;
total = total + 5;

console.log(total);            // 25
console.log(total * vatRate);  // 4.75

vatRate = 0.2; // TypeError: Assignment to constant variable.`,
      notes: [
        { lines: [1], text: 'This rate never changes while the program runs, so it is a `const`.' },
        { lines: [2], text: 'The total changes, so it needs `let`. It starts at 0.' },
        { lines: [4, 5], text: 'Read the right side first: take the current total, add 20, and store the result back in `total`.' },
        { lines: [10], text: 'Giving a `const` a new value is an error. The program stops at this line.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Using let everywhere "just in case"', text: 'Then a reader cannot see which values change. Start with `const`; switch to `let` only when you need to reassign.' },
        { title: 'Declaring the same name twice', text: '`let total = 0;` and later `let total = 5;` in the same block is a SyntaxError. To change it, leave out the `let`: `total = 5;`.' },
        { title: 'Using a variable before its declaration', text: '`let` and `const` exist only from their line onward. Using them earlier gives "Cannot access … before initialization".' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.variables.trace',
        type: 'predict',
        title: 'Follow the values',
        skills: ['js.variables'],
        prompt: 'What does this code print?',
        code: `let count = 1;
const step = 2;

count = count + step;
count = count + step;
console.log(count);

let message = 'Total: ' + count;
console.log(message);`,
        expected: '5\nTotal: 5',
        hints: [
          'Write `count` on paper and update it after every line that changes it.',
          '`count = count + step` takes the current value, adds 2, and stores the result. It happens twice.',
        ],
        explanation: '`count` goes 1 → 3 → 5. Then `\'Total: \' + count` joins the text and the number into one string.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.variables.fix-const',
        type: 'code',
        title: 'Fix the constant that changes',
        skills: ['js.variables', 'debug.reading-errors'],
        prompt: `Run the code first and read the error in the console. Then fix it so that it prints:

\`\`\`
Start: 10
After bonus: 15
\`\`\`

Only change what is necessary. \`playerName\` never changes, so it should stay a \`const\`.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const playerName = 'Sam';
const score = 10;
console.log('Start:', score);

score = score + 5;
console.log('After bonus:', score);
`,
        },
        tests: [
          {
            name: 'The code prints "Start: 10" and "After bonus: 15"',
            run: ({ expect, logs }) => expect(logs.slice(0, 2), 'Check the console output').toEqual(['Start: 10', 'After bonus: 15']),
          },
          {
            name: 'score ends at 15',
            run: ({ expect }) => expect(score).toBe(15),
          },
          {
            name: 'playerName is still a const',
            run: ({ expect }) => {
              let isConst = false;
              try { playerName = 'x'; } catch (error) { isConst = error instanceof TypeError; }
              expect(isConst, 'Keep playerName as const: it never changes').toBe(true);
            },
          },
        ],
        pitfalls: [
          { pattern: /\bvar\s/, message: 'Use `let` instead of `var`. `var` has older, confusing scoping rules.' },
        ],
        hints: [
          'The console says "Assignment to constant variable". Which variable gets a new value?',
          '`score` changes on line 5, so it cannot be a `const`.',
          'Change only the declaration on line 2.',
        ],
        solution: {
          js: `const playerName = 'Sam';
let score = 10;
console.log('Start:', score);

score = score + 5;
console.log('After bonus:', score);
`,
        },
        explanation: '`score` is reassigned, so it must be declared with `let`. `playerName` is never reassigned, so `const` correctly tells readers "this stays the same".',
        takeaway: '"Assignment to constant variable" means: either the variable should be `let`, or the code should not be changing it. Decide which is true.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.variables.write',
        type: 'code',
        title: 'Your first variables',
        skills: ['js.variables'],
        prompt: `Write the code yourself:

1. Create a constant \`city\` with the value \`'Berlin'\`.
2. Create a variable \`temperature\` with the value \`12\`.
3. Increase \`temperature\` by 3.
4. Print \`Berlin: 15°C\`, built from the two variables (join them with \`+\`).`,
        files: ['js'],
        preview: false,
        starter: { js: '// your code here\n' },
        tests: [
          {
            name: 'city is a const with the value "Berlin"',
            run: ({ expect }) => {
              expect(city, 'Create const city = \'Berlin\'').toBe('Berlin');
              let isConst = false;
              try { city = 'x'; } catch (error) { isConst = true; }
              expect(isConst, 'city should be a const').toBe(true);
            },
          },
          {
            name: 'temperature is 15 at the end',
            run: ({ expect }) => expect(temperature, 'Start at 12 and add 3').toBe(15),
          },
          {
            name: 'The console shows "Berlin: 15°C"',
            run: ({ expect, logs }) => expect(logs, 'Print exactly: Berlin: 15°C').toContain('Berlin: 15°C'),
          },
        ],
        pitfalls: [
          { pattern: /['"]Berlin: 15/, message: 'Build the text from the variables (`city + \': \' + …`) instead of typing it out. The point is that it updates when the values change.' },
        ],
        hints: [
          'Which of the two values changes? That one needs `let`.',
          'Increase with `temperature = temperature + 3;`. Text and numbers are joined with `+`.',
          "The last line: `console.log(city + ': ' + temperature + '°C');`",
        ],
        solution: {
          js: `const city = 'Berlin';
let temperature = 12;

temperature = temperature + 3;

console.log(city + ': ' + temperature + '°C');
`,
        },
        explanation: 'Because the output is built from the variables, changing the starting temperature updates the message automatically. In the next lesson you will learn a neater way to build such text: template literals.',
      },
    },
  ],
  keyPoints: [
    '`const` by default; `let` when the value must change; never `var`.',
    'Read assignments right to left: compute the right side, then store it.',
    'Names in camelCase that describe the meaning.',
  ],
};

/* ───────────────────────── 2. Data types ───────────────────────── */

const dataTypes = {
  slug: 'data-types',
  title: 'Data types',
  minutes: 15,
  summary: 'Strings, numbers, booleans, null and undefined, and why "5" is not 5.',
  sections: [
    {
      kind: 'text',
      text: `Every value has a **type**. The basic ones:

- **string**: text, in quotes: \`'hello'\`, \`"42"\`
- **number**: \`42\`, \`3.14\`, \`-1\`. JavaScript has one number type for whole and decimal numbers.
- **boolean**: \`true\` or \`false\`
- **undefined**: "no value yet", e.g. a variable that was declared but never given a value
- **null**: "intentionally empty", set on purpose by a programmer

Everything else is an **object**: arrays, objects, functions, dates. You will meet these soon.

\`typeof value\` tells you the type as a string. A variable can hold any type, and can even change type. That flexibility is also a common source of bugs.

The most important rule: **everything that comes from a form field, a URL or localStorage is a string**, even if it looks like a number.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `console.log(typeof 'hello');   // "string"
console.log(typeof 42);        // "number"
console.log(typeof false);     // "boolean"

let nothingYet;
console.log(nothingYet);       // undefined

console.log('5' + 3);          // "53"
console.log(Number('5') + 3);  // 8`,
      notes: [
        { lines: [1, 3], text: '`typeof` returns the type name as a string.' },
        { lines: [5, 6], text: 'Declared without a value, so it is `undefined`.' },
        { lines: [8], text: 'With a string involved, `+` **joins text**: "5" + 3 becomes "53". This is one of the most common beginner bugs.' },
        { lines: [9], text: '`Number()` converts the string to a number first, so `+` adds.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Adding form values', text: '`input.value + 1` gives "41" instead of 5 when the input contains 4. Convert first: `Number(input.value) + 1`.' },
        { title: '`typeof null` is "object"', text: 'This is a famous mistake in the language that can never be fixed. To check for null, compare directly: `value === null`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.types.typeof',
        type: 'predict',
        title: 'What type is it?',
        skills: ['js.data-types'],
        prompt: 'What does this code print?',
        code: `console.log(typeof 42);
console.log(typeof '42');
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof [1, 2]);
console.log(typeof null);`,
        expected: 'number\nstring\nboolean\nundefined\nobject\nobject',
        hints: [
          'Quotes make a string, whatever is inside them.',
          'Arrays are a kind of object. And remember the famous quirk of `null`.',
        ],
        explanation: '`\'42\'` is a string because of the quotes. Arrays are objects (use `Array.isArray()` to check for an array). And `typeof null` is "object": a bug from 1995 that stays for compatibility.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.types.convert',
        type: 'code',
        title: 'Strings that look like numbers',
        skills: ['js.data-types', 'js.numbers'],
        prompt: 'These values came from two form fields, so they are strings. The code should print `15`, but it prints `105`. Fix it, so that `sum` is the **number** 15.',
        files: ['js'],
        preview: false,
        starter: {
          js: `const a = '10'; // from a form field
const b = '5';  // from a form field

const sum = a + b;
console.log(sum);
`,
        },
        tests: [
          {
            name: 'sum is the number 15',
            run: ({ expect }) => {
              expect(typeof sum, 'Convert the strings to numbers before adding').toBe('number');
              expect(sum).toBe(15);
            },
          },
          {
            name: 'The console shows 15',
            run: ({ expect, logs }) => expect(logs[0]).toBe('15'),
          },
          {
            name: 'a and b are still the original strings',
            run: ({ expect }) => expect([a, b], 'Do not change the input values, convert them where you add').toEqual(['10', '5']),
          },
        ],
        hints: [
          'What does `+` do when one side is a string?',
          'Convert each string with `Number(…)` before adding.',
        ],
        solution: {
          js: `const a = '10'; // from a form field
const b = '5';  // from a form field

const sum = Number(a) + Number(b);
console.log(sum);
`,
        },
        explanation: 'With a string on either side, `+` joins text. `Number()` turns "10" into 10, and then `+` adds. `parseInt(a)` or `parseFloat(a)` also work, and are more forgiving with extra characters like "10px".',
        takeaway: 'When numbers come out wrong in a strange way ("105", "41"), suspect strings. Check with `typeof`.',
      },
    },
  ],
  keyPoints: [
    'Basic types: string, number, boolean, undefined, null. Everything else is an object.',
    'Values from forms, URLs and localStorage are strings.',
    '`+` with a string joins text; convert with `Number()` first.',
  ],
};

/* ───────────────────────── 3. Strings and numbers ───────────────────────── */

const stringsNumbers = {
  slug: 'strings-and-numbers',
  title: 'Strings and numbers',
  minutes: 25,
  summary: 'Template literals, the most useful string methods, and number gotchas.',
  sections: [
    {
      kind: 'text',
      text: `**Template literals** use backticks and \`\${…}\` to put values into text. They are much easier to read than joining with \`+\`:

\`\`\`js
const name = 'Ada';
const visits = 3;
console.log(\`Hi \${name}, visit number \${visits}\`);
\`\`\`

Useful **string** tools:
- \`text.length\`: the number of characters. \`text[0]\` is the first character.
- \`toUpperCase()\`, \`toLowerCase()\`, \`trim()\` (removes spaces at both ends)
- \`includes('x')\`, \`startsWith('x')\`, \`endsWith('x')\`
- \`slice(start, end)\`: part of the text. \`split(' ')\`: cut into an array.

Strings **never change**: methods return a **new** string. \`name.trim()\` does nothing useful unless you store or use its result.

Useful **number** tools: \`%\` (remainder), \`Math.round()\`, \`Math.floor()\`, \`Math.max()\`, and \`n.toFixed(2)\` for display. Watch out: \`toFixed\` returns a **string**.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const raw = '  grace HOPPER ';
const clean = raw.trim().toLowerCase();
console.log(clean);                 // "grace hopper"

const first = clean[0].toUpperCase() + clean.slice(1);
console.log(first);                 // "Grace hopper"

const price = 4.5;
console.log(\`Price: €\${price.toFixed(2)}\`);  // "Price: €4.50"

console.log(17 % 5);                // 2
console.log(0.1 + 0.2);             // 0.30000000000000004`,
      notes: [
        { lines: [2], text: 'Methods can be **chained**: `trim()` returns a new string, and `toLowerCase()` is called on that result.' },
        { lines: [5], text: 'Capitalize: the first character in upper case, plus the rest from position 1.' },
        { lines: [9], text: 'A template literal with `toFixed(2)`, which always shows two decimals.' },
        { lines: [11], text: '`%` gives the remainder of a division. `n % 2 === 0` tests for even numbers.' },
        { lines: [12], text: 'Computers store decimals in binary, so tiny rounding errors appear. For money, round when you display, or calculate in cents.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Expecting a method to change the string', text: '`name.trim();` on its own line does nothing visible. Use the result: `name = name.trim();` or `const clean = name.trim();`.' },
        { title: 'Calculating with toFixed', text: '`price.toFixed(2) + 1` gives "4.501", because `toFixed` returns a string. Use it only at the very end, for display.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.strings.greeting',
        type: 'code',
        title: 'A clean greeting',
        skills: ['js.strings'],
        prompt: `A name came from a form, with extra spaces and in lower case. Using the two given variables, print exactly:

\`\`\`
Welcome back, Ada! This is visit number 3.
\`\`\`

Use a template literal. The name must be trimmed, with its first letter in upper case.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const firstName = '  ada ';
const visits = 3;

// your code here
`,
        },
        tests: [
          {
            name: 'The console shows the exact greeting',
            run: ({ expect, logs }) => expect(logs[0], 'Check spaces and punctuation').toBe('Welcome back, Ada! This is visit number 3.'),
          },
        ],
        pitfalls: [
          { pattern: /['"`]Welcome back, Ada/, message: 'Do not type "Ada" yourself: build it from `firstName`, so it works for every name.' },
          { pattern: /`/, absent: true, message: 'The task asks for a template literal: text in backticks with `${…}` for the values.' },
        ],
        hints: [
          'Two steps: first make a clean version of the name, then build the sentence.',
          '`trim()` removes the spaces. `name[0].toUpperCase() + name.slice(1)` capitalizes.',
          `\`\`\`js
const name = firstName.trim();
const capitalized = /* first letter in upper case + the rest */;
console.log(\`Welcome back, \${capitalized}! …\`);
\`\`\``,
        ],
        solution: {
          js: `const firstName = '  ada ';
const visits = 3;

const name = firstName.trim();
const capitalized = name[0].toUpperCase() + name.slice(1);

console.log(\`Welcome back, \${capitalized}! This is visit number \${visits}.\`);
`,
        },
        explanation: 'Splitting it into small named steps (`name`, `capitalized`) makes each line easy to check. You could write it as one long expression, but you would not be able to read it next week.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.numbers.predict',
        type: 'predict',
        title: 'Number surprises',
        skills: ['js.numbers', 'js.strings'],
        prompt: 'What does this code print?',
        code: `const price = 19.999;
console.log(price.toFixed(2));
console.log(Math.round(price));
console.log(7 % 3);
console.log('abc'.length + 1);
console.log(0.1 + 0.2 === 0.3);`,
        expected: '20.00\n20\n1\n4\nfalse',
        hints: [
          '`toFixed(2)` rounds to two decimals, and always shows both of them.',
          '`7 % 3` is what is left after dividing 7 by 3 as often as possible. And remember the 0.30000000000000004.',
        ],
        explanation: '19.999 rounded to two decimals is 20.00, and to a whole number 20. 7 = 2 × 3 + **1**. "abc" has 3 characters, plus 1 is 4. And 0.1 + 0.2 is 0.30000000000000004, which is not exactly 0.3.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.numbers.price',
        type: 'code',
        title: 'Calculate a price with VAT',
        skills: ['js.numbers', 'js.strings'],
        prompt: `Calculate the gross price (net price plus VAT) and print it with two decimals:

\`\`\`
Total: €23.80
\`\`\`

Use the two given variables. Store the result in a constant \`gross\` that is a **number**.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const net = 20;
const vatRate = 0.19;

// your code here
`,
        },
        tests: [
          {
            name: 'gross is the number 23.8',
            run: ({ expect }) => {
              expect(typeof gross, 'Keep gross a number. Use toFixed only when printing').toBe('number');
              expect(gross).toBeCloseTo(23.8);
            },
          },
          {
            name: 'The console shows "Total: €23.80"',
            run: ({ expect, logs }) => expect(logs[0]).toBe('Total: €23.80'),
          },
        ],
        hints: [
          'Gross = net plus net × rate. Or shorter: net × (1 + rate).',
          'Display with two decimals using `gross.toFixed(2)` inside a template literal.',
        ],
        solution: {
          js: `const net = 20;
const vatRate = 0.19;

const gross = net * (1 + vatRate);

console.log(\`Total: €\${gross.toFixed(2)}\`);
`,
        },
        explanation: 'The calculation stays a number; only the display is formatted. `toFixed(2)` turns 23.8 into "23.80". Keeping calculation and display apart is a habit that prevents many bugs.',
      },
    },
  ],
  keyPoints: [
    'Template literals: backticks with `${value}`.',
    'String methods return a new string; use the result.',
    '`toFixed()` returns a string: format at the end, for display only.',
  ],
};

/* ───────────────────────── 4. Operators ───────────────────────── */

const operators = {
  slug: 'operators',
  title: 'Operators',
  minutes: 20,
  summary: 'Arithmetic, comparisons, logic, and why you always use ===.',
  sections: [
    {
      kind: 'text',
      text: `**Arithmetic:** \`+ - * / % **\` (\`**\` is "to the power of").
**Assignment shortcuts:** \`total += 5\` means \`total = total + 5\`. Also \`-=\`, \`*=\`, and \`count++\` (add 1).

**Comparison** gives \`true\` or \`false\`: \`< > <= >=\`, and:
- \`===\`: equal, **and** the same type. \`5 === '5'\` is \`false\`.
- \`!==\`: not equal.
- Avoid \`==\` and \`!=\`. They convert types first, with surprising results (\`'' == 0\` is \`true\`).

**Logical operators** combine conditions:
- \`a && b\`: true only if **both** are true
- \`a || b\`: true if **at least one** is true
- \`!a\`: the opposite

**\`??\`** (nullish coalescing) gives a fallback only when the value is \`null\` or \`undefined\`: \`quantity ?? 1\`. \`||\` would also replace \`0\` and \`''\`, which is often wrong.

When combining, use **parentheses** to make the order obvious: \`hasTicket && (age >= 18 || hasConsent)\`.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `let stock = 10;
stock -= 3;                         // 7
stock++;                            // 8

const isLow = stock < 10;           // true
const isExact = stock === '8';      // false: number vs string

const age = 16;
const hasConsent = true;
const mayEnter = age >= 18 || hasConsent;   // true

const savedQuantity = 0;
console.log(savedQuantity || 1);    // 1  (0 counts as "false")
console.log(savedQuantity ?? 1);    // 0  (only null/undefined are replaced)`,
      notes: [
        { lines: [2, 3], text: 'Shortcuts for changing a variable based on its own value.' },
        { lines: [5, 6], text: 'Comparisons produce booleans you can store in well-named variables.' },
        { lines: [10], text: '`||`: one true side is enough.' },
        { lines: [13, 14], text: 'The difference between `||` and `??` matters when 0 or an empty string are valid values.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: '`=` instead of `===`', text: '`if (status = \'done\')` **assigns** "done" instead of comparing, and is always true. One `=` assigns; three compare.' },
        { title: 'Mixing && and || without parentheses', text: '`&&` binds stronger than `||`, like × before +. Add parentheses whenever both appear, so readers do not have to remember the rule.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.operators.predict',
        type: 'predict',
        title: 'Comparisons and combinations',
        skills: ['js.operators'],
        prompt: 'What does this code print?',
        code: `console.log(5 == '5');
console.log(5 === '5');
console.log(3 + 4 + '1');
console.log('1' + 3 + 4);
console.log(0 || 'default');
console.log(0 ?? 'default');`,
        expected: 'true\nfalse\n71\n134\ndefault\n0',
        hints: [
          '`==` converts types before comparing; `===` does not.',
          '`+` is evaluated from left to right. Once one side is a string, `+` joins text from then on.',
          '`||` replaces every falsy value (like 0); `??` replaces only null and undefined.',
        ],
        explanation: '3 + 4 is 7 (two numbers), then 7 + "1" joins to "71". In the other line, "1" + 3 is already a string, "13", and + 4 gives "134". `0 || \'default\'` replaces 0, but `0 ?? \'default\'` keeps it.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.operators.stock',
        type: 'code',
        title: 'Update the stock',
        skills: ['js.operators', 'js.variables'],
        prompt: `Complete the code:

1. A customer buys 3 items: reduce \`stock\` by 3, using \`-=\`.
2. A delivery arrives with 12 items: increase \`stock\`, using \`+=\`.
3. Create a constant \`needsReorder\` that is \`true\` when \`stock\` is **below 15**, and \`false\` otherwise.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `let stock = 10;

// 1.

// 2.

// 3.

console.log(stock);
console.log(needsReorder);
`,
        },
        tests: [
          {
            name: 'stock ends at 19',
            run: ({ expect }) => expect(stock, '10 − 3 + 12').toBe(19),
          },
          {
            name: 'needsReorder is false (19 is not below 15)',
            run: ({ expect }) => expect(needsReorder).toBe(false),
          },
          {
            name: 'needsReorder is a comparison, not a fixed value',
            run: ({ expect }) => {
              const source = [...document.scripts].map((s) => s.textContent).join('\n');
              expect(/needsReorder\s*=\s*(true|false)\s*;/.test(source), 'Write the comparison (stock < 15), so it stays correct when stock changes').toBe(false);
            },
          },
        ],
        pitfalls: [
          { pattern: /stock\s*=\s*\d/, message: 'Do not overwrite `stock` with a number you calculated in your head. Use `-=` and `+=`, so the code works for any starting value.' },
        ],
        hints: [
          '`stock -= 3` means "take stock, subtract 3, store it back".',
          'A comparison like `stock < 15` already **is** true or false, so you can store it directly.',
          '`const needsReorder = stock < 15;`',
        ],
        solution: {
          js: `let stock = 10;

// 1.
stock -= 3;

// 2.
stock += 12;

// 3.
const needsReorder = stock < 15;

console.log(stock);
console.log(needsReorder);
`,
        },
        explanation: 'Beginners often write `if (stock < 15) { needsReorder = true } else { … }`. That works, but the comparison already produces the boolean you need.',
      },
    },
  ],
  keyPoints: [
    'Always `===` and `!==`, never `==` and `!=`.',
    '`&&` = both, `||` = at least one, `!` = the opposite. Use parentheses when mixing.',
    '`??` for defaults when 0 or an empty string are valid values.',
  ],
};

/* ───────────────────────── 5. Functions ───────────────────────── */

const functions = {
  slug: 'functions',
  title: 'Functions',
  minutes: 20,
  summary: 'Packaging code under a name, and the difference between defining and calling.',
  sections: [
    {
      kind: 'text',
      text: `A **function** is a named piece of code you can run whenever you need it. Using a function has **two separate steps**:

1. **Defining** it: this only stores the code. Nothing runs yet.
2. **Calling** it: the name followed by parentheses, \`greet()\`. Only now does the code inside run.

\`\`\`js
function greet() {          // 1. define
  console.log('Hello!');
}

greet();                    // 2. call
greet();                    //    and again
\`\`\`

There is a second, shorter way to write functions, the **arrow function**. You will see it everywhere in modern code:

\`\`\`js
const greet = () => {
  console.log('Hello!');
};
\`\`\`

Name functions after what they **do**, usually with a verb: \`calculateTotal\`, \`showError\`, \`isValidEmail\`.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function showWelcome() {
  console.log('Welcome to Café Lumen');
  console.log('Open daily 8:00–18:00');
}

console.log('Page loaded');
showWelcome();
showWelcome;
console.log('Done');`,
      notes: [
        { lines: [1, 4], text: 'Defining the function. Running the script does not print anything for these lines.' },
        { lines: [6], text: 'The first line that actually runs prints "Page loaded".' },
        { lines: [7], text: 'Calling it: the two lines inside run now, and then execution continues on line 8.' },
        { lines: [8], text: 'Without `()`, the function is only **mentioned**, not called. This line does nothing. A classic mistake.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting the parentheses', text: '`button.addEventListener(\'click\', save())` calls `save` immediately, once, instead of on each click. And `showWelcome;` on its own calls nothing. With `()` = run now; without = refer to it.' },
        { title: 'Defining but never calling', text: 'If "nothing happens", check whether the function is called at all. Put a `console.log` at its first line.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.functions.predict',
        type: 'predict',
        title: 'Defined, mentioned or called?',
        skills: ['js.functions'],
        prompt: 'What does this code print?',
        code: `function shout() {
  console.log('HEY');
}

console.log('start');
shout;
shout();
console.log('end');`,
        expected: 'start\nHEY\nend',
        hints: [
          'The function definition does not print anything by itself.',
          'Only one of the two `shout` lines actually calls the function.',
        ],
        explanation: '`shout;` only refers to the function; `shout();` calls it. So "HEY" is printed exactly once, between "start" and "end".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.functions.write',
        type: 'code',
        title: 'Write and call a function',
        skills: ['js.functions'],
        prompt: 'Write a function `sayHello` that prints `Hello!` to the console. Then **call it twice**, so that "Hello!" appears two times.',
        files: ['js'],
        preview: false,
        starter: { js: '// define sayHello here\n\n\n// call it twice here\n' },
        tests: [
          {
            name: 'sayHello is a function',
            run: ({ expect }) => expect(typeof sayHello, 'Define a function named exactly sayHello').toBe('function'),
          },
          {
            name: 'Your code prints "Hello!" exactly twice',
            run: ({ expect, logs }) => expect(logs.filter((line) => line === 'Hello!').length, 'Call the function two times').toBe(2),
          },
          {
            name: 'Calling sayHello() prints "Hello!"',
            run: ({ expect, logs }) => {
              const before = logs.length;
              sayHello();
              expect(logs.slice(before)).toEqual(['Hello!']);
            },
          },
        ],
        pitfalls: [
          { pattern: /console\.log\(\s*['"]Hello!['"]\s*\)[\s\S]*console\.log\(\s*['"]Hello!['"]\s*\)/, message: 'Write `console.log` only once, inside the function. Then call the function twice.' },
        ],
        hints: [
          'First the definition: `function sayHello() { … }`. Then two calls below it.',
          'A call is the name plus parentheses: `sayHello();`',
        ],
        solution: {
          js: `function sayHello() {
  console.log('Hello!');
}

sayHello();
sayHello();
`,
        },
        explanation: 'The code inside the function is written once, but runs every time the function is called. That is the whole point of functions: write once, use many times.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
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
    },
  ],
  keyPoints: [
    'Defining a function stores the code; calling it with `()` runs it.',
    '`name()` runs the function; `name` without parentheses only refers to it.',
    'Name functions with a verb that says what they do.',
  ],
};

/* ───────────────────────── 6. Parameters and return values ───────────────────────── */

const returnValues = {
  slug: 'parameters-and-return',
  title: 'Parameters and return values',
  minutes: 25,
  summary: 'Giving a function input, and getting a result back.',
  sections: [
    {
      kind: 'text',
      text: `A function becomes really useful when it takes **input** and gives back **output**.

\`\`\`js
function calculateTotal(price, quantity) {   // parameters
  return price * quantity;                   // return value
}

const total = calculateTotal(4.5, 3);        // arguments
console.log(total);                          // 13.5
\`\`\`

- **Parameters** are the names in the definition: \`price\`, \`quantity\`. They work like variables inside the function.
- **Arguments** are the actual values you pass in the call: \`4.5\`, \`3\`. They are matched **by position**: first to first.
- **\`return\`** sends a value back to where the function was called, and **stops** the function immediately.

A function without \`return\` gives back \`undefined\`.

**\`console.log\` is not \`return\`.** \`console.log\` only shows a value on screen for you, the developer. \`return\` hands the value to the code that called the function, which can then store it, calculate with it or display it.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function formatPrice(amount, currency = '€') {
  return currency + amount.toFixed(2);
}

const shown = formatPrice(4.5);
console.log(shown);                  // "€4.50"
console.log(formatPrice(10, '$'));   // "$10.00"

const isAdult = (age) => age >= 18;
console.log(isAdult(20));            // true`,
      notes: [
        { lines: [1], text: '`currency = \'€\'` is a **default value**: used when no second argument is given.' },
        { lines: [2], text: '`return` gives the finished text back to the caller.' },
        { lines: [5], text: 'The returned value is stored in a variable.' },
        { lines: [9], text: 'An arrow function with one expression and no `{ }` **returns that expression automatically**.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'console.log instead of return', text: 'The function "works" when you look at the console, but `const total = calculateTotal(2, 3)` is `undefined`. The single most common function mistake.' },
        { title: 'Code after return', text: '`return` ends the function. Any lines after it in the same block never run.' },
        { title: 'Arrow functions with braces', text: '`(a, b) => { a + b }` returns `undefined`: with `{ }` you need to write `return`. Without braces, `(a, b) => a + b` returns automatically.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.return.predict',
        type: 'predict',
        title: 'Log or return?',
        skills: ['js.functions.return'],
        prompt: 'What does this code print?',
        code: `function add(a, b) {
  console.log(a + b);
}

const result = add(2, 3);
console.log(result);`,
        expected: '5\nundefined',
        hints: [
          'Line 5 calls `add`. What does the function do inside?',
          'What does a function give back when it has no `return`?',
        ],
        explanation: 'Inside `add`, `console.log` prints 5. But the function returns nothing, so `result` is `undefined`. This is why "it shows the right number in the console" does not mean the function works.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.return.total',
        type: 'code',
        title: 'Functions that return values',
        skills: ['js.functions.return', 'js.numbers'],
        prompt: `Write two functions:

- \`calculateTotal(price, quantity)\` returns price × quantity.
- \`formatPrice(amount)\` returns the amount as text with a euro sign and two decimals, e.g. \`formatPrice(13.5)\` returns \`'€13.50'\`.

Then use them together: print the formatted total for 3 items of €4.50.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `function calculateTotal(price, quantity) {
  // your code here
}

function formatPrice(amount) {
  // your code here
}

console.log(formatPrice(calculateTotal(4.5, 3)));
`,
        },
        tests: [
          {
            name: 'calculateTotal(4.5, 3) returns 13.5',
            run: ({ expect }) => expect(calculateTotal(4.5, 3)).toBe(13.5),
          },
          {
            name: 'calculateTotal(10, 0) returns 0',
            run: ({ expect }) => expect(calculateTotal(10, 0)).toBe(0),
          },
          {
            name: "formatPrice(13.5) returns '€13.50'",
            run: ({ expect }) => expect(formatPrice(13.5)).toBe('€13.50'),
          },
          {
            name: "formatPrice(7) returns '€7.00'",
            run: ({ expect }) => expect(formatPrice(7)).toBe('€7.00'),
          },
          {
            name: 'The console shows €13.50',
            run: ({ expect, logs }) => expect(logs).toContain('€13.50'),
          },
        ],
        pitfalls: [
          { pattern: /return/, absent: true, message: 'Your functions have no `return`. A function must **return** its result, so other code (and the tests) can use it.' },
        ],
        hints: [
          'Each function body needs just one line, starting with `return`.',
          '`formatPrice` builds text: the euro sign plus `amount.toFixed(2)`.',
          '`return \'€\' + amount.toFixed(2);`',
        ],
        solution: {
          js: `function calculateTotal(price, quantity) {
  return price * quantity;
}

function formatPrice(amount) {
  return '€' + amount.toFixed(2);
}

console.log(formatPrice(calculateTotal(4.5, 3)));
`,
        },
        explanation: 'In the last line, `calculateTotal(4.5, 3)` runs first and returns 13.5. That value becomes the argument of `formatPrice`, which returns "€13.50", which `console.log` prints. Small functions that each do one thing can be combined like building blocks.',
        takeaway: 'A function that computes something should `return` it. Leave the decision of what to do with the result (print it, show it, store it) to the caller.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.return.default',
        type: 'code',
        title: 'A default parameter',
        skills: ['js.functions.return', 'js.strings'],
        prompt: 'Write a function `greet(name)` that returns a greeting such as `Hello, Ada!` (use a template literal). When it is called **without** a name, it should return `Hello, friend!`.',
        files: ['js'],
        preview: false,
        starter: { js: '// your code here\n\nconsole.log(greet(\'Ada\'));\nconsole.log(greet());\n' },
        tests: [
          {
            name: "greet('Ada') returns 'Hello, Ada!'",
            run: ({ expect }) => expect(greet('Ada')).toBe('Hello, Ada!'),
          },
          {
            name: "greet() returns 'Hello, friend!'",
            run: ({ expect }) => expect(greet()).toBe('Hello, friend!'),
          },
          {
            name: "greet('Sam') returns 'Hello, Sam!'",
            run: ({ expect }) => expect(greet('Sam')).toBe('Hello, Sam!'),
          },
        ],
        hints: [
          'A parameter can have a default value right in the parentheses.',
          '`function greet(name = \'friend\') { … }`',
        ],
        solution: {
          js: `function greet(name = 'friend') {
  return \`Hello, \${name}!\`;
}

console.log(greet('Ada'));
console.log(greet());
`,
        },
        explanation: 'When no argument is passed, `name` would be `undefined`. The default value replaces it with "friend".',
      },
    },
  ],
  keyPoints: [
    'Parameters are the names in the definition; arguments are the values in the call, matched by position.',
    '`return` hands a value back and stops the function. Without it: `undefined`.',
    '`console.log` is for you; `return` is for the code that called the function.',
  ],
};

/* ───────────────────────── 7. Conditions ───────────────────────── */

const conditions = {
  slug: 'conditions',
  title: 'Conditions',
  minutes: 25,
  summary: 'if, else if and else, truthy and falsy values, and the ternary operator.',
  sections: [
    {
      kind: 'text',
      text: `\`if\` runs code only when a condition is true. \`else if\` checks the next condition, and \`else\` catches everything else. **Only the first matching branch runs.**

\`\`\`js
function getShipping(total) {
  if (total >= 50) {
    return 0;
  } else if (total >= 20) {
    return 2.95;
  } else {
    return 4.95;
  }
}
\`\`\`

The **order** matters. If \`total >= 20\` were checked first, an order of 60 would match it and never reach the free-shipping branch.

**Truthy and falsy.** A condition does not have to be a boolean. These values count as false (**falsy**): \`false\`, \`0\`, \`''\` (empty string), \`null\`, \`undefined\`, \`NaN\`. **Everything else** is truthy, including \`'0'\`, \`'false'\`, \`[]\` and \`{}\`.

The **ternary operator** chooses between two values in one line: \`const label = count === 1 ? 'item' : 'items';\` Use it for simple choices, not for complex logic.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function describeStock(stock) {
  if (stock === 0) {
    return 'Sold out';
  }
  if (stock < 5) {
    return \`Only \${stock} left\`;
  }
  return 'In stock';
}

console.log(describeStock(0));   // "Sold out"
console.log(describeStock(3));   // "Only 3 left"
console.log(describeStock(40));  // "In stock"`,
      notes: [
        { lines: [2, 4], text: 'Because `return` stops the function, no `else` is needed. This style is called an **early return**, and keeps the code flat.' },
        { lines: [5, 7], text: 'Only reached when stock is not 0.' },
        { lines: [8], text: 'The default case: everything the conditions above did not catch.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'The wrong order', text: 'Check the most specific or strictest condition first. `if (score >= 50)` before `if (score >= 90)` means nobody ever gets an A.' },
        { title: 'Testing truthiness by accident', text: '`if (quantity)` is false for 0. If 0 is a valid value, write the real question: `if (quantity !== undefined)`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.conditions.grade',
        type: 'code',
        title: 'Grades',
        skills: ['js.conditions'],
        prompt: `Write \`getGrade(score)\` that returns:

- \`'A'\` for 90 and above
- \`'B'\` for 75 to 89
- \`'C'\` for 50 to 74
- \`'F'\` below 50`,
        files: ['js'],
        preview: false,
        starter: { js: 'function getGrade(score) {\n  // your code here\n}\n\nconsole.log(getGrade(82));\n' },
        tests: [
          { name: "getGrade(95) returns 'A'", run: ({ expect }) => expect(getGrade(95)).toBe('A') },
          { name: "getGrade(90) returns 'A' (the boundary)", run: ({ expect }) => expect(getGrade(90)).toBe('A') },
          { name: "getGrade(89) returns 'B'", run: ({ expect }) => expect(getGrade(89)).toBe('B') },
          { name: "getGrade(75) returns 'B'", run: ({ expect }) => expect(getGrade(75)).toBe('B') },
          { name: "getGrade(50) returns 'C'", run: ({ expect }) => expect(getGrade(50)).toBe('C') },
          { name: "getGrade(49) returns 'F'", run: ({ expect }) => expect(getGrade(49)).toBe('F') },
          { name: "getGrade(0) returns 'F'", run: ({ expect }) => expect(getGrade(0)).toBe('F') },
        ],
        hints: [
          'Check the highest grade first, then go down.',
          'Use `>=` so that exactly 90, 75 and 50 are included. Each branch can `return` straight away.',
          `\`\`\`js
if (score >= 90) return 'A';
if (score >= 75) return 'B';
// …
\`\`\``,
        ],
        solution: {
          js: `function getGrade(score) {
  if (score >= 90) {
    return 'A';
  }
  if (score >= 75) {
    return 'B';
  }
  if (score >= 50) {
    return 'C';
  }
  return 'F';
}

console.log(getGrade(82));
`,
        },
        explanation: 'Because each branch returns, a score of 82 never reaches the `>= 50` check. Checking from high to low means each condition only needs a lower bound.',
        takeaway: 'Always test the **boundaries** (90, 89, 75, 50, 49). Off-by-one mistakes hide exactly there.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.conditions.entry',
        type: 'code',
        title: 'May they enter?',
        skills: ['js.conditions', 'js.operators'],
        prompt: 'Write `canEnter(age, hasTicket, hasConsent)` that returns `true` when the visitor has a ticket **and** is 18 or older **or** has parental consent. Otherwise it returns `false`.',
        files: ['js'],
        preview: false,
        starter: { js: 'function canEnter(age, hasTicket, hasConsent) {\n  // your code here\n}\n' },
        tests: [
          { name: 'Adult with ticket → true', run: ({ expect }) => expect(canEnter(30, true, false)).toBe(true) },
          { name: '16 with ticket and consent → true', run: ({ expect }) => expect(canEnter(16, true, true)).toBe(true) },
          { name: '16 with ticket, no consent → false', run: ({ expect }) => expect(canEnter(16, true, false)).toBe(false) },
          { name: 'Adult without ticket → false', run: ({ expect }) => expect(canEnter(30, false, false)).toBe(false) },
          { name: '16 with consent but no ticket → false', run: ({ expect }) => expect(canEnter(16, false, true), 'Everyone needs a ticket. Check your parentheses').toBe(false) },
          { name: 'Exactly 18 with ticket → true', run: ({ expect }) => expect(canEnter(18, true, false)).toBe(true) },
        ],
        hints: [
          'Write the rule in words first: ticket AND (adult OR consent).',
          'The comparison can be returned directly; no `if` is needed. Mind the parentheses.',
          '`return hasTicket && (age >= 18 || hasConsent);`',
        ],
        solution: {
          js: `function canEnter(age, hasTicket, hasConsent) {
  return hasTicket && (age >= 18 || hasConsent);
}
`,
        },
        explanation: 'Without parentheses, `hasTicket && age >= 18 || hasConsent` is read as `(hasTicket && age >= 18) || hasConsent`, which lets in a 16-year-old **without a ticket** as long as they have consent. The fifth test catches exactly that.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.conditions.truthy',
        type: 'predict',
        title: 'Truthy or falsy?',
        skills: ['js.conditions', 'js.data-types'],
        prompt: 'What does this code print?',
        code: `if ('0') console.log('A');
if (0) console.log('B');
if ('') console.log('C');
if ([]) console.log('D');
if (null) console.log('E');
console.log('done');`,
        expected: 'A\nD\ndone',
        hints: [
          'Only six values are falsy: false, 0, empty string, null, undefined and NaN.',
          '`\'0\'` is a string with one character in it, not the number 0. And an empty array is still an object.',
        ],
        explanation: '`\'0\'` is a non-empty string, so truthy. `[]` is an object, so truthy, even though it is empty. `0`, `\'\'` and `null` are falsy. To check whether an array is empty, test `list.length === 0`.',
      },
    },
  ],
  keyPoints: [
    'Only the first matching branch runs; order conditions from most to least specific.',
    'Falsy: `false`, `0`, `\'\'`, `null`, `undefined`, `NaN`. Everything else is truthy.',
    'Early returns keep code flat; test the boundary values.',
  ],
};

/* ───────────────────────── 8. Arrays ───────────────────────── */

const arrays = {
  slug: 'arrays',
  title: 'Arrays',
  minutes: 20,
  summary: 'Ordered lists of values: indexes, length, adding and removing.',
  sections: [
    {
      kind: 'text',
      text: `An **array** is an ordered list of values: \`const colors = ['red', 'green', 'blue'];\`

- Positions are called **indexes**, and they start at **0**: \`colors[0]\` is "red".
- \`colors.length\` is the number of items (3). So the **last** item is \`colors[colors.length - 1]\`.
- An index that does not exist gives \`undefined\`, not an error.

Changing arrays:
- \`push(x)\` adds to the end; \`pop()\` removes the last item and returns it.
- \`unshift(x)\` adds to the start; \`shift()\` removes the first.
- \`includes(x)\` → true or false. \`indexOf(x)\` → the position, or \`-1\` if it is not there.

An array in a \`const\` can still be changed: \`const\` only means the variable always points to the **same** array. You can add to it, but not replace it.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const queue = ['Ada', 'Grace'];

queue.push('Alan');                 // ['Ada', 'Grace', 'Alan']
const next = queue.shift();         // 'Ada'

console.log(next);                  // "Ada"
console.log(queue);                 // ["Grace", "Alan"]
console.log(queue.length);          // 2
console.log(queue[queue.length - 1]); // "Alan"
console.log(queue.includes('Ada')); // false`,
      notes: [
        { lines: [1], text: 'A `const` array: the variable always refers to this array, but the array\'s contents can change.' },
        { lines: [3, 4], text: '`push` adds at the end; `shift` removes from the start and **returns** the removed item.' },
        { lines: [9], text: 'The last item. With 2 items, that is index 1.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Off by one', text: 'An array with 3 items has indexes 0, 1, 2. `list[list.length]` is always `undefined`.' },
        { title: 'Checking indexOf for truthiness', text: '`if (list.indexOf(x))` is false when x is at index **0**, and true when it is not found (-1). Use `list.includes(x)` for yes/no questions.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.arrays.predict',
        type: 'predict',
        title: 'Indexes and length',
        skills: ['js.arrays'],
        prompt: 'What does this code print?',
        code: `const colors = ['red', 'green', 'blue'];
console.log(colors[1]);
console.log(colors.length);
console.log(colors[colors.length - 1]);

colors.push('yellow');
console.log(colors.length);
console.log(colors[4]);
console.log(colors.indexOf('blue'));`,
        expected: 'green\n3\nblue\n4\nundefined\n2',
        hints: [
          'Indexes start at 0.',
          'After `push`, there are 4 items, with indexes 0 to 3.',
        ],
        explanation: 'Index 1 is the second item, "green". After pushing, the indexes go up to 3, so `colors[4]` does not exist: `undefined`. "blue" is still at index 2.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.arrays.functions',
        type: 'code',
        title: 'Small array helpers',
        skills: ['js.arrays', 'js.conditions'],
        prompt: `Write two functions:

- \`lastItem(list)\` returns the last item of the array, or \`undefined\` if it is empty.
- \`addUnique(list, item)\` adds \`item\` to the end of the array **only if it is not already in it**, and returns the array.`,
        files: ['js'],
        preview: false,
        starter: { js: 'function lastItem(list) {\n  // your code here\n}\n\nfunction addUnique(list, item) {\n  // your code here\n}\n' },
        tests: [
          { name: "lastItem(['a', 'b', 'c']) returns 'c'", run: ({ expect }) => expect(lastItem(['a', 'b', 'c'])).toBe('c') },
          { name: 'lastItem([7]) returns 7', run: ({ expect }) => expect(lastItem([7])).toBe(7) },
          { name: 'lastItem([]) returns undefined', run: ({ expect }) => expect(lastItem([])).toBe(undefined) },
          {
            name: 'addUnique adds a new item',
            run: ({ expect }) => expect(addUnique(['tea'], 'coffee')).toEqual(['tea', 'coffee']),
          },
          {
            name: 'addUnique does not add a duplicate',
            run: ({ expect }) => expect(addUnique(['tea', 'coffee'], 'tea')).toEqual(['tea', 'coffee']),
          },
          {
            name: 'addUnique changes and returns the same array',
            run: ({ expect }) => {
              const list = ['a'];
              const result = addUnique(list, 'b');
              expect(result === list, 'Return the array you received').toBe(true);
              expect(list).toEqual(['a', 'b']);
            },
          },
        ],
        hints: [
          'The last index is always `length - 1`. For an empty array that is index -1, which gives `undefined` on its own.',
          '`includes()` tells you if the item is already there; `push()` adds it.',
          '`if (!list.includes(item)) { list.push(item); } return list;`',
        ],
        solution: {
          js: `function lastItem(list) {
  return list[list.length - 1];
}

function addUnique(list, item) {
  if (!list.includes(item)) {
    list.push(item);
  }
  return list;
}
`,
        },
        explanation: 'For an empty array, `list[-1]` is `undefined`, so `lastItem` needs no special case. `addUnique` uses `!` to ask "is it NOT already included?".',
      },
    },
  ],
  keyPoints: [
    'Indexes start at 0; the last item is `list[list.length - 1]`.',
    '`push`/`pop` at the end, `unshift`/`shift` at the start.',
    'Use `includes()` for yes/no questions, not `indexOf()`.',
  ],
};

/* ───────────────────────── 9. Loops ───────────────────────── */

const loops = {
  slug: 'loops',
  title: 'Loops',
  minutes: 25,
  summary: 'Repeating code with for, for…of and while.',
  sections: [
    {
      kind: 'text',
      text: `A loop repeats code. JavaScript has several kinds; you need three:

**\`for…of\`** goes through every item of an array (or every character of a string). Use it whenever you loop over a list:

\`\`\`js
for (const name of names) {
  console.log(name);
}
\`\`\`

**The classic \`for\`** counts. It has three parts: start; condition (checked before each round); update (after each round):

\`\`\`js
for (let i = 1; i <= 3; i++) {
  console.log(i);   // 1, 2, 3
}
\`\`\`

**\`while\`** repeats as long as a condition is true, for when you do not know in advance how many rounds are needed. Make sure something inside the loop eventually makes the condition false, or it never ends. (This lab stops runaway loops after 1.5 seconds; a real browser tab would freeze.)

\`break\` stops the loop completely. \`continue\` skips the rest of the current round.

A very common pattern is the **accumulator**: a variable that starts empty or at 0 and collects a result round by round.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const prices = [4.5, 12, 3];
let total = 0;

for (const price of prices) {
  total += price;
}
console.log(total);           // 19.5

let attempts = 0;
let found = false;
while (!found && attempts < 10) {
  attempts++;
  found = attempts * 7 > 30;
}
console.log(attempts);        // 5`,
      notes: [
        { lines: [2], text: 'The **accumulator** starts at 0, before the loop.' },
        { lines: [4, 6], text: 'Each round, `price` is the next item, and it is added to the total.' },
        { lines: [11], text: 'Two exit conditions: stop when found, and also after 10 attempts at most, as a safety net.' },
        { lines: [12, 13], text: 'Something in the loop changes the condition. Without line 13, it would only stop because of the attempt limit.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Resetting the accumulator inside the loop', text: '`for (…) { let total = 0; total += price; }` starts from 0 in every round. The accumulator belongs **before** the loop.' },
        { title: 'Off-by-one in counting loops', text: '`i <= list.length` goes one step too far. To visit every index of an array: `i < list.length`. Or avoid the problem with `for…of`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.loops.sum',
        type: 'code',
        title: 'Add up the numbers',
        skills: ['js.loops'],
        prompt: 'Write `sumTo(n)` that returns the sum of all whole numbers from 1 to `n`. For example, `sumTo(4)` is 1 + 2 + 3 + 4 = 10. Use a `for` loop.',
        files: ['js'],
        preview: false,
        starter: { js: 'function sumTo(n) {\n  // your code here\n}\n\nconsole.log(sumTo(4));\n' },
        tests: [
          { name: 'sumTo(1) returns 1', run: ({ expect }) => expect(sumTo(1)).toBe(1) },
          { name: 'sumTo(4) returns 10', run: ({ expect }) => expect(sumTo(4)).toBe(10) },
          { name: 'sumTo(100) returns 5050', run: ({ expect }) => expect(sumTo(100)).toBe(5050) },
          { name: 'sumTo(0) returns 0', run: ({ expect }) => expect(sumTo(0)).toBe(0) },
        ],
        hints: [
          'You need an accumulator that starts at 0, and a loop that counts from 1 to n.',
          'The loop condition must include n itself: `i <= n`.',
          `\`\`\`js
let total = 0;
for (let i = 1; i <= n; i++) {
  // add i to total
}
return total;
\`\`\``,
        ],
        solution: {
          js: `function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

console.log(sumTo(4));
`,
        },
        explanation: 'For `sumTo(0)`, the condition `1 <= 0` is false from the start, so the loop body never runs and the function returns 0. A loop that runs zero times is normal and correct.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.loops.vowels',
        type: 'code',
        title: 'Count the vowels',
        skills: ['js.loops', 'js.strings', 'js.conditions'],
        prompt: 'Write `countVowels(text)` that returns how many vowels (a, e, i, o, u) the text contains, in upper **or** lower case. Use a `for…of` loop over the characters.',
        files: ['js'],
        preview: false,
        starter: { js: 'function countVowels(text) {\n  // your code here\n}\n\nconsole.log(countVowels(\'Hello World\'));\n' },
        tests: [
          { name: "countVowels('Hello World') returns 3", run: ({ expect }) => expect(countVowels('Hello World')).toBe(3) },
          { name: "countVowels('AEIOU') returns 5 (upper case counts)", run: ({ expect }) => expect(countVowels('AEIOU')).toBe(5) },
          { name: "countVowels('rhythm') returns 0", run: ({ expect }) => expect(countVowels('rhythm')).toBe(0) },
          { name: "countVowels('') returns 0", run: ({ expect }) => expect(countVowels('')).toBe(0) },
        ],
        hints: [
          'Accumulator + loop: a counter at 0, and for each character, add 1 if it is a vowel.',
          "`'aeiou'.includes(char)` tells you if a character is a vowel. Convert to lower case first.",
          `\`\`\`js
let count = 0;
for (const char of text.toLowerCase()) {
  if (/* char is a vowel */) count++;
}
return count;
\`\`\``,
        ],
        solution: {
          js: `function countVowels(text) {
  let count = 0;
  for (const char of text.toLowerCase()) {
    if ('aeiou'.includes(char)) {
      count++;
    }
  }
  return count;
}

console.log(countVowels('Hello World'));
`,
        },
        explanation: 'Converting the whole text to lower case once, before the loop, means the check only needs one set of vowels. `\'aeiou\'.includes(char)` is a short way to ask "is this one of these characters?".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
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
    },
  ],
  keyPoints: [
    '`for…of` for every item of a list; `for` for counting; `while` for an unknown number of rounds.',
    'The accumulator starts before the loop and is returned after it.',
    'Every `while` loop needs something that eventually makes its condition false.',
  ],
};

/* ───────────────────────── 10. Objects ───────────────────────── */

const objects = {
  slug: 'objects',
  title: 'Objects',
  minutes: 25,
  summary: 'Grouping related values under names, and how objects are shared by reference.',
  sections: [
    {
      kind: 'text',
      text: `An **object** groups related values under names (**keys**):

\`\`\`js
const user = {
  firstName: 'Ada',
  age: 36,
  address: { city: 'London' },
};
\`\`\`

- Read with **dot notation**: \`user.firstName\`. Change: \`user.age = 37\`. Add: \`user.email = '…'\`.
- **Bracket notation** \`user[key]\` is needed when the key is in a variable: \`const field = 'age'; user[field]\`.
- A key that does not exist gives \`undefined\`. Reading a property **of** \`undefined\` is an error. **Optional chaining** \`user.address?.city\` stops safely and gives \`undefined\` instead.
- \`Object.keys(obj)\`, \`Object.values(obj)\` and \`Object.entries(obj)\` give arrays you can loop over.

Real data is usually an **array of objects**: a list of products, users or orders.

**Objects are shared by reference.** \`const b = a;\` does **not** copy the object: both names point to the same one, so a change through \`b\` is visible through \`a\`. To copy: \`const b = { ...a };\` (a "shallow" copy).`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const product = { name: 'Notebook', price: 4, stock: 12 };

console.log(product.name);         // "Notebook"
product.stock -= 1;
product.color = 'blue';

const field = 'price';
console.log(product[field]);       // 4

const { name, price } = product;
console.log(\`\${name}: €\${price}\`); // "Notebook: €4"

const user = { name: 'Sam' };
console.log(user.address?.city);   // undefined, no error`,
      notes: [
        { lines: [4, 5], text: 'Change an existing key, and add a new one. The object is a `const`, but its contents can change.' },
        { lines: [7, 8], text: 'The key is in a variable, so bracket notation is needed. `product.field` would look for a key literally called "field".' },
        { lines: [10], text: '**Destructuring**: create variables `name` and `price` from the keys with the same names.' },
        { lines: [14], text: '`user.address` is undefined. `?.` stops there instead of throwing "Cannot read properties of undefined".' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: '"Copying" with =', text: '`const draft = settings; draft.theme = \'dark\';` also changes `settings`. Copy first: `{ ...settings }`.' },
        { title: 'Dot notation with a variable', text: '`obj.key` reads the key named "key". When the name is in a variable, use `obj[key]`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.objects.user',
        type: 'code',
        title: 'Work with a user object',
        skills: ['js.objects', 'js.strings'],
        prompt: `Write two functions that receive a user object like the one in the starter:

- \`formatUser(user)\` returns \`'Ada Lovelace (ada@example.com)'\`: first name, last name, and the email in parentheses.
- \`getCity(user)\` returns the city from \`user.address.city\`, or \`'Unknown'\` when the user has no address.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const ada = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  address: { city: 'London' },
};

function formatUser(user) {
  // your code here
}

function getCity(user) {
  // your code here
}

console.log(formatUser(ada));
console.log(getCity(ada));
`,
        },
        tests: [
          {
            name: "formatUser returns 'Ada Lovelace (ada@example.com)'",
            run: ({ expect }) => expect(formatUser({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' })).toBe('Ada Lovelace (ada@example.com)'),
          },
          {
            name: 'formatUser works for any user',
            run: ({ expect }) => expect(formatUser({ firstName: 'Alan', lastName: 'Turing', email: 'alan@example.com' })).toBe('Alan Turing (alan@example.com)'),
          },
          {
            name: "getCity returns the city",
            run: ({ expect }) => expect(getCity({ address: { city: 'Paris' } })).toBe('Paris'),
          },
          {
            name: "getCity returns 'Unknown' without an address",
            run: ({ expect }) => expect(getCity({ firstName: 'Sam' }), 'Use ?. so a missing address does not throw an error').toBe('Unknown'),
          },
        ],
        hints: [
          'Inside each function, read the values from the `user` parameter.',
          'A template literal for `formatUser`. For `getCity`: `user.address?.city` gives `undefined` when there is no address, and `??` replaces that.',
          '`return user.address?.city ?? \'Unknown\';`',
        ],
        solution: {
          js: `const ada = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  address: { city: 'London' },
};

function formatUser(user) {
  return \`\${user.firstName} \${user.lastName} (\${user.email})\`;
}

function getCity(user) {
  return user.address?.city ?? 'Unknown';
}

console.log(formatUser(ada));
console.log(getCity(ada));
`,
        },
        explanation: 'Without `?.`, `getCity({ firstName: \'Sam\' })` would throw "Cannot read properties of undefined (reading \'city\')". Data from forms and APIs is often incomplete, so this combination of `?.` and `??` is very common.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.objects.reference',
        type: 'predict',
        title: 'Copy or the same object?',
        skills: ['js.objects', 'reading.data-flow'],
        prompt: 'What does this code print?',
        code: `const a = { count: 1 };
const b = a;
b.count = 5;
console.log(a.count);

const c = { ...a };
c.count = 9;
console.log(a.count);
console.log(c.count);`,
        expected: '5\n5\n9',
        hints: [
          '`const b = a` does not create a new object. How many objects exist after line 2?',
          '`{ ...a }` creates a new object with the same keys and values.',
        ],
        explanation: '`a` and `b` point to the same object, so changing `b.count` changes what `a.count` shows: 5. `c` is a **new** object (a copy), so changing it leaves `a` alone.',
        takeaway: 'If changing one variable "mysteriously" changes another, check whether they point to the same object or array.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.objects.count',
        type: 'code',
        title: 'Count with an object',
        skills: ['js.objects', 'js.loops'],
        prompt: "Write `countItems(items)` that returns an object counting how often each item appears. `countItems(['tea', 'coffee', 'tea'])` returns `{ tea: 2, coffee: 1 }`.",
        files: ['js'],
        preview: false,
        starter: { js: "function countItems(items) {\n  // your code here\n}\n\nconsole.log(countItems(['tea', 'coffee', 'tea']));\n" },
        tests: [
          { name: 'Counts repeated items', run: ({ expect }) => expect(countItems(['tea', 'coffee', 'tea'])).toEqual({ tea: 2, coffee: 1 }) },
          { name: 'Returns an empty object for an empty list', run: ({ expect }) => expect(countItems([])).toEqual({}) },
          { name: 'Works with any items', run: ({ expect }) => expect(countItems(['a', 'b', 'a', 'a'])).toEqual({ a: 3, b: 1 }) },
        ],
        hints: [
          'The accumulator here is an empty object `{}`. The loop adds to it.',
          'The key is in a variable, so you need bracket notation: `counts[item]`. The first time, `counts[item]` is `undefined`.',
          '`counts[item] = (counts[item] ?? 0) + 1;`',
        ],
        solution: {
          js: `function countItems(items) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return counts;
}

console.log(countItems(['tea', 'coffee', 'tea']));
`,
        },
        explanation: 'The first time an item appears, `counts[item]` is `undefined`, and `?? 0` turns that into 0 before adding 1. This "count into an object" pattern appears constantly: votes, tags, categories, error types.',
      },
    },
  ],
  keyPoints: [
    'Dot notation for fixed keys; brackets when the key is in a variable.',
    '`?.` reads safely through missing objects; `??` provides a fallback.',
    'Objects and arrays are shared by reference; copy with `{ ...obj }` or `[...arr]`.',
  ],
};

/* ───────────────────────── 11. Array methods ───────────────────────── */

const arrayMethods = {
  slug: 'array-methods',
  title: 'Array methods',
  minutes: 30,
  summary: 'map, filter, find, reduce and friends: transforming lists without manual loops.',
  sections: [
    {
      kind: 'text',
      text: `These methods each take a **function** (a "callback") and call it once for every item. They are the most common tools in modern JavaScript, and in AI-generated code.

- \`map(fn)\` → a **new array** with \`fn(item)\` for every item. Same length.
- \`filter(fn)\` → a **new array** with only the items where \`fn(item)\` is truthy.
- \`find(fn)\` → the **first item** where \`fn(item)\` is truthy, or \`undefined\`.
- \`some(fn)\` / \`every(fn)\` → \`true\` if at least one / all items pass.
- \`reduce(fn, start)\` → **one value** built up from all items (a sum, an object…).
- \`forEach(fn)\` → just runs \`fn\` for each item, returns nothing.

\`map\`, \`filter\`, \`find\`, \`some\`, \`every\` and \`reduce\` do **not** change the original array. **\`sort()\` does**, and by default it sorts as **text**: \`[10, 1, 5].sort()\` gives \`[1, 10, 5]\`. For numbers: \`[...nums].sort((a, b) => a - b)\`.

The callback also receives the index as its second argument: \`list.map((item, index) => …)\`.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const products = [
  { name: 'Notebook', price: 4, stock: 12 },
  { name: 'Pen', price: 1.5, stock: 0 },
  { name: 'Backpack', price: 35, stock: 3 },
];

const names = products.map((p) => p.name);
const available = products.filter((p) => p.stock > 0);
const pen = products.find((p) => p.name === 'Pen');
const anySoldOut = products.some((p) => p.stock === 0);
const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

console.log(names);          // ["Notebook", "Pen", "Backpack"]
console.log(available.length); // 2
console.log(pen.price);      // 1.5
console.log(anySoldOut);     // true
console.log(stockValue);     // 153`,
      notes: [
        { lines: [7], text: '`map`: every product becomes its name. The result has the same length as the input.' },
        { lines: [8], text: '`filter`: keeps only products with stock. The callback returns true or false.' },
        { lines: [9], text: '`find`: the first match itself, not an array.' },
        { lines: [11], text: '`reduce`: `sum` starts at `0` (the last argument). Each round returns the new sum, which becomes `sum` in the next round.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting to return in the callback', text: '`products.map((p) => { p.name })` gives `[undefined, undefined, …]`. With curly braces you must write `return`; without them, the value is returned automatically.' },
        { title: 'Using map for side effects', text: 'If you do not use the new array, you wanted `forEach` (or a `for…of` loop).' },
        { title: 'sort() surprises', text: 'It changes the original array and compares as text. Copy first and pass a compare function: `[...list].sort((a, b) => a - b)`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.array-methods.predict',
        type: 'predict',
        title: 'Predict the new arrays',
        skills: ['js.array-methods'],
        prompt: 'What does this code print?',
        code: `const nums = [10, 1, 5, 100];

console.log(nums.map((n) => n * 2));
console.log(nums.filter((n) => n > 5));
console.log(nums.find((n) => n > 5));
console.log([...nums].sort());
console.log(nums);`,
        expected: '[20, 2, 10, 200]\n[10, 100]\n10\n[1, 10, 100, 5]\n[10, 1, 5, 100]',
        answerHelp: 'Write arrays the way the console shows them, e.g. [1, 2, 3]',
        hints: [
          '`find` returns one item, not an array.',
          'Default `sort()` compares the numbers as text, character by character: "100" comes before "5".',
        ],
        explanation: '`map` doubles every number, `filter` keeps 10 and 100, `find` returns the first match (10). The default sort compares "1", "10", "100", "5" as text. And because `sort` ran on a copy (`[...nums]`), the original array is unchanged.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.array-methods.products',
        type: 'code',
        title: 'Product list helpers',
        skills: ['js.array-methods', 'js.objects'],
        prompt: `Each function receives an array of products like \`{ id, name, price, stock }\`. Use array methods (no \`for\` loops):

- \`getNames(products)\` returns an array of the names.
- \`getInStock(products)\` returns only the products with a stock above 0.
- \`findById(products, id)\` returns the product with that id, or \`undefined\`.
- \`totalValue(products)\` returns the sum of price × stock for all products.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `const products = [
  { id: 1, name: 'Notebook', price: 4, stock: 12 },
  { id: 2, name: 'Pen', price: 1.5, stock: 0 },
  { id: 3, name: 'Backpack', price: 35, stock: 3 },
];

function getNames(products) {
}

function getInStock(products) {
}

function findById(products, id) {
}

function totalValue(products) {
}

console.log(getNames(products));
`,
        },
        tests: [
          {
            name: 'getNames returns the names',
            run: ({ expect }) => expect(getNames([{ name: 'A' }, { name: 'B' }])).toEqual(['A', 'B']),
          },
          {
            name: 'getInStock keeps only products with stock',
            run: ({ expect }) => expect(getInStock([{ id: 1, stock: 2 }, { id: 2, stock: 0 }, { id: 3, stock: 1 }]).map((p) => p.id)).toEqual([1, 3]),
          },
          {
            name: 'findById finds the product',
            run: ({ expect }) => expect(findById([{ id: 7, name: 'Lamp' }, { id: 8, name: 'Desk' }], 8)?.name).toBe('Desk'),
          },
          {
            name: 'findById returns undefined for an unknown id',
            run: ({ expect }) => expect(findById([{ id: 7 }], 99)).toBe(undefined),
          },
          {
            name: 'totalValue adds price × stock',
            run: ({ expect }) => expect(totalValue([{ price: 4, stock: 12 }, { price: 1.5, stock: 0 }, { price: 35, stock: 3 }])).toBe(153),
          },
          {
            name: 'totalValue of an empty list is 0',
            run: ({ expect }) => expect(totalValue([]), 'Give reduce a start value of 0').toBe(0),
          },
          {
            name: 'The original array is not changed',
            run: ({ expect }) => {
              const list = [{ id: 1, name: 'A', price: 1, stock: 0 }];
              getNames(list); getInStock(list); totalValue(list);
              expect(list).toEqual([{ id: 1, name: 'A', price: 1, stock: 0 }]);
            },
          },
        ],
        pitfalls: [
          { pattern: /for\s*\(/, message: 'The task asks for array methods (`map`, `filter`, `find`, `reduce`) instead of `for` loops. Both work, but array methods are what you will read in most modern code.' },
          { pattern: /return/, absent: true, message: 'Each function must `return` the result of the array method.' },
        ],
        hints: [
          'Each function is a single `return` line with one array method.',
          'Which method for which question: a new list of the same length → `map`; fewer items → `filter`; one item → `find`; one number from all items → `reduce`.',
          '`return products.reduce((sum, p) => sum + p.price * p.stock, 0);`',
        ],
        solution: {
          js: `const products = [
  { id: 1, name: 'Notebook', price: 4, stock: 12 },
  { id: 2, name: 'Pen', price: 1.5, stock: 0 },
  { id: 3, name: 'Backpack', price: 35, stock: 3 },
];

function getNames(products) {
  return products.map((product) => product.name);
}

function getInStock(products) {
  return products.filter((product) => product.stock > 0);
}

function findById(products, id) {
  return products.find((product) => product.id === id);
}

function totalValue(products) {
  return products.reduce((sum, product) => sum + product.price * product.stock, 0);
}

console.log(getNames(products));
`,
        },
        explanation: 'Each function asks one question about the list, and the method name says which kind of question: transform (`map`), select (`filter`), look up (`find`), summarize (`reduce`). Without the `0` start value, `reduce` on an empty array throws an error.',
        takeaway: 'Before writing a loop, ask: am I transforming, selecting, looking up or summarizing? There is a method for each.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
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
    },
    {
      kind: 'exercise',
      exercise: {
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
    },
  ],
  keyPoints: [
    '`map` transforms, `filter` selects, `find` looks up, `reduce` summarizes.',
    'With `{ }` in a callback you must write `return`.',
    '`sort()` changes the array and sorts as text by default.',
  ],
};

/* ───────────────────────── 12. Scope ───────────────────────── */

const scope = {
  slug: 'scope',
  title: 'Scope and closures',
  minutes: 25,
  summary: 'Where a variable exists, and how functions remember their surroundings.',
  sections: [
    {
      kind: 'text',
      text: `**Scope** is the part of the code where a variable exists.

- \`let\` and \`const\` are **block-scoped**: they exist only inside the \`{ }\` where they are declared: an \`if\`, a loop, a function.
- Code **inside** can read variables from **outside**. Code outside cannot see in.
- A variable inside can have the same name as one outside. It then **shadows** the outer one: inside, the name refers to the inner variable.
- Variables declared at the top level of a script are **global**: every piece of code can read and change them. Keep globals to a minimum, so one part of a program cannot accidentally break another.

**Closures.** A function remembers the variables that existed where it was **created**, even after the outer function has finished:

\`\`\`js
function createCounter() {
  let count = 0;
  return () => {
    count++;
    return count;
  };
}

const next = createCounter();
next(); // 1
next(); // 2
\`\`\`

\`count\` is private: nothing outside can change it except by calling \`next()\`. Closures are behind event handlers, timers, and many patterns in later modules.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const taxRate = 0.2;

function priceWithTax(price) {
  const tax = price * taxRate;
  return price + tax;
}

console.log(priceWithTax(10));  // 12
console.log(typeof tax);        // "undefined"

if (true) {
  const message = 'inside the block';
}
console.log(typeof message);    // "undefined"`,
      notes: [
        { lines: [1, 4], text: 'The function can read `taxRate`, which is declared outside it.' },
        { lines: [4, 9], text: '`tax` only exists inside the function. Outside it, the name does not exist.' },
        { lines: [11, 14], text: 'The same holds for any block: `message` disappears after the closing `}`.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Declaring inside a block, using outside', text: 'A variable set in an `if` and used after it gives "… is not defined". Declare it **before** the block with `let`, then assign inside.' },
        { title: 'Accidental shadowing', text: 'A `let total` inside a loop hides the `total` outside it. Your changes go to the inner variable, and the outer one stays 0.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.scope.predict',
        type: 'predict',
        title: 'Which variable is it?',
        skills: ['js.scope'],
        prompt: 'What does this code print?',
        code: `let message = 'global';

function show() {
  let message = 'inside';
  console.log(message);
}

show();
console.log(message);

if (true) {
  const temp = 'block';
}
console.log(typeof temp);`,
        expected: 'inside\nglobal\nundefined',
        hints: [
          'There are two different variables called `message`. Which one does each `console.log` see?',
          '`temp` only exists inside the `if` block. `typeof` on a name that does not exist gives "undefined" (without an error).',
        ],
        explanation: 'Inside `show`, the inner `message` shadows the global one. The global one is never changed, so it still says "global". `temp` disappears after its block ends.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.scope.fix',
        type: 'code',
        title: 'Fix the shipping cost',
        skills: ['js.scope', 'debug.reading-errors'],
        prompt: 'This function throws an error instead of returning the shipping cost. Run it, read the error, and fix it. Orders of €50 or more ship for free; others cost €4.95.',
        files: ['js'],
        preview: false,
        starter: {
          js: `function getShippingCost(total) {
  if (total >= 50) {
    let cost = 0;
  } else {
    let cost = 4.95;
  }
  return cost;
}

console.log(getShippingCost(30));
`,
        },
        tests: [
          { name: 'getShippingCost(30) returns 4.95', run: ({ expect }) => expect(getShippingCost(30)).toBe(4.95) },
          { name: 'getShippingCost(50) returns 0', run: ({ expect }) => expect(getShippingCost(50)).toBe(0) },
          { name: 'getShippingCost(120) returns 0', run: ({ expect }) => expect(getShippingCost(120)).toBe(0) },
        ],
        hints: [
          'The error says `cost is not defined` on the `return` line. Where does `cost` exist?',
          'Each `let cost` creates a new variable that only lives inside its own `{ }`. Declare one variable before the `if`, and only **assign** inside the branches.',
        ],
        solution: {
          js: `function getShippingCost(total) {
  let cost;
  if (total >= 50) {
    cost = 0;
  } else {
    cost = 4.95;
  }
  return cost;
}

console.log(getShippingCost(30));
`,
        },
        explanation: 'Now there is one `cost` variable in the function\'s scope, and both branches assign to it. Even shorter: `return total >= 50 ? 0 : 4.95;`, or a `return` inside each branch.',
        takeaway: '"X is not defined" although you can see `let X` in the code? Check which `{ }` block it was declared in.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'js.scope.counter',
        type: 'code',
        title: 'A counter with a closure',
        skills: ['js.scope', 'js.closures', 'js.objects'],
        prompt: `Write \`createCounter()\`. It returns an object with two functions:

- \`increment()\` adds 1 to the counter.
- \`getValue()\` returns the current value.

Every call to \`createCounter()\` creates a **separate** counter that starts at 0.`,
        files: ['js'],
        preview: false,
        starter: {
          js: `function createCounter() {
  // your code here
}

const likes = createCounter();
likes.increment();
likes.increment();
console.log(likes.getValue()); // 2
`,
        },
        tests: [
          {
            name: 'A new counter starts at 0',
            run: ({ expect }) => expect(createCounter().getValue()).toBe(0),
          },
          {
            name: 'increment() adds 1 each time',
            run: ({ expect }) => {
              const counter = createCounter();
              counter.increment(); counter.increment(); counter.increment();
              expect(counter.getValue()).toBe(3);
            },
          },
          {
            name: 'Two counters are independent',
            run: ({ expect }) => {
              const a = createCounter();
              const b = createCounter();
              a.increment(); a.increment();
              b.increment();
              expect([a.getValue(), b.getValue()], 'Keep count inside createCounter, not as a global').toEqual([2, 1]);
            },
          },
        ],
        hints: [
          'The count must live **inside** `createCounter`, so each call gets its own.',
          'Declare `let count = 0;` inside, then return an object whose two functions use `count`.',
          `\`\`\`js
return {
  increment: () => { count++; },
  getValue: () => count,
};
\`\`\``,
        ],
        solution: {
          js: `function createCounter() {
  let count = 0;
  return {
    increment: () => {
      count++;
    },
    getValue: () => count,
  };
}

const likes = createCounter();
likes.increment();
likes.increment();
console.log(likes.getValue()); // 2
`,
        },
        explanation: 'Each call to `createCounter` creates a new `count` variable. The two returned functions close over **that** variable, so they keep using it after `createCounter` has finished. Nobody outside can set `count` to a wrong value: it is private.',
      },
    },
  ],
  keyPoints: [
    '`let` and `const` live only inside their `{ }` block.',
    'Inner code can read outer variables; an inner variable with the same name shadows the outer one.',
    'A closure remembers the variables where its function was created, which makes private state possible.',
  ],
};

export const jsCoreLessons = [
  variables,
  dataTypes,
  stringsNumbers,
  operators,
  functions,
  returnValues,
  conditions,
  arrays,
  loops,
  objects,
  arrayMethods,
  scope,
];
