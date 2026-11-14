/*
 * store.js — the ONLY module that reads or writes localStorage.
 *
 * All saved data lives in one JSON object under one key. It is split into
 * "sections" (settings, progress, projects, code) so each feature works with
 * its own part:
 *
 *   read('settings')                    → a copy of the settings object
 *   update('settings', (s) => { s.theme = 'dark'; })   → change and save
 *
 * Why one module? If ten files each called localStorage directly, a change to
 * the data format would mean hunting through ten files. Here it is one place,
 * and every write goes through the same validation and error handling.
 */

import { emit } from './events.js';

// Must match the key in js/theme-init.js.
const STORAGE_KEY = 'wdl.state';

// Increase this when the shape of the saved data changes, and add a step to migrate().
const SCHEMA_VERSION = 1;

/** The data a brand-new user starts with. A function, so each call returns a fresh object. */
function createDefaultState() {
  return {
    version: SCHEMA_VERSION,
    meta: { createdAt: new Date().toISOString() },
    settings: { theme: 'system' }, // 'system' | 'light' | 'dark'
    progress: {
      attempts: [],   // history of exercise attempts (js/services/progress.js)
      exercises: {},  // state per exercise id: status, hints used, saved draft…
      skills: {},     // evidence per skill id, used to calculate mastery
      lessons: {},    // completion per lesson id (Stage 4)
    },
    projects: {},     // milestones per project (Stage 9)
    code: {},         // saved Code-mode work (Stage 2)
  };
}

// The in-memory copy of the saved data. Loaded once when this module is first imported.
let state = load();

/* ───────────────── Reading and writing ───────────────── */

/**
 * Get a COPY of one section.
 * Returning a copy means a caller cannot change saved data by accident —
 * changes only count when they go through write() or update().
 */
export function read(section) {
  assertSection(section);
  return structuredClone(state[section]);
}

/** Replace a whole section and save. */
export function write(section, value) {
  assertSection(section);
  state[section] = structuredClone(value);
  save();
  emit('store:change', { section });
}

/**
 * Change a section with a function. The function receives a copy ("draft").
 * It can either modify the draft or return a new value.
 *
 *   update('settings', (draft) => { draft.theme = 'dark'; });
 */
export function update(section, changeFn) {
  const draft = read(section);
  const result = changeFn(draft);
  write(section, result === undefined ? draft : result);
}

/* ───────────────── Backup, restore, reset ───────────────── */

/** All saved data as formatted JSON text (used for the backup download). */
export function exportData() {
  return JSON.stringify(state, null, 2);
}

/**
 * Replace all data with a backup. Throws an Error with a readable message if the
 * text is not a valid backup, so the Settings page can show it to the user.
 */
export function importData(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') {
    throw new Error('This file is not a Web Dev Lab backup.');
  }
  if (parsed.version > SCHEMA_VERSION) {
    throw new Error('This backup was made by a newer version of the app.');
  }

  state = migrate(parsed);
  save();
  emit('store:change', { section: '*' });
}

/** Delete everything and start fresh. */
export function resetAll() {
  state = createDefaultState();
  save();
  emit('store:change', { section: '*' });
}

/* ───────────────── Internal helpers ───────────────── */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createDefaultState(); // first visit
    return migrate(JSON.parse(raw));
  } catch (err) {
    // Corrupted JSON or storage blocked (e.g. some private-browsing modes).
    // Start with defaults instead of crashing the whole app.
    console.warn('Could not load saved data, starting fresh.', err);
    return createDefaultState();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Usually "quota exceeded" or storage disabled. The app keeps working in memory.
    console.error('Could not save data.', err);
    emit('store:error', { error: err });
  }
}

/**
 * Bring old saved data up to the current format.
 * Missing sections are filled in from the defaults, so adding a new section
 * in a later version never breaks existing users.
 */
function migrate(data) {
  const defaults = createDefaultState();

  // Future example:
  // if (data.version < 2) { data.progress.reviews = []; data.version = 2; }

  return {
    ...defaults,
    ...data,
    settings: { ...defaults.settings, ...data.settings },
    progress: { ...defaults.progress, ...data.progress },
    version: SCHEMA_VERSION,
  };
}

function assertSection(section) {
  if (!(section in state)) {
    // Fail loudly: a typo like read('setings') should be found immediately.
    throw new Error(`Unknown store section: "${section}"`);
  }
}
