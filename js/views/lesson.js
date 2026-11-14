/*
 * lesson.js — one lesson: #/learn/<module id>/<lesson slug>
 *
 * Renders the lesson's sections in order (explanation, example with important
 * lines, common mistakes, exercises) and keeps a progress line up to date.
 */

import { h, icon } from '../core/dom.js';
import { on } from '../core/events.js';
import { getModule } from '../../content/curriculum.js';
import { getLessons, getLesson, lessonExercises } from '../../content/lessons.js';
import { lessonProgress } from '../services/curriculum-progress.js';
import { createExercise } from '../ui/exercise.js';
import { createLessonExample } from '../ui/lesson-example.js';
import { richText, inline } from '../ui/rich-text.js';
import { emptyState } from '../ui/page.js';

export function render(root, params) {
  const mod = getModule(params.moduleId);
  const lesson = mod && getLesson(mod.id, params.lessonSlug);

  if (!lesson) {
    root.append(
      h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Lesson not found'),
      emptyState({
        iconName: 'learn',
        title: 'Lesson not found',
        text: 'This lesson does not exist (yet).',
        action: h('a', { class: 'btn btn--primary', href: '#/learn' }, 'Back to Learn'),
      }),
    );
    return undefined;
  }

  const lessons = getLessons(mod.id);
  const index = lessons.indexOf(lesson);
  const cleanups = []; // destroy functions of exercises and examples on this page

  /* ── Progress line, updated whenever an exercise is checked ── */
  const progressLine = h('p', { class: 'lesson__progress', 'aria-live': 'polite' });
  function updateProgress() {
    const p = lessonProgress(lesson);
    progressLine.replaceChildren(p.done
      ? h('span', { class: 'badge badge--success' }, icon('check'), 'Lesson complete')
      : h('span', { class: 'badge' }, `${p.finished} of ${p.total} exercises finished`));
  }
  updateProgress();
  cleanups.push(on('progress:change', updateProgress));

  /* ── Sections ── */
  const sections = lesson.sections.map((section) => {
    if (section.kind === 'text') {
      return h('section', { class: 'lesson__section prose' },
        section.title && h('h2', null, section.title),
        richText(section.text));
    }
    if (section.kind === 'example') {
      const example = createLessonExample(section);
      cleanups.push(example.destroy);
      return h('section', { class: 'lesson__section' },
        h('h2', null, section.title ?? 'Example'),
        example.element);
    }
    if (section.kind === 'mistakes') {
      return h('section', { class: 'lesson__section' },
        h('h2', null, 'Common mistakes'),
        h('div', { class: 'stack' }, section.items.map((item) =>
          h('div', { class: 'callout callout--mistake' },
            h('p', { class: 'callout__label' }, inline(item.title)),
            richText(item.text)))));
    }
    if (section.kind === 'exercise') {
      const exercise = createExercise(section.exercise);
      cleanups.push(exercise.destroy);
      return h('section', { class: 'lesson__section lesson__section--exercise' }, exercise.element);
    }
    return null;
  });

  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const exerciseCount = lessonExercises(lesson).length;

  root.append(
    h('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/learn' }, 'Learn'),
      h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { href: `#/learn/${mod.id}` }, `Module ${mod.number}: ${mod.title}`),
    ),
    h('header', { class: 'page-header lesson__header' },
      h('p', { class: 'eyebrow' }, `Module ${mod.number} · Lesson ${index + 1} of ${lessons.length}`),
      h('h1', { tabindex: '-1' }, lesson.title),
      h('p', { class: 'page-header__lead' }, lesson.summary),
      h('div', { class: 'lesson__meta' },
        h('span', null, `About ${lesson.minutes} minutes`),
        h('span', null, `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`),
        progressLine),
    ),
    h('div', { class: 'lesson' }, sections),
    lesson.keyPoints && h('section', { class: 'lesson__section' },
      h('div', { class: 'callout callout--explain' },
        h('p', { class: 'callout__label' }, 'Key points'),
        h('ul', null, lesson.keyPoints.map((point) => h('li', null, inline(point)))))),
    h('nav', { class: 'pager', 'aria-label': 'Lessons' },
      previous
        ? h('a', { class: 'btn btn--ghost', href: `#/learn/${mod.id}/${previous.slug}` }, '← ', previous.title)
        : h('a', { class: 'btn btn--ghost', href: `#/learn/${mod.id}` }, '← Module overview'),
      next
        ? h('a', { class: 'btn btn--primary', href: `#/learn/${mod.id}/${next.slug}` }, `Next: ${next.title}`, icon('arrow-right'))
        : h('a', { class: 'btn btn--primary', href: '#/learn' }, 'Back to all modules', icon('arrow-right')),
    ),
  );

  return () => cleanups.forEach((cleanup) => cleanup?.());
}
