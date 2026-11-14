/*
 * highlighter.js — syntax highlighting for HTML, CSS and JavaScript, with no libraries.
 *
 * How it works, in two steps:
 *
 * 1. TOKENIZE: cut the code into small labelled pieces ("tokens").
 *      const x = 42;   →   [keyword "const"] [space " "] [plain "x"] [space " "]
 *                          [operator "="] [space " "] [number "42"] [punctuation ";"]
 *
 * 2. RENDER: wrap each piece in <span class="tok-TYPE">, which CSS colors (css/syntax.css).
 *
 * Important property: the tokens always add up to EXACTLY the original text,
 * character for character. The editor relies on this (the colored copy must line
 * up with what you typed), and so does the loop guard (js/services/loop-guard.js).
 *
 * This is a "good enough" highlighter for learning code, not a full parser:
 * a few rare edge cases may be colored imperfectly, but no text is ever lost.
 */

/* ════════════════════════ JavaScript ════════════════════════ */

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'break', 'continue', 'switch', 'case', 'default', 'new', 'delete', 'typeof',
  'instanceof', 'in', 'of', 'class', 'extends', 'super', 'import', 'export', 'from',
  'as', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'yield', 'void', 'static',
]);

const JS_LITERALS = new Set(['true', 'false', 'null', 'undefined', 'this', 'NaN', 'Infinity']);

/*
 * The rules are tried in order at the current position. The `y` ("sticky") flag
 * makes a regex match ONLY at regex.lastIndex — exactly what a tokenizer needs.
 */
const JS_RULES = [
  ['space', /\s+/y],
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', /'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?|`(?:\\[\s\S]|[^`\\])*`?/y],
  ['number', /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/y],
  ['word', /[A-Za-z_$][\w$]*/y],
  ['operator', /=>|\.\.\.|\?\.|\?\?=?|[=!]==?|\+\+|--|\*\*=?|&&=?|\|\|=?|<<=?|>>>?=?|[<>]=?|[-+*/%&|^]=?|[~!?:=]/y],
  ['punctuation', /[{}()[\];,.]/y],
];

// A regular-expression literal such as /ab+c/gi
const JS_REGEX_LITERAL = /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[a-z]*/y;

/**
 * Can a "/" at this point start a regex literal, or is it division?
 * After a value (a name, number, ")" or "]") it is division: a / b.
 * Anywhere else (after "=", "(", ",", "return" …) it starts a regex.
 */
function slashStartsRegex(previous) {
  if (!previous) return true;
  if (previous.type === 'number' || previous.type === 'string') return false;
  if (previous.type === 'punctuation') return !/[)\]]/.test(previous.text);
  if (previous.type === 'keyword') return true;
  if (previous.type === 'operator') return true;
  return false; // a name: x / 2
}

/** Cut JavaScript code into tokens: [{ type, text }, …]. */
export function tokenizeJs(code) {
  const tokens = [];
  let pos = 0;
  let previous = null; // the last token that is not whitespace or a comment

  while (pos < code.length) {
    let token = null;

    // Special case first: a "/" that starts a regex literal.
    if (code[pos] === '/' && code[pos + 1] !== '/' && code[pos + 1] !== '*' && slashStartsRegex(previous)) {
      JS_REGEX_LITERAL.lastIndex = pos;
      const m = JS_REGEX_LITERAL.exec(code);
      if (m) token = { type: 'regex', text: m[0] };
    }

    if (!token) {
      for (const [type, regex] of JS_RULES) {
        regex.lastIndex = pos;
        const m = regex.exec(code);
        if (m && m[0].length > 0) {
          token = { type, text: m[0] };
          break;
        }
      }
    }

    // Nothing matched (e.g. "#" or "@"): take one character so we never get stuck.
    if (!token) token = { type: 'plain', text: code[pos] };

    if (token.type === 'word') token.type = classifyWord(token.text, code, pos + token.text.length, previous);

    tokens.push(token);
    pos += token.text.length;
    if (token.type !== 'space' && token.type !== 'comment') previous = token;
  }

  return tokens;
}

/** Decide what kind of name a word is: keyword, literal, function call, property or plain. */
function classifyWord(word, code, end, previous) {
  if (previous && previous.text === '.') {
    return nextNonSpaceChar(code, end) === '(' ? 'function' : 'property';
  }
  if (JS_KEYWORDS.has(word)) return 'keyword';
  if (JS_LITERALS.has(word)) return 'literal';
  if (nextNonSpaceChar(code, end) === '(') return 'function';
  return 'plain';
}

function nextNonSpaceChar(code, from) {
  const m = /\S/.exec(code.slice(from, from + 200));
  return m ? m[0] : '';
}

/* ════════════════════════ CSS ════════════════════════ */

/** Cut CSS code into tokens. */
export function tokenizeCss(code) {
  const tokens = [];
  let pos = 0;
  // Are we in a selector ("a:hover") or in a declaration ("color: red")?
  // Decided at the start of each statement by looking ahead (see below).
  let mode = statementMode(code, 0);
  let afterColon = false; // inside a declaration, are we past the ":"?

  const push = (type, text) => {
    tokens.push({ type, text });
    pos += text.length;
  };
  const match = (regex) => {
    regex.lastIndex = pos;
    const m = regex.exec(code);
    return m && m[0].length > 0 ? m[0] : null;
  };

  while (pos < code.length) {
    let text;
    const ch = code[pos];

    if ((text = match(/\s+/y))) { push('space', text); continue; }
    if ((text = match(/\/\*[\s\S]*?(?:\*\/|$)/y))) { push('comment', text); continue; }
    if ((text = match(/'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?/y))) { push('string', text); continue; }

    // Statement boundaries: after them, decide the mode for the next statement.
    if (ch === '{' || ch === '}' || ch === ';') {
      push('punctuation', ch);
      mode = statementMode(code, pos);
      afterColon = false;
      continue;
    }

    if ((text = match(/@[\w-]+/y))) { push('keyword', text); continue; }

    if (mode === 'selector') {
      if ((text = match(/::?[\w-]+/y))) { push('keyword', text); continue; }     // :hover, ::before
      if ((text = match(/[.#][\w-]+/y))) { push('selector', text); continue; }    // .card, #main
      if ((text = match(/[\w-]+/y))) { push('tag', text); continue; }             // div, a
      push('punctuation', ch);
      continue;
    }

    // Declaration mode: "property: value;"
    if (!afterColon) {
      if ((text = match(/--?[\w-]+|[\w-]+/y))) { push('property', text); continue; }
      if (ch === ':') { push('punctuation', ch); afterColon = true; continue; }
      push('plain', ch);
      continue;
    }

    if ((text = match(/#[\da-fA-F]{3,8}\b/y))) { push('number', text); continue; }            // #fff
    if ((text = match(/-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/y))) { push('number', text); continue; } // 12px, 1.5
    if ((text = match(/!important/y))) { push('keyword', text); continue; }
    if ((text = match(/[\w-]+(?=\()/y))) { push('function', text); continue; }              // var(, rgb(
    if ((text = match(/--[\w-]+/y))) { push('property', text); continue; }                   // var(--x)
    if ((text = match(/[\w-]+/y))) { push('literal', text); continue; }                      // red, flex
    push('punctuation', ch);
  }

  return tokens;
}

/**
 * Look ahead from `from` to the next "{", ";" or "}".
 * If "{" comes first, the text before it is a selector (or an @-rule prelude).
 * Otherwise it is a declaration like "color: red".
 */
function statementMode(code, from) {
  for (let i = from + 1; i < code.length; i++) {
    const c = code[i];
    if (c === '{') return 'selector';
    if (c === ';' || c === '}') return 'declaration';
  }
  // End of file: at the top level it is probably a selector being typed.
  return depthAt(code, from) > 0 ? 'declaration' : 'selector';
}

function depthAt(code, end) {
  let depth = 0;
  for (let i = 0; i <= end && i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') depth = Math.max(0, depth - 1);
  }
  return depth;
}

/* ════════════════════════ HTML ════════════════════════ */

/** Cut HTML into tokens. Code inside <style> and <script> is highlighted as CSS and JS. */
export function tokenizeHtml(code) {
  const tokens = [];
  let pos = 0;

  const push = (type, text) => {
    if (text) tokens.push({ type, text });
    pos += text.length;
  };
  const match = (regex) => {
    regex.lastIndex = pos;
    const m = regex.exec(code);
    return m && m[0].length > 0 ? m[0] : null;
  };

  while (pos < code.length) {
    let text;

    if ((text = match(/<!--[\s\S]*?(?:-->|$)/y))) { push('comment', text); continue; }
    if ((text = match(/<![^>]*>?/y))) { push('keyword', text); continue; } // <!doctype html>
    if ((text = match(/&[#\w]+;/y))) { push('literal', text); continue; } // &amp;

    // A tag: "<" or "</", then the name, attributes, and ">"
    const open = match(/<\/?(?=[A-Za-z])/y);
    if (open) {
      push('punctuation', open);
      const tagName = match(/[A-Za-z][\w-]*/y);
      push('tag', tagName);

      while (pos < code.length) {
        if ((text = match(/\s+/y))) { push('space', text); continue; }
        if ((text = match(/\/?>/y))) { push('punctuation', text); break; }
        if ((text = match(/"[^"]*"?|'[^']*'?/y))) { push('string', text); continue; }
        if (code[pos] === '=') { push('operator', '='); continue; }
        if ((text = match(/[^\s"'=<>/]+/y))) {
          // After "=", an unquoted word is a value; otherwise it is an attribute name.
          const prev = tokens[tokens.length - 1];
          push(prev && prev.text === '=' ? 'string' : 'attr', text);
          continue;
        }
        if (code[pos] === '<') break; // unfinished tag, a new one starts
        push('punctuation', code[pos]);
      }

      // Contents of <script> and <style> are a different language.
      const lower = tagName.toLowerCase();
      if (open === '<' && (lower === 'script' || lower === 'style')) {
        const closeIndex = code.toLowerCase().indexOf(`</${lower}`, pos);
        const end = closeIndex === -1 ? code.length : closeIndex;
        const inner = code.slice(pos, end);
        tokens.push(...(lower === 'script' ? tokenizeJs(inner) : tokenizeCss(inner)));
        pos = end;
      }
      continue;
    }

    // Plain text up to the next "<" or "&"
    text = match(/[^<&]+/y) ?? code[pos];
    push('plain', text);
  }

  return tokens;
}

/* ════════════════════════ Rendering ════════════════════════ */

const TOKENIZERS = { js: tokenizeJs, css: tokenizeCss, html: tokenizeHtml };

/** Make text safe to put inside HTML: "<" must become "&lt;" and so on. */
export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')   // must be first, or it would re-escape the others
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tokenToHtml(type, text) {
  const safe = escapeHtml(text);
  return type === 'plain' || type === 'space' ? safe : `<span class="tok-${type}">${safe}</span>`;
}

/**
 * Highlight code and return one HTML string PER LINE.
 * A token can span several lines (a long comment), so tokens are split at "\n"
 * and each piece is wrapped separately — that way every line is valid HTML on its own.
 */
export function highlightLines(code, language) {
  const tokenize = TOKENIZERS[language];
  const lines = [''];

  if (!tokenize) {
    for (const [i, line] of code.split('\n').entries()) lines[i] = escapeHtml(line);
    return lines;
  }

  for (const { type, text } of tokenize(code)) {
    const parts = text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push(''); // a newline starts a new line
      if (part) lines[lines.length - 1] += tokenToHtml(type, part);
    });
  }
  return lines;
}

/** Highlight code and return a single HTML string. */
export function highlight(code, language) {
  return highlightLines(code, language).join('\n');
}
