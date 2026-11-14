/*
 * projects.js — Module 8 mini projects. Placeholder until its stage is built.
 */

import { getModule } from '../../content/curriculum.js';
import { createPlaceholder } from './placeholder.js';

const projectsModule = getModule('projects');

export const render = createPlaceholder({
  eyebrow: 'Apply',
  title: 'Projects',
  lead: 'Five complete applications, each with requirements, milestones, functional acceptance criteria and a final review.',
  iconName: 'projects',
  points: projectsModule.topics.map((name, i) => `Project ${i + 1}: ${name}`),
  emptyText: 'Project briefs, milestones and acceptance checklists will appear here.',
});
