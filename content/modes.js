/*
 * modes.js — descriptions of the four practice modes.
 * Used by the dashboard cards and by each mode's own page.
 */

export const modes = [
  {
    id: 'learn',
    title: 'Learn',
    icon: 'learn',
    tagline: 'Structured lessons with short exercises.',
    description: 'Each concept follows the same steps: a plain explanation, a small example, the important lines explained, an exercise, an automatic check, and feedback on what went wrong.',
    points: [
      'One concept at a time, in a deliberate order',
      'Important lines of every example are highlighted and explained',
      'Common beginner mistakes for each topic',
    ],
  },
  {
    id: 'code',
    title: 'Code',
    icon: 'code',
    tagline: 'Write HTML, CSS and JavaScript with a live preview.',
    description: 'Separate HTML, CSS and JavaScript editors, a live preview, a console that shows your logs and errors with line numbers, and a reset button.',
    points: [
      'Syntax highlighting built without libraries',
      'Your code runs in an isolated sandbox',
      'Console output and errors captured from the preview',
    ],
  },
  {
    id: 'debug',
    title: 'Debug',
    icon: 'debug',
    tagline: 'Find and fix the bug in broken code.',
    description: 'Broken code, a description of what it should do, and the symptom. Edit and run until the tests pass. Hints come one step at a time; the solution comes last.',
    points: [
      'Realistic bugs: selectors, undefined values, conditions, async',
      'Progressive hints: where to look → concept → nudge → solution',
      'A post-mortem: why it happened and how to spot it next time',
    ],
  },
  {
    id: 'understand',
    title: 'Understand',
    icon: 'understand',
    tagline: 'Read code and predict what it does.',
    description: 'Code-reading drills from the whole program: predict the output before it is revealed, put execution steps in order, fill in trace tables, and explain behavior in your own words.',
    points: [
      'Commit to a prediction before seeing the answer',
      'Trace values and calls step by step',
      '“What happens if this value changes?”',
    ],
  },
];

export function getMode(id) {
  return modes.find((m) => m.id === id);
}
