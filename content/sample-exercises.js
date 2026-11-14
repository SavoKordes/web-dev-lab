/*
 * sample-exercises.js — one or two exercises of every type.
 *
 * They show how the exercise engine works, and they are real exercises: they
 * move into their curriculum modules when those are written.
 *
 * Rules for writing tests (see js/services/test-runner.js):
 *   - A test's run() function is sent into the sandbox as text, so it may only use
 *     its parameters ({ expect, $, $$, style, logs, click, type, submit, wait })
 *     and globals (like the learner's functions). No variables from this file.
 *   - Give expect() a human message as its second argument. It is what the
 *     learner sees when the check fails.
 *   - Do not use the /g flag on pitfall patterns (a /g regex remembers its position).
 */

export const sampleExercises = [
  /* ────────────────────────── Choice ────────────────────────── */
  {
    id: 'sample.choice.null-selector',
    type: 'choice',
    title: 'Why is the button null?',
    skills: ['debug.selectors', 'js.dom'],
    prompt: "This code throws `TypeError: Cannot read properties of null (reading 'addEventListener')`. What is the cause?",
    language: 'html',
    code: `<button class="save-button">Save</button>

<script>
  const button = document.querySelector('save-button');
  button.addEventListener('click', save);
</script>`,
    options: [
      {
        text: "The selector has no dot: `'save-button'` looks for an element **named** `<save-button>`, not for the class.",
        correct: true,
        feedback: '`querySelector` uses CSS selector syntax: `.save-button` for a class, `#save` for an id, `button` for a tag. When nothing matches, it returns `null`.',
      },
      {
        text: '`addEventListener` is misspelled.',
        correct: false,
        feedback: 'It is spelled correctly. A misspelled method gives a different error: `… is not a function`. Read the message again: it says the value **before** `.addEventListener` is `null`.',
      },
      {
        text: 'The function `save` does not exist.',
        correct: false,
        feedback: 'That could also be a bug, but it would cause `ReferenceError: save is not defined`. This error is about a `null` value.',
      },
      {
        text: 'The script runs before the button exists.',
        correct: false,
        feedback: 'Good thinking: that is a very common cause of `null`. But here the `<script>` comes **after** the button, so the button already exists when the script runs.',
      },
    ],
    hints: [
      "The error says the value before `.addEventListener` is `null`. Which line produces that value?",
      '`querySelector` returns `null` when no element matches the selector.',
    ],
    takeaway: '"Cannot read properties of null" after a `querySelector` almost always means the selector matched nothing. Check the `.` or `#` and the spelling first.',
  },

  ];
