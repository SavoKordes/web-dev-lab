/*
 * projects.js — Module 8: the five mini projects.
 *
 *   #/projects              overview with progress per project
 *   #/projects/<slug>       one project (rendered by the lesson view)
 *
 * Projects are stored as lessons of the 'projects' module (content/modules/projects.js),
 * so progress, the exercise shell and the lesson page all work the same way.
 */

import { h, icon } from '../core/dom.js';
import { getLessons, lessonExercises } from '../../content/lessons.js';
import { getExerciseState } from '../services/progress.js';
import { lessonProgress } from '../services/curriculum-progress.js';
import { pageHeader, section, callout } from '../ui/page.js';
import { meter } from '../ui/meter.js';
import { render as renderLesson } from './lesson.js';

export function render(root, params) {
  if (params.lessonSlug) {
    return renderLesson(root, { moduleId: 'projects', lessonSlug: params.lessonSlug });
  }

  const projects = getLessons('projects');

  root.append(
    pageHeader({
      eyebrow: 'Apply',
      title: 'Projects',
      lead: 'Five complete applications, from a personal dashboard to a business admin panel. Each has requirements, three milestones with acceptance criteria, and a final review.',
    }),
    section(null, callout('explain', 'How projects work',
      h('p', null, 'Each milestone builds on the previous one: once you solve it, the next milestone starts from your own code. The checks are the acceptance criteria, so a milestone is done when the app does what the requirements say.'),
      h('p', null, 'Use the Download button in any milestone to save your project as a single HTML file you can open in any browser, keep, and show to others.'),
    )),
    section('Your projects', h('ol', { class: 'project-list' }, projects.map(projectCard))),
  );
}

function projectCard(project, index) {
  const progress = lessonProgress(project);
  const steps = lessonExercises(project).map((exercise) => ({
    label: exercise.type === 'checklist' ? 'Review' : exercise.title.replace(/^Milestone (\d+):.*/, 'M$1'),
    done: getExerciseState(exercise.id).status === 'solved',
  }));

  return h('li', null,
    h('a', { class: 'card project-card', href: `#/projects/${project.slug}` },
      h('span', { class: 'project-card__number', 'aria-hidden': 'true' }, index + 1),
      h('span', { class: 'project-card__body' },
        h('span', { class: 'project-card__title' }, project.title.replace(/^Project \d+: /, '')),
        h('span', { class: 'card__text' }, project.summary),
        h('span', { class: 'project-card__steps' },
          steps.map((step) => h('span', { class: `step${step.done ? ' step--done' : ''}` },
            step.done && icon('check'), step.label)),
          h('span', { class: 'visually-hidden' }, `${progress.solved} of ${progress.total} steps done`)),
      ),
      meter(progress.solved, progress.total, `${project.title}: steps done`),
    ));
}
