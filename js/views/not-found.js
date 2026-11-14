/*
 * not-found.js — shown when the URL hash matches no route.
 */

import { h } from '../core/dom.js';
import { emptyState } from '../ui/page.js';

export function render(root, params, path) {
  root.append(
    h('h1', { class: 'visually-hidden', tabindex: '-1' }, 'Page not found'),
    emptyState({
      iconName: 'understand',
      title: 'Page not found',
      text: `There is no page at “${path}”.`,
      action: h('a', { class: 'btn btn--primary', href: '#/' }, 'Go to the dashboard'),
    }),
  );
}
