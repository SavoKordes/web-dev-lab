/*
 * code-editor.js — a small code editor with syntax highlighting and line numbers.
 *
 * The trick: two layers stacked exactly on top of each other.
 *
 *   ┌──────────────────────────────────────────┐
 *   │ <textarea>  transparent text, visible     │  ← you type here (caret, selection, undo)
 *   │ <pre>       colored copy of the same text │  ← you SEE this, behind the textarea
 *   └──────────────────────────────────────────┘
 *
 * Every time the text changes, the <pre> is re-rendered from the textarea's value.
 * Both layers use the same font, size, line height and padding, so every character
 * lines up. When the textarea scrolls, the <pre> and the line numbers are scrolled
 * by the same amount.
 *
 * Why not contenteditable? A textarea gives us correct typing, selection, undo,
 * copy/paste and mobile keyboards for free. contenteditable needs a lot of code
 * to get those right.
 */

import { h } from '../core/dom.js';
import { highlightLines } from '../services/highlighter.js';

const INDENT = '  '; // two spaces
const CLOSING = { '{': '}', '[': ']', '(': ')' };
const VOID_HTML_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

let editorCount = 0; // used to create unique ids

/**
 * @param {object} options
 * @param {string} options.value - Initial code.
 * @param {'html'|'css'|'js'} options.language
 * @param {string} options.label - Accessible name, e.g. "JavaScript editor".
 * @param {(value: string) => void} [options.onChange] - Called after every edit.
 */
export function createCodeEditor({ value = '', language, label, onChange }) {
  editorCount += 1;
  const hintId = `editor-hint-${editorCount}`;

  /* ── Build the DOM ── */
  const textarea = h('textarea', {
    class: 'editor__input',
    spellcheck: 'false',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    wrap: 'off',
    'aria-label': label,
    'aria-describedby': hintId,
  });
  textarea.value = value;

  const code = h('code');
  const highlightLayer = h('pre', { class: 'editor__highlight', 'aria-hidden': 'true' }, code);
  const gutter = h('div', { class: 'editor__gutter', 'aria-hidden': 'true' });
  const lineMark = h('div', { class: 'editor__line-mark', hidden: true });
  const hint = h('span', { id: hintId, class: 'visually-hidden' },
    'Tab inserts indentation. To leave the editor with the keyboard, press Escape and then Tab.');

  const element = h('div', { class: 'editor' },
    lineMark,
    gutter,
    h('div', { class: 'editor__body' }, highlightLayer, textarea),
    hint,
  );

  let lineCount = 0;
  let markedLine = null;
  let escapeJustPressed = false;

  /* ── Rendering ── */

  function render() {
    const lines = highlightLines(textarea.value, language);
    // The extra "\n" makes sure an empty last line still has height,
    // so the <pre> is never one line shorter than the textarea.
    code.innerHTML = `${lines.join('\n')}\n`;

    // Only rebuild the line numbers when the number of lines changed.
    if (lines.length !== lineCount) {
      lineCount = lines.length;
      gutter.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
    }
    syncScroll();
  }

  function syncScroll() {
    highlightLayer.scrollTop = textarea.scrollTop;
    highlightLayer.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
    positionLineMark();
  }

  function metrics() {
    const style = getComputedStyle(textarea);
    return { lineHeight: parseFloat(style.lineHeight), paddingTop: parseFloat(style.paddingTop) };
  }

  /** Move the red error bar to the marked line (it must follow scrolling). */
  function positionLineMark() {
    if (!markedLine) {
      lineMark.hidden = true;
      return;
    }
    const { lineHeight, paddingTop } = metrics();
    lineMark.hidden = false;
    lineMark.style.height = `${lineHeight}px`;
    lineMark.style.transform = `translateY(${paddingTop + (markedLine - 1) * lineHeight - textarea.scrollTop}px)`;
  }

  /* ── Editing helpers ── */

  /**
   * Insert text at the cursor, replacing any selection.
   * document.execCommand('insertText') is officially deprecated, but it is still the
   * only way to change a textarea that keeps Ctrl+Z (undo) working. If a browser
   * ever drops it, we fall back to setRangeText (undo then skips this change).
   */
  function insertText(text) {
    const ok = document.execCommand && document.execCommand('insertText', false, text);
    if (!ok) {
      textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /** Add (direction 1) or remove (direction -1) one level of indentation on the selected lines. */
  function shiftLines(direction) {
    const { selectionStart: start, selectionEnd: end, value: text } = textarea;
    const blockStart = text.lastIndexOf('\n', start - 1) + 1;
    // If the selection ends right at the start of a line, that line is not included.
    const lastChar = end > start && text[end - 1] === '\n' ? end - 1 : end;
    const lineEnd = text.indexOf('\n', lastChar);
    const blockEnd = lineEnd === -1 ? text.length : lineEnd;

    const oldLines = text.slice(blockStart, blockEnd).split('\n');
    const newLines = oldLines.map((line) =>
      direction > 0 ? INDENT + line : line.replace(/^( {1,2}|\t)/, ''));
    const replacement = newLines.join('\n');

    textarea.setSelectionRange(blockStart, blockEnd);
    insertText(replacement);

    if (start === end) {
      // No selection: keep the caret in the same place relative to the text.
      const shift = newLines[0].length - oldLines[0].length;
      const caret = Math.max(blockStart, start + shift);
      textarea.setSelectionRange(caret, caret);
    } else {
      textarea.setSelectionRange(blockStart, blockStart + replacement.length);
    }
  }

  /** Enter: keep the current indentation, and indent one more level after an opening bracket or tag. */
  function insertNewline() {
    const { selectionStart: start, selectionEnd: end, value: text } = textarea;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineBefore = text.slice(lineStart, start);
    const indent = lineBefore.match(/^[ \t]*/)[0];

    const charBefore = text[start - 1];
    const charAfter = text[end];
    let opens = charBefore in CLOSING;
    let closesRightAfter = opens && charAfter === CLOSING[charBefore];

    if (language === 'html') {
      const openTag = lineBefore.match(/<([a-zA-Z][\w-]*)(?:\s[^<>]*)?>$/);
      if (openTag && !VOID_HTML_ELEMENTS.has(openTag[1].toLowerCase())) {
        opens = true;
        closesRightAfter = text.startsWith('</', end);
      }
    }

    if (opens && closesRightAfter) {
      // {|}  →  {
      //           |
      //         }
      insertText(`\n${indent}${INDENT}\n${indent}`);
      const caret = start + 1 + indent.length + INDENT.length;
      textarea.setSelectionRange(caret, caret);
    } else if (opens) {
      insertText(`\n${indent}${INDENT}`);
    } else {
      insertText(`\n${indent}`);
    }
  }

  /* ── Events ── */

  textarea.addEventListener('input', () => {
    if (markedLine) markedLine = null; // the error mark refers to the old code
    render();
    onChange?.(textarea.value);
  });

  textarea.addEventListener('scroll', syncScroll);

  textarea.addEventListener('keydown', (event) => {
    if (event.isComposing) return; // typing with an input method (e.g. accents) — leave alone

    if (event.key === 'Escape') {
      escapeJustPressed = true;
      return;
    }
    const escaped = escapeJustPressed;
    escapeJustPressed = false;

    const modifier = event.ctrlKey || event.metaKey || event.altKey;

    // Tab indents — unless Escape was pressed just before, then Tab moves focus as usual.
    // (Without this escape route, keyboard users would be trapped in the editor.)
    if (event.key === 'Tab' && !escaped && !modifier) {
      event.preventDefault();
      const { selectionStart, selectionEnd, value: text } = textarea;
      const multiLine = text.slice(selectionStart, selectionEnd).includes('\n');
      if (event.shiftKey) shiftLines(-1);
      else if (multiLine) shiftLines(1);
      else insertText(INDENT);
      return;
    }

    if (event.key === 'Enter' && !modifier && !event.shiftKey) {
      event.preventDefault();
      insertNewline();
    }
  });

  // When the editor changes size (window resize, tab shown), keep layers aligned.
  const resizeObserver = new ResizeObserver(syncScroll);
  resizeObserver.observe(textarea);

  render();

  /* ── Public API: what other code may do with this editor ── */
  return {
    element,
    getValue: () => textarea.value,

    /** Replace all code (does not call onChange). */
    setValue(newValue) {
      textarea.value = newValue;
      markedLine = null;
      render();
    },

    focus: () => textarea.focus(),

    /** Put the caret at the start of a line (1-based) and scroll it into view. */
    goToLine(line) {
      const lines = textarea.value.split('\n');
      const target = Math.min(Math.max(1, line), lines.length);
      const offset = lines.slice(0, target - 1).reduce((sum, l) => sum + l.length + 1, 0);
      textarea.focus();
      textarea.setSelectionRange(offset, offset);
      const { lineHeight } = metrics();
      textarea.scrollTop = Math.max(0, (target - 1) * lineHeight - textarea.clientHeight / 3);
      textarea.scrollLeft = 0; // the caret is at the start of the line
      syncScroll();
    },

    /** Stop watching for size changes. Call when the editor is removed from the page. */
    destroy: () => resizeObserver.disconnect(),

    /** Highlight one line, e.g. where an error happened. Pass null to remove. */
    markLine(line) {
      markedLine = line;
      positionLineMark();
    },
  };
}
