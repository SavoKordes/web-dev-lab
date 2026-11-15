# Web Dev Lab

An interactive training program for reading, writing and debugging HTML, CSS and JavaScript.
It is built with plain HTML, CSS and JavaScript (ES modules). There are no frameworks, no dependencies and no backend.

## Running it

The app uses ES modules. Browsers block modules on `file://` pages, so you need a local web server. Run one of these in this folder:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

You can also use the **Live Server** extension in VS Code: right-click `index.html` and choose "Open with Live Server".

Progress is saved in your browser's `localStorage`. Settings → "Download a backup" exports it as a file.

## How the code is organized

```
index.html            App shell: sidebar, top bar, <main> where views are rendered
css/
  tokens.css          Design tokens: colors (light + dark), type, spacing
  base.css            Reset and default element styles
  layout.css          Sidebar, top bar, page width, mobile drawer
  components.css      Buttons, cards, callouts, badges, forms, panels, tabs
  syntax.css          Colors for highlighted code
  editor.css          Code editor, code blocks, Code-mode layout, console
  exercise.css        Exercise shell, exercise types, feedback, hint and solution areas
  learn.css           Module and lesson pages, examples with "important lines"
js/
  theme-init.js       Classic script: applies the saved theme before first paint
  main.js             Entry point: route table, renders views on navigation
  core/               Infrastructure, no UI
    router.js         URL hash → view
    store.js          The only module that touches localStorage
    events.js         Publish/subscribe event bus
    dom.js            h() element helper, icons, toast
  services/           Logic with no page layout of its own
    highlighter.js    Tokenizes HTML/CSS/JS and renders highlighted HTML
    loop-guard.js     Inserts infinite-loop checks into your code before it runs
    sandbox.js        Runs code in an isolated iframe; relays console, errors, storage
    error-explainer.js  Plain-English explanations of common error messages
    test-runner.js    expect()-style tests that run inside the sandbox
    progress.js       Records attempts, hints and solutions; credit per skill
    curriculum-progress.js  Lesson and module progress, calculated from exercise states
  ui/                 Shared UI behavior and building blocks
    theme.js          Light/dark/system theme
    shell.js          Mobile nav drawer, active link, page title
    page.js           pageHeader, section, callout, emptyState
    code-editor.js    Textarea + highlighted layer, line numbers, smart indentation
    code-block.js     Read-only highlighted code with line numbers and marked lines
    console-panel.js  Shows console output and explained errors
    rich-text.js      `code`, **bold**, lists and ```code blocks``` in content text
    exercise.js       The exercise shell: task, Check, hint ladder, solution lock, feedback
    exercises/        One renderer per exercise type: code, predict, order, choice, explain, trace
    lesson-example.js Code example with clickable "important lines", preview, "Try it in Code mode"
    meter.js          Accessible progress bar
  views/              One file per page; each exports render(root, params)
content/              Curriculum as plain data. No UI code
  curriculum.js       The eight modules
  modes.js            The four practice modes
  playground-starters.js  Example projects for Code mode
  lessons.js          Registry of lessons per module (and the lesson format)
  modules/html.js     Module 1: 7 lessons
  modules/css.js      Module 2: 9 lessons
  modules/js-core.js  Module 3, part 1: 12 lessons on the JavaScript language
  modules/js-browser.js  Module 3, part 2: 10 lessons on JavaScript in the browser
  modules/reading.js  Module 4: 7 lessons on reading and understanding code
  modules/debugging.js  Module 5: 8 lessons, 15 bug challenges
  modules/interactive.js  Module 6: 7 lessons building interactive components
  modules/professional.js  Module 7: 6 lessons on professional practices and code review
  modules/projects.js  Module 8: 5 projects, each with 3 milestones and a final review
  shared/fake-services.js  Fake APIs (users, products, Open-Meteo) and order data used as setup code
  exercises.js        Registry of all exercises (look up any exercise by id)
```

### Data flow in one sentence

The URL changes → `router.js` finds the matching route → `main.js` calls that view's `render()` → the view reads `content/` (what to teach) and `store.js` (your progress) and builds the page with `h()`.

### Rules the code follows

- **Content is data.** Lessons and exercises live in `content/` as plain objects. Views only display them.
- **One owner for storage.** Only `core/store.js` reads or writes `localStorage`.
- **No `innerHTML` with dynamic text.** Views build elements with `h()`, so text can never be run as HTML.
- **Views clean up.** If a view adds a global listener, `render()` returns a function that removes it.

## Code mode in short

Your HTML, CSS and JS are combined into one page and loaded into an `<iframe sandbox>`.
A small "bridge" script is injected first. It forwards `console.*` calls and uncaught errors to the app with `postMessage`.
Error line numbers are translated back to lines in your JavaScript editor.
`localStorage` inside the preview is a stand-in that the app saves for you, because the real one is blocked in a sandbox.
Loops get an automatic guard that stops them after about 1.5 seconds, so `while (true) {}` cannot freeze the page.

## How exercises work

An exercise is a plain object in `content/` with a `type`, a `prompt`, `skills`, `hints`, an optional `solution` and type-specific fields.
`js/ui/exercise.js` wraps it in the shared shell. A renderer from `js/ui/exercises/` provides the part that differs per type.

| Type | You… | Checked by |
|---|---|---|
| `code` | write or fix HTML, CSS or JS | tests run in the sandbox (`expect(...).toBe(...)`) |
| `predict` | type the console output before seeing it | line-by-line comparison |
| `order` | put steps in execution order | position comparison |
| `choice` | pick an answer | per-option feedback explaining each misconception |
| `explain` | explain code in your own words | self-assessment against key points |
| `trace` | fill in a trace table: each variable's value after each step | cell-by-cell comparison |
| `checklist` | review your finished project against professional criteria | honest self-review |

Hints come in a fixed ladder: where to look → the concept → a nudge.
The solution unlocks only after a real attempt and all hints, and viewing it gives no mastery credit.
Every solve records a credit from 0 to 1 per skill, lowered by hints and failed checks. The mastery dashboard (Stage 10) is built on these credits.

## Lessons

A lesson is plain data in `content/modules/`, made of sections in a fixed teaching order:
explanation → example (with "important lines" you can click to highlight) → common mistakes → exercises → key points.
Lesson progress is never stored separately. It is calculated from the exercises, so it cannot drift out of sync.

## Build stages

| Stage | Content | Status |
|---|---|---|
| 1 | App shell, navigation, router, theme, storage, settings | ✅ Done |
| 2 | Code mode: editor, syntax highlighting, sandbox, console | ✅ Done |
| 3 | Exercise engine: checkers, hint ladder, progress recording | ✅ Done |
| 4 | Learn mode + Modules 1–2 (HTML, CSS) | ✅ Done |
| 5 | Module 3 (JavaScript), in two parts | ✅ Done |
| 6 | Understand mode + Module 4 | ✅ Done |
| 7 | Debug mode + Module 5 | ✅ Done |
| 8 | Modules 6–7 | ✅ Done |
| 9 | Projects (Module 8) | ✅ Done |
| 10 | Progress dashboard: mastery, revision queue, charts | |
| 11 | Accessibility and mobile review, polish | |
