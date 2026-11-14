/*
 * styleguide.js — a reference page showing the app's visual building blocks.
 * Useful when building later stages, and a quick way to check both themes.
 */

import { h, icon } from '../core/dom.js';
import { pageHeader, section, callout } from '../ui/page.js';

const sampleCode = `const tasks = ['Read', 'Write', 'Debug'];

function countLetters(words) {
  return words.map((word) => word.length);
}

console.log(countLetters(tasks)); // [4, 5, 5]`;

export function render(root) {
  root.append(
    pageHeader({
      eyebrow: 'Reference',
      title: 'Design reference',
      lead: 'Each kind of learning content has its own color, so you always know whether you are reading an explanation, doing an exercise or looking at a solution.',
    }),

    section('Learning content',
      h('div', { class: 'stack' },
        callout('explain', 'Explanation',
          h('p', null, 'A plain description of a concept. Inline code looks like this: ', h('code', null, 'array.map()'), '.')),
        callout('example', 'Example',
          h('pre', { class: 'code-block' }, h('code', null, sampleCode))),
        callout('exercise', 'Exercise',
          h('p', null, 'Write a function that returns the length of every word.')),
        callout('hint', 'Hint 1 of 3',
          h('p', null, 'Look at what the function returns. Which array method creates a new array of the same length?')),
        callout('solution', 'Solution',
          h('p', null, 'Correct: map() calls the function once per item and collects the results in a new array.')),
        callout('mistake', 'Common mistake',
          h('p', null, 'Forgetting return inside a function with curly braces gives you an array of undefined.')),
      ),
    ),

    section('Buttons and badges',
      h('div', { class: 'card stack' },
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn btn--primary', type: 'button' }, 'Check answer'),
          h('button', { class: 'btn', type: 'button' }, 'Show hint'),
          h('button', { class: 'btn btn--ghost', type: 'button' }, 'Skip'),
          h('button', { class: 'btn btn--danger', type: 'button' }, 'Reset'),
          h('button', { class: 'btn', type: 'button', disabled: true }, 'Disabled'),
        ),
        h('div', { class: 'btn-row' },
          h('span', { class: 'badge' }, 'In preparation'),
          h('span', { class: 'badge badge--accent' }, 'Due today'),
          h('span', { class: 'badge badge--success' }, icon('check'), 'Mastered'),
        ),
      ),
    ),
  );
}
