/*
 * placeholder.js — a temporary view for sections that are built in later stages.
 *
 * createPlaceholder() is a "factory": a function that builds and returns another
 * function (the view's render function). Each placeholder view file is then
 * one short call, and is replaced by a real view when its stage is built.
 */

import { h } from '../core/dom.js';
import { pageHeader, section, emptyState } from '../ui/page.js';

/**
 * @param {object} config
 * @param {string} config.eyebrow
 * @param {string} config.title
 * @param {string} config.lead
 * @param {string} config.iconName - Icon id from the sprite in index.html.
 * @param {string[]} [config.points] - What this section will offer.
 * @param {string} config.emptyText - Message shown in the empty state.
 */
export function createPlaceholder({ eyebrow, title, lead, iconName, points = [], emptyText }) {
  return function render(root) {
    root.append(
      pageHeader({ eyebrow, title, lead }),
      points.length > 0 && section('What you will do here',
        h('ul', { class: 'card stack' }, points.map((point) => h('li', null, point))),
      ),
      section(null,
        emptyState({
          iconName,
          title: 'Content in preparation',
          text: emptyText,
          action: h('a', { class: 'btn', href: '#/curriculum' }, 'See the curriculum'),
        }),
      ),
    );
  };
}
