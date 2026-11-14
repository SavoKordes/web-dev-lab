/*
 * debug.js — the Debug mode. Placeholder until its stage is built (see README "Build stages").
 * The text comes from content/modes.js so it stays consistent with the dashboard.
 */

import { getMode } from '../../content/modes.js';
import { createPlaceholder } from './placeholder.js';

const mode = getMode('debug');

export const render = createPlaceholder({
  eyebrow: 'Practice mode',
  title: mode.title,
  lead: mode.description,
  iconName: mode.icon,
  points: mode.points,
  emptyText: 'This mode is being built. Its exercises will appear here as their curriculum modules are added.',
});
