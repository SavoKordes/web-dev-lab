/*
 * settings.js — theme choice, backup/restore and reset.
 */

import { h, icon, toast } from '../core/dom.js';
import { on } from '../core/events.js';
import { exportData, importData, resetAll } from '../core/store.js';
import { getThemePreference, setThemePreference } from '../ui/theme.js';
import { pageHeader, section } from '../ui/page.js';

export function render(root) {
  // If the theme is changed with the top-bar button while this page is open,
  // keep the radio buttons in sync.
  const stopListening = on('theme:change', ({ preference }) => {
    const radio = root.querySelector(`input[name="theme"][value="${preference}"]`);
    if (radio) radio.checked = true;
  });

  root.append(
    pageHeader({ eyebrow: 'Settings', title: 'Settings' }),
    section('Appearance', h('div', { class: 'card' }, themeRow())),
    section('Your data', h('div', { class: 'card' }, backupRow(), restoreRow(), resetRow())),
    section('Reference',
      h('div', { class: 'card' },
        h('div', { class: 'setting-row' },
          h('div', { class: 'setting-row__text' },
            h('h3', { class: 'card__title' }, 'Design reference'),
            h('p', { class: 'card__text' }, 'The colors and boxes used for explanations, examples, exercises, hints and solutions.'),
          ),
          h('a', { class: 'btn', href: '#/styleguide' }, 'Open'),
        ),
      ),
    ),
  );

  // The cleanup function: main.js calls it when you leave this page.
  return stopListening;
}

/* ───────── Theme: three radio buttons styled as a segmented control ───────── */

function themeRow() {
  const current = getThemePreference();
  const options = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  // A <fieldset> with a <legend> groups the radios for screen readers.
  const group = h('fieldset', { class: 'segmented', style: 'border: 0; margin: 0' },
    h('legend', { class: 'visually-hidden' }, 'Theme'),
    options.map(({ value, label }) =>
      h('label', null,
        h('input', { type: 'radio', name: 'theme', value, checked: value === current }),
        label,
      ),
    ),
  );

  // One 'change' listener on the group handles all three radios (event delegation).
  group.addEventListener('change', (event) => {
    setThemePreference(event.target.value);
  });

  return h('div', { class: 'setting-row' },
    h('div', { class: 'setting-row__text' },
      h('h3', { class: 'card__title' }, 'Theme'),
      h('p', { class: 'card__text' }, '“System” follows your operating system’s light or dark setting.'),
    ),
    group,
  );
}

/* ───────── Backup: download all data as a .json file ───────── */

function backupRow() {
  function download() {
    // A Blob is file-like data in memory. createObjectURL gives it a temporary URL,
    // and clicking a link with a `download` attribute saves it as a file.
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const link = h('a', { href: url, download: `web-dev-lab-backup-${date}.json` });
    link.click();
    URL.revokeObjectURL(url); // free the memory
    toast('Backup downloaded.');
  }

  return h('div', { class: 'setting-row' },
    h('div', { class: 'setting-row__text' },
      h('h3', { class: 'card__title' }, 'Download a backup'),
      h('p', { class: 'card__text' }, 'Progress is stored only in this browser. A backup file lets you move it to another browser or computer.'),
    ),
    h('button', { class: 'btn', type: 'button', onClick: download }, icon('download'), 'Download'),
  );
}

/* ───────── Restore: read a backup file chosen by the user ───────── */

function restoreRow() {
  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const text = await file.text(); // reading a file is asynchronous
      importData(text);
      toast('Backup restored.');
      location.reload(); // simplest way to make every part of the app use the restored data
    } catch (err) {
      toast(`Could not restore: ${err.message}`);
    } finally {
      fileInput.value = ''; // allow choosing the same file again
    }
  });

  return h('div', { class: 'setting-row' },
    h('div', { class: 'setting-row__text' },
      h('h3', { class: 'card__title' }, 'Restore from a backup'),
      h('p', { class: 'card__text' }, 'Replaces all progress in this browser with the contents of a backup file.'),
    ),
    fileInput,
    h('button', { class: 'btn', type: 'button', onClick: () => fileInput.click() }, icon('upload'), 'Choose file'),
  );
}

/* ───────── Reset ───────── */

function resetRow() {
  function reset() {
    const sure = confirm('Delete all progress and settings in this browser? This cannot be undone.');
    if (!sure) return;
    resetAll();
    location.reload();
  }

  return h('div', { class: 'setting-row' },
    h('div', { class: 'setting-row__text' },
      h('h3', { class: 'card__title' }, 'Reset everything'),
      h('p', { class: 'card__text' }, 'Deletes all progress and settings. Download a backup first if you might want them back.'),
    ),
    h('button', { class: 'btn btn--danger', type: 'button', onClick: reset }, 'Reset'),
  );
}
