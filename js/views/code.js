/*
 * code.js — Code mode: HTML, CSS and JavaScript editors with a live preview and console.
 *
 * This view is the "conductor". It creates the parts and connects them; each part
 * does its own job:
 *
 *   code-editor.js ──onChange──► this view ──run()──► sandbox.js (iframe)
 *        ▲                                                │ postMessage
 *        └──goToLine()── console-panel.js ◄──log/error────┘
 *
 * Your code and settings are saved to the store, so they survive a reload.
 */

import { h, icon, toast } from '../core/dom.js';
import { read, update } from '../core/store.js';
import { createCodeEditor } from '../ui/code-editor.js';
import { createConsolePanel } from '../ui/console-panel.js';
import { createSandbox } from '../services/sandbox.js';
import { starters, getStarter } from '../../content/playground-starters.js';

const FILES = [
  { id: 'html', label: 'HTML', editorLabel: 'HTML editor (content of the body)' },
  { id: 'css', label: 'CSS', editorLabel: 'CSS editor' },
  { id: 'js', label: 'JavaScript', editorLabel: 'JavaScript editor' },
];

const AUTO_RUN_DELAY = 800; // ms after you stop typing
const SAVE_DELAY = 400;

/** Load saved playground state, or start with the first example. */
function loadState() {
  const saved = read('code').playground;
  if (saved) return saved;
  const starter = getStarter('welcome');
  return {
    starterId: starter.id,
    files: { html: starter.html, css: starter.css, js: starter.js },
    activeTab: 'js',
    autoRun: true,
  };
}

/** A small helper: delay a function until calls stop for `ms` milliseconds ("debounce"). */
function debounce(fn, ms) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.flush = () => { clearTimeout(timer); fn(); };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

export function render(root) {
  const state = loadState();

  /* ───────── Saving ───────── */

  const save = debounce(() => {
    update('code', (code) => { code.playground = state; });
  }, SAVE_DELAY);

  /* ───────── Console and sandbox ───────── */

  const consolePanel = createConsolePanel({
    onLineClick: (line) => {
      selectTab('js');
      editors.js.goToLine(line);
    },
    actions: [
      h('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        title: 'Delete what your code saved with localStorage',
        onClick: clearSandboxStorage,
      }, 'Clear storage'),
    ],
  });

  const sandbox = createSandbox({
    title: 'Preview of your code',
    onMessage(message) {
      if (message.type === 'console') consolePanel.log(message.level, message.parts);
      if (message.type === 'clear') consolePanel.clear();
      if (message.type === 'navigated') {
        consolePanel.note('The preview page reloaded. If a form was submitted, its submit handler probably needs event.preventDefault().');
      }
      if (message.type === 'storage') {
        update('code', (code) => { code.sandboxStorage = message.data; });
      }
      if (message.type === 'error') {
        consolePanel.error(message);
        if (message.line) {
          editors.js.markLine(message.line);
          tabs.js.classList.add('tab--error');
        }
      }
    },
  });

  function run() {
    autoRun.cancel();
    consolePanel.clear();
    editors.js.markLine(null);
    tabs.js.classList.remove('tab--error');
    sandbox.run({ ...state.files, storage: read('code').sandboxStorage ?? {} });
    consolePanel.setStatus(`Ran at ${new Date().toLocaleTimeString()}`);
  }

  const autoRun = debounce(run, AUTO_RUN_DELAY);

  function clearSandboxStorage() {
    update('code', (code) => { code.sandboxStorage = {}; });
    toast('Saved data cleared. Press Run to start fresh.');
  }

  /* ───────── Editors and tabs ───────── */

  const editors = {};
  const tabs = {};
  const panels = {};

  for (const file of FILES) {
    editors[file.id] = createCodeEditor({
      value: state.files[file.id],
      language: file.id,
      label: file.editorLabel,
      onChange(value) {
        state.files[file.id] = value;
        save();
        if (state.autoRun) autoRun();
      },
    });

    tabs[file.id] = h('button', {
      class: 'tab',
      type: 'button',
      role: 'tab',
      id: `tab-${file.id}`,
      'aria-controls': `panel-${file.id}`,
      onClick: () => selectTab(file.id),
    }, file.label);

    panels[file.id] = h('div', {
      class: 'tabpanel',
      role: 'tabpanel',
      id: `panel-${file.id}`,
      'aria-labelledby': `tab-${file.id}`,
    }, editors[file.id].element);
  }

  function selectTab(id, { focus = false } = {}) {
    for (const file of FILES) {
      const active = file.id === id;
      tabs[file.id].setAttribute('aria-selected', String(active));
      tabs[file.id].tabIndex = active ? 0 : -1; // only the active tab is in the Tab order
      panels[file.id].hidden = !active;
    }
    if (focus) tabs[id].focus();
    state.activeTab = id;
    save();
  }

  // ARIA tabs pattern: Left/Right arrow keys move between tabs.
  function onTabKeydown(event) {
    const index = FILES.findIndex((f) => f.id === state.activeTab);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % FILES.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + FILES.length) % FILES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = FILES.length - 1;
    if (next === null) return;
    event.preventDefault();
    selectTab(FILES[next].id, { focus: true });
  }

  /* ───────── Toolbar ───────── */

  const starterSelect = h('select', { id: 'starter-select', class: 'select' },
    starters.map((s) => h('option', { value: s.id, selected: s.id === state.starterId }, s.title)),
  );
  starterSelect.addEventListener('change', () => {
    const next = getStarter(starterSelect.value);
    if (isModified() && !confirm(`Replace your current code with "${next.title}"?`)) {
      starterSelect.value = state.starterId; // undo the selection
      return;
    }
    loadStarter(next);
  });

  const autoRunToggle = h('input', { type: 'checkbox', checked: state.autoRun });
  autoRunToggle.addEventListener('change', () => {
    state.autoRun = autoRunToggle.checked;
    save();
    if (state.autoRun) run();
  });

  function isModified() {
    const starter = getStarter(state.starterId);
    return FILES.some((f) => state.files[f.id] !== starter[f.id]);
  }

  function loadStarter(starter) {
    state.starterId = starter.id;
    for (const file of FILES) {
      state.files[file.id] = starter[file.id];
      editors[file.id].setValue(starter[file.id]);
    }
    save();
    run();
  }

  function reset() {
    const starter = getStarter(state.starterId);
    if (!isModified()) {
      toast('Nothing to reset. The code is already the original example.');
      return;
    }
    if (!confirm(`Reset all three editors to the original "${starter.title}" code? Your changes will be lost.`)) return;
    loadStarter(starter);
  }

  const description = h('p', { class: 'playground__description' }, getStarter(state.starterId).description);
  starterSelect.addEventListener('change', () => {
    description.textContent = getStarter(state.starterId).description;
  });

  /* ───────── Page structure ───────── */

  root.append(
    h('header', { class: 'playground__header' },
      h('div', { class: 'playground__heading' },
        h('h1', { tabindex: '-1' }, 'Code'),
        description,
      ),
      h('div', { class: 'toolbar' },
        h('label', { class: 'toolbar__field', for: 'starter-select' }, 'Example', starterSelect),
        h('label', { class: 'switch' }, autoRunToggle, h('span', { class: 'switch__track', 'aria-hidden': 'true' }), 'Auto-run'),
        h('button', { class: 'btn', type: 'button', onClick: reset }, 'Reset'),
        h('button', { class: 'btn btn--primary', type: 'button', onClick: run, title: 'Run (Ctrl+Enter or Cmd+Enter)' },
          'Run', h('kbd', { class: 'kbd' }, '⌃↵')),
      ),
    ),
    h('div', { class: 'playground' },
      h('section', { class: 'panel playground__editors', 'aria-label': 'Code editors' },
        h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Files', onKeydown: onTabKeydown },
          FILES.map((f) => tabs[f.id]),
        ),
        FILES.map((f) => panels[f.id]),
        h('p', { class: 'playground__keys' },
          h('span', null, h('kbd', { class: 'kbd' }, 'Tab'), ' indent'),
          h('span', null, h('kbd', { class: 'kbd' }, 'Esc'), ' then ', h('kbd', { class: 'kbd' }, 'Tab'), ' leave editor'),
          h('span', null, h('kbd', { class: 'kbd' }, 'Ctrl'), '+', h('kbd', { class: 'kbd' }, 'Enter'), ' run'),
        ),
      ),
      h('div', { class: 'playground__output' },
        h('section', { class: 'panel preview', 'aria-label': 'Preview' },
          h('header', { class: 'panel__header' }, h('h2', { class: 'panel__title' }, 'Preview')),
          h('div', { class: 'preview__frame' }, sandbox.element),
        ),
        consolePanel.element,
      ),
    ),
  );

  selectTab(state.activeTab);
  run();

  /* ───────── Keyboard shortcuts for the whole page ───────── */

  function onKeydown(event) {
    const mod = event.ctrlKey || event.metaKey;
    if (mod && event.key === 'Enter') {
      event.preventDefault();
      run();
    }
    if (mod && event.key.toLowerCase() === 's') {
      event.preventDefault(); // stop the browser's "Save page" dialog
      save.flush();
      toast('Your code is saved automatically.');
    }
  }
  document.addEventListener('keydown', onKeydown);

  /* ───────── Cleanup when leaving this page (see main.js) ───────── */
  return () => {
    document.removeEventListener('keydown', onKeydown);
    autoRun.cancel();
    save.flush();
    sandbox.destroy();
    Object.values(editors).forEach((editor) => editor.destroy());
  };
}
