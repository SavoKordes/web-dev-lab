/*
 * debug.js — Debug mode: broken code to diagnose and repair.
 *
 *   #/debug            all bug challenges, filterable by bug category
 *   #/debug/<id>       one challenge, with "next" navigation
 *
 * A challenge is any exercise marked `debug: true` (mostly in Module 5). Each
 * has a symptom, progressive hints, and a post-mortem after you fix it.
 */

import { createDrillCollectionView } from './drill-collection.js';

export const render = createDrillCollectionView({
  modeId: 'debug',
  basePath: '/debug',
  noun: 'challenge',
  include: (exercise) => exercise.debug === true,
  groupOf: (exercise) => exercise.bugCategory ?? 'Other',
  intro: {
    title: 'Find it, fix it, recognize it next time',
    text: 'Each challenge is code with a real bug and a description of the symptom. Use the method from Module 5: reproduce, read the error, locate, form a hypothesis, change one thing, verify. Hints come one step at a time.',
    links: [{ href: '#/learn/debugging', label: 'Module 5 lessons' }],
  },
});
