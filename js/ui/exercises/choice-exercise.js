/*
 * choice-exercise.js — multiple choice, used sparingly for quick concept checks.
 *
 *   {
 *     type: 'choice',
 *     multiple: false,              // true: choose all that apply (checkboxes)
 *     code: '…',                    // optional
 *     options: [
 *       { text: '…', correct: true,  feedback: 'Why this is right' },
 *       { text: '…', correct: false, feedback: 'Why someone might pick this, and why it is wrong' },
 *     ],
 *   }
 *
 * The value is in the feedback: a wrong answer explains the misconception behind it,
 * without revealing which option is correct.
 */

import { h } from '../../core/dom.js';
import { createCodeBlock } from '../code-block.js';
import { inline, richText } from '../rich-text.js';

export function createChoiceExercise(exercise, ctx) {
  const inputType = exercise.multiple ? 'checkbox' : 'radio';
  const name = `${exercise.id}-choice`;
  const saved = new Set(Array.isArray(ctx.draft) ? ctx.draft : []);

  const inputs = exercise.options.map((option, index) =>
    h('input', { type: inputType, name, value: String(index), checked: saved.has(index) }));

  const fieldset = h('fieldset', { class: 'choice-list' },
    h('legend', { class: 'visually-hidden' }, exercise.multiple ? 'Choose all that apply' : 'Choose one answer'),
    exercise.options.map((option, index) =>
      h('label', { class: 'choice' }, inputs[index], h('span', null, inline(option.text)))),
  );

  fieldset.addEventListener('change', () => ctx.saveDraft(selectedIndexes()));

  function selectedIndexes() {
    return inputs.filter((input) => input.checked).map((input) => Number(input.value));
  }

  const element = h('div', { class: 'stack' },
    exercise.code && createCodeBlock({ code: exercise.code, language: exercise.language ?? 'js', highlight: exercise.highlight }),
    exercise.multiple && h('p', { class: 'field__help' }, 'Choose all answers that apply.'),
    fieldset,
  );

  async function check() {
    const selected = selectedIndexes();
    if (selected.length === 0) return { invalid: 'Choose an answer first.' };

    const wrongPicked = selected.filter((i) => !exercise.options[i].correct);
    const correctIndexes = exercise.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
    const missed = correctIndexes.filter((i) => !selected.includes(i));
    const correct = wrongPicked.length === 0 && missed.length === 0;

    // Show the feedback for every option you picked: why it is right or wrong.
    const notes = selected.map((i) => {
      const option = exercise.options[i];
      return h('div', { class: `choice-feedback choice-feedback--${option.correct ? 'right' : 'wrong'}` },
        h('p', { class: 'choice-feedback__option' }, inline(option.text)),
        richText(option.feedback ?? ''),
      );
    });

    return {
      correct,
      score: correct ? 1 : 0,
      feedback: h('div', { class: 'stack' },
        !correct && wrongPicked.length === 0 && missed.length > 0 &&
          h('p', null, 'Everything you chose is right, but at least one more answer is also correct.'),
        notes,
      ),
    };
  }

  function solution() {
    return h('ul', { class: 'stack' }, exercise.options.filter((o) => o.correct).map((o) =>
      h('li', null, h('strong', null, inline(o.text)), o.feedback && h('div', null, richText(o.feedback)))));
  }

  return { element, check, solution };
}
