/*
 * page.js — small building blocks that many views share, so every page
 * has the same structure and look.
 */

import { h, icon } from '../core/dom.js';

/**
 * Standard page heading.
 * @param {{eyebrow?: string, title: string, lead?: string}} options
 */
export function pageHeader({ eyebrow, title, lead }) {
  return h('header', { class: 'page-header' },
    eyebrow && h('p', { class: 'eyebrow' }, eyebrow),
    h('h1', { tabindex: '-1' }, title), // tabindex lets main.js move focus here after navigation
    lead && h('p', { class: 'page-header__lead' }, lead),
  );
}

/** A titled section of a page. */
export function section(title, ...children) {
  return h('section', { class: 'section' },
    title && h('h2', { class: 'section__title' }, title),
    ...children,
  );
}

/** Placeholder for areas that have no content yet. */
export function emptyState({ iconName = 'dashboard', title, text, action }) {
  return h('div', { class: 'empty-state' },
    icon(iconName),
    h('h2', null, title),
    text && h('p', null, text),
    action,
  );
}

/**
 * A learning-content box. role is one of:
 * 'explain' | 'example' | 'exercise' | 'hint' | 'solution' | 'mistake'
 */
export function callout(role, label, ...children) {
  return h('div', { class: `callout callout--${role}` },
    h('p', { class: 'callout__label' }, label),
    ...children,
  );
}
