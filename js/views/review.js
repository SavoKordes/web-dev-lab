/*
 * review.js — one revision exercise: #/review/<exercise id>
 *
 * A revision is a fresh attempt at an exercise, recorded separately from your
 * lesson attempt (under "<id>~review"), so that solving it again counts as new
 * evidence for its skills. Each time you start a new revision, that attempt
 * starts from scratch: no draft, no hints used.
 */

import { h, icon } from '../core/dom.js';
import { update } from '../core/store.js';
import { getExercise } from '../../content/exercises.js';
import { getExerciseState } from '../services/progress.js';
import { revisionId, dueRevisions, skillLabel } from '../services/mastery.js';
import { createExercise } from '../ui/exercise.js';
import { callout, emptyState } from '../ui/page.js';

export function render(root, params) {
  const original = getExercise(params.exerciseId);
  if (!original) {
    root.append(
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Not found'),
      emptyState({ iconName: 'progress', title: 'This exercise does not exist', action: h('a', { class: 'btn btn--primary', href: '#/progress' }, 'Back to Progress') }),
    );
    return undefined;
  }

  // Start a fresh revision attempt, unless one is still in progress.
  const id = revisionId(original.id);
  const previous = getExerciseState(id);
  if (previous.status === 'solved' || previous.status === 'revealed') {
    update('progress', (progress) => { delete progress.exercises[id]; });
  }

  const exercise = { ...original, id, continuesFrom: undefined };
  const view = createExercise(exercise);
  const nextDue = dueRevisions().find((item) => item.exercise.id !== original.id);

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/progress' }, 'Progress'),
      h('span', { 'aria-hidden': 'true' }, '/'),
      h('span', null, 'Revision'),
    ),
    h('h1', { class: 'visually-hidden', tabindex: '-1' }, `Revision: ${original.title}`),
    callout('explain', 'Revision',
      h('p', null, `This exercise trains: ${(original.skills ?? []).map(skillLabel).join('; ')}. Solve it from memory first; hints lower the credit, as always.`)),
    view.element,
    h('nav', { class: 'pager', 'aria-label': 'Revision' },
      h('a', { class: 'btn btn--ghost', href: '#/progress' }, '← Progress'),
      nextDue && h('a', { class: 'btn btn--primary', href: `#/review/${nextDue.exercise.id}` }, `Next revision: ${nextDue.skill.label}`, icon('arrow-right')),
    ),
  );

  return view.destroy;
}
