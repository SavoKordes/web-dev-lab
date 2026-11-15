/*
 * code-exercise.js — "write or fix code until the tests pass".
 *
 * Used for JavaScript functions, HTML markup, CSS layouts and (later) debugging
 * challenges. The exercise definition decides which files you may edit:
 *
 *   {
 *     type: 'code',
 *     files: ['js'],                  // editable files, in tab order
 *     starter: { js: '…' },           // starting content of the editable files
 *     given: { html: '…', css: '…', setup: '…' },  // read-only files; setup runs before your JS
 *     preview: true,                  // show the rendered page (false: console only)
 *     tests: [{ name, run }],         // see js/services/test-runner.js
 *     pitfalls: [{ file, pattern, absent?, message }],  // common-mistake detectors
 *     solution: { js: '…' },
 *     downloadable: true,             // offer "Download as HTML file" (projects)
 *     setupInDownload: false,         // leave the setup code out of the download
 *   }
 *
 * ─── The renderer contract (shared by every exercise type) ───
 * create(exercise, ctx) returns:
 *   element      the exercise's own interface
 *   check()      → Promise<Result | null>
 *                  Result = { correct, score (0–1), feedback (Node) } or { invalid: 'message' }
 *                  null = "no result yet" (the renderer calls ctx.submit(result) later)
 *   solution()   → Node shown in the solution panel
 *   destroy()    optional cleanup
 * ctx gives: ctx.draft (saved answer or null), ctx.saveDraft(draft), ctx.submit(result)
 */

import { h, icon } from '../../core/dom.js';
import { createCodeEditor } from '../code-editor.js';
import { createCodeBlock } from '../code-block.js';
import { createConsolePanel } from '../console-panel.js';
import { createSandbox } from '../../services/sandbox.js';
import { richText } from '../rich-text.js';

const FILE_LABELS = { html: 'HTML', css: 'CSS', js: 'JavaScript', setup: 'Provided JS' };
const CHECK_TIMEOUT = 6000;

export function createCodeExercise(exercise, ctx) {
  const editable = exercise.files ?? ['js'];
  const given = exercise.given ?? {};
  const showPreview = exercise.preview !== false;

  // The current content of all three files: editable ones from your draft or the
  // starter code, the others from the exercise's provided files.
  const current = {};
  for (const file of ['html', 'css', 'js']) {
    current[file] = editable.includes(file)
      ? (ctx.draft?.[file] ?? exercise.starter?.[file] ?? '')
      : (given[file] ?? '');
  }

  let saveTimer = null;
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    const draft = {};
    for (const file of editable) draft[file] = current[file];
    ctx.saveDraft(draft);
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 400);
  }

  /* ───────── Console and sandbox ───────── */

  let pendingCheck = null; // the resolve() function of a check that is waiting for test results

  const consolePanel = createConsolePanel({
    onLineClick: (line) => {
      if (!editors.js) return;
      selectTab('js');
      editors.js.goToLine(line);
    },
  });

  const sandbox = createSandbox({
    title: `Preview: ${exercise.title}`,
    onMessage(message) {
      if (message.type === 'console') consolePanel.log(message.level, message.parts);
      if (message.type === 'clear') consolePanel.clear();
      if (message.type === 'error') {
        consolePanel.error(message);
        if (message.line && editors.js) editors.js.markLine(message.line);
      }
      if (message.type === 'tests' && pendingCheck) pendingCheck(message);
      if (message.type === 'navigated') {
        if (pendingCheck) pendingCheck({ navigated: true });
        else consolePanel.note('The preview page reloaded. Did a form submit without event.preventDefault()?');
      }
    },
  });

  function runCode(tests = null) {
    consolePanel.clear();
    editors.js?.markLine(null);
    sandbox.run({ ...current, setup: given.setup ?? '', tests });
  }

  /* ───────── Editors and read-only tabs ───────── */

  const editors = {};
  const tabs = [];   // { id, button, panel }

  for (const file of editable) {
    editors[file] = createCodeEditor({
      value: current[file],
      language: file,
      label: `${FILE_LABELS[file]} editor`,
      onChange(value) {
        current[file] = value;
        scheduleSave();
      },
    });
    addTab(file, FILE_LABELS[file], editors[file].element);
  }

  // Provided files you need to read (e.g. the HTML a CSS exercise styles).
  for (const file of ['html', 'css', 'setup']) {
    if (editable.includes(file) || !given[file]) continue;
    const language = file === 'setup' ? 'js' : file;
    // A lock icon marks read-only tabs; the title and a hidden text say it in words.
    const tabLabel = [icon('lock'), FILE_LABELS[file], h('span', { class: 'visually-hidden' }, ' (provided, read only)')];
    addTab(`given-${file}`, tabLabel,
      h('div', { class: 'code-exercise__readonly' },
        createCodeBlock({ code: given[file], language, label: `Provided ${FILE_LABELS[file]}, read only` })));
  }

  function addTab(id, label, content) {
    const uid = `${exercise.id}-${id}`.replace(/[^\w-]/g, '-');
    const button = h('button', {
      class: 'tab', type: 'button', role: 'tab', id: `tab-${uid}`, 'aria-controls': `panel-${uid}`,
      title: id.startsWith('given-') ? 'Provided by the exercise (read only)' : null,
      onClick: () => selectTab(id),
    }, label);
    const panel = h('div', { class: 'tabpanel', role: 'tabpanel', id: `panel-${uid}`, 'aria-labelledby': `tab-${uid}` }, content);
    tabs.push({ id, button, panel });
  }

  function selectTab(id) {
    for (const tab of tabs) {
      const active = tab.id === id;
      tab.button.setAttribute('aria-selected', String(active));
      tab.button.tabIndex = active ? 0 : -1;
      tab.panel.hidden = !active;
    }
  }

  function onTabKeydown(event) {
    const index = tabs.findIndex((t) => t.button.getAttribute('aria-selected') === 'true');
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    selectTab(next.id);
    next.button.focus();
  }

  function resetCode() {
    if (!confirm('Replace your code with the starting code? Your changes will be lost.')) return;
    for (const file of editable) {
      current[file] = exercise.starter?.[file] ?? '';
      editors[file].setValue(current[file]);
    }
    ctx.saveDraft(null);
    runCode();
  }

  /** Combine the files into one standalone HTML document and download it. */
  function download() {
    const setup = exercise.setupInDownload === false ? '' : (given.setup ?? '');
    const page = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${exercise.title}</title>`,
      `<style>\n${current.css}\n</style>`,
      '</head>',
      '<body>',
      current.html,
      `<script>\n${setup}\n${current.js}\n</script>`,
      '</body>',
      '</html>',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([page], { type: 'text/html' }));
    const fileName = `${exercise.id.replace(/[^\w-]+/g, '-')}.html`;
    h('a', { href: url, download: fileName }).click();
    URL.revokeObjectURL(url);
  }

  /* ───────── Layout ───────── */

  const element = h('div', { class: `code-exercise${showPreview ? '' : ' code-exercise--no-preview'}` },
    h('section', { class: 'panel code-exercise__editors', 'aria-label': 'Your code' },
      h('div', { class: 'code-exercise__bar' },
        h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Files', onKeydown: onTabKeydown },
          tabs.map((t) => t.button)),
        h('div', { class: 'panel__actions' },
          exercise.downloadable && h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: download, title: 'Save your project as one HTML file you can open in any browser' }, icon('download'), 'Download'),
          h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: resetCode }, 'Reset code'),
          h('button', { class: 'btn btn--sm', type: 'button', onClick: () => runCode(), title: 'Run without checking (Ctrl+Enter)' },
            'Run'),
        ),
      ),
      tabs.map((t) => t.panel),
    ),
    h('div', { class: 'code-exercise__output' },
      showPreview && h('section', { class: 'panel preview', 'aria-label': 'Preview' },
        h('header', { class: 'panel__header' }, h('h3', { class: 'panel__title' }, 'Preview')),
        h('div', { class: 'preview__frame' }, sandbox.element)),
      consolePanel.element,
    ),
  );

  // Without a preview the iframe still has to exist (it runs the code), just hidden.
  if (!showPreview) element.append(h('div', { hidden: true }, sandbox.element));

  // Ctrl/Cmd+Enter runs the code while focus is inside this exercise.
  element.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      runCode();
    }
  });

  selectTab(tabs[0].id);
  runCode();

  /* ───────── Checking ───────── */

  function check() {
    return new Promise((resolve) => {
      const timer = setTimeout(() => finish(null), CHECK_TIMEOUT);

      function finish(message) {
        clearTimeout(timer);
        pendingCheck = null;
        resolve(buildResult(message));
      }

      pendingCheck = finish;
      runCode(exercise.tests ?? []);
    });
  }

  function buildResult(message) {
    if (message?.navigated) {
      return {
        correct: false,
        score: 0,
        feedback: h('p', null, 'The page reloaded while the checks were running, so they could not finish. This almost always means a form was submitted without ', h('code', null, 'event.preventDefault()'), ' in its submit handler.'),
      };
    }
    if (!message) {
      return {
        correct: false,
        score: 0,
        feedback: h('p', null, `The checks did not finish within ${CHECK_TIMEOUT / 1000} seconds. Is there a loop that never ends, or an await that never resolves?`),
      };
    }

    const results = message.results ?? [];
    const errors = message.errors ?? [];
    const passed = results.filter((r) => r.passed).length;
    const correct = results.length > 0 && passed === results.length && errors.length === 0;

    return {
      correct,
      score: results.length ? passed / results.length : 0,
      feedback: h('div', { class: 'stack' },
        errors.length > 0 && h('p', { class: 'feedback__error' },
          'Your code stopped with an error: ', h('code', null, errors[0].message),
          errors[0].line ? ` (line ${errors[0].line}). ` : '. ',
          'The console below explains it.'),
        h('p', { class: 'feedback__summary' }, `${passed} of ${results.length} checks passed.`),
        h('ul', { class: 'test-list' }, results.map(testResultItem)),
        pitfallCallouts(correct),
      ),
    };
  }

  function testResultItem(result) {
    return h('li', { class: `test-result test-result--${result.passed ? 'pass' : 'fail'}` },
      h('span', { class: 'test-result__icon', 'aria-hidden': 'true' }, icon(result.passed ? 'check' : 'close')),
      h('span', { class: 'visually-hidden' }, result.passed ? 'Passed: ' : 'Failed: '),
      h('span', { class: 'test-result__body' },
        h('span', { class: 'test-result__name' }, result.name),
        !result.passed && result.message && h('span', { class: 'test-result__message' }, result.message)),
    );
  }

  /** Common-mistake detectors: a pattern found (or missing) in your code. */
  function pitfallCallouts(correct) {
    return (exercise.pitfalls ?? [])
      .filter((p) => (p.when === 'always' || !correct))
      .filter((p) => {
        const found = p.pattern.test(current[p.file ?? 'js']);
        return p.absent ? !found : found;
      })
      .map((p) => h('div', { class: 'callout callout--mistake' },
        h('p', { class: 'callout__label' }, 'Common mistake'),
        richText(p.message)));
  }

  /* ───────── Solution ───────── */

  function solution() {
    const files = editable.filter((file) => exercise.solution?.[file] != null);
    return h('div', { class: 'stack' },
      files.map((file) => h('div', null,
        files.length > 1 && h('p', { class: 'solution__file' }, FILE_LABELS[file]),
        createCodeBlock({ code: exercise.solution[file], language: file, label: `Solution: ${FILE_LABELS[file]}` }),
      )),
      h('button', { class: 'btn btn--sm', type: 'button', onClick: loadSolution }, 'Copy the solution into the editor'),
    );
  }

  function loadSolution() {
    for (const file of editable) {
      if (exercise.solution?.[file] == null) continue;
      current[file] = exercise.solution[file];
      editors[file].setValue(current[file]);
    }
    scheduleSave();
    runCode();
  }

  return {
    element,
    check,
    solution,
    destroy() {
      if (saveTimer) saveNow(); // do not lose the last few keystrokes
      sandbox.destroy();
      Object.values(editors).forEach((editor) => editor.destroy());
    },
  };
}
