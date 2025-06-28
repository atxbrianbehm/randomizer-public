# Advanced Options Modal

A modern, keyboard-friendly interface for locking grammar rules and fine-tuning generation parameters.

## Key Points

• **Dynamic** – builds controls based on the selected generator’s `lockableRules` array.
• **Stage Grouping** – variables are automatically grouped under “Stage 1…5” headers by scanning `stage_X_sermon` templates.
• **Lock Toggle** – each rule has a 🔓/🔒 button; values persist in `app.engine.lockedValues` and localStorage.
• **Accessibility** – focus trap, `role="dialog"`, `aria-label` on lock buttons, Esc to close.
• **Feature Flag** – set `window.FEATURE_ADV_MODAL = false` *before* app bootstrap (e.g. in a `<script>` tag in `index.html`) to revert to the legacy UI.

## Development

The modal lives in `src/ui/advancedModal.js` and is unit-tested in `tests/advancedModal.spec.js`.
Run:
```bash
npm test
```
To execute the Vitest suite, including modal helper and DOM tests.
