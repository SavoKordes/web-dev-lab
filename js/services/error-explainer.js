/*
 * error-explainer.js — explains common JavaScript error messages in plain English.
 *
 * Error messages are precise but terse. Each pattern below matches one kind of
 * message (Chrome, Edge, Safari and Firefox word some of them differently) and
 * returns:
 *   - what the message means
 *   - what to check, in the order that usually finds the bug fastest
 *
 * Learning to read error messages yourself is one of the most valuable debugging
 * skills, so the explanation always quotes the important part of the original.
 */

const EXPLANATIONS = [
  {
    test: /Loop on line \d+ ran too long/,
    explain: () => ({
      title: 'Infinite loop stopped',
      meaning: 'A loop kept running without ever finishing, so the lab stopped it before it froze the page.',
      checks: [
        'Does the loop condition ever become false? Look at the variable it tests.',
        'Is that variable actually changed inside the loop (e.g. i++)?',
        'In a for loop, check the direction: i++ with i > 0 never ends if i starts positive.',
      ],
    }),
  },
  {
    test: /(?:ReferenceError: )?(\S+) is not defined/,
    explain: (m) => ({
      title: `"${m[1]}" does not exist here`,
      meaning: `Your code uses the name ${m[1]}, but no variable or function with exactly that name exists where this line runs.`,
      checks: [
        'Spelling and capitalization: userName and username are different names.',
        'Was it declared with let, const or function before this point?',
        'Was it declared inside another function or { } block? Then it only exists there (scope).',
      ],
    }),
  },
  {
    test: /Cannot access '(\S+)' before initialization|can't access lexical declaration '(\S+)' before initialization/,
    explain: (m) => ({
      title: `"${m[1] || m[2]}" used before its declaration line`,
      meaning: 'A variable declared with let or const exists only from its declaration line onward. This line runs earlier.',
      checks: [
        'Move the declaration above the line that uses it.',
        'If a function uses it, make sure the function is called after the declaration.',
      ],
    }),
  },
  {
    test: /Cannot (read|set) propert(?:y|ies) of (undefined|null)(?: \((?:reading|setting) '([^']+)'\))?|can't access property "([^"]+)", (\S+) is (undefined|null)|(\S+) is (undefined|null)$/,
    explain: (m) => {
      const missing = m[2] || m[6] || m[8] || 'undefined';
      const prop = m[3] || m[4];
      return {
        title: `Using a property of ${missing}`,
        meaning: `${prop ? `You tried to use .${prop} on a value that is ${missing}.` : `You used a property on a value that is ${missing}.`} The value LEFT of the dot is missing, not the property.`,
        checks: missing === 'null'
          ? [
              'querySelector / getElementById return null when nothing matches. Check the selector (. for classes, # for ids) and the spelling in the HTML.',
              'Does the script run before the element exists? (Here the script runs after the HTML, so this is usually a selector typo.)',
            ]
          : [
              'Log the value left of the dot: console.log(thatValue).',
              'Is a property name misspelled earlier in the chain (user.adress.city)?',
              'Is an array index out of range? arr[arr.length] is undefined.',
              'Does a function you call actually return something?',
            ],
      };
    },
  },
  {
    test: /(\S+) is not a function/,
    explain: (m) => ({
      title: `${m[1]} is not a function`,
      meaning: `You put () after ${m[1]}, which means "call it", but its value is not a function.`,
      checks: [
        'Spelling and capitalization of method names: addEventListener, querySelector, toUpperCase.',
        'Is the value the type you think? .map() exists on arrays, not on plain objects or strings.',
        'Did you overwrite a function with a value of the same name?',
      ],
    }),
  },
  {
    test: /is not iterable/,
    explain: () => ({
      title: 'Looping over something that is not a list',
      meaning: 'for…of, spread (...) and destructuring need an array-like value. This value is not one (often undefined or a plain object).',
      checks: [
        'Log the value just before the loop.',
        'For a plain object, use Object.keys(obj), Object.values(obj) or Object.entries(obj).',
      ],
    }),
  },
  {
    test: /Assignment to constant variable|invalid assignment to const/,
    explain: () => ({
      title: 'Changing a const',
      meaning: 'A variable declared with const cannot be given a new value with =.',
      checks: [
        'If the value really needs to change, declare it with let.',
        'Note: you CAN change the contents of a const array or object (push, obj.x = 1); you just cannot replace it.',
      ],
    }),
  },
  {
    test: /has already been declared|redeclaration of/,
    explain: () => ({
      title: 'The same name declared twice',
      meaning: 'let and const do not allow declaring the same name twice in the same scope.',
      checks: ['Remove the second let/const and just assign: name = newValue (only for let).'],
    }),
  },
  {
    test: /Maximum call stack size exceeded|too much recursion/,
    explain: () => ({
      title: 'A function keeps calling itself',
      meaning: 'Functions called each other (or themselves) so many times that the browser ran out of space to track them.',
      checks: [
        'Does the recursive function have a base case that stops it?',
        'Do two functions call each other in a circle?',
        'An event handler that triggers the same event can cause this too.',
      ],
    }),
  },
  {
    test: /JSON|is not valid JSON|Unexpected token .* in JSON/,
    explain: () => ({
      title: 'Invalid JSON',
      meaning: 'JSON.parse() received text that is not valid JSON.',
      checks: [
        'Log the text before parsing it. Is it empty, undefined, or HTML (e.g. an error page)?',
        'JSON needs double quotes around keys and strings, and no trailing commas.',
      ],
    }),
  },
  {
    test: /Failed to fetch|NetworkError|Load failed/,
    explain: () => ({
      title: 'The request did not reach the server',
      meaning: 'fetch() could not get any response. This is not the same as an error status like 404, which still counts as a response.',
      checks: [
        'Is the URL correct, including https://?',
        'Are you online?',
        'Does the API allow requests from browsers (CORS)? The browser console of the preview may say more.',
      ],
    }),
  },
  {
    test: /SyntaxError|Unexpected token|Unexpected end of input|Unexpected identifier|missing .* (?:after|before)|Invalid or unexpected token|unterminated/i,
    explain: () => ({
      title: 'Syntax error: the code could not start',
      meaning: 'The browser could not understand the code\'s structure, so NONE of it ran. The real mistake is often on the line before the one reported.',
      checks: [
        'Every ( { [ has a matching ) } ].',
        'Every string starts and ends with the same quote.',
        'Commas between items in arrays and objects; no comma missing or doubled.',
        '"Unexpected end of input" almost always means a missing } at the end.',
      ],
    }),
  },
];

/**
 * @param {string} message - The error message as reported by the browser.
 * @returns {{title: string, meaning: string, checks: string[]} | null}
 */
export function explainError(message) {
  for (const { test, explain } of EXPLANATIONS) {
    const match = message.match(test);
    if (match) return explain(match);
  }
  return null;
}
