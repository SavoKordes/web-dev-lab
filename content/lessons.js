/*
 * lessons.js — registry of all lessons, per module.
 *
 * ─── Lesson format ───
 *   {
 *     slug: 'semantic-html',          // part of the URL: #/learn/html/semantic-html
 *     title: 'Semantic HTML',
 *     minutes: 15,                    // rough estimate
 *     summary: 'One sentence shown in lists.',
 *     sections: [                     // shown in this order
 *       { kind: 'text', title?: '…', text: '…' },               // explanation (rich text)
 *       { kind: 'example', title?, language, code, css?, preview?, notes: [{ lines: [3, 4], text }] },
 *       { kind: 'mistakes', items: [{ title, text }] },          // common beginner mistakes
 *       { kind: 'exercise', exercise: { … } },                   // see js/ui/exercise.js
 *     ],
 *     keyPoints: ['…'],               // short recap at the end
 *   }
 *
 * The sections follow the teaching sequence used everywhere in the lab:
 * explain simply → small example → important lines explained → exercise → check → feedback.
 */

import { htmlLessons } from './modules/html.js';
import { cssLessons } from './modules/css.js';
import { jsCoreLessons } from './modules/js-core.js';
import { jsBrowserLessons } from './modules/js-browser.js';
import { readingLessons } from './modules/reading.js';
import { debuggingLessons } from './modules/debugging.js';

const lessonsByModule = {
  html: htmlLessons,
  css: cssLessons,
  js: [...jsCoreLessons, ...jsBrowserLessons],
  reading: readingLessons,
  debugging: debuggingLessons,
};

export function getLessons(moduleId) {
  return lessonsByModule[moduleId] ?? [];
}

export function getLesson(moduleId, slug) {
  return getLessons(moduleId).find((lesson) => lesson.slug === slug);
}

/** The exercises inside a lesson, in order. */
export function lessonExercises(lesson) {
  return lesson.sections.filter((s) => s.kind === 'exercise').map((s) => s.exercise);
}

/** Find the module and lesson an exercise belongs to: { moduleId, lesson } or null. */
export function findLessonOfExercise(exerciseId) {
  for (const [moduleId, lessons] of Object.entries(lessonsByModule)) {
    const lesson = lessons.find((l) => lessonExercises(l).some((e) => e.id === exerciseId));
    if (lesson) return { moduleId, lesson };
  }
  return null;
}

/** Every exercise from every lesson (used by the exercise registry). */
export function allLessonExercises() {
  return Object.values(lessonsByModule).flat().flatMap(lessonExercises);
}
