/*
 * module.js — one module's lesson list: #/learn/<module id>
 */

import { h, icon } from '../core/dom.js';
import { getModule } from '../../content/curriculum.js';
import { getLessons } from '../../content/lessons.js';
import { lessonProgress, moduleProgress } from '../services/curriculum-progress.js';
import { emptyState } from '../ui/page.js';
import { meter } from '../ui/meter.js';

export function render(root, params) {
  const mod = getModule(params.moduleId);
  const lessons = mod ? getLessons(mod.id) : [];

  if (!mod || lessons.length === 0) {
    root.append(
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Module not available'),
      emptyState({
        iconName: 'curriculum',
        title: mod ? `Module ${mod.number} is in preparation` : 'Module not found',
        text: mod ? 'Its lessons are added in a later stage.' : '',
        action: h('a', { class: 'btn btn--primary', href: '#/learn' }, 'Back to Learn'),
      }),
    );
    return;
  }

  const progress = moduleProgress(mod.id);
  const firstOpen = lessons.find((lesson) => !lessonProgress(lesson).done) ?? lessons[0];

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/learn' }, 'Learn'),
      h('span', { 'aria-hidden': 'true' }, '/'),
      h('span', { 'aria-current': 'page' }, mod.title),
    ),
    h('header', { class: 'page-header' },
      h('p', { class: 'eyebrow' }, `Module ${mod.number}`),
      h('h1', { tabindex: '-1' }, mod.title),
      h('p', { class: 'page-header__lead' }, mod.summary),
      h('div', { class: 'module-progress' },
        meter(progress.doneLessons, progress.lessons, `${mod.title}: lessons complete`),
        h('span', null, `${progress.doneLessons} of ${progress.lessons} lessons complete`),
        h('a', { class: 'btn btn--primary', href: `#/learn/${mod.id}/${firstOpen.slug}` },
          progress.doneLessons === 0 ? 'Start' : 'Continue', icon('arrow-right')),
      ),
    ),
    h('ol', { class: 'lesson-list' }, lessons.map((lesson, i) => {
      const p = lessonProgress(lesson);
      const status = p.done ? 'Complete' : p.started ? `${p.finished} of ${p.total} exercises` : 'Not started';
      return h('li', null,
        h('a', { class: 'card lesson-link', href: `#/learn/${mod.id}/${lesson.slug}` },
          h('span', { class: `lesson-link__number${p.done ? ' is-done' : ''}`, 'aria-hidden': 'true' },
            p.done ? icon('check') : i + 1),
          h('span', { class: 'lesson-link__body' },
            h('span', { class: 'lesson-link__title' }, lesson.title),
            h('span', { class: 'lesson-link__summary' }, lesson.summary)),
          h('span', { class: `badge${p.done ? ' badge--success' : ''}` }, status),
        ));
    })),
  );
}
