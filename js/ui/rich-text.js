/*
 * rich-text.js — turns simple formatted text from content files into DOM nodes.
 *
 * Content files (lessons, exercises) are written as plain strings with a few
 * Markdown-like conventions, so they stay easy to read and write:
 *
 *   Blank line            → new paragraph
 *   "- item" lines        → bulleted list
 *   `code`                → inline code
 *   **bold**              → bold
 *   ```js … ```           → highlighted code block (js, css or html)
 *
 * Everything is built with DOM methods, never innerHTML, so content can never
 * inject HTML by accident.
 */

import { h } from '../core/dom.js';
import { createCodeBlock } from './code-block.js';

/** Render a block of formatted text. Returns a DocumentFragment. */
export function richText(text) {
  const fragment = document.createDocumentFragment();
  if (!text) return fragment;

  // First split out fenced code blocks: ```lang\n…\n```
  const parts = text.split(/```(\w*)\n([\s\S]*?)```/);
  // split() with capture groups gives: [text, lang, code, text, lang, code, text…]
  for (let i = 0; i < parts.length; i += 3) {
    appendParagraphs(fragment, parts[i]);
    if (i + 2 < parts.length) {
      fragment.append(createCodeBlock({ code: parts[i + 2], language: parts[i + 1] || 'js' }));
    }
  }
  return fragment;
}

function appendParagraphs(target, text) {
  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.every((line) => /^\s*- /.test(line))) {
      target.append(h('ul', null, lines.map((line) => h('li', null, inline(line.replace(/^\s*- /, ''))))));
    } else {
      target.append(h('p', null, inline(lines.join(' '))));
    }
  }
}

/** Inline formatting: `code` and **bold**. Returns an array of nodes and strings. */
export function inline(text) {
  const result = [];
  // The capture group keeps the matched markers in the output of split().
  for (const piece of text.split(/(`[^`]+`|\*\*[^*]+\*\*)/)) {
    if (!piece) continue;
    if (piece.startsWith('`')) result.push(h('code', null, piece.slice(1, -1)));
    else if (piece.startsWith('**')) result.push(h('strong', null, piece.slice(2, -2)));
    else result.push(piece);
  }
  return result;
}
