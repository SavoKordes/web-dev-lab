/*
 * progress.js — the progress dashboard. Placeholder until its stage is built.
 */

import { createPlaceholder } from './placeholder.js';

export const render = createPlaceholder({
  eyebrow: 'Overview',
  title: 'Progress',
  lead: 'How your skills are developing over time — measured by mastery, not just by how many exercises you have finished.',
  iconName: 'progress',
  points: [
    'Mastery per skill and per module, and how it changes over time',
    'Areas that need improvement, based on errors and hints used',
    'Revision exercises that are due today',
    'Your full exercise history and project milestones',
  ],
  emptyText: 'Your progress will appear here once you complete your first exercises.',
});
