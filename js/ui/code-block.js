/*
 * code-block.js — read-only, syntax-highlighted code with line numbers.
 *
 * Lessons use `highlight` to draw attention to the important lines:
 *   createCodeBlock({ code, language: 'js', highlight: [3, 4] })
 */

import { h } from '../core/dom.js';
import { highlightLines } from '../services/highlighter.js';

/**
 * @param {object} options
 * @param {string} options.code
 * @param {'html'|'css'|'js'} options.language
 * @param {number[]} [options.highlight] - Line numbers (1-based) to emphasize.
 * @param {string} [options.label] - Accessible description, e.g. "Example: a counter".
 */
export function createCodeBlock({ code, language, highlight = [], label }) {
  const marked = new Set(highlight);
  const codeEl = h('code', { class: `language-${language}` });

  // highlightLines() returns escaped HTML (every "<" in the code is already "&lt;"),
  // so inserting it with innerHTML is safe here.
  codeEl.innerHTML = highlightLines(code.replace(/\n$/, ''), language)
    .map((lineHtml, i) => {
      const number = i + 1;
      const cls = marked.has(number) ? 'code-line is-highlighted' : 'code-line';
      return `<span class="${cls}" data-line="${number}">${lineHtml || ' '}</span>`;
    })
    .join('');

  return h('pre', {
    class: 'code-block code-block--numbered',
    tabindex: '0', // scrollable regions must be reachable with the keyboard
    'aria-label': label ?? `${language.toUpperCase()} code`,
  }, codeEl);
}
