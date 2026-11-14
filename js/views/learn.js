/*
 * learn.js — Learn mode overview: where to continue, and all modules.
 */

import { h, icon } from '../core/dom.js';
import { modules } from '../../content/curriculum.js';
import { getMode } from '../../content/modes.js';
import { moduleProgress, nextLesson } from '../services/curriculum-progress.js';
import { pageHeader, section } from '../ui/page.js';
import { meter } from '../ui/meter.js';

export function render(root) {
  const mode = getMode('learn');
  const next = nextLesson();

  root.append(
    pageHeader({ eyebrow: 'Practice mode', title: mode.title, lead: mode.description }),

    next && section('Continue',
      h('a', { class: 'card continue-card', href: `#/learn/${next.module.id}/${next.lesson.slug}` },
        h('span', { class: 'eyebrow' }, `Module ${next.module.number} · ${next.module.title}`),
        h('span', { class: 'continue-card__title' }, next.lesson.title),
        h('span', { class: 'card__text' }, next.lesson.summary),
        h('span', { class: 'mode-card__cta' }, 'Open lesson', icon('arrow-right')),
      )),

    section('Modules', h('ol', { class: 'module-list' }, modules.map(moduleRow))),
  );
}

function moduleRow(mod) {
  const progress = moduleProgress(mod.id);
  const content = [
    h('span', { class: 'module__number', 'aria-hidden': 'true' }, mod.number),
    h('div', null,
      h('div', { class: 'module__head' },
        h('h3', null, h('span', { class: 'visually-hidden' }, `Module ${mod.number}: `), mod.title),
        !progress.available && h('span', { class: 'badge' }, 'In preparation')),
      h('p', { class: 'module__summary' }, mod.summary),
      progress.available && h('div', { class: 'module-progress module-progress--compact' },
        meter(progress.doneLessons, progress.lessons, `${mod.title}: lessons complete`),
        h('span', null, `${progress.doneLessons} of ${progress.lessons} lessons`)),
    ),
  ];

  return h('li', null, progress.available
    ? h('a', { class: 'card module module--link', href: `#/learn/${mod.id}` }, content)
    : h('div', { class: 'card module module--unavailable' }, content));
}
