/*
 * dom.js — small helpers for creating DOM elements.
 *
 * The views build their HTML with h() instead of innerHTML strings:
 *
 *   h('a', { class: 'btn', href: '#/code' }, 'Open editor')
 *   → <a class="btn" href="#/code">Open editor</a>
 *
 * Why not innerHTML? Text passed to h() is always inserted as TEXT, never parsed
 * as HTML. So if a string ever contains "<script>" (for example from a saved
 * user answer), it is shown literally instead of being executed. This is the
 * main defense against XSS (cross-site scripting).
 */

/**
 * Create an element.
 * @param {string} tag - Tag name, e.g. 'div'.
 * @param {object|null} props - Attributes. Special keys:
 *    class    → className
 *    dataset  → object of data-* attributes
 *    onClick, onInput, … → event listeners
 *    true / false / null values → attribute present / absent
 * @param {...(Node|string|number|Array|null|false)} children - Content. Arrays are flattened;
 *    null and false are skipped, which makes conditional content easy:
 *    h('p', null, isDone && 'Completed')
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // onClick → 'click'
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, value);
    }
  }

  append(el, children);
  return el;
}

/** Append children (nodes, strings, nested arrays) to a parent element. */
export function append(parent, children) {
  for (const child of [children].flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : String(child));
  }
  return parent;
}

/**
 * An icon from the sprite in index.html.
 * SVG elements need createElementNS (the SVG "namespace"); createElement('svg')
 * would create an unknown HTML element that never draws.
 */
export function icon(name) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

/** Shorthand for document.querySelector, optionally inside another element. */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** Show a short message at the bottom of the screen that disappears by itself. */
export function toast(message, duration = 3200) {
  document.querySelector('.toast')?.remove(); // only one at a time
  const el = h('div', { class: 'toast', role: 'status' }, message);
  document.body.append(el);
  setTimeout(() => el.remove(), duration);
}
