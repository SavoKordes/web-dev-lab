/*
 * chart.js — a small, accessible line chart in plain SVG (no library).
 *
 *   createLineChart({ points: [{ date: '2026-03-01', value: 12 }, …],
 *                     label: 'Overall mastery', max: 100, format: (v) => `${v}%` })
 *
 * Design rules (from the data-visualization guidance):
 *   - one series, one axis, a 2px line in the accent color, recessive gridlines
 *   - no legend: the title names the single series
 *   - hover: a crosshair and a tooltip for the nearest day
 *   - accessibility: role="img" with a summary, plus a table view of every value
 */

import { h } from '../core/dom.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 40 };

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

function shortDate(iso) {
  return new Date(`${iso}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function createLineChart({ points, label, max = 100, format = (v) => String(v) }) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;

  const first = points[0];
  const last = points[points.length - 1];
  const summary = `${label}: ${format(first.value)} on ${shortDate(first.date)}, ${format(last.value)} on ${shortDate(last.date)}.`;

  const chart = svg('svg', {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: 'line-chart__svg',
    role: 'img',
    'aria-label': summary,
  });

  // Recessive gridlines and y-axis labels at 0, 25, 50, 75, 100 %
  for (let step = 0; step <= 4; step++) {
    const value = (max / 4) * step;
    chart.append(
      svg('line', { x1: PAD.left, x2: WIDTH - PAD.right, y1: y(value), y2: y(value), class: step === 0 ? 'line-chart__baseline' : 'line-chart__grid' }),
      Object.assign(svg('text', { x: PAD.left - 8, y: y(value) + 4, class: 'line-chart__tick', 'text-anchor': 'end' }), { textContent: format(value) }),
    );
  }

  // X-axis labels: first, middle and last day only, so they never collide
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  for (const i of labelIndexes) {
    const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
    chart.append(Object.assign(svg('text', { x: x(i), y: HEIGHT - 8, class: 'line-chart__tick', 'text-anchor': anchor }), { textContent: shortDate(points[i].date) }));
  }

  // The line itself, and a marker on the latest value
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  chart.append(
    svg('path', { d: path, class: 'line-chart__line' }),
    svg('circle', { cx: x(points.length - 1), cy: y(last.value), r: 4, class: 'line-chart__marker' }),
  );

  // Hover layer: crosshair + dot, and an HTML tooltip
  const crosshair = svg('line', { y1: PAD.top, y2: PAD.top + innerH, class: 'line-chart__crosshair', visibility: 'hidden' });
  const dot = svg('circle', { r: 5, class: 'line-chart__marker line-chart__hover-dot', visibility: 'hidden' });
  const hitArea = svg('rect', { x: PAD.left, y: PAD.top, width: innerW, height: innerH, fill: 'transparent' });
  chart.append(crosshair, dot, hitArea);

  const tooltip = h('div', { class: 'line-chart__tooltip', hidden: true });
  const wrapper = h('div', { class: 'line-chart' }, chart, tooltip);

  hitArea.addEventListener('pointermove', (event) => {
    const box = chart.getBoundingClientRect();
    const svgX = ((event.clientX - box.left) / box.width) * WIDTH;
    const ratio = Math.min(1, Math.max(0, (svgX - PAD.left) / innerW));
    const index = Math.round(ratio * (points.length - 1));
    const point = points[index];

    crosshair.setAttribute('x1', x(index));
    crosshair.setAttribute('x2', x(index));
    dot.setAttribute('cx', x(index));
    dot.setAttribute('cy', y(point.value));
    crosshair.setAttribute('visibility', 'visible');
    dot.setAttribute('visibility', 'visible');

    tooltip.replaceChildren(h('strong', null, format(point.value)), ` · ${shortDate(point.date)}`);
    tooltip.hidden = false;
    const left = (x(index) / WIDTH) * box.width;
    tooltip.style.left = `${Math.min(Math.max(left, 50), box.width - 50)}px`;
    tooltip.style.top = `${(y(point.value) / HEIGHT) * box.height - 36}px`;
  });
  hitArea.addEventListener('pointerleave', () => {
    crosshair.setAttribute('visibility', 'hidden');
    dot.setAttribute('visibility', 'hidden');
    tooltip.hidden = true;
  });

  // Table view: every value, for screen readers, keyboard users and precise reading
  const table = h('details', { class: 'line-chart__table' },
    h('summary', null, 'Show as a table'),
    h('table', null,
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Date'), h('th', { scope: 'col' }, label))),
      h('tbody', null, points.map((p) => h('tr', null, h('td', null, shortDate(p.date)), h('td', null, format(p.value)))))),
  );

  return h('figure', { class: 'chart-figure' },
    h('figcaption', { class: 'chart-figure__title' }, label),
    wrapper,
    table,
  );
}
