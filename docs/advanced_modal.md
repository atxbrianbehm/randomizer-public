# Advanced Options Modal

A modern, keyboard-friendly interface for locking grammar rules and fine-tuning generation parameters.

![Advanced Modal Demo](img/advanced_modal_demo.gif)

> Tip: Open/close the modal quickly using **Ctrl + Shift + L** (Cmd + Shift + L on macOS).

## Key Points

• **Dynamic** – builds controls based on the selected generator’s `lockableRules` array.
• **Stage Grouping** – variables are automatically grouped under “Stage 1…5” headers by scanning `stage_X_sermon` templates.
• **Lock Toggle** – each rule has a 🔓/🔒 button; values persist in `app.engine.lockedValues` and localStorage.
• **Accessibility** – focus trap, `role="dialog"`, `aria-label` on lock buttons, Esc to close.
• **Feature Flag** – set `window.FEATURE_ADV_MODAL = false` *before* app bootstrap (e.g. in a `<script>` tag in `index.html`) to revert to the legacy UI.

## Slot Controls & New Slots

The modal generates one control per *lockable* grammar rule:

| Grammar pattern | UI Control | Notes |
|-----------------|------------|-------|
| Array of strings | Single-select dropdown |
| Array of `{label,value}` objects | Single-select dropdown (shows `label`) |
| `_meta.multiSelect: true` + array | Checkbox grid (multi-select) |
| Boolean variable | Toggle switch |

### Support for New Slots (July 2025)
The expanded slot taxonomy introduces categories such as **texture**, **size/scale**, **mood/ambience**, **sound**, and **motion/animation**. If your generator defines rules in these slots, the modal displays them automatically provided the rule is an array.

Example – *Texture* checkbox grid:
```jsonc
"texture": [
  { "_meta": { "multiSelect": true } },
  "gritty", "polished", "rusted", "velvet-soft"
]
```

The `_meta.multiSelect` flag renders a responsive grid; selections are written to `engine.lockedValues.texture`.

---

## Development

The modal lives in `src/ui/advancedModal.js` and is unit-tested in `tests/advancedModal.spec.js`.
Run:
```bash
npm test
```
To execute the Vitest suite, including modal helper and DOM tests.
