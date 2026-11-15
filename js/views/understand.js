/*
 * understand.js — Understand mode: code-reading drills from the whole program.
 *
 *   #/understand            all drills, filterable by type, plus a random drill
 *   #/understand/<id>       one drill, with "next" navigation
 *
 * A drill is any reading exercise (predict, order, trace, explain), plus every
 * exercise in Module 4. The page itself is the shared drill collection.
 */

import { createDrillCollectionView } from './drill-collection.js';
import { TYPE_LABELS } from '../ui/exercise.js';

const READING_TYPES = ['predict', 'order', 'trace', 'explain'];

export const render = createDrillCollectionView({
  modeId: 'understand',
  basePath: '/understand',
  noun: 'drill',
  include: (exercise, mod) => !exercise.debug && (mod.id === 'reading' || READING_TYPES.includes(exercise.type)),
  groupOf: (exercise) => TYPE_LABELS[exercise.type],
  intro: {
    title: 'Train your code-reading',
    text: 'Reading code you did not write is the core skill for reviewing AI output. Start with Module 4 for the method, then use these drills for regular practice. Always commit to an answer before checking.',
    links: [{ href: '#/learn/reading', label: 'Module 4 lessons' }],
  },
});
