/*
 * explain-exercise.js — "explain in your own words what this code does".
 *
 *   {
 *     type: 'explain',
 *     code: '…',
 *     minLength: 60,                       // characters, so the answer is a real attempt
 *     keyPoints: ['point a good answer mentions', …],
 *     modelAnswer: 'An example of a good explanation.',
 *   }
 *
 * A program cannot reliably judge a free-text explanation, so this is honest
 * SELF-assessment: after you commit to your answer, the model answer and a list
 * of key points appear. You tick the points your answer really covered.
 * Your answer is locked at that moment, so it cannot be "improved" by copying.
 * Self-assessed results count a little less toward mastery (see progress.js).
 */

import { h } from '../../core/dom.js';
import { createCodeBlock } from '../code-block.js';
import { inline, richText } from '../rich-text.js';

const PASS_RATIO = 0.7;

export function createExplainExercise(exercise, ctx) {
  const minLength = exercise.minLength ?? 60;
  const draft = ctx.draft ?? {};

  const answer = h('textarea', { class: 'answer-input', rows: 5, id: `${exercise.id}-answer` });
  answer.value = draft.text ?? '';

  const counter = h('span', { class: 'field__help' });
  function updateCounter() {
    const length = answer.value.trim().length;
    counter.textContent = length < minLength
      ? `${length} / ${minLength} characters minimum`
      : `${length} characters`;
  }
  answer.addEventListener('input', () => {
    updateCounter();
    ctx.saveDraft({ text: answer.value });
  });
  updateCounter();

  const reviewArea = h('div', { class: 'stack' });

  const element = h('div', { class: 'stack' },
    exercise.code && createCodeBlock({ code: exercise.code, language: exercise.language ?? 'js', highlight: exercise.highlight, label: 'Code to explain' }),
    h('div', { class: 'field' },
      h('label', { class: 'field__label', for: answer.id }, 'Your explanation'),
      answer,
      counter,
    ),
    reviewArea,
  );

  /** Phase 2: show the model answer and the self-assessment checklist. */
  function showReview(lockedAnswer) {
    answer.readOnly = true;
    const boxes = exercise.keyPoints.map((point, i) =>
      h('label', { class: 'choice' },
        h('input', { type: 'checkbox', value: String(i) }),
        h('span', null, inline(point))));

    const submitButton = h('button', { class: 'btn btn--primary', type: 'button' }, 'Save my self-assessment');
    submitButton.addEventListener('click', () => {
      const covered = boxes.filter((label) => label.querySelector('input').checked).length;
      const ratio = covered / exercise.keyPoints.length;
      submitButton.disabled = true;
      boxes.forEach((label) => { label.querySelector('input').disabled = true; });
      ctx.saveDraft({ text: lockedAnswer, reviewed: true });
      ctx.submit({
        correct: ratio >= PASS_RATIO,
        score: ratio,
        selfAssessed: true,
        feedback: h('p', null, ratio >= PASS_RATIO
          ? `Your explanation covered ${covered} of ${exercise.keyPoints.length} key points.`
          : `Your explanation covered ${covered} of ${exercise.keyPoints.length} key points. Read the model answer, then come back to this exercise later and explain it again without looking.`),
      });
    });

    reviewArea.replaceChildren(
      h('div', { class: 'callout callout--solution' },
        h('p', { class: 'callout__label' }, 'Model answer'),
        richText(exercise.modelAnswer)),
      h('fieldset', { class: 'choice-list' },
        h('legend', { class: 'field__label' }, 'Be honest: which of these did YOUR answer clearly explain?'),
        boxes),
      h('div', { class: 'btn-row' }, submitButton),
    );
  }

  // Returning to an exercise you already reviewed: keep the answer locked.
  if (draft.reviewed) {
    answer.readOnly = true;
    reviewArea.append(h('div', { class: 'callout callout--solution' },
      h('p', { class: 'callout__label' }, 'Model answer'),
      richText(exercise.modelAnswer)));
  }

  async function check() {
    if (answer.readOnly) return { invalid: 'You have already compared this answer with the model answer.' };
    if (answer.value.trim().length < minLength) {
      return { invalid: `Write at least ${minLength} characters. Explain it as you would to a colleague.` };
    }
    showReview(answer.value);
    return null; // the result comes later, from the self-assessment button
  }

  return {
    element,
    check,
    solution: null, // the model answer is part of the check itself
    checkLabel: 'Compare with model answer',
  };
}
