/*
 * checklist-exercise.js — a self-review checklist, used for the final review of projects.
 *
 *   {
 *     type: 'checklist',
 *     items: ['Every button works with the keyboard', …],
 *   }
 *
 * A program cannot judge everything that makes code professional (are the names
 * clear? is the structure sensible?). So, like a code review with a colleague,
 * you go through the list and confirm each point honestly, fixing what is not
 * true yet. The review is complete when every point is confirmed.
 */

import { h } from '../../core/dom.js';
import { inline } from '../rich-text.js';

export function createChecklistExercise(exercise, ctx) {
  const checked = new Set(Array.isArray(ctx.draft) ? ctx.draft : []);

  const boxes = exercise.items.map((item, index) => {
    const input = h('input', { type: 'checkbox', checked: checked.has(index) });
    input.addEventListener('change', () => {
      if (input.checked) checked.add(index);
      else checked.delete(index);
      ctx.saveDraft([...checked]);
    });
    return h('label', { class: 'choice' }, input, h('span', null, inline(item)));
  });

  const element = h('fieldset', { class: 'choice-list' },
    h('legend', { class: 'field__help' }, 'Tick a point only when it is really true for your project. Fix the others first, then come back.'),
    boxes,
  );

  async function check() {
    const done = checked.size;
    const total = exercise.items.length;
    const complete = done === total;
    return {
      correct: complete,
      score: done / total,
      selfAssessed: true,
      feedback: h('p', null, complete
        ? 'Review complete. This project is finished.'
        : `${done} of ${total} points confirmed. Work on the open points, then complete the review.`),
    };
  }

  return { element, check, solution: null, checkLabel: 'Complete the review' };
}
