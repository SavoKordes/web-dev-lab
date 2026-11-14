/*
 * learn.js — Learn mode.
 *
 * Lessons arrive in Stage 4. Until then this page lists the sample exercises,
 * one of each type, so the exercise engine can be tried out.
 */

import { h } from '../core/dom.js';
import { on } from '../core/events.js';
import { getMode } from '../../content/modes.js';
import { sampleExercises } from '../../content/exercises.js';
import { getExerciseState } from '../services/progress.js';
import { TYPE_LABELS } from '../ui/exercise.js';
import { pageHeader, section, callout } from '../ui/page.js';

const STATUS_TEXT = {
  new: 'Not started',
  attempted: 'In progress',
  solved: 'Solved',
  revealed: 'Solution viewed',
};

export function render(root) {
  const mode = getMode('learn');
  const list = h('ul', { class: 'exercise-list' });

  function renderList() {
    list.replaceChildren(...sampleExercises.map((exercise) => {
      const state = getExerciseState(exercise.id);
      return h('li', null,
        h('a', { class: 'card exercise-link', href: `#/practice/${exercise.id}` },
          h('span', { class: 'exercise-link__type' }, TYPE_LABELS[exercise.type]),
          h('span', { class: 'exercise-link__title' }, exercise.title),
          h('span', { class: `badge${state.status === 'solved' ? ' badge--success' : ''}` }, STATUS_TEXT[state.status]),
        ));
    }));
  }
  renderList();

  root.append(
    pageHeader({ eyebrow: 'Practice mode', title: mode.title, lead: mode.description }),
    section('Sample exercises',
      h('p', { class: 'muted' }, 'One exercise of each type. Use them to get to know how checking, hints and solutions work. The full lessons are added module by module.'),
      list,
    ),
    section('How exercises work',
      callout('explain', 'Hints before solutions',
        h('p', null, 'Each exercise has up to three hints: where to look, the concept behind it, and a nudge. The solution unlocks only after you have checked an answer and used every hint.'),
        h('p', null, 'Solving without hints counts most toward mastery. Viewing the solution counts nothing, but the exercise stays open so you can solve it yourself later.'),
      ),
    ),
  );

  // Keep the status badges current if progress changes (e.g. after a reset in another tab).
  return on('progress:change', renderList);
}
