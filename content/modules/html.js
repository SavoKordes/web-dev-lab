/*
 * html.js — Module 1: HTML fundamentals.
 *
 * Lesson format: see content/lessons.js. Exercise format: see js/ui/exercise.js
 * and the renderers in js/ui/exercises/. Test functions run inside the sandbox
 * and may only use their parameters (see js/services/test-runner.js).
 */

/* ───────────────────────── Lesson 1: Document structure ───────────────────────── */

const documentStructure = {
  slug: 'document-structure',
  title: 'Document structure',
  minutes: 15,
  summary: 'The skeleton every HTML page shares, and what each part is for.',
  sections: [
    {
      kind: 'text',
      text: `HTML describes the **structure** of a page: what is a heading, what is a paragraph, what is a link. The browser reads it and builds a tree of elements from it (the **DOM**), which CSS then styles and JavaScript changes.

Every page has the same skeleton. The \`<head>\` holds information **about** the page: its title, character set and stylesheets. Nothing in it is shown on the page itself. The \`<body>\` holds everything the visitor sees.`,
    },
    {
      kind: 'example',
      title: 'A complete page',
      language: 'html',
      code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening hours – Café Lumen</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Café Lumen</h1>
  <p>Open daily from 8:00 to 18:00.</p>
  <script src="app.js"></script>
</body>
</html>`,
      notes: [
        { lines: [1], text: '`<!doctype html>` switches the browser to standards mode. Without it, browsers emulate old bugs ("quirks mode").' },
        { lines: [2], text: '`lang="en"` tells screen readers which pronunciation to use and helps translation tools.' },
        { lines: [4], text: '`charset="utf-8"` makes characters like é, € and – display correctly.' },
        { lines: [5], text: 'The viewport line makes phones use their real width. Without it, a phone shows a zoomed-out desktop page.' },
        { lines: [6], text: 'The `<title>` appears in the browser tab, in bookmarks and in search results.' },
        { lines: [7], text: 'Loads a stylesheet. `rel` says what the linked file is.' },
        { lines: [9, 13], text: 'Everything inside `<body>` is what the visitor sees.' },
        { lines: [12], text: 'The script is placed at the **end** of the body, so the HTML above it already exists when it runs. (Or use `<script defer>` in the head.)' },
      ],
    },
    {
      kind: 'text',
      title: 'Anatomy of an element',
      text: `\`<a href="/menu" class="nav-link">Our menu</a>\`

- \`<a …>\` is the **opening tag**, \`</a>\` the **closing tag**.
- \`href="/menu"\` and \`class="nav-link"\` are **attributes**: extra information, written as \`name="value"\`.
- "Our menu" is the **content**.

Some elements have no content and no closing tag, for example \`<img>\`, \`<input>\`, \`<meta>\` and \`<br>\`. They are called **void elements**.

Elements are **nested** inside each other, and must be closed in the reverse order they were opened: \`<p><strong>…</strong></p>\`, never \`<p><strong>…</p></strong>\`.`,
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting the viewport meta tag', text: 'The page looks tiny and zoomed out on phones, and no amount of CSS fixes it. Every page needs line 5 of the example.' },
        { title: 'Wrong nesting', text: 'Browsers silently "repair" badly nested HTML, sometimes in surprising ways. Your CSS and JavaScript then work on a different tree than you wrote. **DevTools → Elements** shows the tree the browser actually built, so look there when something behaves strangely.' },
        { title: 'A script in the head that runs too early', text: 'A `<script>` in `<head>` without `defer` runs before the body exists, so `document.querySelector(…)` returns `null`. Put scripts at the end of the body or add `defer`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.structure.order',
        type: 'order',
        title: 'Build the skeleton',
        skills: ['html.document-structure'],
        prompt: 'Put these lines in the order they appear in a valid HTML document.',
        steps: [
          '`<!doctype html>`',
          '`<html lang="en">`',
          '`<head>`',
          '`<meta charset="utf-8">`',
          '`<title>Café Lumen</title>`',
          '`</head>`',
          '`<body>`',
          '`<h1>Welcome</h1>`',
          '`</body>`',
          '`</html>`',
        ],
        hints: [
          'Start with the line that comes before every element, then the element that wraps everything else.',
          'The `<head>` comes before the `<body>`, and both sit inside `<html>`. Elements close in the reverse order they were opened.',
        ],
        explanation: 'The doctype comes first, then `<html>`, which contains `<head>` (information about the page) followed by `<body>` (what is shown). Each element closes after everything nested inside it.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.structure.head',
        type: 'choice',
        title: 'What belongs in the head?',
        skills: ['html.document-structure'],
        prompt: 'Which of these belong inside `<head>`?',
        multiple: true,
        options: [
          { text: '`<meta charset="utf-8">`', correct: true, feedback: 'Yes. It describes the document, and it should be one of the first lines in the head.' },
          { text: '`<title>Contact – Café Lumen</title>`', correct: true, feedback: 'Yes. The title is shown in the tab, not on the page.' },
          { text: '`<link rel="stylesheet" href="styles.css">`', correct: true, feedback: 'Yes. Stylesheets are loaded from the head so the page is styled before it appears.' },
          { text: '`<h1>Contact us</h1>`', correct: false, feedback: 'A heading is visible content, so it belongs in the `<body>`.' },
          { text: '`<nav>` with the site menu', correct: false, feedback: 'Navigation is visible, so it belongs in the `<body>`. Think: will the visitor see it on the page? Then it goes in the body.' },
        ],
        hints: ['Ask for each line: is this something the visitor sees on the page, or information about the page?'],
        takeaway: 'Head = information about the page. Body = what the visitor sees.',
      },
    },
  ],
  keyPoints: [
    'Every page starts with `<!doctype html>` and has `<html lang>`, `<head>` and `<body>`.',
    'The head needs at least `charset`, `viewport` and `<title>`.',
    'Close elements in the reverse order you opened them. DevTools shows the tree the browser really built.',
  ],
};

/* ───────────────────────── Lesson 2: Semantic HTML ───────────────────────── */

const semanticHtml = {
  slug: 'semantic-html',
  title: 'Semantic HTML',
  minutes: 20,
  summary: 'Choosing elements for their meaning, not their looks, and why that matters.',
  sections: [
    {
      kind: 'text',
      text: `**Semantic** HTML means choosing the element that describes what the content **is**. A \`<nav>\` is navigation, a \`<button>\` is something you can press, an \`<h2>\` is a section heading.

Why it matters:
- **Screen readers** let users jump between landmarks ("go to main content", "go to navigation") and headings. That only works if those elements are used.
- **Browsers give you behavior for free**: a \`<button>\` is focusable and responds to Enter and Space; a \`<div>\` does none of that.
- **Your code is easier to read**, for you, for colleagues, and for AI tools working on it.

\`<div>\` and \`<span>\` have **no meaning**. They are for grouping things purely for styling or layout. Use them when no semantic element fits.`,
    },
    {
      kind: 'example',
      title: 'Page landmarks',
      language: 'html',
      preview: true,
      previewHeight: 360,
      css: `body { font-family: system-ui, sans-serif; margin: 0; font-size: 14px; }
header, main, footer, nav, article, aside { padding: 8px 12px; margin: 6px; border: 1px dashed #999; }
header { background: #eef2ff; } main { background: #f5f5f5; } footer { background: #f0fdf4; }
h1, h2 { margin: 4px 0; font-size: 16px; }`,
      code: `<header>
  <p>Café Lumen</p>
  <nav>
    <a href="/menu">Menu</a>
    <a href="/visit">Visit</a>
  </nav>
</header>
<main>
  <article>
    <h1>New autumn menu</h1>
    <p>Pumpkin soup, apple cake and more.</p>
  </article>
  <aside>Open daily 8:00–18:00</aside>
</main>
<footer>© 2026 Café Lumen</footer>`,
      notes: [
        { lines: [1, 7], text: '`<header>`: introductory content, usually the logo and main navigation.' },
        { lines: [3, 6], text: '`<nav>`: a block of navigation links. Use it for major navigation, not for every group of links.' },
        { lines: [8], text: '`<main>`: the main content of the page. Only **one** per page.' },
        { lines: [9, 12], text: '`<article>`: a self-contained piece that would make sense on its own, like a blog post, a product card or a comment.' },
        { lines: [13], text: '`<aside>`: content related to the main content, but not part of it.' },
        { lines: [15], text: '`<footer>`: closing information, such as copyright, contact or legal links.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: '"Div soup"', text: '`<div class="header">`, `<div class="nav">`… looks the same in the browser, but screen readers and search engines see no structure at all. AI-generated code does this often, so check for it in reviews.' },
        { title: 'Choosing an element for how it looks', text: 'Using `<h4>` because it is small, or `<blockquote>` to indent text. Choose by meaning, then style it with CSS.' },
        { title: '`<section>` as a generic wrapper', text: 'A `<section>` is a thematic part of a page and should have a heading. If you just need a box for styling, use a `<div>`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.semantic.div-soup',
        type: 'code',
        title: 'Turn div soup into semantic HTML',
        skills: ['html.semantic'],
        prompt: `Replace the meaningless \`<div>\`s with semantic elements: \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\` and \`<footer>\`. Keep the content the same.

The classes can stay or go. The styling uses them, so keeping them keeps the look.`,
        files: ['html'],
        starter: {
          html: `<div class="header">
  <div class="logo">Café Lumen</div>
  <div class="nav">
    <a href="#menu">Menu</a>
    <a href="#visit">Visit</a>
  </div>
</div>
<div class="main">
  <div class="article">
    <h1>New autumn menu</h1>
    <p>Pumpkin soup, apple cake and more.</p>
  </div>
</div>
<div class="footer">© 2026 Café Lumen</div>
`,
        },
        given: {
          css: `body { font-family: system-ui, sans-serif; margin: 0; }
.header { display: flex; justify-content: space-between; padding: 1rem; background: #1f2937; color: white; }
.header a { color: white; margin-left: 1rem; }
.main { padding: 1rem; }
.footer { padding: 1rem; color: #666; font-size: 0.9rem; }`,
        },
        tests: [
          {
            name: 'There is a <header> containing a <nav>',
            run: ({ expect, $ }) => {
              expect($('header'), 'Add a <header> element').toBeTruthy();
              expect($('header nav'), 'The <nav> should be inside the <header>').toBeTruthy();
            },
          },
          {
            name: 'The <nav> contains both links',
            run: ({ expect, $$ }) => expect($$('nav a').length, 'Both links belong inside the <nav>').toBe(2),
          },
          {
            name: 'There is exactly one <main>',
            run: ({ expect, $$ }) => expect($$('main').length, 'Use one <main> for the main content').toBe(1),
          },
          {
            name: 'The post is an <article> inside <main>, with its heading',
            run: ({ expect, $ }) => {
              expect($('main article'), 'Put an <article> inside <main>').toBeTruthy();
              expect($('main article h1'), 'The <h1> belongs inside the <article>').toBeTruthy();
            },
          },
          {
            name: 'There is a <footer>',
            run: ({ expect, $ }) => expect($('footer'), 'Add a <footer> element').toBeTruthy(),
          },
          {
            name: 'No meaningless divs left for these parts',
            run: ({ expect, $$ }) => expect($$('div.header, div.nav, div.main, div.article, div.footer').length,
              'Replace those divs instead of wrapping them').toBe(0),
          },
        ],
        hints: [
          'Each `<div class="…">` has a class name that already tells you which semantic element it should be.',
          'Change both the opening and the closing tag: `<div class="nav">` … `</div>` becomes `<nav class="nav">` … `</nav>`. The tricky part is matching each `</div>` to the right opening tag. The indentation helps.',
          'The logo can stay a `<div>` or become a `<p>`: it is not one of the five landmarks.',
        ],
        solution: {
          html: `<header class="header">
  <div class="logo">Café Lumen</div>
  <nav class="nav">
    <a href="#menu">Menu</a>
    <a href="#visit">Visit</a>
  </nav>
</header>
<main class="main">
  <article class="article">
    <h1>New autumn menu</h1>
    <p>Pumpkin soup, apple cake and more.</p>
  </article>
</main>
<footer class="footer">© 2026 Café Lumen</footer>
`,
        },
        explanation: 'The page looks exactly the same, but now it has a structure that screen readers, search engines and other developers can understand. Keeping the classes means the CSS still works without changes.',
        takeaway: 'When you review code, look for divs whose class name describes a meaning (`header`, `nav`, `button`…). That meaning usually belongs in the element itself.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.semantic.card',
        type: 'choice',
        title: 'The right element for a card',
        skills: ['html.semantic'],
        prompt: 'A blog shows a list of post previews. Each preview has a title, a date and a short excerpt, and links to the full post. Which element should wrap **each preview**?',
        options: [
          { text: '`<article>`', correct: true, feedback: 'Yes. Each preview is self-contained: it makes sense on its own, even outside this list. That is exactly what `<article>` is for.' },
          { text: '`<section>`', correct: false, feedback: 'A `<section>` groups part of a page around one theme. The list as a whole could be a section, but each self-contained preview is an article.' },
          { text: '`<div>`', correct: false, feedback: 'It would work visually, but a `<div>` says nothing about the content. Use a div only when no meaningful element fits.' },
          { text: '`<aside>`', correct: false, feedback: '`<aside>` is for content beside the main content, such as a sidebar. These previews ARE the main content.' },
        ],
        hints: ['Ask: would one preview still make sense if you copied it to another website?'],
      },
    },
  ],
  keyPoints: [
    'Choose elements for their **meaning**, then style them with CSS.',
    'Landmarks: `header`, `nav`, `main` (one per page), `article`, `aside`, `footer`.',
    '`div` and `span` have no meaning; use them only for styling and layout.',
  ],
};

/* ───────────────────────── Lesson 3: Headings, paragraphs and links ───────────────────────── */

const textAndLinks = {
  slug: 'headings-paragraphs-links',
  title: 'Headings, paragraphs and links',
  minutes: 20,
  summary: 'The outline of a page, and links that say where they go.',
  sections: [
    {
      kind: 'text',
      text: `**Headings** (\`<h1>\` to \`<h6>\`) form the outline of a page, like the table of contents of a book. Many screen-reader users navigate by jumping from heading to heading.

- One \`<h1>\` per page: what the page is about.
- Sub-sections use \`<h2>\`, their sub-sections \`<h3>\`, and so on. **Do not skip levels** (an \`<h2>\` followed directly by an \`<h4>\`).
- Pick the level by position in the outline, never by font size. Size is CSS's job.

**Paragraphs** go in \`<p>\`. Do not use \`<br>\` to create space between blocks. \`<br>\` is only for line breaks that belong to the content, like in an address or a poem.`,
    },
    {
      kind: 'example',
      title: 'Links',
      language: 'html',
      code: `<a href="https://example.com/menu">Our menu</a>
<a href="/visit.html">Visit us</a>
<a href="../index.html">Home</a>
<a href="#hours">Opening hours</a>
<a href="mailto:hello@example.com">Email us</a>
<a href="https://maps.example.com" target="_blank" rel="noopener">
  Directions (opens in a new tab)
</a>`,
      notes: [
        { lines: [1], text: 'An **absolute** URL: the complete address, including `https://`.' },
        { lines: [2], text: 'Starts with `/`: relative to the **root** of the current website.' },
        { lines: [3], text: '`../` means "one folder up" from the current page.' },
        { lines: [4], text: '`#hours` jumps to the element with `id="hours"` on the same page.' },
        { lines: [5], text: '`mailto:` opens the visitor\'s email program.' },
        { lines: [6, 8], text: '`target="_blank"` opens a new tab. Say so in the link text, so it does not surprise anyone. `rel="noopener"` stops the new page from controlling yours.' },
      ],
    },
    {
      kind: 'text',
      title: 'Links go somewhere, buttons do something',
      text: `Use \`<a href>\` when the user **navigates** to another page or place. Use \`<button>\` when something **happens** on this page: open a menu, save, delete. Screen readers announce the two differently, and keyboard users expect different keys to work (Enter for links; Enter and Space for buttons).

Link text must make sense **on its own**. Screen readers can list all links on a page, and a list of ten links all called "click here" is useless.`,
    },
    {
      kind: 'mistakes',
      items: [
        { title: '"Click here" links', text: 'Write the destination into the link: "Read the **delivery conditions**" instead of "For delivery conditions, click here".' },
        { title: 'Skipping heading levels for the look', text: '`<h2>` then `<h4>` because h4 "looks right". Keep the levels in order and change the size in CSS.' },
        { title: '`<a>` without `href`', text: 'A link without `href` cannot be focused with the keyboard and does nothing. If it performs an action, it should be a `<button>`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.text.outline',
        type: 'code',
        title: 'Fix the outline and the links',
        skills: ['html.headings', 'html.links'],
        prompt: `This page section has several problems. Fix them:

- The page title should be the only \`<h1>\`, and the two sub-sections \`<h2>\`.
- "click here" should become a link whose text describes the destination.
- "Email us" should open an email to \`hello@example.com\`.
- Remove the \`<br>\` tags that are used for spacing.`,
        files: ['html'],
        starter: {
          html: `<h2>Visit Café Lumen</h2>
<h4>Opening hours</h4>
<p>Monday to Friday, 8:00–18:00.</p>
<h4>Find us</h4>
<p>Harbour Street 12. For directions, <a href="https://maps.example.com/lumen">click here</a>.</p>
<br><br>
<p>Questions? <a>Email us</a></p>
`,
        },
        given: { css: 'body { font-family: system-ui, sans-serif; padding: 0 1rem; }' },
        tests: [
          {
            name: 'There is exactly one <h1>, and it comes first',
            run: ({ expect, $$ }) => {
              const headings = $$('h1, h2, h3, h4, h5, h6');
              expect($$('h1').length, 'Use exactly one <h1>').toBe(1);
              expect(headings[0].tagName, 'The first heading should be the <h1>').toBe('H1');
            },
          },
          {
            name: 'No heading levels are skipped',
            run: ({ expect, $$ }) => {
              const levels = $$('h1, h2, h3, h4, h5, h6').map((el) => Number(el.tagName[1]));
              const skipped = levels.some((level, i) => i > 0 && level > levels[i - 1] + 1);
              expect(skipped, `Heading levels in order: ${levels.join(', ')}`).toBe(false);
            },
          },
          {
            name: 'No "click here" or "here" link text',
            run: ({ expect, $$ }) => {
              const vague = $$('a').filter((a) => /^\s*(click\s+)?here\s*$/i.test(a.textContent));
              expect(vague.length, 'Write the destination into the link text').toBe(0);
            },
          },
          {
            name: 'The directions link still goes to the map',
            run: ({ expect, $ }) => expect($('a[href*="maps.example.com"]'), 'Keep the map link').toBeTruthy(),
          },
          {
            name: 'The email link opens an email to hello@example.com',
            run: ({ expect, $ }) => {
              const link = $('a[href^="mailto:"]');
              expect(link, 'Use href="mailto:…"').toBeTruthy();
              expect(link.getAttribute('href'), 'Use the right address').toBe('mailto:hello@example.com');
            },
          },
          {
            name: 'Every link has an href',
            run: ({ expect, $$ }) => expect($$('a:not([href])').length, 'A link without href does nothing').toBe(0),
          },
          {
            name: 'No <br> used for spacing',
            run: ({ expect, $$ }) => expect($$('br').length, 'Remove the <br> tags; spacing is a job for CSS').toBe(0),
          },
        ],
        hints: [
          'Go through it line by line: the headings first, then each `<a>`, then the `<br>` line.',
          'An email link uses the `mailto:` scheme in its `href`. Good link text names the destination, like "directions on the map".',
          'Example: `For <a href="…">directions to the café</a>, see the map.`',
        ],
        solution: {
          html: `<h1>Visit Café Lumen</h1>
<h2>Opening hours</h2>
<p>Monday to Friday, 8:00–18:00.</p>
<h2>Find us</h2>
<p>Harbour Street 12. See the <a href="https://maps.example.com/lumen">directions on the map</a>.</p>
<p>Questions? <a href="mailto:hello@example.com">Email us</a></p>
`,
        },
        explanation: 'The page now has a correct outline (h1 → h2 → h2). Each link explains itself without the surrounding sentence, and every link actually goes somewhere.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.text.relative-url',
        type: 'predict',
        title: 'Where does the link go?',
        skills: ['html.links'],
        prompt: 'This link is on the page `https://cafe.example.com/blog/autumn.html`. Which full URL does the browser open when you click it?',
        language: 'html',
        code: '<a href="../menu.html">Our menu</a>',
        expected: 'https://cafe.example.com/menu.html',
        answerLabel: 'The full URL the browser opens',
        answerHelp: 'Write the complete address, starting with https://',
        hints: [
          'The current page is in the folder `/blog/`.',
          '`../` means "go up one folder". From `/blog/` that is the root `/`.',
        ],
        explanation: 'The page is in `/blog/`. `../` goes up one folder to the root `/`, where `menu.html` is found: `https://cafe.example.com/menu.html`.',
      },
    },
  ],
  keyPoints: [
    'One `<h1>`; headings form an outline without skipped levels.',
    'Link text must make sense on its own, and every link needs an `href`.',
    'Links navigate; buttons perform actions.',
  ],
};

/* ───────────────────────── Lesson 4: Images ───────────────────────── */

const images = {
  slug: 'images',
  title: 'Images',
  minutes: 15,
  summary: 'Alternative text, decorative images, sizes and captions.',
  sections: [
    {
      kind: 'text',
      text: `\`<img src="…" alt="…">\` shows an image. The \`alt\` attribute is the **alternative text**: what a screen reader reads aloud, and what appears when the image fails to load.

Writing good alt text:
- Describe what the image **communicates in this context**, briefly. For a logo, write the company name.
- Do not start with "Image of…". Screen readers already say it is an image.
- **Decorative** images (a divider, a background flourish) get an **empty** alt: \`alt=""\`. Screen readers then skip them.
- Never leave \`alt\` out completely. Then many screen readers read the **file name** instead ("divider-flourish-final-v2 dot svg").`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<img src="logo.svg" alt="Café Lumen" width="120" height="40">

<figure>
  <img src="terrace.jpg" alt="Sunny terrace with wooden tables and plants"
       width="800" height="533" loading="lazy">
  <figcaption>Our terrace seats 40 guests in summer.</figcaption>
</figure>

<img src="divider.svg" alt="">`,
      notes: [
        { lines: [1], text: 'A logo\'s alt text is the name it shows. `width` and `height` let the browser reserve space before the image loads, so the page does not jump.' },
        { lines: [3, 7], text: '`<figure>` groups an image with its caption, `<figcaption>`.' },
        { lines: [5], text: '`loading="lazy"` loads the image only when it is about to scroll into view.' },
        { lines: [9], text: 'A decorative image: empty alt, so screen readers skip it.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Missing alt attribute', text: 'Without `alt`, screen readers often read the file name. Every `<img>` needs `alt`, even if it is empty.' },
        { title: 'Repeating the caption', text: 'If a `<figcaption>` already says it, the alt text should describe what is **visible**, not repeat the caption.' },
        { title: 'Text inside images', text: 'Text in an image cannot be selected, translated, enlarged or read by search engines. Use real text and style it with CSS.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.images.alt',
        type: 'code',
        title: 'Give the images the right alt text',
        skills: ['html.images', 'html.accessibility'],
        prompt: `Fix these three images:

- The logo: alt text with the café's name, "Café Lumen".
- The terrace photo: wrap it in a \`<figure>\`, turn the paragraph into its \`<figcaption>\`, and give the photo an alt text that describes what is visible.
- The divider is decorative.

(The image files do not exist here, so the preview shows broken images. The checks look at the HTML.)`,
        files: ['html'],
        preview: false,
        starter: {
          html: `<img src="logo.svg" width="120" height="40">

<img src="photo-terrace.jpg" width="800" height="533">
<p>Our terrace in summer, with room for 40 guests.</p>

<img src="divider-flourish.svg">
`,
        },
        tests: [
          {
            name: 'Every image has an alt attribute',
            run: ({ expect, $$ }) => expect($$('img:not([alt])').length, 'Add alt to every <img>, even if empty').toBe(0),
          },
          {
            name: 'The logo is named "Café Lumen"',
            run: ({ expect, $ }) => expect(($('img[src="logo.svg"]').alt || '').trim(), 'Use the name shown in the logo').toBe('Café Lumen'),
          },
          {
            name: 'The divider is marked as decorative',
            run: ({ expect, $ }) => {
              const divider = $('img[src="divider-flourish.svg"]');
              expect(divider.hasAttribute('alt') && divider.alt === '', 'Use alt="" for decorative images').toBe(true);
            },
          },
          {
            name: 'The photo has a real description',
            run: ({ expect, $ }) => {
              const alt = ($('img[src="photo-terrace.jpg"]').alt || '').trim();
              expect(alt.length >= 10, 'Describe what is visible in a few words').toBe(true);
              expect(/\.jpe?g|^(image|picture|photo) of/i.test(alt), 'No file names, and no "image of…"').toBe(false);
            },
          },
          {
            name: 'The photo is in a <figure> with a <figcaption>',
            run: ({ expect, $ }) => {
              expect($('figure img[src="photo-terrace.jpg"]'), 'Put the photo inside a <figure>').toBeTruthy();
              const caption = $('figure figcaption');
              expect(caption, 'Add a <figcaption> inside the figure').toBeTruthy();
              expect(caption.textContent, 'Use the paragraph text as the caption').toContain('terrace');
            },
          },
        ],
        hints: [
          'Decide for each image: does it carry meaning, or is it decoration?',
          'Meaningful images get a short description; decorative ones get `alt=""`. A caption goes in `<figcaption>`, inside the same `<figure>` as the image.',
          'Structure: `<figure><img …><figcaption>…</figcaption></figure>`',
        ],
        solution: {
          html: `<img src="logo.svg" alt="Café Lumen" width="120" height="40">

<figure>
  <img src="photo-terrace.jpg" alt="Sunny terrace with wooden tables and plants" width="800" height="533">
  <figcaption>Our terrace in summer, with room for 40 guests.</figcaption>
</figure>

<img src="divider-flourish.svg" alt="">
`,
        },
        explanation: 'Each image now has exactly the alt text its role needs: a name for the logo, a description for the photo, and nothing for the decoration.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.images.alt-choice',
        type: 'choice',
        title: 'The best alt text',
        skills: ['html.images', 'html.accessibility'],
        prompt: 'An online shop shows a photo of the product on a product page: a red hooded rain jacket. Which alt text is best?',
        options: [
          { text: '`alt="red-jacket-final2.jpg"`', correct: false, feedback: 'A file name helps nobody. It is what screen readers read when alt is missing, which is exactly what we want to avoid.' },
          { text: '`alt="Image of a jacket"`', correct: false, feedback: '"Image of" is redundant (screen readers already say "image"), and "a jacket" leaves out what matters to a buyer.' },
          { text: '`alt="Red hooded rain jacket, front view"`', correct: true, feedback: 'Yes: short, specific, and it describes what a sighted buyer gets from the photo.' },
          { text: '`alt=""`', correct: false, feedback: 'An empty alt marks an image as decorative. Here the photo is the most important content on the page.' },
        ],
        hints: ['What would a buyer who cannot see the photo want to know from it?'],
      },
    },
  ],
  keyPoints: [
    'Every `<img>` needs `alt`. Meaningful: a short description. Decorative: `alt=""`.',
    'Add `width` and `height` so the page does not jump while images load.',
    'Use `<figure>` with `<figcaption>` for captions.',
  ],
};

/* ───────────────────────── Lesson 5: Forms, inputs and buttons ───────────────────────── */

const forms = {
  slug: 'forms-and-buttons',
  title: 'Forms, inputs and buttons',
  minutes: 25,
  summary: 'Labels, input types, names, radio groups, and what buttons do inside a form.',
  sections: [
    {
      kind: 'text',
      text: `Forms collect input. A good form gets a lot done before you write any JavaScript:

- **Every input needs a label.** Connect them with \`<label for="x">\` and \`<input id="x">\`. Clicking the label then focuses the input, and screen readers announce the label.
- **The \`type\`** (\`email\`, \`number\`, \`tel\`, \`date\`, \`password\`…) gives the right keyboard on phones and basic validation.
- **\`name\`** is the key under which the value is sent or read with \`FormData\`. Without a name, the value is not included.
- **Validation attributes** like \`required\`, \`minlength\`, \`min\` and \`pattern\` make the browser check the input before submitting.`,
    },
    {
      kind: 'example',
      title: 'A small contact form',
      language: 'html',
      preview: true,
      previewHeight: 340,
      css: `body { font-family: system-ui, sans-serif; font-size: 14px; padding: 0 12px; }
form { display: grid; gap: 6px; max-width: 320px; }
input, select, textarea, button { font: inherit; padding: 4px 6px; }
fieldset { display: flex; gap: 12px; }`,
      code: `<form action="/contact" method="post">
  <label for="name">Name</label>
  <input id="name" name="name" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="topic">Topic</label>
  <select id="topic" name="topic">
    <option value="booking">Table booking</option>
    <option value="other">Something else</option>
  </select>

  <fieldset>
    <legend>Reply by</legend>
    <label><input type="radio" name="reply" value="email" checked> Email</label>
    <label><input type="radio" name="reply" value="phone"> Phone</label>
  </fieldset>

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="3"></textarea>

  <button type="submit">Send</button>
</form>`,
      notes: [
        { lines: [1], text: '`action` is where the data goes, `method` how. With JavaScript you usually listen for the form\'s `submit` event instead.' },
        { lines: [2, 3], text: '`for` matches the input\'s `id`. `name` is the key the value is sent under. `required` blocks empty submissions.' },
        { lines: [6], text: '`type="email"` checks the format and shows an @ keyboard on phones.' },
        { lines: [9, 12], text: 'A `<select>` offers fixed choices. The `value` is what gets sent; the text is what the user sees.' },
        { lines: [14, 18], text: 'Radio buttons with the **same `name`** form a group: only one can be selected. `<fieldset>` and `<legend>` give the group its question.' },
        { lines: [16], text: 'Wrapping an input inside its `<label>` connects them too, without `for`/`id`.' },
        { lines: [23], text: 'A button in a form submits it. `type="submit"` is the default, but writing it makes the intent clear.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Placeholder instead of label', text: 'Placeholder text disappears as soon as you type, is often too light to read, and is not reliably announced. Always use a real `<label>`. A placeholder can be an extra example.' },
        { title: 'A button that accidentally submits', text: 'A `<button>` inside a form submits it unless it has `type="button"`. A "Show password" button without that type reloads the page.' },
        { title: 'Radio buttons with different names', text: 'Different `name`s mean separate groups, so all of them can be selected at once.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'sample.html.form-label',
        type: 'code',
        title: 'Make a sign-up form accessible',
        skills: ['html.forms', 'html.accessibility'],
        prompt: `This form looks fine, but a screen reader cannot tell what the input is for, the browser cannot validate it, and the button does nothing. Fix the HTML:

    - Connect the label to the input (with \`for\` and \`id\`).
    - Make the input an **email** input that is **required**.
    - Make the button submit the form.`,
        files: ['html'],
        starter: {
          html: `<form id="signup">
      <label>Email address</label>
      <input name="email">
      <button type="button">Sign up</button>
    </form>
    `,
        },
        given: {
          css: `body { font-family: system-ui, sans-serif; padding: 1.5rem; }
    form { display: grid; gap: 0.5rem; max-width: 320px; }
    input, button { font: inherit; padding: 0.5rem; }`,
        },
        tests: [
          {
            name: 'The input has an id',
            run: ({ expect, $ }) => {
              const input = $('#signup input');
              expect(input, 'There should be an <input> inside the form').toBeTruthy();
              expect(input.id, 'Give the input an id attribute').toBeTruthy();
            },
          },
          {
            name: 'The label is connected to the input',
            run: ({ expect, $ }) => {
              const input = $('#signup input');
              expect(input.labels.length, "The label's for must be exactly the input's id").toBe(1);
            },
          },
          {
            name: 'The input is an email input',
            run: ({ expect, $ }) => expect($('#signup input').type, 'Set type="email"').toBe('email'),
          },
          {
            name: 'The input is required',
            run: ({ expect, $ }) => expect($('#signup input').required, 'Add the required attribute').toBe(true),
          },
          {
            name: 'The button submits the form',
            run: ({ expect, $ }) => expect($('#signup button').type, 'The button type should be submit').toBe('submit'),
          },
        ],
        pitfalls: [
          {
            file: 'html',
            pattern: /type\s*=\s*["']button["']/,
            message: 'A `type="button"` button does nothing on its own. Inside a form, buttons are `type="submit"` by default, so remove the type or set it to `submit`.',
          },
        ],
        hints: [
          'Look at how the `<label>` and the `<input>` refer to each other. At the moment nothing links them.',
          "A label's `for` attribute must contain exactly the input's `id`. Input types like `email` and the `required` attribute give you browser validation for free.",
          `The connection looks like this:
    \`\`\`html
    <label for="email">Email address</label>
    <input id="email" name="email" …>
    \`\`\``,
        ],
        solution: {
          html: `<form id="signup">
      <label for="email">Email address</label>
      <input id="email" name="email" type="email" required>
      <button type="submit">Sign up</button>
    </form>
    `,
        },
        explanation: 'Clicking the label now focuses the input. A screen reader announces "Email address, edit text, required". The browser refuses to submit an empty or invalid address, before any JavaScript runs.',
        takeaway: 'Every input needs a connected label. Prefer the right input `type` and attributes like `required` before writing validation code.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.forms.radio-group',
        type: 'code',
        title: 'A proper radio group',
        skills: ['html.forms', 'html.accessibility'],
        prompt: `Make this size choice work properly:

- Group the radios in a \`<fieldset>\` with the \`<legend>\` "Size" (replace the paragraph).
- Give all three radios \`name="size"\` and the values \`small\`, \`medium\` and \`large\`.
- Give each radio a label, by wrapping it and its text in a \`<label>\`.
- Make Medium selected by default.`,
        files: ['html'],
        starter: {
          html: `<form id="order">
  <p>Size</p>
  <input type="radio"> Small
  <input type="radio"> Medium
  <input type="radio"> Large
  <button>Order</button>
</form>
`,
        },
        given: { css: 'body { font-family: system-ui, sans-serif; padding: 1rem; } label { display: block; }' },
        tests: [
          {
            name: 'The radios are in a <fieldset> with the legend "Size"',
            run: ({ expect, $ }) => {
              expect($('fieldset'), 'Add a <fieldset>').toBeTruthy();
              expect(($('fieldset legend')?.textContent || '').trim(), 'Add <legend>Size</legend> inside the fieldset').toBe('Size');
              expect($('fieldset input[type=radio]'), 'The radios belong inside the fieldset').toBeTruthy();
            },
          },
          {
            name: 'All three radios share name="size"',
            run: ({ expect, $$ }) => expect($$('input[type=radio][name=size]').length, 'Give every radio name="size"').toBe(3),
          },
          {
            name: 'The values are small, medium and large',
            run: ({ expect, $$ }) => expect($$('input[type=radio]').map((r) => r.value), 'Set value="…" on each radio').toEqual(['small', 'medium', 'large']),
          },
          {
            name: 'Every radio has a label',
            run: ({ expect, $$ }) => expect($$('input[type=radio]').every((r) => r.labels.length === 1), 'Wrap each radio and its text in <label>').toBe(true),
          },
          {
            name: 'Medium is selected by default',
            run: ({ expect, $ }) => expect($('input[value=medium]')?.checked, 'Add the checked attribute to Medium').toBe(true),
          },
          {
            name: 'Selecting Small deselects Medium',
            run: ({ expect, $, click }) => {
              click($('input[value=small]'));
              expect($('input[value=medium]').checked, 'Radios with the same name form one group').toBe(false);
            },
          },
        ],
        hints: [
          'Look at what is missing on each `<input>`: `name`, `value` and a label.',
          'Radios with the same `name` form a group. `<label><input type="radio" …> Small</label>` connects a radio and its text.',
          'One radio, finished: `<label><input type="radio" name="size" value="small"> Small</label>`',
        ],
        solution: {
          html: `<form id="order">
  <fieldset>
    <legend>Size</legend>
    <label><input type="radio" name="size" value="small"> Small</label>
    <label><input type="radio" name="size" value="medium" checked> Medium</label>
    <label><input type="radio" name="size" value="large"> Large</label>
  </fieldset>
  <button>Order</button>
</form>
`,
        },
        explanation: 'Now only one size can be selected. Clicking the word "Small" selects its radio, and a screen reader announces "Size, group. Medium, radio button, checked, 2 of 3". When the form is submitted, the data contains `size=medium`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.forms.button-type',
        type: 'choice',
        title: 'What does this button do?',
        skills: ['html.forms', 'html.buttons'],
        prompt: 'Inside a `<form>`, a developer adds `<button>Show password</button>` and a click listener that toggles the password field. When clicked, the page reloads. Why?',
        options: [
          { text: 'A `<button>` inside a form is a **submit** button by default, so the click submits the form.', correct: true, feedback: 'Yes. Add `type="button"` for buttons that should only run JavaScript.' },
          { text: 'The click listener has an error.', correct: false, feedback: 'An error would show in the console, but would not reload the page. The reload is what a form submission does.' },
          { text: 'Buttons always reload the page.', correct: false, feedback: 'Outside a form, a button does nothing on its own. The form is what makes the difference.' },
          { text: 'The button needs an `id`.', correct: false, feedback: 'An id helps you select the button, but does not change what a click does.' },
        ],
        hints: ['What is the default `type` of a `<button>`?'],
        takeaway: 'In forms, always write the button type: `submit` for sending, `button` for everything else.',
      },
    },
  ],
  keyPoints: [
    'Every input has a connected `<label>`; placeholders do not replace labels.',
    '`name` decides under which key the value is sent; radios in one group share a `name`.',
    'Buttons in a form submit it unless they have `type="button"`.',
  ],
};

/* ───────────────────────── Lesson 6: Tables ───────────────────────── */

const tables = {
  slug: 'tables',
  title: 'Tables',
  minutes: 15,
  summary: 'Tables for tabular data, with headers that screen readers understand.',
  sections: [
    {
      kind: 'text',
      text: `Use a \`<table>\` for **tabular data**: information you would compare across rows and columns, like opening hours, prices or a schedule. Do not use tables for page layout; that is what CSS Grid and Flexbox are for.

Header cells (\`<th>\`) are what make a table understandable. A screen reader can then read "Saturday, Opens, 9:00" instead of just "9:00".`,
    },
    {
      kind: 'example',
      language: 'html',
      preview: true,
      previewHeight: 170,
      css: `body { font-family: system-ui, sans-serif; font-size: 14px; }
table { border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 4px 10px; text-align: left; }
caption { text-align: left; font-weight: 600; margin-bottom: 4px; } thead th { background: #f3f4f6; }`,
      code: `<table>
  <caption>Opening hours</caption>
  <thead>
    <tr>
      <th scope="col">Day</th>
      <th scope="col">Opens</th>
      <th scope="col">Closes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Monday</th>
      <td>8:00</td>
      <td>18:00</td>
    </tr>
  </tbody>
</table>`,
      notes: [
        { lines: [2], text: '`<caption>` is the table\'s title. Screen readers announce it when entering the table.' },
        { lines: [3, 9], text: '`<thead>` holds the header row; `<tbody>` the data rows.' },
        { lines: [5, 7], text: '`<th scope="col">` is a header for its **column**.' },
        { lines: [12], text: '`<th scope="row">` is a header for its **row**.' },
        { lines: [13, 14], text: '`<td>` is a normal data cell.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Bold text instead of header cells', text: '`<td><b>Day</b></td>` looks like a header but means nothing. Use `<th>`.' },
        { title: 'Tables for layout', text: 'Layout tables break on small screens and confuse screen readers. Use CSS Grid or Flexbox.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.tables.timetable',
        type: 'code',
        title: 'A proper timetable',
        skills: ['html.tables', 'html.accessibility'],
        prompt: `Improve this table:

- Add the caption "Opening hours".
- Put the first row in a \`<thead>\`, and turn its cells into \`<th scope="col">\` (no \`<b>\`).
- Put the other rows in a \`<tbody>\`, with the day name as \`<th scope="row">\`.`,
        files: ['html'],
        starter: {
          html: `<table>
  <tr>
    <td><b>Day</b></td>
    <td><b>Opens</b></td>
    <td><b>Closes</b></td>
  </tr>
  <tr>
    <td>Monday</td>
    <td>8:00</td>
    <td>18:00</td>
  </tr>
  <tr>
    <td>Saturday</td>
    <td>9:00</td>
    <td>16:00</td>
  </tr>
</table>
`,
        },
        given: {
          css: `body { font-family: system-ui, sans-serif; padding: 1rem; }
table { border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 4px 10px; text-align: left; }
caption { text-align: left; font-weight: 600; } thead th { background: #f3f4f6; }`,
        },
        tests: [
          {
            name: 'The caption says "Opening hours"',
            run: ({ expect, $ }) => expect(($('table caption')?.textContent || '').trim(), 'Add <caption>Opening hours</caption>').toBe('Opening hours'),
          },
          {
            name: 'The header row is in <thead>, with three <th scope="col">',
            run: ({ expect, $$ }) => expect($$('thead th[scope=col]').length, 'Use <th scope="col"> in a <thead>').toBe(3),
          },
          {
            name: 'The two data rows are in <tbody>',
            run: ({ expect, $$ }) => expect($$('tbody tr').length, 'Only the data rows go in <tbody>').toBe(2),
          },
          {
            name: 'Each day name is a row header',
            run: ({ expect, $$ }) => {
              const firstCells = $$('tbody tr').map((row) => row.cells[0]);
              expect(firstCells.every((cell) => cell.tagName === 'TH' && cell.getAttribute('scope') === 'row'),
                'Use <th scope="row"> for Monday and Saturday').toBe(true);
            },
          },
          {
            name: 'No <b> used for headers',
            run: ({ expect, $$ }) => expect($$('table b').length, 'A <th> is already bold; remove the <b>').toBe(0),
          },
        ],
        hints: [
          'Work from the outside in: caption first, then wrap the rows in `<thead>` and `<tbody>`, then change the cells.',
          'The caption goes directly after `<table>`. Header cells are `<th>`, with `scope="col"` or `scope="row"`.',
          'The first data row becomes: `<tr><th scope="row">Monday</th><td>8:00</td><td>18:00</td></tr>`',
        ],
        solution: {
          html: `<table>
  <caption>Opening hours</caption>
  <thead>
    <tr>
      <th scope="col">Day</th>
      <th scope="col">Opens</th>
      <th scope="col">Closes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Monday</th>
      <td>8:00</td>
      <td>18:00</td>
    </tr>
    <tr>
      <th scope="row">Saturday</th>
      <td>9:00</td>
      <td>16:00</td>
    </tr>
  </tbody>
</table>
`,
        },
        explanation: 'Interesting detail: if you write `<tr>` directly inside `<table>`, the browser silently adds a `<tbody>` around it. That is why, before your fix, all three rows were in one tbody. You can see this in DevTools → Elements.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.tables.when',
        type: 'choice',
        title: 'Table or not?',
        skills: ['html.tables', 'html.semantic'],
        prompt: 'For which of these is a `<table>` the right choice?',
        options: [
          { text: 'Comparing three subscription plans across price, storage and support', correct: true, feedback: 'Yes. Rows (plans) and columns (features) that you compare is exactly tabular data.' },
          { text: 'A page layout with a sidebar and a content area', correct: false, feedback: 'That is layout, a job for CSS Grid or Flexbox. Layout tables break on phones and confuse screen readers.' },
          { text: 'The links in the main navigation', correct: false, feedback: 'A list of links belongs in `<nav>`, usually as a `<ul>`.' },
          { text: 'Labels and inputs in a form', correct: false, feedback: 'Forms use `<label>` and `<input>`, arranged with CSS. A table would add meaning that is not there.' },
        ],
        hints: ['Would you compare the cells across both rows **and** columns?'],
      },
    },
  ],
  keyPoints: [
    'Tables are for data you compare across rows and columns, never for layout.',
    'Use `<caption>`, `<thead>`/`<tbody>`, and `<th scope="col|row">`.',
  ],
};

/* ───────────────────────── Lesson 7: Accessibility fundamentals ───────────────────────── */

const accessibility = {
  slug: 'accessibility',
  title: 'Accessibility fundamentals',
  minutes: 20,
  summary: 'Keyboard access, accessible names, and why native elements beat clever workarounds.',
  sections: [
    {
      kind: 'text',
      text: `Accessibility means people can use your site however they access it: keyboard only, screen reader, zoomed in, with poor eyesight, color blindness, or a shaky hand. It is also a legal requirement in many countries, and it makes sites better for everyone.

Most of it comes from good HTML:
- **Use native elements.** A \`<button>\` can be focused with Tab and pressed with Enter and Space. A \`<div onclick>\` can do none of that, and is announced as plain text.
- **Every interactive element needs an accessible name**: the button text, the label of an input, or \`aria-label\` for an icon-only button.
- **Keep focus visible.** Never remove the focus outline without a clear replacement.
- **Do not use color alone** to convey meaning, like "required fields are red".

The first rule of **ARIA** (attributes like \`aria-label\` and \`role\`): do not use ARIA if a native element can do the job. Wrong ARIA is worse than none.`,
    },
    {
      kind: 'example',
      title: 'A div is not a button',
      language: 'html',
      preview: true,
      previewHeight: 120,
      css: `body { font-family: system-ui, sans-serif; font-size: 14px; display: flex; gap: 12px; align-items: center; padding: 8px; }
.fake, button { padding: 6px 12px; border: 1px solid #888; border-radius: 6px; background: #f3f4f6; font: inherit; cursor: pointer; }`,
      code: `<!-- Not accessible -->
<div class="fake" onclick="save()">Save</div>

<!-- Accessible -->
<button type="button" onclick="save()">Save</button>

<!-- Icon-only button: needs a name -->
<button type="button" aria-label="Close">✕</button>`,
      notes: [
        { lines: [2], text: 'Looks like a button, but cannot be reached with Tab, does not react to Enter or Space, and screen readers announce it as plain text "Save".' },
        { lines: [5], text: 'The same look with CSS, plus keyboard support and the right announcement ("Save, button") for free.' },
        { lines: [8], text: 'Without `aria-label`, a screen reader would announce "multiplication X, button". Now it says "Close, button".' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: '`outline: none` without a replacement', text: 'Keyboard users can no longer see where they are. If you change the focus style, style `:focus-visible` instead (Module 2).' },
        { title: 'Testing only with a mouse', text: 'Unplug the mouse for a minute: can you reach and use everything with Tab, Enter, Space and the arrow keys? This 60-second test finds many problems, including in AI-generated code.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.a11y.toolbar',
        type: 'code',
        title: 'Fix an inaccessible toolbar',
        skills: ['html.accessibility', 'html.buttons'],
        prompt: `Both buttons in this toolbar have accessibility problems. Fix them in the HTML:

- "Save" is a \`<div>\`. Make it a real button (it should still call \`save()\`).
- The share button only contains an icon. Give it the accessible name "Share".

The functions \`save()\` and \`share()\` are provided.`,
        files: ['html'],
        starter: {
          html: `<div class="toolbar">
  <div class="btn" onclick="save()">Save</div>
  <button type="button" class="btn" onclick="share()">
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></svg>
  </button>
</div>
<p id="status" role="status"></p>
`,
        },
        given: {
          css: `body { font-family: system-ui, sans-serif; padding: 1rem; }
.toolbar { display: flex; gap: 8px; }
.btn { display: inline-flex; align-items: center; padding: 6px 12px; border: 1px solid #888; border-radius: 6px; background: #f3f4f6; font: inherit; cursor: pointer; }`,
          setup: `function save() { document.querySelector('#status').textContent = 'Saved'; }
function share() { document.querySelector('#status').textContent = 'Shared'; }`,
        },
        tests: [
          {
            name: 'Save is a real <button>',
            run: ({ expect, $$ }) => {
              const save = $$('button').find((b) => b.textContent.trim() === 'Save');
              expect(save, 'Make "Save" a <button>').toBeTruthy();
            },
          },
          {
            name: 'No clickable div left',
            run: ({ expect, $$ }) => expect($$('div[onclick]').length, 'Replace the div, do not add a button next to it').toBe(0),
          },
          {
            name: 'Clicking Save still saves',
            run: ({ expect, $, $$, click }) => {
              click($$('button').find((b) => b.textContent.trim() === 'Save'));
              expect($('#status').textContent, 'Keep onclick="save()"').toBe('Saved');
            },
          },
          {
            name: 'The share button is named "Share"',
            run: ({ expect, $$ }) => {
              const share = $$('button').find((b) => (b.getAttribute('onclick') || '').includes('share'));
              const name = (share.getAttribute('aria-label') || share.textContent).trim();
              expect(name, 'Give the icon-only button aria-label="Share"').toBe('Share');
            },
          },
          {
            name: 'Both buttons have type="button"',
            run: ({ expect, $$ }) => expect($$('button').every((b) => b.getAttribute('type') === 'button'), 'Write type="button" on both').toBe(true),
          },
        ],
        hints: [
          'One problem is the **element**, the other is a missing **name**.',
          'Change `<div …>Save</div>` into a `<button>` and keep its class and onclick. An icon-only button gets its name from `aria-label`.',
          '`<button type="button" class="btn" onclick="share()" aria-label="Share">`',
        ],
        solution: {
          html: `<div class="toolbar">
  <button type="button" class="btn" onclick="save()">Save</button>
  <button type="button" class="btn" onclick="share()" aria-label="Share">
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></svg>
  </button>
</div>
<p id="status" role="status"></p>
`,
        },
        explanation: 'Try it in the preview: press Tab to reach both buttons, then press Enter or Space. With the div, Tab skipped "Save" completely. The `role="status"` on the paragraph makes screen readers announce "Saved" when the text changes.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'html.a11y.problems',
        type: 'choice',
        title: 'Spot the accessibility problems',
        skills: ['html.accessibility'],
        prompt: 'Which of these are real accessibility problems?',
        multiple: true,
        options: [
          { text: 'A search field with only `placeholder="Search"` and no label', correct: true, feedback: 'Yes. The placeholder disappears when typing and is not a reliable accessible name. Add a label (it can be visually hidden).' },
          { text: 'An icon-only "delete" button without `aria-label`', correct: true, feedback: 'Yes. Screen readers announce just "button", so nobody knows what it deletes.' },
          { text: '`button:focus { outline: none; }` with no other focus style', correct: true, feedback: 'Yes. Keyboard users can no longer see which element is focused.' },
          { text: 'Using a `<button>` to open a menu', correct: false, feedback: 'That is correct use. It is an action on the current page, so a button is the right element.' },
          { text: 'Required fields marked only by red label color', correct: true, feedback: 'Yes. Color alone fails for color-blind users and screen readers. Add text such as "(required)" and the `required` attribute.' },
        ],
        hints: ['For each one, imagine using the page with only a keyboard, or with a screen reader, or without seeing colors.'],
      },
    },
  ],
  keyPoints: [
    'Native elements first: `<button>`, `<a href>`, `<label>`, `<input>`.',
    'Every interactive element needs an accessible name; icon-only buttons use `aria-label`.',
    'Keep focus visible, and never rely on color alone.',
    'Test with the keyboard: Tab, Enter, Space, arrows.',
  ],
};

export const htmlLessons = [
  documentStructure,
  semanticHtml,
  textAndLinks,
  images,
  forms,
  tables,
  accessibility,
];
