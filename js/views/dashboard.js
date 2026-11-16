/*
 * dashboard.js — the home page.
 *
 * Shows your level and key numbers, the reviews that are due, the next lesson to
 * continue with, and the four practice modes. The full picture (charts, weak
 * spots, history) is on the Progress page (views/progress.js).
 */

import { h, icon } from '../core/dom.js';
import { read } from '../core/store.js';
import { modes } from '../../content/modes.js';
import { countDoneLessons, nextLesson } from '../services/curriculum-progress.js';
import { overallScore, levelFor, dueRevisions } from '../services/mastery.js';
import { revisionList } from './progress.js';
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

    progress.attempts.length > 0 && section('Revision due', revisionList(dueRevisions(), 3),
      h('p', { style: 'margin-top: var(--space-3)' }, h('a', { href: '#/progress' }, 'See your full progress'))),

    section('Practice modes',
      h('div', { class: 'grid grid--4' }, modes.map(modeCard)),
    ),

    section('Recommended next step', nextStepCard()),

    section('How progress is measured',
      callout('explain', 'Completion is not mastery',
        h('p', null, 'Finishing an exercise once does not mean you have learned it. Each exercise trains specific skills. Your mastery of a skill rises when you solve problems without hints, and falls slowly when you have not practised it for a while.'),
        h('p', null, 'Skills come back as revision exercises at growing intervals (after 1, 3, 7, 14, 30 and then 60 days, or after 1 day when the last result was weak), with a different exercise where possible, so you cannot simply remember the answer.'),
      ),
    ),
  );
}

/** Three summary numbers. They are read from storage, so they update as you progress. */
function statsRow(progress) {
  const lessonsDone = countDoneLessons();
  const attempts = progress.attempts.length;

  const score = overallScore();
  const stats = [
    { value: levelFor(score).name, label: 'Current level' },
    { value: `${score}%`, label: 'Overall mastery' },
    { value: lessonsDone, label: 'Lessons completed' },
    { value: attempts, label: 'Checks made' },
  ];

  return h('div', { class: 'grid grid--4' },
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
  const next = nextLesson();
  if (!next) {
    return h('div', { class: 'card' },
      h('h3', { class: 'card__title' }, 'All available lessons are complete'),
      h('p', { class: 'card__text' }, 'New modules are added stage by stage. Meanwhile, practise freely in Code mode.'));
  }
  return h('div', { class: 'card' },
    h('p', { class: 'eyebrow' }, `Module ${next.module.number} · ${next.module.title}`),
    h('h3', { class: 'card__title' }, next.lesson.title),
    h('p', { class: 'card__text' }, next.lesson.summary),
    h('div', { class: 'btn-row', style: 'margin-top: var(--space-4)' },
      h('a', { class: 'btn btn--primary', href: `#/learn/${next.module.id}/${next.lesson.slug}` }, 'Open lesson', icon('arrow-right')),
      h('a', { class: 'btn', href: '#/curriculum' }, 'View the curriculum'),
    ),
  );
}
