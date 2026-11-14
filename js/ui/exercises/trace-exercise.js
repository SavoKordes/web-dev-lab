/*
 * trace-exercise.js — "fill in the trace table".
 *
 *   {
 *     type: 'trace',
 *     code: '…',
 *     columns: ['price', 'total'],               // the variables to trace
 *     rows: [
 *       { label: 'Before the loop', values: ['—', '0'], given: [0, 1] },
 *       { label: 'After round 1',   values: ['4', '4'] },
 *     ],
 *   }
 *
 * A trace table is how experienced developers read tricky code on paper: one row
 * per step, one column per variable, filled in as you go. `given` lists the
 * column indexes that are already filled in, as a starting point.
 *
 * A value may list alternatives separated by "|", e.g. '4.5|4.50'.
 * Checking ignores spaces, quotes and upper/lower case, so ['a'] equals [a].
 */

import { h } from '../../core/dom.js';
import { createCodeBlock } from '../code-block.js';
import { inline } from '../rich-text.js';

function normalize(value) {
  return String(value).toLowerCase().replace(/[\s'"`]/g, '');
}

function isCorrect(given, expected) {
  return expected.split('|').some((option) => normalize(option) === normalize(given));
}

export function createTraceExercise(exercise, ctx) {
  const draft = ctx.draft ?? {};
  const inputs = []; // { input, expected } for every cell the learner fills in

  const table = h('table', { class: 'trace-table' },
    h('thead', null, h('tr', null,
      h('th', { scope: 'col' }, 'Step'),
      exercise.columns.map((column) => h('th', { scope: 'col' }, h('code', null, column))))),
    h('tbody', null, exercise.rows.map((row, r) => h('tr', null,
      h('th', { scope: 'row' }, inline(row.label)),
      row.values.map((value, c) => {
        if (row.given?.includes(c)) {
          return h('td', { class: 'trace-table__given' }, value);
        }
        const key = `${r}:${c}`;
        const input = h('input', {
          class: 'trace-table__input',
          type: 'text',
          spellcheck: 'false',
          autocapitalize: 'off',
          'aria-label': `${row.label.replace(/`/g, '')}, ${exercise.columns[c]}`,
        });
        input.value = draft[key] ?? '';
        input.addEventListener('input', () => {
          input.classList.remove('is-right', 'is-wrong');
          input.removeAttribute('aria-invalid');
          draft[key] = input.value;
          ctx.saveDraft({ ...draft });
        });
        inputs.push({ input, expected: value });
        return h('td', null, input);
      }),
    ))),
  );

  const element = h('div', { class: 'stack' },
    createCodeBlock({ code: exercise.code, language: exercise.language ?? 'js', highlight: exercise.highlight, label: 'Code to trace' }),
    h('p', { class: 'field__help' }, 'Fill in the value of each variable after each step. Write arrays like [a, b] and text without quotes.'),
    h('div', { class: 'trace-table__wrap' }, table),
  );

  async function check() {
    if (inputs.every(({ input }) => input.value.trim() === '')) {
      return { invalid: 'Fill in the table first. Work through the code one step at a time.' };
    }

    let right = 0;
    for (const { input, expected } of inputs) {
      const ok = isCorrect(input.value, expected);
      input.classList.toggle('is-right', ok);
      input.classList.toggle('is-wrong', !ok);
      if (ok) {
        right += 1;
        input.removeAttribute('aria-invalid');
      } else {
        input.setAttribute('aria-invalid', 'true');
      }
    }

    const correct = right === inputs.length;
    return {
      correct,
      score: right / inputs.length,
      feedback: h('p', null, correct
        ? 'Every value is right.'
        : `${right} of ${inputs.length} values are right. The wrong ones are marked in the table. Find the first wrong row: the mistake usually starts there and carries on into the rows below.`),
    };
  }

  function solution() {
    return h('div', { class: 'trace-table__wrap' }, h('table', { class: 'trace-table' },
      h('thead', null, h('tr', null,
        h('th', { scope: 'col' }, 'Step'),
        exercise.columns.map((column) => h('th', { scope: 'col' }, h('code', null, column))))),
      h('tbody', null, exercise.rows.map((row) => h('tr', null,
        h('th', { scope: 'row' }, inline(row.label)),
        row.values.map((value) => h('td', null, value.split('|')[0]))))),
    ));
  }

  return { element, check, solution };
}
