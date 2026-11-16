/*
 * console-panel.js — shows console output and errors from the preview.
 *
 * It only DISPLAYS messages. The sandbox (js/services/sandbox.js) collects them,
 * and the view that owns both connects them: sandbox → view → console panel.
 */

import { h } from '../core/dom.js';
import { explainError } from '../services/error-explainer.js';

const LEVEL_LABELS = { log: 'log', info: 'info', debug: 'debug', warn: 'warning', error: 'error' };

/**
 * @param {object} options
 * @param {(line: number) => void} [options.onLineClick] - Called when an error's line link is clicked.
 * @param {Node[]} [options.actions] - Extra buttons for the panel header.
 */
export function createConsolePanel({ onLineClick, actions = [], label = 'Console' } = {}) {
  // role="log" lets screen readers announce new output. It is not allowed on a
  // list element, so the log is a <div> with one <div> per entry.
  const list = h('div', { class: 'console__list', role: 'log', 'aria-label': `${label} output` });
  const status = h('span', { class: 'console__status' });
  const errorBadge = h('span', { class: 'badge badge--error', hidden: true });

  const element = h('section', { class: 'panel console', 'aria-label': label },
    h('header', { class: 'panel__header' },
      h('h2', { class: 'panel__title' }, 'Console'),
      errorBadge,
      status,
      h('div', { class: 'panel__actions' },
        actions,
        h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: clear }, 'Clear'),
      ),
    ),
    list,
  );

  let errorCount = 0;
  let lastEntry = null; // for grouping identical repeated messages

  function showEmptyMessage() {
    list.replaceChildren(h('div', { class: 'console__empty' },
      'Nothing logged yet. Use console.log(value) in your JavaScript to print values here.'));
  }

  function add(entry) {
    list.querySelector('.console__empty')?.remove();
    list.append(entry);
    list.scrollTop = list.scrollHeight; // keep the newest message in view
  }

  /** A console.log / warn / error / info call from the code. */
  function log(level, parts) {
    const text = parts.join(' ');

    // Like browser consoles: the same message several times in a row shows a counter.
    if (lastEntry && lastEntry.level === level && lastEntry.text === text) {
      lastEntry.count += 1;
      lastEntry.counter.textContent = lastEntry.count;
      lastEntry.counter.hidden = false;
      return;
    }

    const counter = h('span', { class: 'console__count', hidden: true }, '1');
    const entry = h('div', { class: `console__entry console__entry--${level}` },
      h('div', { class: 'console__row' },
        counter,
        h('span', { class: 'console__level' }, LEVEL_LABELS[level] ?? level),
        h('span', { class: 'console__text' }, text),
      ),
    );
    add(entry);
    lastEntry = { level, text, count: 1, counter };
    if (level === 'error') countError();
  }

  /** An uncaught error, with an optional line number in the JS editor. */
  function error({ message, line }) {
    countError();
    lastEntry = null;
    const explanation = explainError(message);

    add(h('div', { class: 'console__entry console__entry--error console__entry--uncaught' },
      h('div', { class: 'console__row' },
        h('span', { class: 'console__level' }, 'error'),
        h('span', { class: 'console__text' }, message),
        line && h('button', {
          class: 'console__line',
          type: 'button',
          title: 'Show this line in the JavaScript editor',
          onClick: () => onLineClick?.(line),
        }, `line ${line}`),
      ),
      explanation && h('details', { class: 'console__explain' },
        h('summary', null, `What does this mean? ${explanation.title}`),
        h('p', null, explanation.meaning),
        h('p', { class: 'console__checks-title' }, 'Check:'),
        h('ul', null, explanation.checks.map((check) => h('li', null, check))),
      ),
    ));
  }

  /** A note from the lab itself (not from your code). */
  function note(text) {
    lastEntry = null;
    add(h('div', { class: 'console__entry console__entry--note' }, text));
  }

  function countError() {
    errorCount += 1;
    errorBadge.textContent = errorCount === 1 ? '1 error' : `${errorCount} errors`;
    errorBadge.hidden = false;
  }

  function clear() {
    errorCount = 0;
    lastEntry = null;
    errorBadge.hidden = true;
    showEmptyMessage();
  }

  function setStatus(text) {
    status.textContent = text;
  }

  showEmptyMessage();
  return { element, log, error, note, clear, setStatus };
}
