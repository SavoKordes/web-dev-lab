/*
 * meter.js — a small horizontal progress bar.
 *
 * role="progressbar" with aria-valuenow/min/max lets screen readers announce
 * the value ("3 of 7"), which a plain colored bar could not do.
 */

import { h } from '../core/dom.js';

export function meter(value, max, label) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return h('div', {
    class: 'meter',
    role: 'progressbar',
    'aria-label': label,
    'aria-valuemin': '0',
    'aria-valuemax': String(max),
    'aria-valuenow': String(value),
    'aria-valuetext': `${value} of ${max}`,
  }, h('span', { class: 'meter__fill', style: `width: ${percent}%` }));
}
