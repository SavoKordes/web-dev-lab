/*
 * curriculum.js (view) — the module map.
 * All text comes from content/curriculum.js; this file only decides how it looks.
 */

import { h } from '../core/dom.js';
import { modules } from '../../content/curriculum.js';
import { pageHeader } from '../ui/page.js';

export function render(root) {
  root.append(
    pageHeader({
      eyebrow: 'Curriculum',
      title: 'Eight modules, in order',
      lead: 'Each module builds on the previous ones. JavaScript (Module 3) is the largest, because writing and reading JavaScript is where most of your growth will happen.',
    }),
    h('ol', { class: 'module-list' }, modules.map(moduleItem)),
  );
}

function moduleItem(mod) {
  return h('li', { class: 'card module' },
    h('span', { class: 'module__number', 'aria-hidden': 'true' }, mod.number),
    h('div', null,
      h('div', { class: 'module__head' },
        h('h3', null,
          h('span', { class: 'visually-hidden' }, `Module ${mod.number}: `),
          mod.title,
        ),
        h('span', { class: 'badge' }, 'In preparation'),
      ),
      h('p', { class: 'module__summary' }, mod.summary),
      h('details', null,
        h('summary', null, `${mod.topics.length} topics · ${mod.practice.join(' · ')}`),
        h('ul', { class: 'topic-list' }, mod.topics.map((topic) => h('li', null, topic))),
      ),
    ),
  );
}
