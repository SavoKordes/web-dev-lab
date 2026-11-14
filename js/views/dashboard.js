/*
 * dashboard.js — the home page.
 *
 * Stage 1 shows a starting point: summary numbers read from saved progress
 * (all zero for now), the four practice modes and the recommended first step.
 * The full progress dashboard with charts is built in a later stage.
 */

import { h, icon } from '../core/dom.js';
import { read } from '../core/store.js';
import { modes } from '../../content/modes.js';
import { modules } from '../../content/curriculum.js';
import { pageHeader, section, callout } from '../ui/page.js';

export function render(root) {
  const progress = read('progress');

  root.append(
    pageHeader({
      eyebrow: 'Dashboard',
      title: 'Web Dev Lab',
      lead: 'A training program for reading, writing and debugging HTML, CSS and JavaScript — so you can understand and take responsibility for the code you ship, including code written with AI.',
    }),

    section('Where you are', statsRow(progress)),

    section('Practice modes',
      h('div', { class: 'grid grid--4' }, modes.map(modeCard)),
    ),

    section('Recommended next step', nextStepCard()),

    section('How progress is measured',
      callout('explain', 'Completion is not mastery',
        h('p', null, 'Finishing an exercise once does not mean you have learned it. Each exercise trains specific skills. Your mastery of a skill rises when you solve problems without hints, and falls slowly when you have not practised it for a while.'),
        h('p', null, 'Skills come back as revision exercises at growing intervals — after 1, 3, 7, 14 and 30 days — with different problems each time, so you cannot simply remember the answer.'),
      ),
    ),
  );
}

/** Three summary numbers. They are read from storage, so they update as you progress. */
function statsRow(progress) {
  const lessonsDone = Object.values(progress.lessons).filter((l) => l.completed).length;
  const attempts = progress.attempts.length;

  const stats = [
    { value: 'Foundation', label: 'Current level' },
    { value: lessonsDone, label: 'Lessons completed' },
    { value: attempts, label: 'Exercises attempted' },
  ];

  return h('div', { class: 'grid' },
    stats.map(({ value, label }) =>
      h('div', { class: 'card stat' },
        h('div', { class: 'stat__value' }, value),
        h('div', { class: 'stat__label' }, label),
      ),
    ),
  );
}

function modeCard(mode) {
  return h('a', { class: 'card mode-card', href: `#/${mode.id}` },
    h('span', { class: 'mode-card__icon' }, icon(mode.icon)),
    h('div', null,
      h('h3', { class: 'card__title' }, mode.title),
      h('p', { class: 'card__text' }, mode.tagline),
    ),
    h('span', { class: 'mode-card__cta' }, `Open ${mode.title}`, icon('arrow-right')),
  );
}

function nextStepCard() {
  const first = modules[0];
  return h('div', { class: 'card' },
    h('p', { class: 'eyebrow' }, `Module ${first.number}`),
    h('h3', { class: 'card__title' }, first.title),
    h('p', { class: 'card__text' }, first.summary),
    h('div', { class: 'btn-row', style: 'margin-top: var(--space-4)' },
      h('a', { class: 'btn btn--primary', href: '#/curriculum' }, 'View the curriculum', icon('arrow-right')),
    ),
  );
}
