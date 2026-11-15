/*
 * exercise.js — the shared "shell" around every exercise.
 *
 * The shell does the parts that are the same for every exercise type:
 *   - the task description
 *   - the Check button and the feedback area
 *   - the hint ladder: where to look → the concept → a nudge → the solution
 *   - the solution lock: it opens only after a real attempt and all hints
 *   - recording progress (js/services/progress.js)
 *
 * The part that differs per type (code editor, prediction box, list to order…)
 * comes from a "renderer" in js/ui/exercises/. The shell does not know how a
 * renderer works inside; it only uses the contract described in code-exercise.js.
 * This is the "strategy pattern": swap the strategy, keep the surrounding logic.
 */

import { h, icon, setChildren } from '../core/dom.js';
import { richText } from './rich-text.js';
import {
  getExerciseState, markOpened, saveDraft, recordHint, recordSolutionShown, recordAttempt,
} from '../services/progress.js';
import { createCodeExercise } from './exercises/code-exercise.js';
import { createPredictExercise } from './exercises/predict-exercise.js';
import { createOrderExercise } from './exercises/order-exercise.js';
import { createChoiceExercise } from './exercises/choice-exercise.js';
import { createExplainExercise } from './exercises/explain-exercise.js';
import { createTraceExercise } from './exercises/trace-exercise.js';

const RENDERERS = {
  code: createCodeExercise,
  predict: createPredictExercise,
  order: createOrderExercise,
  choice: createChoiceExercise,
  explain: createExplainExercise,
  trace: createTraceExercise,
};

export const TYPE_LABELS = {
  code: 'Write code',
  predict: 'Predict the output',
  order: 'Order the steps',
  choice: 'Concept check',
  explain: 'Explain it',
  trace: 'Trace the values',
};

const HINT_LABELS = ['Where to look', 'The concept', 'A nudge'];

const STATUS_BADGES = {
  new: null,
  attempted: { text: 'In progress', cls: 'badge' },
  solved: { text: 'Solved', cls: 'badge badge--success' },
  revealed: { text: 'Solution viewed', cls: 'badge' },
};

/**
 * @param {object} exercise - An exercise definition from content/.
 * @returns {{ element: HTMLElement, destroy: () => void }}
 */
export function createExercise(exercise) {
  const createRenderer = RENDERERS[exercise.type];
  if (!createRenderer) throw new Error(`Unknown exercise type: "${exercise.type}"`);

  markOpened(exercise.id);
  let state = getExerciseState(exercise.id);
  const hints = (exercise.hints ?? []).map((hint, i) =>
    (typeof hint === 'string' ? { label: HINT_LABELS[i] ?? `Hint ${i + 1}`, text: hint } : hint));

  const renderer = createRenderer(exercise, {
    draft: state.draft,
    saveDraft: (draft) => saveDraft(exercise.id, draft),
    submit: (result) => handleResult(result),
  });

  /* ───────── Elements ───────── */

  const statusBadge = h('span', { hidden: true });
  const feedbackArea = h('div', { class: 'exercise__feedback', 'aria-live': 'polite' });
  const hintsArea = h('div', { class: 'exercise__hints stack' });
  const solutionArea = h('div', { class: 'exercise__solution' });
  const successArea = h('div', { class: 'exercise__success stack' });

  const checkButton = h('button', { class: 'btn btn--primary', type: 'button', onClick: onCheck },
    renderer.checkLabel ?? 'Check answer');
  const hintButton = h('button', { class: 'btn', type: 'button', onClick: showNextHint });
  const solutionButton = h('button', { class: 'btn btn--ghost', type: 'button', onClick: onShowSolution });
  const lockNote = h('p', { class: 'exercise__lock-note', id: `${exercise.id}-lock` });

  const element = h('article', { class: 'exercise', 'aria-labelledby': `${exercise.id}-title` },
    h('header', { class: 'exercise__header' },
      h('p', { class: 'eyebrow' }, exercise.debug ? `Bug challenge · ${exercise.bugCategory ?? 'Fix the bug'}` : `Exercise · ${TYPE_LABELS[exercise.type]}`),
      h('div', { class: 'exercise__title-row' },
        h('h2', { class: 'exercise__title', id: `${exercise.id}-title` }, exercise.title),
        statusBadge),
    ),
    h('div', { class: 'callout callout--exercise' },
      h('p', { class: 'callout__label' }, 'Your task'),
      richText(exercise.prompt)),
    renderer.element,
    h('div', { class: 'exercise__actions' },
      checkButton,
      hints.length > 0 && hintButton,
      renderer.solution && solutionButton,
    ),
    renderer.solution && lockNote,
    feedbackArea,
    hintsArea,
    solutionArea,
    successArea,
  );

  /* ───────── Status, hints, solution lock ───────── */

  function refresh() {
    state = getExerciseState(exercise.id);

    const badge = STATUS_BADGES[state.status];
    statusBadge.hidden = !badge;
    if (badge) {
      statusBadge.className = badge.cls;
      statusBadge.textContent = badge.text;
    }

    const hintsLeft = hints.length - state.hintsUsed;
    hintButton.disabled = hintsLeft <= 0;
    hintButton.textContent = hintsLeft > 0
      ? `Show hint (${hintsLeft} left)`
      : 'No more hints';

    // The solution is available after solving (to compare), or after a real
    // attempt AND every hint — so you always try the smaller steps first.
    const solved = state.status === 'solved';
    const unlocked = solved || state.solutionShown
      || (state.attempts > 0 && state.hintsUsed >= hints.length);
    solutionButton.disabled = !unlocked || state.solutionShown;
    setChildren(solutionButton, [!unlocked && icon('lock'), solved ? 'Compare with the model solution' : 'Show solution']);
    lockNote.textContent = unlocked ? '' : (hints.length
      ? 'The solution unlocks after you have checked an answer and used all hints.'
      : 'The solution unlocks after you have checked an answer.');
    lockNote.hidden = unlocked;
    if (unlocked) solutionButton.removeAttribute('aria-describedby');
    else solutionButton.setAttribute('aria-describedby', lockNote.id);
  }

  function renderHint(index) {
    const hint = hints[index];
    hintsArea.append(h('div', { class: 'callout callout--hint' },
      h('p', { class: 'callout__label' }, `Hint ${index + 1} of ${hints.length} · ${hint.label}`),
      richText(hint.text)));
  }

  function showNextHint() {
    if (state.hintsUsed >= hints.length) return;
    renderHint(state.hintsUsed);
    recordHint(exercise.id, state.hintsUsed + 1);
    refresh();
  }

  function renderSolution() {
    solutionArea.replaceChildren(h('div', { class: 'callout callout--solution' },
      h('p', { class: 'callout__label' }, 'Solution'),
      renderer.solution(),
      exercise.explanation && h('div', { class: 'exercise__explanation' }, richText(exercise.explanation)),
    ));
  }

  function onShowSolution() {
    const solved = state.status === 'solved';
    if (!solved && !confirm('Show the solution? This exercise will then not count toward your mastery. You can still solve it yourself afterwards, for practice.')) return;
    if (!solved) recordSolutionShown(exercise.id);
    renderSolution();
    refresh();
    solutionArea.querySelector('.callout')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ───────── Checking ───────── */

  async function onCheck() {
    checkButton.disabled = true;
    showFeedback('info', 'Checking…');
    try {
      const result = await renderer.check();
      if (result) handleResult(result);
      else feedbackArea.replaceChildren(); // the renderer continues (e.g. self-assessment)
    } catch (error) {
      console.error(error);
      showFeedback('fail', 'Something went wrong while checking. Try again.');
    } finally {
      checkButton.disabled = false;
    }
  }

  function handleResult(result) {
    if (result.invalid) {
      showFeedback('info', result.invalid);
      return;
    }

    const { firstSolve } = recordAttempt(exercise, result);
    refresh();

    if (result.correct) {
      showFeedback('pass', 'Correct', result.feedback, firstSolve ? creditMessage() : null);
      renderSuccess();
    } else {
      showFeedback('fail', 'Not yet', result.feedback,
        hints.length > state.hintsUsed ? 'Stuck? A hint shows you where to look, without giving the answer away.' : null);
    }
  }

  /** Tell the learner honestly how this solve counts. */
  function creditMessage() {
    if (state.solutionShown) return 'You solved it after viewing the solution, so it does not count toward mastery. Come back to it later and solve it from memory.';
    if (state.hintsUsed === 0 && state.failedAttempts === 0) return 'Solved on the first try without hints.';
    const parts = [];
    if (state.hintsUsed) parts.push(`${state.hintsUsed} hint${state.hintsUsed === 1 ? '' : 's'}`);
    if (state.failedAttempts) parts.push(`${state.failedAttempts} earlier check${state.failedAttempts === 1 ? '' : 's'}`);
    return `Solved after ${parts.join(' and ')}. This skill will come back for revision.`;
  }

  function renderSuccess() {
    setChildren(successArea, [
      // Debug challenges end with a post-mortem: why the bug happened, and how to spot it.
      exercise.explanation && !solutionArea.hasChildNodes() && h('div', { class: 'callout callout--explain' },
        h('p', { class: 'callout__label' }, exercise.debug ? 'Why the bug happened' : 'Why this works'),
        richText(exercise.explanation)),
      exercise.takeaway && h('div', { class: 'callout callout--example' },
        h('p', { class: 'callout__label' }, exercise.debug ? 'How to recognize it next time' : 'Remember next time'),
        richText(exercise.takeaway)),
    ]);
  }

  function showFeedback(kind, title, body = null, note = null) {
    feedbackArea.replaceChildren(h('div', { class: `feedback feedback--${kind}` },
      h('p', { class: 'feedback__title' },
        kind === 'pass' && icon('check'),
        title),
      body,
      note && h('p', { class: 'feedback__note' }, note),
    ));
  }

  /* ───────── Restore earlier progress ───────── */

  for (let i = 0; i < Math.min(state.hintsUsed, hints.length); i++) renderHint(i);
  if (state.solutionShown && renderer.solution) renderSolution();
  if (state.status === 'solved') renderSuccess();
  refresh();

  return {
    element,
    destroy: () => renderer.destroy?.(),
  };
}
