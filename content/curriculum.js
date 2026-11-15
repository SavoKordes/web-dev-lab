/*
 * curriculum.js — the outline of the whole program, as plain data.
 *
 * Views read this data and turn it into pages; this file contains no UI code.
 * The lessons and exercises of each module live in content/modules/*.js and are
 * linked to these modules by their `id` in content/lessons.js.
 */

export const modules = [
  {
    id: 'html',
    number: 1,
    title: 'HTML fundamentals',
    summary: 'The structure and meaning of a page: which element to use, and why it matters for users, browsers and screen readers.',
    topics: [
      'Document structure', 'Semantic HTML', 'Headings, paragraphs and links', 'Images',
      'Forms and input elements', 'Buttons', 'Tables', 'Accessibility fundamentals',
    ],
    practice: ['Identify elements', 'Complete missing HTML', 'Correct invalid markup'],
  },
  {
    id: 'css',
    number: 2,
    title: 'CSS fundamentals',
    summary: 'How the browser decides what a page looks like: which rule wins, how boxes are sized, and how layouts are built.',
    topics: [
      'Selectors', 'Specificity', 'Box model', 'Margin and padding', 'Display', 'Positioning',
      'Flexbox', 'CSS Grid', 'Responsive design', 'Media queries', 'Variables',
      'Pseudo-classes and pseudo-elements',
    ],
    practice: ['Predict layout results', 'Fix styling problems', 'Reproduce small layouts'],
  },
  {
    id: 'js',
    number: 3,
    title: 'JavaScript fundamentals',
    summary: 'The core of the program. You write real code from the first lesson, checked by automated tests.',
    topics: [
      'let and const', 'Data types', 'Strings and numbers', 'Operators', 'Functions',
      'Parameters and return values', 'Conditions', 'Arrays', 'Loops', 'Objects', 'Array methods', 'Scope',
      'DOM manipulation', 'Events', 'Form handling', 'Error handling', 'JSON', 'Local storage',
      'Modules', 'Promises', 'Async/await', 'Fetch API',
    ],
    practice: ['Write functions that pass tests', 'Complete partial programs', 'Predict values'],
  },
  {
    id: 'reading',
    number: 4,
    title: 'Reading and understanding code',
    summary: 'Realistic code you did not write. Work out what runs first, what calls what, what data moves where, and what it outputs.',
    topics: [
      'What the code does', 'Execution order', 'Call chains', 'Data flow between functions',
      'Predicting output', 'What-if changes',
    ],
    practice: ['Predict before revealing', 'Order execution steps', 'Explain in your own words'],
  },
  {
    id: 'debugging',
    number: 5,
    title: 'Debugging workshop',
    summary: 'Deliberately broken code. Diagnose, repair, then learn how to recognize the same class of bug next time.',
    topics: [
      'Incorrect selectors', 'Missing event listeners', 'Incorrect variable names', 'Undefined values',
      'Incorrect conditions', 'Broken function calls', 'Incorrect array handling',
      'DOM manipulation errors', 'Asynchronous mistakes', 'A systematic debugging method',
    ],
    practice: ['Repair until tests pass', 'Progressive hints', 'Post-mortem explanations'],
  },
  {
    id: 'dom',
    number: 6,
    title: 'DOM and interactive applications',
    summary: 'Small interactive components built step by step, each a little more complex than the last.',
    topics: [
      'Interactive forms', 'To-do lists', 'Calculators', 'Tabs', 'Modals', 'Search and filtering',
      'Dynamic lists', 'Data validation', 'Saving and loading data',
    ],
    practice: ['Build in milestones', 'Behavior tests', 'Extend working code'],
  },
  {
    id: 'professional',
    number: 7,
    title: 'Professional JavaScript',
    summary: 'The habits that separate working code from maintainable code — and what to look for when reviewing AI output.',
    topics: [
      'Separation of concerns', 'Reusable functions', 'Modular code', 'State management fundamentals',
      'Error handling', 'API communication', 'Data validation', 'Clean code', 'Basic application architecture',
    ],
    practice: ['Refactor messy code', 'Review code critically', 'Structure a small app'],
  },
  {
    id: 'projects',
    number: 8,
    title: 'Mini projects',
    summary: 'Five complete applications with requirements, milestones, acceptance criteria and a final review.',
    topics: [
      'Interactive personal dashboard', 'Task management application',
      'Contact manager with local storage', 'Weather app with a public API',
      'Small business administration dashboard',
    ],
    practice: ['Requirements to working app', 'Acceptance criteria', 'Senior-style final review'],
  },
];

/** Find a module by id. Returns undefined if there is none. */
export function getModule(id) {
  return modules.find((m) => m.id === id);
}
