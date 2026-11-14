/*
 * curriculum-progress.js — how far you are through lessons and modules.
 *
 * Nothing here is stored separately: lesson progress is CALCULATED from the
 * state of the lesson's exercises every time it is needed. One source of truth
 * means the numbers can never disagree with each other.
 *
 * "Done" means every exercise is solved or its solution was viewed. That is
 * completion, not mastery: the mastery numbers (later stage) are calculated
 * from the credits in progress.js.
 */

import { modules } from '../../content/curriculum.js';
import { getLessons, lessonExercises } from '../../content/lessons.js';
import { getExerciseState } from './progress.js';

const FINISHED = new Set(['solved', 'revealed']);

/** { total, finished, solved, started, done } for one lesson. */
export function lessonProgress(lesson) {
  const states = lessonExercises(lesson).map((exercise) => getExerciseState(exercise.id));
  const finished = states.filter((s) => FINISHED.has(s.status)).length;
  return {
    total: states.length,
    finished,
    solved: states.filter((s) => s.status === 'solved').length,
    started: states.some((s) => s.status !== 'new'),
    done: states.length > 0 && finished === states.length,
  };
}

/** { lessons, doneLessons, available } for one module. */
export function moduleProgress(moduleId) {
  const lessons = getLessons(moduleId);
  return {
    lessons: lessons.length,
    doneLessons: lessons.filter((lesson) => lessonProgress(lesson).done).length,
    available: lessons.length > 0,
  };
}

/** Total number of finished lessons across all modules. */
export function countDoneLessons() {
  return modules.reduce((sum, mod) => sum + moduleProgress(mod.id).doneLessons, 0);
}

/**
 * The lesson to continue with: the first one, in curriculum order, that is not done.
 * Returns { module, lesson } or null when everything available is done.
 */
export function nextLesson() {
  for (const mod of modules) {
    for (const lesson of getLessons(mod.id)) {
      if (!lessonProgress(lesson).done) return { module: mod, lesson };
    }
  }
  return null;
}
