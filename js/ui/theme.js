/*
 * theme.js — light/dark theme handling.
 *
 * The user's preference is one of three values, saved in settings.theme:
 *   'system' → follow the operating system (no data-theme attribute on <html>)
 *   'light'  → data-theme="light"
 *   'dark'   → data-theme="dark"
 * The CSS in tokens.css does the rest: it swaps color variables based on that attribute.
 */

import { read, update } from '../core/store.js';
import { emit } from '../core/events.js';

// A MediaQueryList: .matches is true when the OS is in dark mode, and it fires
// 'change' when the OS setting changes.
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

let toggleButton = null;

/** 'system' | 'light' | 'dark' — what the user chose. */
export function getThemePreference() {
  return read('settings').theme;
}

/** 'light' | 'dark' — what is actually on screen right now. */
export function getEffectiveTheme() {
  const pref = getThemePreference();
  if (pref === 'system') return systemDark.matches ? 'dark' : 'light';
  return pref;
}

/** Save a new preference and apply it. */
export function setThemePreference(pref) {
  update('settings', (settings) => { settings.theme = pref; });
  applyTheme(pref);
}

function applyTheme(pref) {
  const root = document.documentElement;
  if (pref === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', pref);
  }
  updateToggleLabel();
  emit('theme:change', { preference: pref, effective: getEffectiveTheme() });
}

function updateToggleLabel() {
  if (!toggleButton) return;
  // The label describes what clicking WILL do, which is what a screen-reader user needs.
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  toggleButton.setAttribute('aria-label', `Switch to ${next} theme`);
  toggleButton.title = `Switch to ${next} theme`;
}

/**
 * Connect the top-bar toggle button. Clicking it switches between light and dark
 * (an explicit choice). "Follow system" can be restored on the Settings page.
 */
export function initTheme(button) {
  toggleButton = button;
  applyTheme(getThemePreference());

  button.addEventListener('click', () => {
    setThemePreference(getEffectiveTheme() === 'dark' ? 'light' : 'dark');
  });

  // If the user follows the system and the OS switches, refresh the button label.
  systemDark.addEventListener('change', () => {
    if (getThemePreference() === 'system') applyTheme('system');
  });
}
