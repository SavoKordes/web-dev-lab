/*
 * progress.js — your development over time: level, mastery, revision, weak spots, history.
 *
 * Everything shown here is calculated from what progress.js recorded, by the
 * functions in services/mastery.js and services/curriculum-progress.js.
 * Completion (what you finished) and mastery (what you can still do now) are
 * shown separately on purpose.
 */

import { h, icon } from '../core/dom.js';
import { read } from '../core/store.js';
import { getExercise } from '../../content/exercises.js';
import { findLessonOfExercise, getLessons, lessonExercises } from '../../content/lessons.js';
import {
  overallScore, levelFor, LEVELS, scoreHistory, moduleMastery, dueRevisions,
  nextUpcomingReview, weakestSkills, allSkillMastery,
} from '../services/mastery.js';
import { moduleProgress } from '../services/curriculum-progress.js';
import { getExerciseState } from '../services/progress.js';
import { createLineChart } from '../ui/chart.js';
import { pageHeader, section, emptyState } from '../ui/page.js';
import { meter } from '../ui/meter.js';

const dateTime = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dateOnly = (ms) => new Date(ms).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export function render(root) {
  const progress = read('progress');
  const header = pageHeader({
    eyebrow: 'Overview',
    title: 'Progress',
    lead: 'What you can do now, not just what you have finished. Mastery rises when you solve exercises without help, and slowly falls when you do not practise.',
  });

  if (progress.attempts.length === 0) {
    root.append(header, emptyState({
      iconName: 'progress',
      title: 'No progress yet',
      text: 'Your level, mastery chart, revision plan and history appear here once you check your first exercise.',
      action: h('a', { class: 'btn btn--primary', href: '#/learn' }, 'Start learning'),
    }));
    return;
  }

  const score = overallScore();
  const level = levelFor(score);
  const nextLevel = LEVELS.find((l) => l.min > score);
  const skills = allSkillMastery();
  const practised = skills.filter((s) => s.practised);
  // Revision attempts are stored as "<id>~review"; count each exercise only once here.
  const solvedStates = Object.entries(progress.exercises)
    .filter(([id, state]) => !id.endsWith('~review') && state.status === 'solved')
    .map(([, state]) => state);
  const firstTry = solvedStates.filter((s) => s.hintsUsed === 0 && s.failedAttempts === 0 && !s.solutionShown).length;
  const due = dueRevisions();

  root.append(
    header,

    section(null, h('div', { class: 'card level-card' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Current level'),
        h('p', { class: 'level-card__name' }, level.name),
        h('p', { class: 'card__text' }, level.description)),
      h('div', { class: 'level-card__score' },
        h('p', { class: 'stat__value' }, `${score}%`),
        h('p', { class: 'stat__label' }, 'overall mastery'),
        meter(score, 100, 'Overall mastery'),
        nextLevel && h('p', { class: 'card__text' }, `${nextLevel.name} from ${nextLevel.min}%`)),
    )),

    section('At a glance', h('div', { class: 'grid grid--4' },
      stat(`${practised.length} / ${skills.length}`, 'skills practised'),
      stat(solvedStates.length, 'exercises solved'),
      stat(solvedStates.length ? `${Math.round((firstTry / solvedStates.length) * 100)}%` : '—', 'solved first try, no hints'),
      stat(due.length, due.length === 1 ? 'review due' : 'reviews due'),
    )),

    section('Mastery over time', h('div', { class: 'card' },
      createLineChart({ points: scoreHistory(30), label: 'Overall mastery, last 30 days', max: 100, format: (v) => `${v}%` }))),

    section('Revision', revisionList(due)),

    section('Areas requiring improvement', weakList()),

    section('Mastery by module', h('div', { class: 'card' }, moduleBars())),

    section('Completed modules and projects', completion()),

    section('Exercise history', historyTable(progress.attempts)),
  );
}

function stat(value, label) {
  return h('div', { class: 'card stat' }, h('div', { class: 'stat__value' }, value), h('div', { class: 'stat__label' }, label));
}

/* ───────── Revision ───────── */

export function revisionList(due, limit = 8) {
  if (due.length === 0) {
    const upcoming = nextUpcomingReview();
    return h('div', { class: 'card' },
      h('p', null, h('strong', null, 'Nothing to revise right now.')),
      upcoming && h('p', { class: 'card__text' }, `Next: ${upcoming.skill.label}, on ${dateOnly(upcoming.at)}.`));
  }
  return h('ul', { class: 'exercise-list' }, due.slice(0, limit).map(({ skill, exercise }) =>
    h('li', null, h('a', { class: 'card exercise-link', href: `#/review/${exercise.id}` },
      h('span', { class: 'exercise-link__type' }, `${skill.mastery}% mastery`),
      h('span', { class: 'exercise-link__body' },
        h('span', { class: 'exercise-link__title' }, skill.label),
        h('span', { class: 'exercise-link__source' }, `Revise with: ${exercise.title}`)),
      h('span', { class: 'badge badge--accent' }, 'Due'),
    ))));
}

/* ───────── Weak spots ───────── */

function weakList() {
  const weak = weakestSkills(5).filter((s) => s.mastery < 80);
  if (weak.length === 0) {
    return h('div', { class: 'card' }, h('p', { class: 'card__text' }, 'No weak spots among the skills you have practised. Keep going with new lessons and revisions.'));
  }
  return h('ul', { class: 'weak-list' }, weak.map((skill) =>
    h('li', { class: 'card weak-item' },
      h('div', { class: 'weak-item__head' },
        h('span', { class: 'weak-item__name' }, skill.label),
        h('span', { class: 'weak-item__value' }, `${skill.mastery}%`)),
      meter(skill.mastery, 100, `${skill.label} mastery`),
      skill.reasons.length > 0 && h('p', { class: 'card__text' }, `Why: ${skill.reasons.join(', ')}.`),
    )));
}

/* ───────── Mastery by module: a single-hue bar list ───────── */

function moduleBars() {
  return h('ul', { class: 'bar-list' }, moduleMastery().filter((m) => m.available).map(({ module: mod, mastery }) =>
    h('li', { class: 'bar-list__row' },
      h('span', { class: 'bar-list__label' }, `${mod.number}. ${mod.title}`),
      h('span', { class: 'bar-list__track', 'aria-hidden': 'true' },
        h('span', { class: 'bar-list__bar', style: `width: ${Math.max(mastery, 0)}%` })),
      h('span', { class: 'bar-list__value' }, `${mastery}%`),
    )));
}

/* ───────── Completion ───────── */

function completion() {
  const modules = moduleMastery().filter((m) => m.available && m.module.id !== 'projects');
  const projects = getLessons('projects');

  return h('div', { class: 'grid grid--2' },
    h('div', { class: 'card' },
      h('h3', { class: 'card__title' }, 'Modules'),
      h('ul', { class: 'completion-list' }, modules.map(({ module: mod }) => {
        const p = moduleProgress(mod.id);
        const done = p.doneLessons === p.lessons;
        return h('li', null,
          h('a', { href: `#/learn/${mod.id}` }, `${mod.number}. ${mod.title}`),
          h('span', { class: `badge${done ? ' badge--success' : ''}` }, done ? 'Complete' : `${p.doneLessons} / ${p.lessons} lessons`));
      }))),
    h('div', { class: 'card' },
      h('h3', { class: 'card__title' }, 'Projects'),
      h('ul', { class: 'completion-list' }, projects.map((project) => {
        const exercises = lessonExercises(project);
        const solved = exercises.filter((e) => getExerciseState(e.id).status === 'solved').length;
        return h('li', null,
          h('a', { href: `#/projects/${project.slug}` }, project.title.replace(/^Project \d+: /, '')),
          h('span', { class: `badge${solved === exercises.length ? ' badge--success' : ''}` }, `${solved} / ${exercises.length} steps`));
      }))),
  );
}

/* ───────── History ───────── */

function historyTable(attempts) {
  const recent = [...attempts].reverse().slice(0, 25);
  return h('div', { class: 'card history' },
    h('div', { class: 'history__wrap' }, h('table', { class: 'history__table' },
      h('caption', { class: 'visually-hidden' }, 'Your most recent checks'),
      h('thead', null, h('tr', null,
        ['When', 'Exercise', 'Result', 'Help used'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', null, recent.map((attempt) => {
        const isReview = attempt.exerciseId.endsWith('~review');
        const id = attempt.exerciseId.replace('~review', '');
        const exercise = getExercise(id);
        const home = findLessonOfExercise(id);
        const help = [
          attempt.hintsUsed ? `${attempt.hintsUsed} hint${attempt.hintsUsed === 1 ? '' : 's'}` : null,
          attempt.solutionShown ? 'solution viewed' : null,
          attempt.selfAssessed ? 'self-assessed' : null,
        ].filter(Boolean).join(', ');
        return h('tr', null,
          h('td', null, dateTime(attempt.at)),
          h('td', null,
            home ? h('a', { href: `#/practice/${id}` }, exercise?.title ?? id) : (exercise?.title ?? id),
            isReview && h('span', { class: 'badge', style: 'margin-left: 6px' }, 'revision')),
          h('td', null, attempt.correct
            ? h('span', { class: 'history__ok' }, icon('check'), ' Correct')
            : h('span', { class: 'history__fail' }, `Not yet (${Math.round(attempt.score * 100)}%)`)),
          h('td', null, help || '—'));
      })),
    )),
    attempts.length > recent.length && h('p', { class: 'card__text' }, `Showing the latest ${recent.length} of ${attempts.length} checks.`),
  );
}

