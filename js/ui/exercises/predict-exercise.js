/*
 * predict-exercise.js — "what does this code print?"
 *
 *   {
 *     type: 'predict',
 *     code: '…', language: 'js',
 *     expected: 'AC\n3',      // the exact console output, one line per console.log
 *   }
 *
 * You commit to a prediction BEFORE seeing the answer. That is the point: reading
 * code and running it in your head is the skill being trained.
 * Feedback says which lines are right, without revealing the correct output.
 */

import { h } from '../../core/dom.js';
import { createCodeBlock } from '../code-block.js';

/**
 * Make small formatting differences not matter:
 * extra spaces, spaces after commas/brackets, and ' versus " quotes.
 */
function normalizeLine(line) {
  return line
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([[\](){},:])\s*/g, '$1')
    .replace(/'/g, '"');
}

function toLines(text) {
  const lines = text.replace(/\r/g, '').split('\n').map(normalizeLine);
  while (lines.length && lines[lines.length - 1] === '') lines.pop(); // ignore trailing empty lines
  return lines;
}

export function createPredictExercise(exercise, ctx) {
  const answer = h('textarea', {
    class: 'answer-input answer-input--mono',
    rows: Math.max(3, exercise.expected.split('\n').length + 1),
    spellcheck: 'false',
    autocapitalize: 'off',
    id: `${exercise.id}-answer`,
  });
  answer.value = ctx.draft ?? '';
  answer.addEventListener('input', () => ctx.saveDraft(answer.value));

  const element = h('div', { class: 'stack' },
    createCodeBlock({ code: exercise.code, language: exercise.language ?? 'js', label: 'Code to read' }),
    h('div', { class: 'field' },
      h('label', { class: 'field__label', for: answer.id }, 'Your prediction of the console output'),
      h('p', { class: 'field__help' }, 'Write one line per console.log, in the order they appear.'),
      answer,
    ),
  );

  async function check() {
    if (!answer.value.trim()) return { invalid: 'Write your prediction first. A guess is fine: committing to an answer is part of the exercise.' };

    const expected = toLines(exercise.expected);
    const given = toLines(answer.value);
    const rows = expected.map((line, i) => given[i] === line);
    const rightCount = rows.filter(Boolean).length;
    const correct = rightCount === expected.length && given.length === expected.length;

    return {
      correct,
      score: rightCount / expected.length,
      feedback: h('div', { class: 'stack' },
        given.length !== expected.length && h('p', null,
          `The code prints ${expected.length} line${expected.length === 1 ? '' : 's'}; you wrote ${given.length}. Count the console.log calls that actually run.`),
        h('ul', { class: 'test-list' }, rows.map((ok, i) =>
          h('li', { class: `test-result test-result--${ok ? 'pass' : 'fail'}` },
            h('span', { class: 'test-result__body' },
              h('span', { class: 'test-result__name' }, `Line ${i + 1}: ${ok ? 'correct' : 'not right yet'}`))))),
        correct && h('div', null,
          h('p', { class: 'field__label' }, 'Actual output'),
          h('pre', { class: 'code-block' }, exercise.expected)),
      ),
    };
  }

  function solution() {
    return h('div', null,
      h('p', { class: 'field__label' }, 'The code prints'),
      h('pre', { class: 'code-block' }, exercise.expected));
  }

  return { element, check, solution };
}
