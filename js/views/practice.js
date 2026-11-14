/*
 * practice.js — shows one exercise on its own page: #/practice/<exercise id>
 *
 * Used for the sample exercises now, and later for revision exercises that
 * come back on the dashboard.
 */

import { h, icon } from '../core/dom.js';
import { getExercise, sampleExercises } from '../../content/exercises.js';
import { createExercise } from '../ui/exercise.js';
import { emptyState } from '../ui/page.js';

export function render(root, params) {
  const exercise = getExercise(params.exerciseId);

  if (!exercise) {
    root.append(
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Exercise not found'),
      emptyState({
        iconName: 'learn',
        title: 'Exercise not found',
        text: `There is no exercise with the id “${params.exerciseId}”.`,
        action: h('a', { class: 'btn btn--primary', href: '#/learn' }, 'Back to Learn'),
      }),
    );
    return undefined;
  }

  const view = createExercise(exercise);

  // Previous / next within the list this exercise belongs to.
  const list = sampleExercises;
  const index = list.indexOf(exercise);
  const previous = list[index - 1];
  const next = list[index + 1];

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/learn' }, 'Learn'),
      h('span', { 'aria-hidden': 'true' }, '/'),
      h('span', { 'aria-current': 'page' }, exercise.title),
    ),
    // The page's h1 for screen readers; the exercise shows its own visible title.
    h('h1', { class: 'visually-hidden', tabindex: '-1' }, exercise.title),
    view.element,
    index >= 0 && h('nav', { class: 'pager', 'aria-label': 'More exercises' },
      previous
        ? h('a', { class: 'btn btn--ghost', href: `#/practice/${previous.id}` }, '← ', previous.title)
        : h('span'),
      next && h('a', { class: 'btn', href: `#/practice/${next.id}` }, next.title, icon('arrow-right')),
    ),
  );

  return view.destroy;
}
