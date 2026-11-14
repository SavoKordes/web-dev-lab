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
  components.css      Buttons, cards, callouts, badges, forms
js/
  theme-init.js       Classic script: applies the saved theme before first paint
  main.js             Entry point: route table, renders views on navigation
  core/               Infrastructure, no UI
    router.js         URL hash → view
    store.js          The only module that touches localStorage
    events.js         Publish/subscribe event bus
    dom.js            h() element helper, icons, toast
  ui/                 Shared UI behavior and building blocks
    theme.js          Light/dark/system theme
    shell.js          Mobile nav drawer, active link, page title
    page.js           pageHeader, section, callout, emptyState
  views/              One file per page; each exports render(root, params)
content/              Curriculum as plain data. No UI code
  curriculum.js       The eight modules
  modes.js            The four practice modes
```

### Data flow in one sentence

The URL changes → `router.js` finds the matching route → `main.js` calls that view's `render()` → the view reads `content/` (what to teach) and `store.js` (your progress) and builds the page with `h()`.

### Rules the code follows

- **Content is data.** Lessons and exercises live in `content/` as plain objects. Views only display them.
- **One owner for storage.** Only `core/store.js` reads or writes `localStorage`.
- **No `innerHTML` with dynamic text.** Views build elements with `h()`, so text can never be run as HTML.
- **Views clean up.** If a view adds a global listener, `render()` returns a function that removes it.

## Build stages

| Stage | Content | Status |
|---|---|---|
| 1 | App shell, navigation, router, theme, storage, settings | ✅ Done |
| 2 | Code mode: editor, syntax highlighting, sandbox, console | |
| 3 | Exercise engine: checkers, hint ladder, progress recording | |
| 4 | Learn mode + Modules 1–2 (HTML, CSS) | |
| 5 | Module 3 (JavaScript), in two parts | |
| 6 | Understand mode + Module 4 | |
| 7 | Debug mode + Module 5 | |
| 8 | Modules 6–7 | |
| 9 | Projects (Module 8) | |
| 10 | Progress dashboard: mastery, revision queue, charts | |
| 11 | Accessibility and mobile review, polish | |
