/*
 * practice.js — shows one exercise on its own page: #/practice/<exercise id>
 *
 * Used for revision (an exercise coming back on its own, outside its lesson).
 * The breadcrumb links back to the lesson the exercise belongs to.
 */

import { h } from '../core/dom.js';
import { getExercise } from '../../content/exercises.js';
import { findLessonOfExercise } from '../../content/lessons.js';
import { getModule } from '../../content/curriculum.js';
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

  // The lesson this exercise belongs to, for the breadcrumb and the "back" link.
  const home = findLessonOfExercise(exercise.id);
  const mod = home && getModule(home.moduleId);
  const lessonUrl = home && `#/learn/${home.moduleId}/${home.lesson.slug}`;

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/learn' }, 'Learn'),
      home && [
        h('span', { 'aria-hidden': 'true' }, '/'),
        h('a', { href: `#/learn/${home.moduleId}` }, mod.title),
        h('span', { 'aria-hidden': 'true' }, '/'),
        h('a', { href: lessonUrl }, home.lesson.title),
      ],
    ),
    // The page's h1 for screen readers; the exercise shows its own visible title.
    h('h1', { class: 'visually-hidden', tabindex: '-1' }, exercise.title),
    view.element,
    home && h('nav', { class: 'pager', 'aria-label': 'Lesson' },
      h('a', { class: 'btn btn--ghost', href: lessonUrl }, '← Back to the lesson: ', home.lesson.title),
    ),
  );

  return view.destroy;
}
