/*
 * lesson-example.js — a code example inside a lesson.
 *
 *   { kind: 'example', title?, language: 'html' | 'css' | 'js', code,
 *     html?, css?,                  // extra files for the preview (e.g. the HTML a CSS example styles)
 *     preview?: true, previewHeight?: 180,
 *     notes: [{ lines: [3, 4], text: 'What these lines do' }] }
 *
 * The notes are the "important lines explained" step. Selecting a note
 * highlights its lines in the code, so you can see exactly what it refers to.
 */

import { h, toast } from '../core/dom.js';
import { read, update } from '../core/store.js';
import { createCodeBlock } from './code-block.js';
import { inline } from './rich-text.js';
import { createSandbox } from '../services/sandbox.js';
import { getStarter } from '../../content/playground-starters.js';

/** "Line 3" or "Lines 3–5" */
function linesLabel(lines) {
  if (lines.length === 1) return `Line ${lines[0]}`;
  const sorted = [...lines].sort((a, b) => a - b);
  const consecutive = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  return consecutive ? `Lines ${sorted[0]}–${sorted[sorted.length - 1]}` : `Lines ${sorted.join(', ')}`;
}

/** The three files this example represents, for the preview and for Code mode. */
function exampleFiles(example) {
  return {
    html: example.language === 'html' ? example.code : (example.html ?? ''),
    css: example.language === 'css' ? example.code : (example.css ?? ''),
    js: example.language === 'js' ? example.code : (example.js ?? ''),
  };
}

export function createLessonExample(example) {
  const block = createCodeBlock({ code: example.code, language: example.language, label: example.title ?? 'Example code' });
  const noteButtons = [];

  function highlight(lines) {
    for (const line of block.querySelectorAll('.code-line')) {
      line.classList.toggle('is-highlighted', lines.includes(Number(line.dataset.line)));
    }
  }

  const notes = (example.notes ?? []).map((note) => {
    const button = h('button', { class: 'note__lines', type: 'button', 'aria-pressed': 'false' }, linesLabel(note.lines));
    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') === 'true';
      noteButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', String(!pressed));
      highlight(pressed ? [] : note.lines);
    });
    noteButtons.push(button);
    return h('li', { class: 'note' }, button, h('div', { class: 'note__text' }, inline(note.text)));
  });

  /* ── Optional live preview ── */
  let sandbox = null;
  let previewEl = null;
  if (example.preview) {
    sandbox = createSandbox({ title: `Preview: ${example.title ?? 'example'}`, onMessage: () => {} });
    previewEl = h('div', { class: 'example__preview', style: `height: ${example.previewHeight ?? 180}px` },
      h('p', { class: 'example__preview-label' }, 'Result'),
      sandbox.element);
    sandbox.run(exampleFiles(example));
  }

  const element = h('div', { class: 'example' },
    h('div', { class: 'example__code' },
      block,
      previewEl,
      h('div', { class: 'example__actions' },
        h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => openInCodeMode(example) }, 'Try it in Code mode'),
      ),
    ),
    notes.length > 0 && h('div', { class: 'example__notes' },
      h('p', { class: 'example__notes-title' }, 'Important lines'),
      h('ol', { class: 'note-list' }, notes),
    ),
  );

  return { element, destroy: () => sandbox?.destroy() };
}

/** Copy the example into Code mode so you can change it and experiment. */
function openInCodeMode(example) {
  const current = read('code').playground;
  if (current) {
    const starter = getStarter(current.starterId);
    const modified = ['html', 'css', 'js'].some((f) => current.files[f] !== starter[f]);
    if (modified && !confirm('Replace the code that is currently in Code mode with this example?')) return;
  }

  update('code', (code) => {
    code.playground = {
      starterId: 'blank',
      files: exampleFiles(example),
      activeTab: example.language,
      autoRun: current?.autoRun ?? true,
    };
  });
  toast('Example opened in Code mode.');
  location.hash = '#/code';
}
