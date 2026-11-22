# Web Dev Lab

An interactive training program for reading, writing and debugging HTML, CSS and JavaScript.
It aims to take you from directing AI to build websites to understanding, writing and reviewing the code yourself.
It is built with plain HTML, CSS and JavaScript (ES modules). There are no frameworks, no dependencies and no backend.

## What's inside

| Module | Lessons | Focus |
|---|---|---|
| 1. HTML fundamentals | 7 | structure, semantics, links, images, forms, tables, accessibility |
| 2. CSS fundamentals | 9 | selectors, specificity, box model, positioning, flexbox, grid, responsive design, variables, pseudo-classes |
| 3. JavaScript fundamentals | 22 | the language core (variables to closures), then the browser (DOM, events, forms, errors, JSON, storage, modules, promises, async/await, fetch) |
| 4. Reading and understanding code | 7 | a reading method, execution order, call chains, data flow, trace tables, what-if changes, a complete module |
| 5. Debugging workshop | 8 | a systematic method and 15 bug challenges across all common bug categories |
| 6. DOM and interactive applications | 7 | tabs, dialogs, a calculator, a to-do list in two parts, search and filtering, form validation |
| 7. Professional JavaScript | 6 | separation of concerns, clean code, state, error handling, API clients, architecture and reviewing AI code |
| 8. Mini projects | 5 | dashboard, task manager, contact manager, weather app (Open-Meteo), business admin dashboard |

**Four practice modes:**
- **Learn:** lessons in a fixed order: explanation, example with important lines, common mistakes, exercises.
- **Code:** HTML/CSS/JS editors with a live preview and a console that explains errors.
- **Debug:** every bug challenge, filterable by bug category.
- **Understand:** every code-reading drill, filterable by type.

**Progress** shows your level, mastery per skill and module over time, revisions that are due, weak spots with reasons, and your full history.

Every exercise gives hints in steps (where to look → the concept → a nudge). The solution unlocks only after a real attempt and all hints.

## Running it

The app uses ES modules. Browsers block modules on `file://` pages, so you need a local web server. Run one of these in this folder:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

You can also use the **Live Server** extension in VS Code: right-click `index.html` and choose "Open with Live Server".

Progress is saved in your browser's `localStorage`. Settings → "Download a backup" exports it as a file.

## Offline use and installing on a tablet or phone

The app works without an internet connection once it has been opened online one time.

1. Publish it with GitHub Pages: on GitHub go to Settings → Pages, choose the `main` branch and the `/ (root)` folder. It will be at `https://<user>.github.io/web-dev-lab/`.
2. Open that address on the tablet while online. Settings → "Works offline" shows **Ready** after the first load.
3. Use "Add to Home Screen" (Safari: Share button; Chrome: ⋮ menu → "Install app"). It then opens full-screen, like an app.

How it works: `sw.js` is a *service worker*, a script the browser runs between the page and the network. It always tries the network first (so you get updates), stores every file it fetches, and serves the stored copy when there is no connection. `js/core/offline.js` registers it and tells it which files the page has already loaded. Only the live weather API in project 4 needs a connection.

Service workers need a secure address: `https://` or `http://localhost`. Opened over a local network address such as `http://192.168.1.20:8000` the app still works, but not offline.

Progress is stored per browser. To move it to the tablet: Settings → "Download a backup" on the computer, then "Restore from a backup" on the tablet.

## How the code is organized

```
index.html            App shell: sidebar, top bar, <main> where views are rendered
manifest.webmanifest  Name, icons and colors for installing the app on a home screen
sw.js                 Service worker: offline cache (network first, stored copy as fallback)
icons/                App icon (SVG source + PNGs for home screens)
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
    offline.js        Registers the service worker; offline status for Settings
  services/           Logic with no page layout of its own
    highlighter.js    Tokenizes HTML/CSS/JS and renders highlighted HTML
    loop-guard.js     Inserts infinite-loop checks into your code before it runs
    sandbox.js        Runs code in an isolated iframe; relays console, errors, storage
    error-explainer.js  Plain-English explanations of common error messages
    test-runner.js    expect()-style tests that run inside the sandbox
    progress.js       Records attempts, hints and solutions; credit per skill
    curriculum-progress.js  Lesson and module progress, calculated from exercise states
    mastery.js        Mastery per skill (credit × retention), levels, revision schedule, weak spots
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
    chart.js          Accessible SVG line chart with hover tooltip and table view
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

## Mastery and revision

Completion (what you finished) and mastery (what you can still do) are separate.
Every solved exercise gives its skills a credit from 0 to 1, lowered by hints and failed checks, and 0 after viewing the solution.
A skill's mastery is the weighted average of its last five credits × a retention factor that falls with the days since you practised it. More successful practice makes it fall more slowly.
After practice, a skill is due for revision after 1, 3, 7, 14, 30, then 60 days (after 1 day if the last result was weak).
A revision uses a different exercise for the same skill where possible, and is recorded separately from the lesson attempt.

## Quality checks

During development, every stage was verified in a real (headless) browser:
- **Content audit:** for every code exercise, the starter code fails at least one check and the model solution passes all of them. Every other exercise accepts its correct answer.
- **Predict answers verified by running the code:** every JavaScript "predict the output" answer was compared with the real output.
- **Alternative solutions and typical mistakes:** extra cases confirm that other correct solutions pass and common mistakes fail, with a useful message.
- **Accessibility:** axe-core reports no violations (WCAG 2.1 AA plus best practices) on the main pages in both themes. Keyboard navigation was walked through, including the skip link, the editor's Esc+Tab, and the mobile menu.
- **Responsive:** no horizontal scrolling at 360px on any page.

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
| 10 | Progress dashboard: mastery, revision queue, charts | ✅ Done |
| 11 | Accessibility and mobile review, polish | ✅ Done |
