/*
 * mastery.js — how well you know each skill, and what to revise when.
 *
 * Built on the evidence that progress.js records: every time you SOLVE an exercise
 * (in a lesson or in a revision), each of its skills gets an event with a credit
 * from 0 to 1 (lower with hints and failed checks, 0 after viewing the solution).
 *
 * Mastery of a skill = (recent average credit) × (retention)
 *   - recent average: the last 5 events, newer ones weigh more
 *   - retention: falls slowly with the days since you last practised the skill.
 *     The more successful practice it has, the slower it falls ("stability").
 *
 * Revision: after each successful practice, the skill is due again after a
 * growing interval: 1, 3, 7, 14, 30, then 60 days. Revision uses a different
 * exercise for the same skill when one exists, so you cannot just remember an answer.
 */

import { read } from '../core/store.js';
import { modules } from '../../content/curriculum.js';
import { getLessons, lessonExercises } from '../../content/lessons.js';
import { listExercises } from '../../content/exercises.js';
import { getExerciseState } from './progress.js';

const DAY = 24 * 60 * 60 * 1000;
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60]; // days
const REVIEW_SUFFIX = '~review';

export const LEVELS = [
  { min: 0, name: 'Foundation', description: 'Learning the building blocks of HTML, CSS and JavaScript.' },
  { min: 25, name: 'Practitioner', description: 'You can read and write the core patterns with some help.' },
  { min: 50, name: 'Independent', description: 'You build and debug common features on your own.' },
  { min: 75, name: 'Professional', description: 'You can supervise and review code, including AI-generated code, with confidence.' },
];

const PREFIX_LABELS = {
  html: 'HTML', css: 'CSS', js: 'JavaScript', reading: 'Reading code', debug: 'Debugging',
  interactive: 'Interactive apps', pro: 'Professional', project: 'Projects',
};

/** A readable name for a skill id: 'js.array-methods' → 'JavaScript: array methods'. */
export function skillLabel(skillId) {
  const [prefix, ...rest] = skillId.split('.');
  const name = rest.join(' ').replace(/-/g, ' ');
  return `${PREFIX_LABELS[prefix] ?? prefix}: ${name}`;
}

/* ───────────────── Pure calculations (testable without the page) ───────────────── */

/** Mastery of one skill (0–1), from its events, as it would be at time `now` (ms). */
export function skillMastery(events, now = Date.now()) {
  const past = events.filter((e) => Date.parse(e.at) <= now);
  if (past.length === 0) return 0;

  const recent = past.slice(-5);
  let weighted = 0;
  let weights = 0;
  recent.forEach((event, i) => {
    const weight = i + 1; // the newest event weighs most
    weighted += event.credit * weight;
    weights += weight;
  });
  const average = weighted / weights;

  const successes = past.filter((e) => e.credit > 0).length;
  const stabilityDays = 2 * REVIEW_INTERVALS[Math.min(Math.max(successes, 1), REVIEW_INTERVALS.length) - 1];
  const daysSince = (now - Date.parse(past[past.length - 1].at)) / DAY;
  const retention = Math.exp(-Math.max(0, daysSince) / stabilityDays);

  return average * retention;
}

/** When a skill should be revised next (ms), or null if it has never been practised. */
export function nextReviewAt(events) {
  if (events.length === 0) return null;
  const successes = events.filter((e) => e.credit > 0).length;
  const interval = REVIEW_INTERVALS[Math.min(Math.max(successes, 1), REVIEW_INTERVALS.length) - 1];
  // A weak last result (below 0.5) brings the skill back after one day.
  const last = events[events.length - 1];
  const days = last.credit < 0.5 ? 1 : interval;
  return Date.parse(last.at) + days * DAY;
}

export function levelFor(score) {
  return [...LEVELS].reverse().find((level) => score >= level.min);
}

/* ───────────────── Reading the stored progress ───────────────── */

/** Every skill trained somewhere in the curriculum, with the exercises that train it. */
export function curriculumSkills() {
  const skills = new Map();
  for (const exercise of listExercises()) {
    for (const skill of exercise.skills ?? []) {
      if (!skills.has(skill)) skills.set(skill, []);
      skills.get(skill).push(exercise);
    }
  }
  return skills;
}

function skillEvents() {
  return read('progress').skills;
}

/** Mastery (0–100) per skill, for every skill in the curriculum. */
export function allSkillMastery(now = Date.now()) {
  const events = skillEvents();
  return [...curriculumSkills().keys()].map((id) => {
    const list = events[id]?.events ?? [];
    return {
      id,
      label: skillLabel(id),
      mastery: Math.round(skillMastery(list, now) * 100),
      practised: list.length > 0,
      events: list,
      nextReview: nextReviewAt(list),
    };
  });
}

/** Overall score (0–100): the average mastery over ALL curriculum skills, so unseen skills count as 0. */
export function overallScore(now = Date.now()) {
  const skills = allSkillMastery(now);
  if (skills.length === 0) return 0;
  return Math.round(skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length);
}

/** Overall score at the end of each of the last `days` days: [{ date: 'YYYY-MM-DD', value }]. */
export function scoreHistory(days = 30) {
  const points = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  for (let i = days - 1; i >= 0; i--) {
    const end = new Date(today.getTime() - i * DAY);
    const date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    points.push({ date, value: overallScore(end.getTime()) });
  }
  return points;
}

/** Average mastery (0–100) of the skills trained in each module. */
export function moduleMastery(now = Date.now()) {
  const bySkill = new Map(allSkillMastery(now).map((s) => [s.id, s.mastery]));
  return modules.map((mod) => {
    const ids = new Set(getLessons(mod.id).flatMap(lessonExercises).flatMap((e) => e.skills ?? []));
    const values = [...ids].map((id) => bySkill.get(id) ?? 0);
    return {
      module: mod,
      available: ids.size > 0,
      mastery: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
    };
  });
}

/* ───────────────── Revision ───────────────── */

/** The exercise to use for revising a skill: one not used last time, ideally unsolved. */
export function pickRevisionExercise(skillId, events) {
  const candidates = (curriculumSkills().get(skillId) ?? [])
    .filter((e) => e.type !== 'checklist' && e.type !== 'explain' && !e.id.startsWith('project.'));
  if (candidates.length === 0) return null;

  const lastUsed = events.length ? events[events.length - 1].exerciseId.replace(REVIEW_SUFFIX, '') : null;
  const others = candidates.filter((e) => e.id !== lastUsed);
  const pool = others.length ? others : candidates;

  // Prefer exercises you have not solved yet; then the one solved longest ago.
  const unsolved = pool.filter((e) => getExerciseState(e.id).status !== 'solved');
  if (unsolved.length) return unsolved[0];
  return [...pool].sort((a, b) =>
    (getExerciseState(a.id).solvedAt ?? '').localeCompare(getExerciseState(b.id).solvedAt ?? ''))[0];
}

/** Skills due for revision now, most overdue first: [{ skill, exercise, dueSince }]. */
export function dueRevisions(now = Date.now()) {
  return allSkillMastery(now)
    .filter((s) => s.practised && s.nextReview !== null && s.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .map((skill) => ({ skill, exercise: pickRevisionExercise(skill.id, skill.events), dueSince: skill.nextReview }))
    .filter((item) => item.exercise);
}

/** The next upcoming review, if nothing is due: { skill, at } or null. */
export function nextUpcomingReview(now = Date.now()) {
  const upcoming = allSkillMastery(now)
    .filter((s) => s.nextReview !== null && s.nextReview > now)
    .sort((a, b) => a.nextReview - b.nextReview);
  return upcoming.length ? { skill: upcoming[0], at: upcoming[0].nextReview } : null;
}

/** The id under which a revision attempt of an exercise is stored (separate from the lesson attempt). */
export function revisionId(exerciseId) {
  return `${exerciseId}${REVIEW_SUFFIX}`;
}

/* ───────────────── Areas that need work ───────────────── */

/**
 * The weakest practised skills, with the reasons that make them weak:
 * low recent credit (hints, failed checks, viewed solutions) or a long break.
 */
export function weakestSkills(limit = 5, now = Date.now()) {
  const progress = read('progress');
  return allSkillMastery(now)
    .filter((s) => s.practised)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit)
    .map((skill) => {
      const exercises = curriculumSkills().get(skill.id) ?? [];
      const states = exercises.map((e) => progress.exercises[e.id]).filter(Boolean);
      const reasons = [];
      const hints = states.reduce((n, s) => n + (s.hintsUsed ?? 0), 0);
      const failed = states.reduce((n, s) => n + (s.failedAttempts ?? 0), 0);
      const revealed = states.filter((s) => s.solutionShown).length;
      const lastAt = Date.parse(skill.events[skill.events.length - 1].at);
      const idleDays = Math.floor((now - lastAt) / DAY);
      if (revealed) reasons.push(`${revealed} solution${revealed === 1 ? '' : 's'} viewed`);
      if (hints) reasons.push(`${hints} hint${hints === 1 ? '' : 's'} used`);
      if (failed) reasons.push(`${failed} unsuccessful check${failed === 1 ? '' : 's'}`);
      if (idleDays >= 7) reasons.push(`not practised for ${idleDays} days`);
      return { ...skill, reasons };
    });
}
