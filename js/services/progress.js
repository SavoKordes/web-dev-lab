/*
 * progress.js — records what you do in exercises.
 *
 * Three kinds of data are kept (all inside the store's 'progress' section):
 *
 *   exercises[id]   The current state of one exercise: status, number of attempts,
 *                   hints used, whether you looked at the solution, your saved draft.
 *   attempts[]      A history: one entry per "Check". Used for the activity history.
 *   skills[skill]   Evidence for each skill: one entry each time you SOLVE an exercise
 *                   that trains that skill, with a score from 0 to 1.
 *
 * The score is deliberately strict. Solving on the first try without hints is
 * strong evidence that you know something. Solving after three hints is weaker
 * evidence, and solving after seeing the solution is no evidence at all.
 * The mastery calculation (a later stage) is built on these scores.
 */

import { read, update } from '../core/store.js';
import { emit } from '../core/events.js';

const MAX_HISTORY = 1500; // oldest attempts are dropped beyond this

/** The state of one exercise, with defaults for an exercise you have never opened. */
export function getExerciseState(id) {
  return stateFrom(read('progress'), id);
}

// Fill in defaults for any field that has not been saved yet.
function stateFrom(progress, id) {
  return {
    status: 'new',          // 'new' | 'attempted' | 'solved' | 'revealed'
    attempts: 0,            // number of checks
    failedAttempts: 0,      // checks that were not correct (before solving)
    hintsUsed: 0,
    solutionShown: false,
    draft: null,            // your unfinished answer, restored when you come back
    firstOpenedAt: null,
    solvedAt: null,
    ...progress.exercises[id],
  };
}

/** Change one exercise's state with a function, the same way store.update works. */
function updateExercise(id, changeFn) {
  update('progress', (progress) => {
    const state = stateFrom(progress, id);
    progress.exercises[id] = changeFn(state) ?? state;
  });
}

export function markOpened(id) {
  if (getExerciseState(id).firstOpenedAt) return;
  updateExercise(id, (state) => { state.firstOpenedAt = new Date().toISOString(); });
}

export function saveDraft(id, draft) {
  updateExercise(id, (state) => { state.draft = draft; });
}

export function recordHint(id, hintsUsed) {
  updateExercise(id, (state) => { state.hintsUsed = Math.max(state.hintsUsed, hintsUsed); });
}

export function recordSolutionShown(id) {
  updateExercise(id, (state) => {
    state.solutionShown = true;
    if (state.status !== 'solved') state.status = 'revealed';
  });
  emit('progress:change', { exerciseId: id });
}

/**
 * How much evidence of mastery does solving this exercise give? (0 to 1)
 *   - starts from the result's own score (1 for fully correct; less for self-assessed)
 *   - each hint costs 0.2
 *   - each failed check costs 0.1, at most 0.3 in total
 *   - a solved exercise always counts for at least 0.2
 *   - after seeing the solution it counts for 0
 */
export function creditFor({ score = 1, hintsUsed, failedAttempts, solutionShown }) {
  if (solutionShown) return 0;
  const credit = score - 0.2 * hintsUsed - Math.min(0.3, 0.1 * failedAttempts);
  return Math.max(0.2, Math.min(1, Math.round(credit * 100) / 100));
}

/**
 * Record the result of one "Check".
 * @param {object} exercise - The exercise definition (needs id and skills).
 * @param {{correct: boolean, score?: number, selfAssessed?: boolean}} result
 * @returns {{firstSolve: boolean, credit: number|null}} what changed, for the feedback message
 */
export function recordAttempt(exercise, result) {
  const now = new Date().toISOString();
  const before = getExerciseState(exercise.id);
  const firstSolve = result.correct && before.status !== 'solved' && before.status !== 'revealed';
  let credit = null;

  update('progress', (progress) => {
    const state = stateFrom(progress, exercise.id);
    state.attempts += 1;

    if (!result.correct && state.status !== 'solved') {
      state.failedAttempts += 1;
      if (state.status === 'new') state.status = 'attempted';
    }

    if (firstSolve) {
      state.status = 'solved';
      state.solvedAt = now;
      // Self-assessed answers are weaker evidence than automatic checks.
      const score = (result.score ?? 1) * (result.selfAssessed ? 0.8 : 1);
      credit = creditFor({ ...state, score });

      for (const skill of exercise.skills ?? []) {
        progress.skills[skill] ??= { events: [] };
        progress.skills[skill].events.push({ at: now, exerciseId: exercise.id, credit });
      }
    }

    progress.exercises[exercise.id] = state;

    progress.attempts.push({
      at: now,
      exerciseId: exercise.id,
      correct: result.correct,
      score: result.score ?? (result.correct ? 1 : 0),
      hintsUsed: state.hintsUsed,
      solutionShown: state.solutionShown,
      selfAssessed: Boolean(result.selfAssessed),
    });
    if (progress.attempts.length > MAX_HISTORY) {
      progress.attempts.splice(0, progress.attempts.length - MAX_HISTORY);
    }
  });

  emit('progress:change', { exerciseId: exercise.id });
  return { firstSolve, credit };
}
