/*
 * order-exercise.js — "put these steps in the order they happen".
 *
 *   {
 *     type: 'order',
 *     code: '…',                         // optional code the steps refer to
 *     steps: ['first', 'second', …],     // written in the CORRECT order
 *   }
 *
 * The steps are shown shuffled. You reorder them with Move up / Move down buttons
 * (keyboard and screen-reader friendly — no drag and drop needed).
 */

import { h } from '../../core/dom.js';
import { createCodeBlock } from '../code-block.js';
import { inline } from '../rich-text.js';

/**
 * A shuffle that gives the same result every time for the same exercise
 * (so the list does not jump around when you come back), but is never
 * already in the correct order.
 */
function stableShuffle(count, seedText) {
  let seed = [...seedText].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    seed = (seed * 1103515245 + 12345) >>> 0; // a simple "linear congruential" generator
    return seed / 2 ** 32;
  };
  const order = [...Array(count).keys()];
  for (let i = order.length - 1; i > 0; i--) {   // Fisher–Yates shuffle
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((value, index) => value === index)) order.reverse();
  return order;
}

export function createOrderExercise(exercise, ctx) {
  // `order` holds step indexes: order[0] is the index of the step shown first.
  let order = Array.isArray(ctx.draft) && ctx.draft.length === exercise.steps.length
    ? ctx.draft
    : stableShuffle(exercise.steps.length, exercise.id);
  let marks = null; // after a check: true/false per position

  const list = h('ol', { class: 'order-list' });

  function render(focusIndex = null, focusDirection = null) {
    list.replaceChildren(...order.map((stepIndex, position) => {
      const text = exercise.steps[stepIndex];
      const up = h('button', {
        class: 'icon-btn icon-btn--sm', type: 'button',
        'aria-label': `Move up: ${text}`, disabled: position === 0,
        onClick: () => move(position, -1),
      }, '↑');
      const down = h('button', {
        class: 'icon-btn icon-btn--sm', type: 'button',
        'aria-label': `Move down: ${text}`, disabled: position === order.length - 1,
        onClick: () => move(position, 1),
      }, '↓');
      const markClass = marks ? (marks[position] ? ' order-item--right' : ' order-item--wrong') : '';
      return h('li', { class: `order-item${markClass}` },
        h('span', { class: 'order-item__text' }, inline(text)),
        h('span', { class: 'order-item__buttons' }, up, down),
      );
    }));

    // Keep keyboard focus on the button you pressed, in the item's new position.
    if (focusIndex !== null) {
      const buttons = list.children[focusIndex]?.querySelectorAll('button');
      const target = focusDirection < 0 ? buttons?.[0] : buttons?.[1];
      (target && !target.disabled ? target : buttons?.[focusDirection < 0 ? 1 : 0])?.focus();
    }
  }

  function move(position, direction) {
    const target = position + direction;
    if (target < 0 || target >= order.length) return;
    [order[position], order[target]] = [order[target], order[position]];
    marks = null;
    ctx.saveDraft(order);
    render(target, direction);
  }

  const element = h('div', { class: 'stack' },
    exercise.code && createCodeBlock({ code: exercise.code, language: exercise.language ?? 'js', highlight: exercise.highlight, label: 'Code to read' }),
    list,
  );
  render();

  async function check() {
    marks = order.map((stepIndex, position) => stepIndex === position);
    render();
    const right = marks.filter(Boolean).length;
    const correct = right === order.length;
    return {
      correct,
      score: right / order.length,
      feedback: h('p', null, correct
        ? 'Every step is in the right place.'
        : `${right} of ${order.length} steps are in the right position (marked green). Trace the code again from the top, one line at a time.`),
    };
  }

  function solution() {
    return h('ol', { class: 'solution-steps' }, exercise.steps.map((step) => h('li', null, inline(step))));
  }

  return { element, check, solution };
}
