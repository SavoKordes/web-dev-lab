/*
 * exercises.js — the registry of every exercise in the program.
 *
 * Exercises live in lessons (content/modules/*.js) and in the sample list.
 * This file collects them, so the rest of the app can look up any exercise by id
 * without knowing which file it is in.
 */

import { sampleExercises } from './sample-exercises.js';
import { allLessonExercises } from './lessons.js';

const allExercises = [...allLessonExercises(), ...sampleExercises];

// Catch a content mistake early: two exercises with the same id would share progress.
const seen = new Set();
for (const exercise of allExercises) {
  if (seen.has(exercise.id)) console.error(`Duplicate exercise id: ${exercise.id}`);
  seen.add(exercise.id);
}

export function getExercise(id) {
  return allExercises.find((exercise) => exercise.id === id);
}

export function listExercises() {
  return allExercises;
}

export { sampleExercises };
