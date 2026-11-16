/*
 * drill-collection.js — a page type shared by Understand mode and Debug mode.
 *
 * Both modes collect exercises from all lessons, show them as a filterable list
 * with a "random unsolved" button, and show one exercise at a time with "next"
 * navigation. Only WHICH exercises and HOW they are grouped differ, so those
 * are passed in as options. One implementation, two modes: less code to read
 * and to keep correct.
 *
 *   createDrillCollectionView({
 *     modeId: 'understand',                 // content/modes.js entry for the header
 *     basePath: '/understand',              // list at #/understand, one drill at #/understand/<id>
 *     include: (exercise, module) => bool,  // which exercises belong to this mode
 *     groupOf: (exercise) => 'label',       // the filter group of an exercise
 *     intro: { title, text, links: [{ href, label }] },
 *     noun: 'drill',
 *   })
 */

import { h, icon } from '../core/dom.js';
import { getMode } from '../../content/modes.js';
import { modules, getModule } from '../../content/curriculum.js';
import { getLessons, lessonExercises } from '../../content/lessons.js';
import { getExerciseState } from '../services/progress.js';
import { createExercise } from '../ui/exercise.js';
import { pageHeader, section, emptyState } from '../ui/page.js';

const STATUS_TEXT = {
  new: 'Not started',
  attempted: 'In progress',
  solved: 'Solved',
  revealed: 'Solution viewed',
};

export function createDrillCollectionView(options) {
  /** All matching exercises, in curriculum order: { exercise, module, lesson }. */
  function collect() {
    const items = [];
    for (const mod of modules) {
      for (const lesson of getLessons(mod.id)) {
        for (const exercise of lessonExercises(lesson)) {
          if (options.include(exercise, mod)) items.push({ exercise, module: mod, lesson });
        }
      }
    }
    return items;
  }

  return function render(root, params) {
    return params.exerciseId ? renderOne(root, params.exerciseId) : renderList(root);
  };

  /* ───────────── The list ───────────── */

  function renderList(root) {
    const mode = getMode(options.modeId);
    const items = collect();
    let activeGroup = 'All';

    const list = h('ul', { class: 'exercise-list' });
    const countLine = h('p', { class: 'muted', 'aria-live': 'polite' });

    const groups = ['All', ...new Set(items.map((item) => options.groupOf(item.exercise)))];
    const filterButtons = groups.map((group) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(group === activeGroup),
      onClick: () => { activeGroup = group; update(); },
    }, group));

    const visible = () => (activeGroup === 'All' ? items : items.filter((item) => options.groupOf(item.exercise) === activeGroup));

    function update() {
      filterButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(groups[i] === activeGroup)));
      const shown = visible();
      const solved = shown.filter((item) => getExerciseState(item.exercise.id).status === 'solved').length;
      countLine.textContent = `${shown.length} ${options.noun}s · ${solved} solved`;
      list.replaceChildren(...shown.map(row));
    }

    function openRandom() {
      const open = visible().filter((item) => getExerciseState(item.exercise.id).status !== 'solved');
      const pool = open.length > 0 ? open : visible();
      const pick = pool[Math.floor(Math.random() * pool.length)];
      location.hash = `#${options.basePath}/${pick.exercise.id}`;
    }

    root.append(
      pageHeader({ eyebrow: 'Practice mode', title: mode.title, lead: mode.description }),
      section(null,
        h('div', { class: 'understand-intro card' },
          h('div', null,
            h('h2', { class: 'card__title' }, options.intro.title),
            h('p', { class: 'card__text' }, options.intro.text)),
          h('div', { class: 'btn-row' },
            options.intro.links.map((link) => h('a', { class: 'btn', href: link.href }, link.label)),
            h('button', { class: 'btn btn--primary', type: 'button', onClick: openRandom }, `Random unsolved ${options.noun}`, icon('arrow-right'))),
        ),
      ),
      section(`All ${options.noun}s`,
        h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Filter' }, filterButtons),
        countLine,
        list,
      ),
    );
    update();
  }

  function row({ exercise, module: mod, lesson }) {
    const state = getExerciseState(exercise.id);
    return h('li', null,
      h('a', { class: 'card exercise-link', href: `#${options.basePath}/${exercise.id}` },
        h('span', { class: 'exercise-link__type' }, options.groupOf(exercise)),
        h('span', { class: 'exercise-link__body' },
          h('span', { class: 'exercise-link__title' }, exercise.title),
          h('span', { class: 'exercise-link__source' }, `Module ${mod.number} · ${lesson.title}`)),
        h('span', { class: `badge${state.status === 'solved' ? ' badge--success' : ''}` }, STATUS_TEXT[state.status]),
      ));
  }

  /* ───────────── One exercise ───────────── */

  function renderOne(root, exerciseId) {
    const items = collect();
    const index = items.findIndex((item) => item.exercise.id === exerciseId);
    const listHref = `#${options.basePath}`;
    const modeTitle = getMode(options.modeId).title;

    if (index === -1) {
      root.append(
        h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Not found'),
        emptyState({
          iconName: options.modeId,
          title: `This ${options.noun} does not exist`,
          action: h('a', { class: 'btn btn--primary', href: listHref }, `All ${options.noun}s`),
        }),
      );
      return undefined;
    }

    const { exercise, lesson, module: mod } = items[index];
    const next = items[index + 1];
    const view = createExercise(exercise);

    root.append(
      h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
        h('a', { href: listHref }, modeTitle),
        h('span', { 'aria-hidden': 'true' }, '/'),
        h('span', null, `${options.noun[0].toUpperCase()}${options.noun.slice(1)} ${index + 1} of ${items.length}`),
      ),
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, exercise.title),
      view.element,
      h('nav', { class: 'pager', 'aria-label': `${modeTitle} navigation` },
        h('a', { class: 'btn btn--ghost', href: `#/learn/${mod.id}/${lesson.slug}` }, `From: ${getModule(mod.id).title} · ${lesson.title}`),
        next
          ? h('a', { class: 'btn btn--primary', href: `#${options.basePath}/${next.exercise.id}` }, `Next: ${next.exercise.title}`, icon('arrow-right'))
          : h('a', { class: 'btn btn--primary', href: listHref }, `All ${options.noun}s`, icon('arrow-right')),
      ),
    );

    return view.destroy;
  }
}
