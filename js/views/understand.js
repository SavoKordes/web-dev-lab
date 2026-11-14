/*
 * understand.js — Understand mode: code-reading drills from the whole program.
 *
 *   #/understand            all drills, filterable by type, plus a random drill
 *   #/understand/<id>       one drill, with "next drill" navigation
 *
 * A "drill" is any reading exercise: predict the output, order the steps,
 * trace the values, or explain it, plus all exercises in Module 4. The drills
 * live in their lessons; this view only collects and filters them, so progress
 * is the same wherever you solve them.
 */

import { h, icon } from '../core/dom.js';
import { getMode } from '../../content/modes.js';
import { modules, getModule } from '../../content/curriculum.js';
import { getLessons, lessonExercises } from '../../content/lessons.js';
import { getExerciseState } from '../services/progress.js';
import { createExercise, TYPE_LABELS } from '../ui/exercise.js';
import { pageHeader, section, emptyState } from '../ui/page.js';

const READING_TYPES = ['predict', 'order', 'trace', 'explain'];

const STATUS_TEXT = {
  new: 'Not started',
  attempted: 'In progress',
  solved: 'Solved',
  revealed: 'Solution viewed',
};

/** Every reading drill, in curriculum order: { exercise, module, lesson }. */
function collectDrills() {
  const drills = [];
  for (const mod of modules) {
    for (const lesson of getLessons(mod.id)) {
      for (const exercise of lessonExercises(lesson)) {
        if (mod.id === 'reading' || READING_TYPES.includes(exercise.type)) {
          drills.push({ exercise, module: mod, lesson });
        }
      }
    }
  }
  return drills;
}

export function render(root, params) {
  return params.exerciseId ? renderDrill(root, params.exerciseId) : renderList(root);
}

/* ───────────────────────── The list ───────────────────────── */

function renderList(root) {
  const mode = getMode('understand');
  const drills = collectDrills();
  let activeType = 'all';

  const list = h('ul', { class: 'exercise-list' });
  const countLine = h('p', { class: 'muted', 'aria-live': 'polite' });

  // One filter button per drill type that actually occurs, plus "All".
  const types = ['all', ...new Set(drills.map((d) => d.exercise.type))];
  const filterButtons = types.map((type) => h('button', {
    class: 'chip', type: 'button', 'aria-pressed': String(type === activeType),
    onClick: () => { activeType = type; update(); },
  }, type === 'all' ? 'All' : TYPE_LABELS[type]));

  function visibleDrills() {
    return activeType === 'all' ? drills : drills.filter((d) => d.exercise.type === activeType);
  }

  function update() {
    filterButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(types[i] === activeType)));
    const visible = visibleDrills();
    const solved = visible.filter((d) => getExerciseState(d.exercise.id).status === 'solved').length;
    countLine.textContent = `${visible.length} drills · ${solved} solved`;
    list.replaceChildren(...visible.map(drillRow));
  }

  function openRandom() {
    const open = visibleDrills().filter((d) => getExerciseState(d.exercise.id).status !== 'solved');
    const pool = open.length > 0 ? open : visibleDrills();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    location.hash = `#/understand/${pick.exercise.id}`;
  }

  root.append(
    pageHeader({ eyebrow: 'Practice mode', title: mode.title, lead: mode.description }),
    section(null,
      h('div', { class: 'understand-intro card' },
        h('div', null,
          h('h2', { class: 'card__title' }, 'Train your code-reading'),
          h('p', { class: 'card__text' }, 'Reading code you did not write is the core skill for reviewing AI output. Start with Module 4 for the method, then use these drills for regular practice. Always commit to an answer before checking.')),
        h('div', { class: 'btn-row' },
          h('a', { class: 'btn', href: '#/learn/reading' }, 'Module 4 lessons'),
          h('button', { class: 'btn btn--primary', type: 'button', onClick: openRandom }, 'Random unsolved drill', icon('arrow-right'))),
      ),
    ),
    section('All drills',
      h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Filter by type' }, filterButtons),
      countLine,
      list,
    ),
  );
  update();
}

function drillRow({ exercise, module: mod, lesson }) {
  const state = getExerciseState(exercise.id);
  return h('li', null,
    h('a', { class: 'card exercise-link', href: `#/understand/${exercise.id}` },
      h('span', { class: 'exercise-link__type' }, TYPE_LABELS[exercise.type]),
      h('span', { class: 'exercise-link__body' },
        h('span', { class: 'exercise-link__title' }, exercise.title),
        h('span', { class: 'exercise-link__source' }, `Module ${mod.number} · ${lesson.title}`)),
      h('span', { class: `badge${state.status === 'solved' ? ' badge--success' : ''}` }, STATUS_TEXT[state.status]),
    ));
}

/* ───────────────────────── One drill ───────────────────────── */

function renderDrill(root, exerciseId) {
  const drills = collectDrills();
  const index = drills.findIndex((d) => d.exercise.id === exerciseId);

  if (index === -1) {
    root.append(
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Drill not found'),
      emptyState({
        iconName: 'understand',
        title: 'Drill not found',
        action: h('a', { class: 'btn btn--primary', href: '#/understand' }, 'All drills'),
      }),
    );
    return undefined;
  }

  const { exercise, lesson, module: mod } = drills[index];
  const next = drills[index + 1];
  const view = createExercise(exercise);

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/understand' }, 'Understand'),
      h('span', { 'aria-hidden': 'true' }, '/'),
      h('span', null, `Drill ${index + 1} of ${drills.length}`),
    ),
    h('h1', { class: 'visually-hidden', tabindex: '-1' }, exercise.title),
    view.element,
    h('nav', { class: 'pager', 'aria-label': 'Drills' },
      h('a', { class: 'btn btn--ghost', href: `#/learn/${mod.id}/${lesson.slug}` }, `From: ${getModule(mod.id).title} · ${lesson.title}`),
      next
        ? h('a', { class: 'btn btn--primary', href: `#/understand/${next.exercise.id}` }, `Next drill: ${next.exercise.title}`, icon('arrow-right'))
        : h('a', { class: 'btn btn--primary', href: '#/understand' }, 'All drills', icon('arrow-right')),
    ),
  );

  return view.destroy;
}
