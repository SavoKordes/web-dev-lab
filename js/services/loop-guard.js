/*
 * loop-guard.js — protects the app from infinite loops in your code.
 *
 * The problem: code like `while (true) {}` never stops. The preview runs on the
 * same thread as this app, so the whole page would freeze and could not be fixed
 * without closing the tab.
 *
 * The solution: before running your code, we insert a tiny check at the start of
 * every loop body:
 *
 *     while (x > 0) {            →     while (x > 0) {__wdlLoopGuard(3);
 *
 * __wdlLoopGuard is defined inside the sandbox (js/services/sandbox.js). If one
 * synchronous run of code keeps looping for more than ~1.5 seconds, it throws an
 * error that tells you which line the loop is on.
 *
 * The check is inserted on the SAME line, so error line numbers stay correct.
 * Loops without curly braces (`while (x) x--;`) are not guarded — rare in practice.
 */

import { tokenizeJs } from './highlighter.js';

const LOOP_KEYWORDS = new Set(['for', 'while', 'do']);

/** Return a copy of `code` with a guard call inserted into each loop body. */
export function addLoopGuards(code) {
  const tokens = tokenizeJs(code);
  const insertAfter = new Set(); // indexes of "{" tokens that open a loop body

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== 'keyword' || !LOOP_KEYWORDS.has(token.text)) continue;

    let j = nextSignificant(tokens, i + 1);

    if (token.text === 'for' || token.text === 'while') {
      // "for await (" is also a loop
      if (tokens[j]?.text === 'await') j = nextSignificant(tokens, j + 1);
      if (tokens[j]?.text !== '(') continue;
      j = matchingParen(tokens, j);         // jump to the ")" that closes the condition
      if (j === -1) continue;
      j = nextSignificant(tokens, j + 1);
    }

    // For do…while the body follows "do" directly. For "} while (x);" the next
    // token is ";", not "{", so the end of a do…while is correctly skipped.
    if (tokens[j]?.text === '{') insertAfter.add(j);
  }

  // Rebuild the code. Track line numbers so each guard knows where its loop is.
  let line = 1;
  let output = '';
  tokens.forEach((token, i) => {
    output += token.text;
    if (insertAfter.has(i)) output += `__wdlLoopGuard(${line});`;
    line += (token.text.match(/\n/g) || []).length;
  });
  return output;
}

/** Index of the next token that is not whitespace or a comment. */
function nextSignificant(tokens, from) {
  let i = from;
  while (i < tokens.length && (tokens[i].type === 'space' || tokens[i].type === 'comment')) i++;
  return i;
}

/** Given the index of "(", return the index of its matching ")" (or -1). */
function matchingParen(tokens, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < tokens.length; i++) {
    if (tokens[i].type !== 'punctuation') continue;
    if (tokens[i].text === '(') depth++;
    if (tokens[i].text === ')') depth--;
    if (depth === 0) return i;
  }
  return -1;
}
