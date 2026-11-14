/*
 * css.js — Module 2: CSS fundamentals.
 *
 * Most CSS checks measure the RESULT (positions, sizes, computed colors) rather
 * than the exact code, so any working solution passes. Where the result alone
 * cannot tell (e.g. :focus-visible, @media), tests inspect the stylesheet rules.
 */

const ui = 'body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; }';

/* ───────────────────────── Lesson 1: Selectors and the cascade ───────────────────────── */

const selectors = {
  slug: 'selectors',
  title: 'Selectors and the cascade',
  minutes: 20,
  summary: 'How CSS picks elements, and what happens when several rules disagree.',
  sections: [
    {
      kind: 'text',
      text: `A CSS rule has a **selector** (which elements) and **declarations** (what to change):

\`\`\`css
.note {              /* selector */
  color: #6b7280;    /* declaration: property + value */
}
\`\`\`

The selectors you will use most:
- \`p\`: every \`<p>\` (a **type** selector)
- \`.note\`: every element with \`class="note"\` (a **class** selector)
- \`#main\`: the element with \`id="main"\` (an **id** selector)
- \`nav a\`: every \`<a>\` **anywhere inside** a \`<nav>\` (a **descendant** selector)
- \`ul > li\`: every \`<li>\` that is a **direct child** of a \`<ul>\`
- \`[type="email"]\`: elements with that **attribute**
- \`h1, h2\`: **both** (a group)

The **cascade** decides what happens when several rules set the same property on the same element. The more **specific** selector wins (next lesson). If they are equally specific, the rule that comes **later** wins.

Some properties are **inherited** by child elements, mostly text properties like \`color\` and \`font-family\`. Box properties like \`padding\` and \`border\` are not.`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 150,
      html: `<nav class="site-nav">
  <a href="#">Home</a> <a href="#" class="active">Menu</a>
</nav>
<p class="note">Closed on public holidays.</p>`,
      code: `body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

.site-nav a {
  text-decoration: none;
}

.site-nav a.active {
  font-weight: 700;
}

.note {
  color: #6b7280;
}`,
      notes: [
        { lines: [1, 4], text: 'Set on `body`, these text properties are **inherited** by everything inside it.' },
        { lines: [6], text: 'Descendant selector: only links inside the element with class `site-nav`.' },
        { lines: [10], text: '`a.active` (no space) means "an `<a>` that also has the class `active`". With a space, `a .active` would mean "an element with class active **inside** an `<a>`".' },
        { lines: [14, 16], text: 'Overrides the inherited body color, because a rule that targets the element itself beats inheritance.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Forgetting the dot or hash', text: '`note { … }` looks for an element **named** `<note>`. Classes need `.`, ids need `#`. This is the same mistake as in `querySelector`, which uses the same selector language.' },
        { title: 'A space that changes the meaning', text: '`a.active` = a link with class active. `a .active` = something with class active inside a link. One space, completely different elements.' },
        { title: 'Selectors that are too broad', text: '`a { text-decoration: none; }` removes the underline from every link on the site, including links in your text, where they matter. Scope rules to a component: `.site-nav a`.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.selectors.scoped',
        type: 'code',
        title: 'Target exactly the right elements',
        skills: ['css.selectors'],
        prompt: `Write CSS for the provided HTML (see the HTML tab):

- Links **inside the nav** have no underline. The link in \`<main>\` must keep its underline.
- The **active** nav link is bold (\`font-weight: 700\`).
- The paragraph with class \`note\` has the color \`#6b7280\`.`,
        files: ['css'],
        given: {
          html: `<nav class="site-nav">
  <a href="#">Home</a>
  <a href="#" class="active">Menu</a>
  <a href="#">Visit</a>
</nav>
<main>
  <p>Welcome to Café Lumen.</p>
  <p class="note">Closed on public holidays.</p>
  <a href="#">Book a table</a>
</main>`,
        },
        starter: { css: `${ui}\n\n/* your rules here */\n` },
        tests: [
          {
            name: 'Nav links have no underline',
            run: ({ expect, $$, style }) => {
              const underlined = $$('.site-nav a').filter((a) => style(a, 'textDecorationLine') !== 'none');
              expect(underlined.length, 'Set text-decoration: none on links inside .site-nav').toBe(0);
            },
          },
          {
            name: 'The link in <main> keeps its underline',
            run: ({ expect, $, style }) => expect(style($('main a'), 'textDecorationLine'), 'Your selector is too broad: it also hits the link in <main>').toBe('underline'),
          },
          {
            name: 'The active link is bold',
            run: ({ expect, $, style }) => expect(style($('.site-nav .active'), 'fontWeight'), 'Set font-weight: 700 on the active link').toBe('700'),
          },
          {
            name: 'The other nav links are not bold',
            run: ({ expect, $$, style }) => {
              const bold = $$('.site-nav a:not(.active)').filter((a) => style(a, 'fontWeight') === '700');
              expect(bold.length, 'Only the link with class active should be bold').toBe(0);
            },
          },
          {
            name: 'The note is gray (#6b7280)',
            run: ({ expect, $, style }) => expect(style($('.note'), 'color'), 'Set color: #6b7280 on .note').toBe('rgb(107, 114, 128)'),
          },
          {
            name: 'The other paragraph keeps the normal color',
            run: ({ expect, $, style }) => expect(style($('main p:not(.note)'), 'color'), 'Only the note should be gray').toBe('rgb(0, 0, 0)'),
          },
        ],
        pitfalls: [
          { file: 'css', pattern: /(^|[\s}])a\s*\{/, message: '`a { … }` selects **every** link on the page. Use a descendant selector that starts with the nav, such as `.site-nav a`.' },
          { file: 'css', pattern: /(^|[\s}])note\s*\{/, message: '`note { … }` looks for an element named `<note>`. A class selector needs a dot: `.note`.' },
        ],
        hints: [
          'Each requirement needs one rule. Start every selector from something that only exists in the right place, such as the nav\'s class.',
          'Descendant selector: `.site-nav a`. Element with two conditions: `.site-nav a.active` or `.site-nav .active`. Class: `.note`.',
          'The underline is controlled by `text-decoration: none;`.',
        ],
        solution: {
          css: `${ui}

.site-nav a {
  text-decoration: none;
}

.site-nav .active {
  font-weight: 700;
}

.note {
  color: #6b7280;
}
`,
        },
        explanation: 'Each selector starts from something that only exists where you want the style: `.site-nav` for the links, `.active` for one link, `.note` for one paragraph. The link in `<main>` is not inside `.site-nav`, so it keeps the browser\'s default underline.',
        takeaway: 'Scope styles to a component with a descendant selector, so they cannot leak into the rest of the page.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.selectors.cascade-predict',
        type: 'predict',
        title: 'Which rule wins?',
        skills: ['css.cascade', 'css.specificity'],
        prompt: 'The HTML is `<p class="intro">First</p>` followed by `<p>Second</p>`. What color is each paragraph?',
        language: 'css',
        code: `p {
  color: green;
}

.intro {
  color: blue;
}

p {
  color: red;
}`,
        expected: 'blue\nred',
        answerLabel: 'The color of "First", then of "Second" (one per line)',
        answerHelp: 'Write just the color names, e.g. green',
        hints: [
          'For each paragraph, list the rules that match it. "Second" has no class.',
          'A class selector is more specific than a type selector, so it wins no matter where it is. Only between equally specific rules does the later one win.',
        ],
        explanation: '"First" matches all three rules. `.intro` is more specific than `p`, so it wins even though a `p` rule comes later: **blue**. "Second" only matches the two `p` rules, which are equally specific, so the later one wins: **red**.',
      },
    },
  ],
  keyPoints: [
    'Class `.x`, id `#x`, descendant `a b`, child `a > b`, group `a, b`.',
    'More specific wins; if equal, the later rule wins.',
    'Text properties like `color` are inherited; box properties are not.',
  ],
};

/* ───────────────────────── Lesson 2: Specificity ───────────────────────── */

const specificity = {
  slug: 'specificity',
  title: 'Specificity',
  minutes: 20,
  summary: 'Why a rule "does not work", and how to fix it without !important.',
  sections: [
    {
      kind: 'text',
      text: `When two rules set the same property, the browser compares their **specificity**. Count three numbers for each selector:

- **(A)** the number of **ids** (\`#menu\`)
- **(B)** the number of **classes**, attributes and pseudo-classes (\`.active\`, \`[type]\`, \`:hover\`)
- **(C)** the number of **element** types (\`a\`, \`li\`) and pseudo-elements

Compare A first; only if A is equal, compare B; then C. So \`#menu a\` is (1, 0, 1) and beats \`.nav .link.active\` (0, 3, 0), because **one id beats any number of classes**.

Inline \`style="…"\` attributes beat every selector, and \`!important\` beats even those. Both make CSS hard to maintain, because the only way to override them is with more of the same.

**Strategy:** keep specificity low and flat. Style mainly with single classes, and avoid ids in CSS.`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 90,
      html: `<nav id="menu"><a class="nav-link active" href="#">Menu</a></nav>`,
      code: `#menu a {               /* (1, 0, 1) */
  color: crimson;
}

.nav-link.active {      /* (0, 2, 0) */
  color: seagreen;
}

nav .nav-link {         /* (0, 1, 1) */
  color: royalblue;
}`,
      notes: [
        { lines: [1, 3], text: 'One id. It wins against both other rules, even though it comes first.' },
        { lines: [5, 7], text: 'Two classes: more than the third rule, but no id, so it loses to the first.' },
        { lines: [9, 11], text: 'One class and one element: the weakest of the three.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Reaching for !important', text: 'It "fixes" one rule and makes the next change harder. AI tools often add `!important` when a style does not apply. When you review such code, find the competing rule instead.' },
        { title: 'Guessing instead of checking', text: 'DevTools → Elements → Styles shows every rule that matches an element, and crosses out the declarations that lost. It tells you exactly which rule wins.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.specificity.predict',
        type: 'predict',
        title: 'Count the specificity',
        skills: ['css.specificity'],
        prompt: 'The HTML is `<nav id="menu" class="nav"><a class="nav-link" href="#">Menu</a></nav>`. What color is the link?',
        language: 'css',
        code: `.nav .nav-link {
  color: green;
}

a.nav-link {
  color: purple;
}

#menu a {
  color: orange;
}

.nav a.nav-link {
  color: blue;
}`,
        expected: 'orange',
        answerLabel: 'The color of the link',
        answerHelp: 'Write just the color name',
        hints: [
          'Write down (ids, classes, elements) for each of the four selectors.',
          '`.nav .nav-link` = (0,2,0), `a.nav-link` = (0,1,1), `#menu a` = (1,0,1), `.nav a.nav-link` = (0,2,1). Compare the first number first.',
        ],
        explanation: '`#menu a` is the only selector with an id: (1, 0, 1). The first number is compared first, so it beats `.nav a.nav-link` (0, 2, 1) even though that one has more classes and comes later.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.specificity.fix',
        type: 'code',
        title: 'Make the button rule win',
        skills: ['css.specificity', 'debug.css'],
        prompt: `The "Subscribe" link should look like a button: white text on dark blue. But its text stays blue, because another rule wins.

Fix it **without \`!important\`** and without changing the HTML. The "Archive" link must stay blue (\`#2563eb\`).`,
        files: ['css'],
        given: {
          html: `<aside id="sidebar">
  <a class="button" href="#">Subscribe</a>
  <p><a href="#">Archive</a></p>
</aside>`,
        },
        starter: {
          css: `${ui}

#sidebar a {
  color: #2563eb;
}

/* Should make "Subscribe" white on dark blue, but the text stays blue. */
.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #1e3a8a;
  color: white;
  text-decoration: none;
}
`,
        },
        tests: [
          {
            name: 'Subscribe has white text',
            run: ({ expect, $, style }) => expect(style($('.button'), 'color'), 'The .button color rule still loses').toBe('rgb(255, 255, 255)'),
          },
          {
            name: 'Subscribe has the dark blue background',
            run: ({ expect, $, style }) => expect(style($('.button'), 'backgroundColor')).toBe('rgb(30, 58, 138)'),
          },
          {
            name: 'Archive is still blue',
            run: ({ expect, $, style }) => expect(style($('p a'), 'color'), 'Do not delete or weaken the rule for other sidebar links').toBe('rgb(37, 99, 235)'),
          },
          {
            name: 'No !important used',
            run: ({ expect, rules }) => {
              const important = rules.some((r) => [...r.style].some((prop) => r.style.getPropertyPriority(prop) === 'important'));
              expect(important, 'Solve it with specificity, not !important').toBe(false);
            },
          },
        ],
        hints: [
          'Compare the two selectors that set `color` on the Subscribe link. What is the specificity of each?',
          '`#sidebar a` is (1, 0, 1) and `.button` is (0, 1, 0). The button rule needs at least as much specificity as the sidebar rule, and to come later.',
          'Starting the selector with the same id gives `#sidebar .button`, which is (1, 1, 0).',
        ],
        solution: {
          css: `${ui}

#sidebar a {
  color: #2563eb;
}

#sidebar .button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #1e3a8a;
  color: white;
  text-decoration: none;
}
`,
        },
        explanation: '`#sidebar .button` (1, 1, 0) beats `#sidebar a` (1, 0, 1). The better long-term fix would be to remove the id from the first rule (`.sidebar a`), but here the HTML could not change. This is the typical cost of ids in CSS: they force everything else to use ids too.',
        takeaway: 'When a style "does not apply", find the competing rule in DevTools and compare specificity before adding anything.',
      },
    },
  ],
  keyPoints: [
    'Specificity = (ids, classes, elements), compared left to right.',
    'One id beats any number of classes; ids in CSS cause specificity wars.',
    'Avoid `!important`; use DevTools to find which rule wins and why.',
  ],
};

/* ───────────────────────── Lesson 3: The box model ───────────────────────── */

const boxModel = {
  slug: 'box-model',
  title: 'The box model: margin and padding',
  minutes: 20,
  summary: 'Every element is a box. How its size is calculated, and the one line that makes it predictable.',
  sections: [
    {
      kind: 'text',
      text: `Every element is a rectangular box with four layers, from the inside out:

1. **content**: the text or image
2. **padding**: space inside the box, around the content (the background shows here)
3. **border**
4. **margin**: space outside the box, between it and its neighbors (always transparent)

By default, \`width\` sets only the **content** width. Padding and border are **added** on top, so \`width: 200px; padding: 20px\` is 240px wide on screen. That surprises everyone.

\`box-sizing: border-box\` changes this: \`width\` then includes padding and border. Almost every project sets it for all elements, as this app does in \`css/base.css\`:

\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\``,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 160,
      html: '<div class="card">Card content</div><div class="card">Second card</div>',
      code: `.card {
  box-sizing: border-box;
  width: 240px;
  padding: 12px 16px;
  border: 2px solid #94a3b8;
  margin: 0 0 16px;
  background: #f1f5f9;
}`,
      notes: [
        { lines: [2, 3], text: 'With `border-box`, the card is exactly 240px wide, padding and border included.' },
        { lines: [4], text: 'Two values: top/bottom 12px, left/right 16px.' },
        { lines: [6], text: 'Three values: top 0, left/right 0, bottom 16px. The full order is **top right bottom left**: clockwise, starting at the top.' },
        { lines: [7], text: 'The background fills content and padding, but not the margin.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Padding versus margin', text: 'Need space **inside** the box, where the background shows? Padding. Space **between** boxes? Margin.' },
        { title: 'Collapsing margins', text: 'The vertical margins of two blocks above each other do not add up: `margin-bottom: 20px` and `margin-top: 30px` give a 30px gap, not 50px. Inside flex and grid containers this does not happen, which is one reason to prefer `gap` there.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.box.predict-width',
        type: 'predict',
        title: 'How wide is the box?',
        skills: ['css.box-model'],
        prompt: 'No `box-sizing` is set, so the default applies. How wide is this box on screen, from the outer edge of the left border to the outer edge of the right border?',
        language: 'css',
        code: `.box {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}`,
        expected: '250',
        accept: ['250px', '250 px'],
        answerLabel: 'Width in pixels',
        answerHelp: 'Just the number',
        hints: [
          'By default (`content-box`), `width` is only the content. What gets added on the left and on the right?',
          'Padding and border are added on **both** sides. The margin is outside the border, so it does not count here.',
        ],
        explanation: '200 (content) + 2 × 20 (padding) + 2 × 5 (border) = **250px**. The margin is outside the border, so it adds space around the box but not to its width. With `box-sizing: border-box` the answer would be 200.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.box.border-box',
        type: 'code',
        title: 'Two halves that fit',
        skills: ['css.box-model'],
        prompt: 'Each card has `width: 50%`, yet the second card wraps onto a new line. Make the two cards sit **side by side**, each exactly half of the 400px row, **keeping** the padding and the border.',
        files: ['css'],
        given: {
          html: `<div class="row">
  <div class="card">One</div><div class="card">Two</div>
</div>`,
        },
        starter: {
          css: `${ui}

.row {
  width: 400px;
  background: #eef1f6;
}

.card {
  display: inline-block;
  width: 50%;
  padding: 16px;
  border: 2px solid #94a3b8;
}
`,
        },
        tests: [
          {
            name: 'The cards sit side by side',
            run: ({ expect, $$ }) => {
              const [a, b] = $$('.card').map((c) => c.getBoundingClientRect());
              expect(Math.abs(a.top - b.top) < 1, 'The second card still wraps onto a new line').toBe(true);
            },
          },
          {
            name: 'Each card is exactly 200px wide',
            run: ({ expect, $$ }) => {
              const widths = $$('.card').map((c) => Math.round(c.getBoundingClientRect().width));
              expect(widths, 'Each card should be half of 400px, including padding and border').toEqual([200, 200]);
            },
          },
          {
            name: 'The padding and border are still there',
            run: ({ expect, $, style }) => {
              expect(style($('.card'), 'paddingLeft'), 'Keep padding: 16px').toBe('16px');
              expect(style($('.card'), 'borderLeftWidth'), 'Keep the 2px border').toBe('2px');
            },
          },
        ],
        hints: [
          'Calculate the real width of one card: 50% of 400px, plus padding on both sides, plus border on both sides.',
          'Each card is 200 + 32 + 4 = 236px, so two of them need 472px. Which property makes `width` include padding and border?',
          'Add `box-sizing: border-box;` to `.card`.',
        ],
        solution: {
          css: `${ui}

.row {
  width: 400px;
  background: #eef1f6;
}

.card {
  display: inline-block;
  box-sizing: border-box;
  width: 50%;
  padding: 16px;
  border: 2px solid #94a3b8;
}
`,
        },
        explanation: 'With the default `content-box`, each card was 200 + 32 + 4 = 236px wide, and two of them do not fit in 400px. With `border-box`, the 50% includes padding and border, so each card is exactly 200px.',
        takeaway: 'If a layout is a few pixels too wide, check `box-sizing` first. Most projects set `border-box` on every element.',
      },
    },
  ],
  keyPoints: [
    'Content → padding → border → margin.',
    'Default `width` is the content only; `box-sizing: border-box` makes it include padding and border.',
    'Shorthand order: top, right, bottom, left (clockwise).',
  ],
};

/* ───────────────────────── Lesson 4: Display and positioning ───────────────────────── */

const positioning = {
  slug: 'display-and-positioning',
  title: 'Display and positioning',
  minutes: 25,
  summary: 'Block versus inline, hiding elements, and placing elements with position.',
  sections: [
    {
      kind: 'text',
      text: `**\`display\`** decides how a box takes part in the layout:
- \`block\`: starts on a new line and takes the full available width (\`div\`, \`p\`, \`h1\`, \`section\`).
- \`inline\`: flows within text; \`width\`, \`height\` and vertical margins have no effect (\`a\`, \`span\`, \`strong\`).
- \`inline-block\`: flows within text, but accepts width, height and padding.
- \`none\`: removed completely, as if it were not there. (\`visibility: hidden\` hides it but keeps its space.)
- \`flex\` and \`grid\`: layout systems for the children, covered in the next lessons.

**\`position\`** moves a box away from its normal place:
- \`static\`: the default; normal flow.
- \`relative\`: stays in the flow; \`top\`/\`left\` nudge it from its normal place. Its most common use: becoming the **reference box** for absolutely positioned children.
- \`absolute\`: taken **out** of the flow and placed relative to the nearest ancestor that has a position other than \`static\`.
- \`fixed\`: placed relative to the browser window; it stays put while scrolling.
- \`sticky\`: scrolls normally until it reaches a given offset, then sticks (like this app's top bar).`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 150,
      html: `<article class="card">
  <span class="badge">New</span>
  <h2>Pumpkin soup</h2>
</article>`,
      code: `.card {
  position: relative;
  width: 220px;
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #16a34a;
  color: white;
}`,
      notes: [
        { lines: [2], text: '`position: relative` does not move the card. It makes the card the reference box for the badge.' },
        { lines: [10], text: 'The badge leaves the normal flow: the heading moves up as if the badge were not there.' },
        { lines: [11, 12], text: '8px from the top and right edges of the nearest positioned ancestor, which is the card.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Absolute without a positioned parent', text: 'If no ancestor has `position: relative` (or another non-static position), the element is placed relative to the whole page and ends up in a corner of the screen.' },
        { title: 'Using position for layout', text: 'Positioning every element absolutely breaks as soon as text or screen sizes change. Use normal flow, flexbox and grid for layout, and `absolute` only for small overlays like badges and tooltips.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.position.badge',
        type: 'code',
        title: 'Place a badge in the corner',
        skills: ['css.positioning'],
        prompt: 'Place the "New" badge in the **top-right corner** of the card, 8px from the top and right edges. The heading should not move down because of the badge.',
        files: ['css'],
        given: {
          html: `<article class="card">
  <span class="badge">New</span>
  <h2>Pumpkin soup</h2>
  <p>With roasted seeds.</p>
</article>`,
        },
        starter: {
          css: `${ui}

.card {
  width: 260px;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  font-size: 0.8rem;
}
`,
        },
        tests: [
          {
            name: 'The badge is in the top-right corner, 8px from the edges',
            run: ({ expect, $ }) => {
              const card = $('.card').getBoundingClientRect();
              const badge = $('.badge').getBoundingClientRect();
              // 8px from the inner edge of the 1px border
              expect(Math.abs(card.right - badge.right - 9) <= 1.5, `The badge is ${Math.round(card.right - badge.right)}px from the right edge`).toBe(true);
              expect(Math.abs(badge.top - card.top - 9) <= 1.5, `The badge is ${Math.round(badge.top - card.top)}px from the top edge`).toBe(true);
            },
          },
          {
            name: 'The badge is out of the normal flow',
            run: ({ expect, $, style }) => expect(style($('.badge'), 'position'), 'Use position: absolute for the badge').toBe('absolute'),
          },
          {
            name: 'The heading starts at the top of the card',
            run: ({ expect, $, style }) => {
              const card = $('.card').getBoundingClientRect();
              const h2 = $('h2');
              const marginTop = parseFloat(style(h2, 'marginTop'));
              expect(h2.getBoundingClientRect().top - marginTop - card.top <= 18, 'The heading should not be pushed down by the badge').toBe(true);
            },
          },
        ],
        pitfalls: [
          { file: 'css', pattern: /position\s*:\s*relative/, absent: true, message: 'Without `position: relative` on the card, the badge is placed relative to the **page**, not the card.' },
        ],
        hints: [
          'The badge must leave the normal flow, and be placed relative to the **card**.',
          'Two declarations work together: `position: absolute` on the child, and `position: relative` on the element it should be placed against.',
          'On the badge: `position: absolute; top: 8px; right: 8px;`. On the card: `position: relative;`.',
        ],
        solution: {
          css: `${ui}

.card {
  position: relative;
  width: 260px;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  font-size: 0.8rem;
}
`,
        },
        explanation: '`position: absolute` removes the badge from the flow, so the heading moves up. `top` and `right` are measured from the nearest positioned ancestor, and `position: relative` makes the card that ancestor.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.position.absolute-choice',
        type: 'choice',
        title: 'Where does it go?',
        skills: ['css.positioning'],
        prompt: 'An element has `position: absolute; top: 0; left: 0;`. Where does it end up?',
        options: [
          { text: 'In the top-left corner of its **nearest ancestor with a non-static position**, or of the page if there is none', correct: true, feedback: 'Yes. That ancestor is called the **containing block**. That is why the parent usually gets `position: relative`.' },
          { text: 'Always in the top-left corner of its parent', correct: false, feedback: 'Only if the parent is positioned. If it is not, the browser keeps looking further up the tree.' },
          { text: 'Always in the top-left corner of the browser window', correct: false, feedback: 'That is what `position: fixed` does.' },
          { text: 'Where it would normally be, because `top: 0` moves it 0px', correct: false, feedback: 'That would be true for `position: relative`. An absolute element is taken out of the flow and placed against its containing block.' },
        ],
        hints: ['Think about what the parent needed in the badge exercise.'],
      },
    },
  ],
  keyPoints: [
    '`block` takes the full width; `inline` flows in text; `none` removes the element.',
    '`absolute` is placed against the nearest positioned ancestor; give that parent `position: relative`.',
    'Use positioning for small overlays, and flexbox or grid for layout.',
  ],
};

/* ───────────────────────── Lesson 5: Flexbox ───────────────────────── */

const flexbox = {
  slug: 'flexbox',
  title: 'Flexbox',
  minutes: 25,
  summary: 'Arranging items in a row or column, with alignment and spacing.',
  sections: [
    {
      kind: 'text',
      text: `\`display: flex\` turns an element into a **flex container**. Its direct children become **flex items**, arranged in one direction: a row by default.

The main properties, all set on the **container**:
- \`flex-direction\`: \`row\` (default) or \`column\`. This sets the **main axis**.
- \`justify-content\`: alignment along the main axis: \`flex-start\`, \`center\`, \`space-between\`…
- \`align-items\`: alignment on the **cross axis** (vertical, in a row): \`stretch\` (default), \`center\`, \`flex-start\`…
- \`gap\`: space between items. No more margins on every item.
- \`flex-wrap: wrap\`: allow items to continue on a new line.

On an **item**, \`flex: 1\` makes it grow to fill the remaining space.

Flexbox is **one-dimensional**: it arranges items along one line. For rows **and** columns at once, use Grid (next lesson).`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 110,
      html: `<header class="bar">
  <strong>Café Lumen</strong>
  <nav class="links"><a href="#">Menu</a><a href="#">Visit</a></nav>
</header>`,
      code: `.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1f2937;
  color: white;
}

.links {
  display: flex;
  gap: 16px;
}

.links a { color: white; }`,
      notes: [
        { lines: [2], text: 'The header\'s two children, the name and the nav, become flex items in a row.' },
        { lines: [3], text: '`space-between`: the first item at the start, the last at the end, the space divided between them.' },
        { lines: [4], text: 'Vertically centers items of different heights.' },
        { lines: [10, 13], text: 'Flex containers can be nested: the nav is a flex item of the bar, **and** a flex container for its links.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Setting flex properties on the wrong element', text: '`justify-content` and `align-items` go on the **container**, the parent of the items you want to move. On the items themselves, they do nothing.' },
        { title: 'Mixing up the axes', text: 'With `flex-direction: column`, `justify-content` works vertically and `align-items` horizontally. The axes turn with the direction.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'sample.css.center',
        type: 'code',
        title: 'Center a card',
        skills: ['css.flexbox', 'css.layout'],
        prompt: 'Center the card **horizontally and vertically** inside `.page`. The card should stay only as wide as its content. Look at the provided HTML tab to see the structure.',
        files: ['css'],
        given: {
          html: `<div class="page">
      <div class="card">I should be in the middle</div>
    </div>`,
        },
        starter: {
          css: `body { margin: 0; font-family: system-ui, sans-serif; }

    .page {
      min-height: 300px;
      background: #eef1f6;
      /* center the card here */
    }

    .card {
      padding: 1.5rem 2rem;
      background: white;
      border-radius: 10px;
    }
    `,
        },
        tests: [
          {
            name: 'The card is only as wide as its content',
            run: ({ expect, $ }) => {
              const page = $('.page').getBoundingClientRect();
              const card = $('.card').getBoundingClientRect();
              expect(card.width < page.width * 0.8, 'The card still stretches across the page').toBeTruthy();
            },
          },
          {
            name: 'The card is centered horizontally',
            run: ({ expect, $ }) => {
              const page = $('.page').getBoundingClientRect();
              const card = $('.card').getBoundingClientRect();
              const offset = Math.abs((page.left + page.width / 2) - (card.left + card.width / 2));
              expect(offset < 2, `The card is ${Math.round(offset)}px away from the horizontal center`).toBeTruthy();
            },
          },
          {
            name: 'The card is centered vertically',
            run: ({ expect, $ }) => {
              const page = $('.page').getBoundingClientRect();
              const card = $('.card').getBoundingClientRect();
              const offset = Math.abs((page.top + page.height / 2) - (card.top + card.height / 2));
              expect(offset < 2, `The card is ${Math.round(offset)}px away from the vertical center`).toBeTruthy();
            },
          },
          {
            name: 'The page is still at least 300px tall',
            run: ({ expect, $ }) => expect($('.page').getBoundingClientRect().height >= 299, 'Keep min-height: 300px on .page').toBeTruthy(),
          },
        ],
        pitfalls: [
          {
            file: 'css',
            pattern: /text-align\s*:\s*center/,
            message: '`text-align: center` centers the **text inside** an element, not the element itself.',
          },
          {
            file: 'css',
            pattern: /margin\s*:\s*(0\s+)?auto/,
            message: '`margin: auto` centers a block horizontally, but in normal flow it cannot center vertically. To center in both directions, make the **parent** a flex or grid container.',
          },
        ],
        hints: [
          'The centering rules belong on the **parent** (`.page`), not on the card.',
          'With `display: flex` on the parent, `justify-content` aligns children along the main axis (horizontal by default) and `align-items` aligns them on the cross axis (vertical).',
          'Three declarations in `.page`: `display: flex;` and one property for each direction.',
        ],
        solution: {
          css: `body { margin: 0; font-family: system-ui, sans-serif; }

    .page {
      min-height: 300px;
      background: #eef1f6;
      display: flex;
      justify-content: center; /* horizontal */
      align-items: center;     /* vertical */
    }

    .card {
      padding: 1.5rem 2rem;
      background: white;
      border-radius: 10px;
    }
    `,
        },
        explanation: 'A flex container places its children side by side and can align them in both directions. The card also stops stretching to the full width, because flex items are only as wide as their content by default. `display: grid; place-items: center;` would work too.',
        takeaway: 'To position something, style its **parent**. Centering is a job for flexbox or grid on the container.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.flex.navbar',
        type: 'code',
        title: 'Build a navigation bar',
        skills: ['css.flexbox', 'css.layout'],
        prompt: `Turn the header into a navigation bar:

- The logo on the **left**, the navigation on the **right**, both **vertically centered**.
- The three links **in a row**, with **1rem (16px)** between them, and no bullet points.`,
        files: ['css'],
        given: {
          html: `<header class="site-header">
  <a class="logo" href="#">Café Lumen</a>
  <nav>
    <ul class="nav-list">
      <li><a href="#">Menu</a></li>
      <li><a href="#">Visit</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
</header>`,
        },
        starter: {
          css: `body { margin: 0; font-family: system-ui, sans-serif; }

.site-header {
  padding: 1rem 1.5rem;
  background: #1f2937;
}

.site-header a {
  color: white;
  text-decoration: none;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-list {
  margin: 0;
  padding: 0;
}
`,
        },
        tests: [
          {
            name: 'The logo is on the left and the nav on the right',
            run: ({ expect, $ }) => {
              const header = $('.site-header').getBoundingClientRect();
              const logo = $('.logo').getBoundingClientRect();
              const nav = $('nav').getBoundingClientRect();
              expect(logo.left - header.left < 30, 'The logo should be at the left').toBe(true);
              expect(header.right - nav.right < 30, 'The nav should be at the right').toBe(true);
            },
          },
          {
            name: 'Logo and nav are vertically centered with each other',
            run: ({ expect, $ }) => {
              const logo = $('.logo').getBoundingClientRect();
              const nav = $('nav').getBoundingClientRect();
              const offset = Math.abs((logo.top + logo.height / 2) - (nav.top + nav.height / 2));
              expect(offset < 2, `Their centers are ${Math.round(offset)}px apart`).toBe(true);
            },
          },
          {
            name: 'The links are in one row',
            run: ({ expect, $$ }) => {
              const tops = $$('.nav-list li').map((li) => Math.round(li.getBoundingClientRect().top));
              expect(new Set(tops).size, 'The list items should sit next to each other').toBe(1);
            },
          },
          {
            name: 'There is 16px between the links',
            run: ({ expect, $$ }) => {
              const [first, second] = $$('.nav-list li').map((li) => li.getBoundingClientRect());
              const space = Math.round(second.left - first.right);
              expect(space, 'Use gap: 1rem on the list').toBe(16);
            },
          },
          {
            name: 'No bullet points',
            run: ({ expect, $, style }) => expect(style($('.nav-list'), 'listStyleType'), 'Use list-style: none on the list').toBe('none'),
          },
        ],
        hints: [
          'There are two containers here: the header (logo + nav) and the list (three links). Each needs its own flex rules.',
          'Header: `display: flex`, plus one property to push the children apart and one to center them vertically. List: `display: flex` and `gap`. Bullets come from `list-style`.',
          '`.site-header { display: flex; justify-content: space-between; align-items: center; }` Now do the same thinking for `.nav-list`.',
        ],
        solution: {
          css: `body { margin: 0; font-family: system-ui, sans-serif; }

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1f2937;
}

.site-header a {
  color: white;
  text-decoration: none;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-list {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
`,
        },
        explanation: 'The header is a flex container for the logo and the nav, and the list is a flex container for the list items. `gap` puts space only **between** items, never before the first or after the last.',
        takeaway: 'For each layout problem, first ask: which element is the container, and which elements are its items?',
      },
    },
  ],
  keyPoints: [
    'Flex properties like `justify-content`, `align-items` and `gap` go on the container.',
    '`justify-content` follows the main axis; `align-items` the cross axis.',
    'Use `gap` for spacing between items.',
  ],
};

/* ───────────────────────── Lesson 6: CSS Grid ───────────────────────── */

const grid = {
  slug: 'grid',
  title: 'CSS Grid',
  minutes: 25,
  summary: 'Two-dimensional layouts with columns, rows and responsive card grids.',
  sections: [
    {
      kind: 'text',
      text: `\`display: grid\` lays children out in **rows and columns at the same time**. You define the columns, and items fill the cells in order.

- \`grid-template-columns: 200px 1fr 1fr\`: three columns; \`fr\` is a **fraction of the remaining space**.
- \`repeat(3, 1fr)\`: three equal columns.
- \`gap: 16px\`: space between rows and columns.
- On an item, \`grid-column: span 2\` makes it two columns wide.

A powerful pattern needs no media queries:
\`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))\` means "as many columns as fit, each at least 200px wide, sharing the rest of the space equally".

**Flexbox or Grid?** Flexbox for a line of items whose size comes from their content (a nav bar, a row of buttons). Grid when you think in columns and rows (a card grid, a page layout).`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 220,
      html: `<div class="cards">
  <div class="card">Espresso</div><div class="card">Flat white</div>
  <div class="card">Chai latte</div><div class="card">Hot chocolate</div>
  <div class="card">Matcha</div>
</div>`,
      code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.card {
  padding: 16px;
  border-radius: 8px;
  background: #e0e7ff;
}`,
      notes: [
        { lines: [2], text: 'The container becomes a grid. The cards are its items.' },
        { lines: [3], text: 'As many columns as fit, each at least 140px. Make the window narrower and the number of columns changes, with no media query.' },
        { lines: [4], text: 'One value for both the row gap and the column gap.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Using percentages with gap', text: '`repeat(3, 33.33%)` plus a gap overflows, because the gap is added to 100%. `fr` units share only the space that is **left** after the gaps.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.grid.featured',
        type: 'code',
        title: 'A grid with a featured card',
        skills: ['css.grid', 'css.layout'],
        prompt: 'Lay out the cards in **three equal columns** with a **16px gap**. The featured card spans **two columns**.',
        files: ['css'],
        given: {
          html: `<div class="grid">
  <article class="card featured">Seasonal special</article>
  <article class="card">Espresso</article>
  <article class="card">Flat white</article>
  <article class="card">Chai latte</article>
  <article class="card">Hot chocolate</article>
</div>`,
        },
        starter: {
          css: `${ui}

.grid {
  width: 600px;
}

.card {
  padding: 1rem;
  border-radius: 8px;
  background: #e0e7ff;
}

.featured {
  background: #c7d2fe;
}
`,
        },
        tests: [
          {
            name: 'The normal cards are equal thirds',
            run: ({ expect, $$ }) => {
              const widths = $$('.card:not(.featured)').map((c) => c.getBoundingClientRect().width);
              const expected = (600 - 32) / 3;
              expect(widths.every((w) => Math.abs(w - expected) < 1.5), `Expected about ${Math.round(expected)}px each, got ${widths.map(Math.round).join(', ')}`).toBe(true);
            },
          },
          {
            name: 'The featured card spans two columns',
            run: ({ expect, $ }) => {
              const width = $('.featured').getBoundingClientRect().width;
              const expected = ((600 - 32) / 3) * 2 + 16;
              expect(Math.abs(width - expected) < 1.5, `Expected about ${Math.round(expected)}px, got ${Math.round(width)}px`).toBe(true);
            },
          },
          {
            name: 'The first row is the featured card and Espresso',
            run: ({ expect, $$ }) => {
              const tops = $$('.card').map((c) => Math.round(c.getBoundingClientRect().top));
              expect(tops[0] === tops[1] && tops[2] > tops[0], 'Featured + Espresso on row 1, the rest on row 2').toBe(true);
            },
          },
          {
            name: 'There is a 16px gap between columns and rows',
            run: ({ expect, $$ }) => {
              const cards = $$('.card').map((c) => c.getBoundingClientRect());
              expect(Math.round(cards[3].left - cards[2].right), 'Column gap').toBe(16);
              expect(Math.round(cards[2].top - cards[0].bottom), 'Row gap').toBe(16);
            },
          },
        ],
        hints: [
          'The container needs `display: grid`, the column definition and a gap. The featured card needs one extra declaration of its own.',
          '`repeat(3, 1fr)` gives three equal columns that respect the gap. `grid-column: span 2` makes an item two columns wide.',
          '`.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }`',
        ],
        solution: {
          css: `${ui}

.grid {
  width: 600px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  padding: 1rem;
  border-radius: 8px;
  background: #e0e7ff;
}

.featured {
  grid-column: span 2;
  background: #c7d2fe;
}
`,
        },
        explanation: 'The two gaps (32px) are taken off first, then the remaining 568px is split into three equal `1fr` columns of about 189px. The featured card covers two columns plus the gap between them.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.grid.auto-fill',
        type: 'predict',
        title: 'How many columns?',
        skills: ['css.grid'],
        prompt: 'The container is **700px** wide. How many columns does this grid have?',
        language: 'css',
        code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}`,
        expected: '3',
        answerLabel: 'Number of columns',
        answerHelp: 'Just the number',
        hints: [
          'Each column must be at least 200px, and there is a 20px gap between columns.',
          'Try 4 columns: 4 × 200 + 3 × 20 = 860px. Does that fit in 700px? Now try 3.',
        ],
        explanation: '3 columns need 3 × 200 + 2 × 20 = 640px, which fits. 4 would need 860px. The `1fr` then grows each of the 3 columns to share the leftover space: (700 − 40) / 3 = 220px each.',
      },
    },
  ],
  keyPoints: [
    'Grid is two-dimensional: columns and rows.',
    '`fr` shares the space that is left after gaps; `repeat()` avoids repetition.',
    '`repeat(auto-fill, minmax(…, 1fr))` makes a responsive grid without media queries.',
  ],
};

/* ───────────────────────── Lesson 7: Responsive design ───────────────────────── */

const responsive = {
  slug: 'responsive-design',
  title: 'Responsive design and media queries',
  minutes: 20,
  summary: 'One page that works from a phone to a wide screen, built mobile-first.',
  sections: [
    {
      kind: 'text',
      text: `A responsive page adapts to the screen size. The building blocks:

1. The **viewport meta tag** (Module 1), without which phones pretend to be desktops.
2. **Flexible sizes**: percentages, \`fr\`, \`max-width\` instead of fixed \`width\`, and \`img { max-width: 100%; }\`.
3. **Media queries**: rules that apply only under a condition:

\`\`\`css
@media (min-width: 700px) {
  .layout { display: flex; }
}
\`\`\`

**Mobile-first** means: write the base styles for small screens (often just stacked blocks), then use \`min-width\` queries to **add** layout as space allows. This tends to need less code than starting from desktop and undoing things with \`max-width\` queries.

Choose breakpoints where **your content** starts to look wrong, not by device names. Devices change every year.`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 170,
      html: `<div class="layout">
  <main>Main content</main>
  <aside>Sidebar</aside>
</div>`,
      code: `main, aside {
  padding: 12px;
  background: #e0e7ff;
}

aside {
  margin-top: 12px;
  background: #fef3c7;
}

@media (min-width: 500px) {
  .layout {
    display: flex;
    gap: 12px;
  }

  main { flex: 1; }

  aside {
    width: 160px;
    margin-top: 0;
  }
}`,
      notes: [
        { lines: [1, 9], text: 'The base styles: the blocks are simply stacked, which works on every screen.' },
        { lines: [11], text: 'From 500px wide and up, these extra rules apply.' },
        { lines: [12, 15], text: 'Side by side when there is room. (The preview is probably wider than 500px. Use "Try it in Code mode" and resize the window to see it switch.)' },
        { lines: [19, 22], text: 'The query can also undo a base style, here the margin that was only needed when stacked.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: 'Fixed widths', text: '`width: 960px` forces horizontal scrolling on phones. Use `max-width: 960px` with `width: 100%`, or a flexible layout.' },
        { title: 'Testing only at your own screen size', text: 'Use DevTools\' device toolbar (Ctrl+Shift+M) and drag the width from 320px up to wide. Look for overflowing text, squashed columns and horizontal scrolling.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.responsive.mobile-first',
        type: 'code',
        title: 'Make a layout mobile-first',
        skills: ['css.responsive', 'css.media-queries'],
        prompt: `This layout is always side by side, which is cramped on phones. Make it **mobile-first**:

- By default (small screens), \`main\` and \`aside\` are **stacked**.
- From a width of **700px** and up, they are side by side, with the aside 250px wide.

Use a \`min-width\` media query.`,
        files: ['css'],
        given: {
          html: `<div class="layout">
  <main>Main content: articles, photos and more.</main>
  <aside>Opening hours and address.</aside>
</div>`,
        },
        starter: {
          css: `${ui}

.layout {
  display: flex;
  gap: 1rem;
}

main {
  flex: 1;
  padding: 1rem;
  background: #e0e7ff;
}

aside {
  width: 250px;
  padding: 1rem;
  background: #fef3c7;
}
`,
        },
        tests: [
          {
            name: 'The base rule for .layout does not use flex',
            run: ({ expect, rules }) => {
              const base = rules.filter((r) => !r.media && r.selector.includes('.layout'));
              expect(base.some((r) => r.style.display === 'flex'), 'Move display: flex into the media query').toBe(false);
            },
          },
          {
            name: 'A min-width: 700px media query makes .layout flex',
            run: ({ expect, rules }) => {
              const inQuery = rules.filter((r) => r.media && /min-width:\s*700px/.test(r.media) && r.selector.includes('.layout'));
              expect(inQuery.some((r) => r.style.display === 'flex'), 'Add @media (min-width: 700px) { .layout { display: flex; … } }').toBe(true);
            },
          },
          {
            name: 'The aside is only 250px wide inside the media query',
            run: ({ expect, rules }) => {
              const baseWidth = rules.some((r) => !r.media && r.selector.includes('aside') && r.style.width === '250px');
              const queryWidth = rules.some((r) => r.media && /min-width:\s*700px/.test(r.media) && r.selector.includes('aside') && r.style.width === '250px');
              expect(!baseWidth && queryWidth, 'On small screens the aside should take the full width').toBe(true);
            },
          },
          {
            name: 'The page shows the right layout at the current width',
            run: ({ expect, $ }) => {
              const main = $('main').getBoundingClientRect();
              const aside = $('aside').getBoundingClientRect();
              const sideBySide = Math.abs(main.top - aside.top) < 1;
              expect(sideBySide, `At ${window.innerWidth}px wide, the layout should be ${window.innerWidth >= 700 ? 'side by side' : 'stacked'}`).toBe(window.innerWidth >= 700);
            },
          },
        ],
        hints: [
          'Mobile-first: the rules outside a media query are for small screens. What should they NOT contain?',
          'Move the side-by-side parts (`display: flex` on the layout, `width: 250px` on the aside) into `@media (min-width: 700px) { … }`.',
          `The structure:
\`\`\`css
@media (min-width: 700px) {
  .layout { display: flex; gap: 1rem; }
  aside { width: 250px; }
}
\`\`\``,
        ],
        solution: {
          css: `${ui}

main {
  padding: 1rem;
  background: #e0e7ff;
}

aside {
  padding: 1rem;
  background: #fef3c7;
}

@media (min-width: 700px) {
  .layout {
    display: flex;
    gap: 1rem;
  }

  main {
    flex: 1;
  }

  aside {
    width: 250px;
  }
}
`,
        },
        explanation: 'Small screens get the simple stacked layout, with no extra rules. From 700px up, the media query adds the flex layout. Open it in Code mode and make the window narrower and wider to watch it switch.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.responsive.viewport',
        type: 'choice',
        title: 'Why is it still zoomed out?',
        skills: ['css.responsive', 'html.document-structure'],
        prompt: 'A page has correct mobile-first CSS with media queries, but on a real phone it still shows the tiny desktop layout, zoomed out. What is the most likely cause?',
        options: [
          { text: 'The `<meta name="viewport" content="width=device-width, initial-scale=1">` tag is missing', correct: true, feedback: 'Yes. Without it, phones pretend to be about 980px wide, so your `min-width` queries match as if on a desktop.' },
          { text: 'Media queries do not work on phones', correct: false, feedback: 'They do. The phone is reporting the wrong width to them.' },
          { text: 'The breakpoint should be in em instead of px', correct: false, feedback: 'Units can matter for zoomed text, but they would not cause a zoomed-out desktop layout.' },
          { text: 'The CSS file is cached', correct: false, feedback: 'Possible in general, but then the page would show the old styles, not a consistently zoomed-out layout.' },
        ],
        hints: ['Module 1, lesson 1: which head tag was about phones?'],
      },
    },
  ],
  keyPoints: [
    'Responsive = viewport meta tag + flexible sizes + media queries.',
    'Mobile-first: base styles for small screens, `min-width` queries add layout.',
    'Choose breakpoints where the content breaks, not by device.',
  ],
};

/* ───────────────────────── Lesson 8: Custom properties ───────────────────────── */

const customProperties = {
  slug: 'custom-properties',
  title: 'Custom properties (CSS variables)',
  minutes: 15,
  summary: 'Name a value once, use it everywhere, and change it in one place.',
  sections: [
    {
      kind: 'text',
      text: `A **custom property** stores a value under a name that starts with two dashes. You read it with \`var()\`:

\`\`\`css
:root {
  --brand: #0f766e;
}

.button {
  background: var(--brand);
}
\`\`\`

\`:root\` is the \`<html>\` element. Custom properties are **inherited**, so values defined there are available everywhere.

Why they matter:
- Change the brand color in **one** place instead of searching through 40 rules.
- A child element can **override** the value for its own part of the page.
- They exist **at runtime**: media queries and JavaScript can change them. This app's light and dark themes are just two sets of custom properties (see \`css/tokens.css\`).

\`var(--name, fallback)\` uses the fallback if the property is not defined.`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 120,
      html: `<button class="button">Default</button>
<div class="danger-zone"><button class="button">Delete</button></div>`,
      code: `:root {
  --brand: #0f766e;
  --radius: 6px;
}

.button {
  padding: 8px 14px;
  border: 0;
  border-radius: var(--radius);
  background: var(--brand);
  color: white;
}

.danger-zone {
  --brand: #b91c1c;
}`,
      notes: [
        { lines: [1, 4], text: 'Defined once, on the root element.' },
        { lines: [9, 10], text: '`var()` reads the value. The button rule does not know or care what the brand color is.' },
        { lines: [14, 16], text: 'Overrides `--brand` for everything **inside** `.danger-zone`. The same button rule now produces a red button there.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.vars.refactor',
        type: 'code',
        title: 'Replace repeated colors with variables',
        skills: ['css.custom-properties', 'css.maintainability'],
        prompt: `The brand color \`#0f766e\` and its light version \`#f0fdfa\` are repeated in several rules. Refactor:

- Define \`--brand: #0f766e\` and \`--brand-soft: #f0fdfa\` on \`:root\`.
- Use \`var(--brand)\` and \`var(--brand-soft)\` everywhere instead of the hex values.

The page should look exactly the same afterwards.`,
        files: ['css'],
        given: {
          html: `<section class="promo">
  <h2>Autumn menu</h2>
  <p>Now with <a href="#">pumpkin soup</a>.</p>
  <button class="cta">Book a table</button>
</section>`,
        },
        starter: {
          css: `${ui}

.promo {
  padding: 1.5rem;
  border: 2px solid #0f766e;
  border-radius: 12px;
  background: #f0fdfa;
}

.promo h2 {
  color: #0f766e;
}

.promo a {
  color: #0f766e;
}

.cta {
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 6px;
  background: #0f766e;
  color: #f0fdfa;
}
`,
        },
        tests: [
          {
            name: '--brand and --brand-soft are defined on :root',
            run: ({ expect, style }) => {
              const root = getComputedStyle(document.documentElement);
              expect(root.getPropertyValue('--brand').trim().toLowerCase(), 'Define --brand: #0f766e; on :root').toBe('#0f766e');
              expect(root.getPropertyValue('--brand-soft').trim().toLowerCase(), 'Define --brand-soft: #f0fdfa; on :root').toBe('#f0fdfa');
            },
          },
          {
            name: 'The page still looks the same',
            run: ({ expect, $, style }) => {
              expect(style($('.promo h2'), 'color')).toBe('rgb(15, 118, 110)');
              expect(style($('.cta'), 'backgroundColor')).toBe('rgb(15, 118, 110)');
              expect(style($('.promo'), 'backgroundColor')).toBe('rgb(240, 253, 250)');
            },
          },
          {
            name: 'No hex color is repeated outside :root',
            run: ({ expect, rules }) => {
              const literal = rules.filter((r) => r.selector !== ':root' && /rgb\(15, 118, 110\)|rgb\(240, 253, 250\)/.test(r.style.cssText));
              expect(literal.map((r) => r.selector).join(', '), 'These rules still contain the hex value instead of var()').toBe('');
            },
          },
          {
            name: 'Changing --brand changes every brand-colored element',
            run: ({ expect, $, style }) => {
              document.documentElement.style.setProperty('--brand', 'rgb(200, 0, 0)');
              const changed = [style($('.promo h2'), 'color'), style($('.promo a'), 'color'), style($('.cta'), 'backgroundColor'), style($('.promo'), 'borderTopColor')];
              document.documentElement.style.removeProperty('--brand');
              expect(changed.every((c) => c === 'rgb(200, 0, 0)'), 'Some rule does not use var(--brand) yet').toBe(true);
            },
          },
        ],
        hints: [
          'First add a `:root { … }` rule at the top. Then go through the rules one by one and replace each hex value.',
          'Every `#0f766e` becomes `var(--brand)`, every `#f0fdfa` becomes `var(--brand-soft)`. Do not forget the border.',
          '`border: 2px solid var(--brand);` A variable can be part of a shorthand value.',
        ],
        solution: {
          css: `${ui}

:root {
  --brand: #0f766e;
  --brand-soft: #f0fdfa;
}

.promo {
  padding: 1.5rem;
  border: 2px solid var(--brand);
  border-radius: 12px;
  background: var(--brand-soft);
}

.promo h2 {
  color: var(--brand);
}

.promo a {
  color: var(--brand);
}

.cta {
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 6px;
  background: var(--brand);
  color: var(--brand-soft);
}
`,
        },
        explanation: 'The last check changed `--brand` to red at runtime, and every element followed. That is exactly how themes work, including dark mode in this app.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.vars.predict',
        type: 'predict',
        title: 'Which value applies?',
        skills: ['css.custom-properties', 'css.cascade'],
        prompt: 'The HTML is `<div class="card"><button class="button">A</button></div>` followed by `<button class="button">B</button>`. What color is the text of each button?',
        language: 'css',
        code: `:root {
  --accent: blue;
}

.card {
  --accent: green;
}

.button {
  color: var(--accent);
}`,
        expected: 'green\nblue',
        answerLabel: 'The color of button A, then of button B (one per line)',
        answerHelp: 'Just the color names',
        hints: [
          'Custom properties are inherited, like `color`. Which ancestors does each button have?',
          'Button A is inside `.card`, which sets its own `--accent`. Button B is not.',
        ],
        explanation: '`var(--accent)` reads the value the element **inherits**. Button A inherits `green` from `.card`, the nearest ancestor that defines it. Button B only has `:root` above it, so it gets `blue`.',
      },
    },
  ],
  keyPoints: [
    'Define custom properties with `--name`, read them with `var(--name)`.',
    'They inherit, so values on `:root` are available everywhere, and a parent can override them.',
    'They live at runtime: the basis of themes like light and dark mode.',
  ],
};

/* ───────────────────────── Lesson 9: Pseudo-classes and pseudo-elements ───────────────────────── */

const pseudo = {
  slug: 'pseudo-classes-and-elements',
  title: 'Pseudo-classes and pseudo-elements',
  minutes: 20,
  summary: 'Styling states like hover and focus, and parts of elements like ::before.',
  sections: [
    {
      kind: 'text',
      text: `A **pseudo-class** (one colon) selects an element in a certain **state** or **position**:
- States: \`:hover\`, \`:focus\`, \`:focus-visible\` (focus from the keyboard), \`:active\`, \`:checked\`, \`:disabled\`, \`:invalid\`
- Position: \`:first-child\`, \`:last-child\`, \`:nth-child(odd)\`, \`:nth-child(3n)\`
- Logic: \`:not(.active)\`

A **pseudo-element** (two colons) styles a **part** of an element, or adds generated content:
- \`::before\` and \`::after\` insert content before or after the element's content. They need the \`content\` property, or they do not appear at all.
- \`::placeholder\`, \`::marker\` (list bullets), \`::selection\`.

Use \`:focus-visible\` rather than \`:focus\` for custom focus styles: it shows for keyboard users without showing an outline on every mouse click.`,
    },
    {
      kind: 'example',
      language: 'css',
      preview: true,
      previewHeight: 150,
      html: `<label class="required" for="n">Name</label>
<input id="n">
<button>Save</button>`,
      code: `button {
  padding: 6px 14px;
  background: #e2e8f0;
}

button:hover {
  background: #cbd5e1;
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

.required::after {
  content: " *";
  color: #dc2626;
}`,
      notes: [
        { lines: [6, 8], text: 'Applies only while the mouse is over the button.' },
        { lines: [10, 14], text: 'A clear focus style for keyboard users. Press Tab in the preview to see it.' },
        { lines: [16, 19], text: 'Adds a red asterisk after the label text, without changing the HTML. Without `content`, nothing would appear.' },
      ],
    },
    {
      kind: 'mistakes',
      items: [
        { title: '::before or ::after without content', text: 'A pseudo-element without `content` is not generated at all. Even for a purely decorative box, write `content: ""`.' },
        { title: 'Information only in generated content', text: 'Screen readers do not consistently read `::before` and `::after` text. Use them for decoration, not for important information.' },
      ],
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.pseudo.form',
        type: 'code',
        title: 'States and generated content',
        skills: ['css.pseudo', 'html.accessibility'],
        prompt: `Using pseudo-classes and pseudo-elements only (no HTML changes):

- Add a red asterisk after every label with class \`required\`: content \`" *"\`, color \`#dc2626\`.
- Give inputs and buttons a visible keyboard focus style: \`outline: 3px solid #2563eb\` on \`:focus-visible\`.
- Give every **odd** item in the list the background \`#f3f4f6\` (zebra stripes).`,
        files: ['css'],
        given: {
          html: `<form>
  <label class="required" for="name">Name</label>
  <input id="name" required>
  <label for="phone">Phone</label>
  <input id="phone">
  <button>Send</button>
</form>
<ul class="list">
  <li>Espresso</li>
  <li>Flat white</li>
  <li>Chai latte</li>
  <li>Hot chocolate</li>
</ul>`,
        },
        starter: {
          css: `${ui}

form { display: grid; gap: 0.25rem; max-width: 280px; }
input, button { font: inherit; padding: 0.4rem; }
.list { list-style: none; padding: 0; max-width: 280px; }
.list li { padding: 0.4rem 0.6rem; }

/* your rules here */
`,
        },
        tests: [
          {
            name: 'Required labels get " *" after them',
            run: ({ expect, $, style }) => expect(style($('.required'), 'content', '::after'), 'Use .required::after with content: " *"').toBe('" *"'),
          },
          {
            name: 'The asterisk is red (#dc2626)',
            run: ({ expect, $, style }) => expect(style($('.required'), 'color', '::after'), 'Set color on the ::after, not on the label').toBe('rgb(220, 38, 38)'),
          },
          {
            name: 'The label text itself keeps its color',
            run: ({ expect, $, style }) => expect(style($('.required'), 'color')).toBe('rgb(0, 0, 0)'),
          },
          {
            name: 'Inputs and buttons have a 3px solid focus-visible outline',
            run: ({ expect, rules }) => {
              const focusRules = rules.filter((r) => r.selector.includes(':focus-visible'));
              const covers = (tag) => focusRules.some((r) => r.selector.includes(tag) && r.style.outlineStyle === 'solid' && r.style.outlineWidth === '3px');
              expect(covers('input') && covers('button'), 'Write a :focus-visible rule for input and button with outline: 3px solid #2563eb').toBe(true);
            },
          },
          {
            name: 'Odd list items are gray, even ones are not',
            run: ({ expect, $$, style }) => {
              const colors = $$('.list li').map((li) => style(li, 'backgroundColor'));
              expect(colors, 'Use .list li:nth-child(odd)').toEqual(['rgb(243, 244, 246)', 'rgba(0, 0, 0, 0)', 'rgb(243, 244, 246)', 'rgba(0, 0, 0, 0)']);
            },
          },
        ],
        hints: [
          'Three rules, three different tools: a pseudo-element, a state pseudo-class and a position pseudo-class.',
          '`.required::after { content: …; color: …; }`, then `input:focus-visible, button:focus-visible { … }`, then `.list li:nth-child(…)`.',
          'The content value needs quotes: `content: " *";`. Zebra stripes: `:nth-child(odd)`.',
        ],
        solution: {
          css: `${ui}

form { display: grid; gap: 0.25rem; max-width: 280px; }
input, button { font: inherit; padding: 0.4rem; }
.list { list-style: none; padding: 0; max-width: 280px; }
.list li { padding: 0.4rem 0.6rem; }

.required::after {
  content: " *";
  color: #dc2626;
}

input:focus-visible,
button:focus-visible {
  outline: 3px solid #2563eb;
}

.list li:nth-child(odd) {
  background: #f3f4f6;
}
`,
        },
        explanation: 'Click into the preview and press Tab to see the focus outline move. With a mouse click the outline does not appear for the button: that is the difference between `:focus-visible` and `:focus`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'css.pseudo.content-choice',
        type: 'choice',
        title: 'The missing price label',
        skills: ['css.pseudo', 'debug.css'],
        prompt: 'This rule should show "incl. VAT" after every price, but nothing appears. Why?',
        language: 'css',
        code: `.price::after {
  color: #6b7280;
  font-size: 0.8em;
  margin-left: 4px;
}`,
        options: [
          { text: 'The `content` property is missing, so the pseudo-element is not created', correct: true, feedback: 'Yes. `::before` and `::after` only exist when they have `content`. Add `content: "incl. VAT";`.' },
          { text: '`::after` needs one colon: `:after`', correct: false, feedback: 'Browsers accept both. The double colon is the modern way to write pseudo-elements.' },
          { text: 'Pseudo-elements do not work on `<span>` elements', correct: false, feedback: 'They work on most elements. Exceptions are elements without content, like `<img>` and `<input>`.' },
          { text: 'The color is too light to see', correct: false, feedback: 'A gray text would still be visible. Here nothing is generated at all.' },
        ],
        hints: ['What is the one property every `::before` and `::after` needs?'],
      },
    },
  ],
  keyPoints: [
    'Pseudo-classes (`:hover`, `:focus-visible`, `:nth-child`) select states and positions.',
    'Pseudo-elements (`::before`, `::after`) style parts or add content, and need `content`.',
    'Style `:focus-visible` for keyboard users; never just remove the outline.',
  ],
};

export const cssLessons = [
  selectors,
  specificity,
  boxModel,
  positioning,
  flexbox,
  grid,
  responsive,
  customProperties,
  pseudo,
];
