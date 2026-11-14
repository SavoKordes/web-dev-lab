/*
 * learn.js — Learn mode overview: where to continue, all modules, preview exercises.
 */

import { h, icon } from '../core/dom.js';
import { modules } from '../../content/curriculum.js';
import { getMode } from '../../content/modes.js';
import { sampleExercises } from '../../content/exercises.js';
import { getExerciseState } from '../services/progress.js';
import { moduleProgress, nextLesson } from '../services/curriculum-progress.js';
import { TYPE_LABELS } from '../ui/exercise.js';
import { pageHeader, section } from '../ui/page.js';
import { meter } from '../ui/meter.js';

const STATUS_TEXT = {
  new: 'Not started',
  attempted: 'In progress',
  solved: 'Solved',
  revealed: 'Solution viewed',
};

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

    section('Preview: JavaScript exercises',
      h('p', { class: 'muted' }, 'A first taste of Modules 3 and 4. These move into their lessons when those modules are written.'),
      h('ul', { class: 'exercise-list' }, sampleExercises.map(exerciseRow))),
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

function exerciseRow(exercise) {
  const state = getExerciseState(exercise.id);
  return h('li', null,
    h('a', { class: 'card exercise-link', href: `#/practice/${exercise.id}` },
      h('span', { class: 'exercise-link__type' }, TYPE_LABELS[exercise.type]),
      h('span', { class: 'exercise-link__title' }, exercise.title),
      h('span', { class: `badge${state.status === 'solved' ? ' badge--success' : ''}` }, STATUS_TEXT[state.status]),
    ));
}
