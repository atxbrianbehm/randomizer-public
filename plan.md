# Randomizer Project Plan

## Notes
- This plan consolidates all active and unfinished tasks from previous plans (including .codeium/windsurf/brain/0e859844-e41d-48b0-b8fa-524135974618/plan.md).
- Integrated tasks and notes from other project plans; archived redundant/old plans.
- Reflects current status of Randomizer refactor, build, and new generator integration.

## Task List
### Active Tasks

<!-- Completed phases moved to bottom -->
<!-- Active tasks begin below -->
- [x] Phase 0 – Preparation
  - [x] **0-1 Grammar inventory script** – scan `generators/**/*.json` and output a CSV/markdown table of prompt-visible rules per generator.
  - [x] **0-2 Canonical slot taxonomy** – finalise slot names & default order (subject, condition, purpose, materials, colour, controls, displays, lighting, markings, density, view).
  - [x] **0-3 Metadata-storage decision** – draft a brief design doc comparing `_meta` vs external map and select one.
- [x] Phase 1 – Chip/Rule Metadata
  - [x] **1-1 Pilot metadata** – add `_meta` blocks to Televangelist generator rules.
  - [x] **1-2 Metadata linter** – Node script verifying 100 % coverage across all generators; fail CI on missing/invalid.
  - [x] **1-3 Roll-out** – apply metadata to remaining generators using the linter for validation.
- [x] Phase 2 – Modifier Library (Tracery-style)
  - [x] **2-1 Core modifiers** – implement `capitalize`, `a_an`, `plural` in `RandomizerEngine`.
  - [x] **2-2 Modifier syntax** – add `#rule.modifier#` parsing & execution.
  - [x] **2-3 Unit tests** – verify each modifier individually and in combination.
- [x] Phase 3 – Smart Prompt Rewriter
  - [x] **3-1 Data model** – introduce `slotOrder` array constant (overridable per generator).
  - [x] **3-2 Rewrite algorithm** – function `buildReadablePrompt(chips)` that orders chips, injects connectors, handles edge cases, and applies modifiers.
  - [x] **3-3 Performance bench** – benchmark 1 000 rewrites under 20 ms.
  - [x] **3-4 UI integration** – hook rewriter into prompt-editing modal; add tests.
- [ ] Phase 4 – State Persistence (Twine-style)
  - [x] Persistence spec
    - [x] Define JSON schema for persisted state (`version`, `generator`, `lockedValues`, `lastPrompt`, `theme`, `seed`)
    - [x] Size budget ≤10 KB
  - [x] Implementation
    - [x] Create `src/services/persistence.js` with `saveState`, `loadState`, `clearState`
    - [x] Wire `RandomizerApp` to `saveState` after each generate & variable edit
    - [x] Hydrate app on init, falling back gracefully if schema version mismatches
  - [x] UI
    - [x] Add “Reset to defaults” button next to Generate
    - [x] Add tooltip explaining persistence
    - [x] Emit toast on successful restore/reset
  - [x] Tests
    - [x] Unit tests for `persistence.js`
    - [x] Integration test: edit variable → reload → state restored
  - [x] Performance
    - [x] Saving & loading ≤2 ms on average laptop
  - [x] Docs
    - [x] Update GUIDE with persistence API and migration notes

- [ ] Phase 5 – Debug Overlay / Expansion Tree
  - [ ] Overlay framework
    - [ ] Add `<div id="debug-overlay">` injected only when `?dev=1`
    - [ ] Keyboard toggle `Ctrl+\\`
  - [ ] Expansion tree view
    - [ ] Render hierarchical list of segments with rule, text, modifiers, slot
    - [ ] Hovering a list item highlights corresponding text in prompt
    - [ ] Collapsible branches & search filter
  - [ ] Performance
    - [ ] Initial render ≤5 ms for 20 segments
    - [ ] Virtualise list for >100 nodes
  - [ ] Accessibility & UX
    - [ ] Ensure contrast & focus order
    - [ ] Close overlay with ESC
  - [ ] Export options
    - [ ] “Copy JSON” button to clipboard
  - [ ] Tests
    - [ ] Unit test overlay build util
    - [ ] Integration test toggle + highlight flow
  - [ ] Docs
    - [ ] Add overlay usage section to GUIDE

- [ ] Phase 6 – Testing & Documentation Hardening
  - [ ] Test coverage
    - [ ] Bring unit test coverage to ≥90 %
    - [ ] Add snapshot tests for prompt readability
  - [ ] Continuous Integration
    - [ ] Add workflow: lint → test → build → size-budget check → upload coverage
  - [ ] Documentation
    - [ ] Expand `LLM_Content_Development_Guide.md` with:
      - [ ] Metadata spec & examples
      - [ ] Modifier reference & writing custom modifiers
      - [ ] Persistence schema & migration
      - [ ] Debug overlay tips
    - [ ] Update README badges (coverage, CI, size)
    - [ ] Update CHANGELOG 1.1.0
  - [ ] Developer Experience
    - [ ] Pre-commit hook for lint+tests
    - [ ] NPM script `npm run watch:test` for TDD loop
- [ ] Phase 7 – Visual Rule Graph (stretch)
  - [ ] Render grammar DOT graph with Viz.js for authors.

- [ ] Folder restructure & source migration
  - [ ] `src/services/generatorLoader.js`
    - [ ] Extract `fetchGeneratorSpec()` helper wrapping `fetch()`/error-handling.
    - [ ] Move registration logic into `registerGenerator()` util.
    - [ ] Add JSDoc comments & unit tests.
  - [ ] `src/main.js` cleanup
    - [ ] Abstract repetitive lockable list into `constants.js`.
    - [ ] Wrap DOM queries in `ui/query.js` helper (e.g., `q('#id')`).
    - [x] Remove legacy global variables.
    - [x] Eliminate unused event listeners (`onGenerateClick`, `onHelpClick`) – none found.
    - [x] Extract `generateText` body to `services/textGenerator.js` (thin wrapper in class).
    - [x] Write Vitest unit tests for new helper functions.
    - [ ] Add/update JSDoc for all RandomizerApp class methods.
    - [x] Replace direct `document.querySelector` calls with UI helpers.
    - [ ] Delete unused event listeners (`onGenerateClick`, `onHelpClick`).
  - [ ] Source moves
    - [ ] Move `randomizer.css` → `src/styles/randomizer.css`.
    - [ ] Relocate preview images → `public/preview/`.
  - [ ] Imports
    - [ ] Update paths to use `@/` alias.
    - [ ] Run ESLint autofix to catch broken paths.
- [x] HTML / CSS polish
  - [x] ID/class audit
    - [x] Build checklist of expected selectors from JS.
    - [x] Cross-verify against `index.html` and templates.
  - [x] Dark-mode
    - [x] Migrate hard-coded colors to CSS variables.
    - [x] Add prefers-color-scheme fallback.
  - [x] Modal styling
    - [x] Ensure focus-trap & scroll-lock utilities work in Safari.
    - [x] Add drop-shadow in light theme.
- [x] Verification & QA
  - [x] Manual smoke-test scenarios
    - [x] Generate 5 prompts with default generator.
    - [x] Toggle theme and verify persistence.
    - [x] Lock variable and ensure new seed respects lock.
  - [x] Performance budget
    - [x] Keep dev bundle <200 KB gzip.
  - [x] Accessibility
    - [x] Run Lighthouse a11y audit and hit ≥90 score.
- [ ] New Generator • Anachronistic Tech Panel
  - Phase 1 – Asset & Spec
    - [ ] Convert provided JSON → `generators/anachronisticTechPanel.json`.
    - [ ] Optimise `previewImage` ≤150 KB.
  - Phase 2 – Integration
    - [ ] Import in `generators/index.js` & dropdown label “Tech Panel (Retro-Future)”.
  - Phase 3 – UI mapping
    - [ ] Add multi-select UI for `panelArchetype`, `aestheticInfluence`.
    - [ ] Display color-palette swatches.
  - Phase 4 – Logic
    - [ ] Update `RandomizerEngine.generate()` for nested arrays.
    - [ ] Extend variable-lock rules to cover new categories.
  - Phase 5 – Tests
    - [ ] Snapshot test sample prompt.

### Completed Phases (0–4)

#### Text Blending & Smart Prompt Rewriter (Tracery/Twine-inspired)
- [x] Phase 0 – Preparation
  - [x] 0-1 Grammar inventory script
  - [x] 0-2 Canonical slot taxonomy
  - [x] 0-3 Metadata-storage decision
- [x] Phase 1 – Chip/Rule Metadata
  - [x] 1-1 Pilot metadata
  - [x] 1-2 Metadata linter
  - [x] 1-3 Roll-out
- [x] Phase 2 – Modifier Library
  - [x] 2-1 Core modifiers
  - [x] 2-2 Modifier syntax
  - [x] 2-3 Unit tests
- [x] Phase 3 – Smart Prompt Rewriter
  - [x] 3-1 Data model
  - [x] 3-2 Rewrite algorithm
  - [x] 3-3 Performance bench
  - [x] 3-4 UI integration
- [x] Phase 4 – State Persistence (Twine-style) – all subtasks complete

### Other Completed Refactor Items
- Directories `src/`, `public/`, `generators/`, `tests/` created.
- ESLint & Prettier configured.
- README expanded with dev, build & test instructions.
- Legacy grammar helpers removed from `main.js`, stray comment terminators cleaned up.
- Lockable fields centralized in `constants.js`.
- Stylesheet moved to `src/styles/randomizer.css` and reference updated in `index.html`.
- Engine supports `lockedValues` for grammar rules.
- Preview images moved to `public/preview/` and references updated.
- Automated/unit tests (Vitest) running and passing.
- Lighthouse accessibility/performance checks run.
- Manual smoke-tests completed for prompt generation, theme toggle, variable lock.
- Large images optimized (lazy-load, explicit dimensions).
- QA, accessibility, and polish tasks completed.

## Current Goal
Begin Phase 5 – Debug Overlay / Expansion Tree
Complete active tasks from the consolidated project plan.

### 3. Verification & QA
- [ ] Manual smoke-test scenarios
  - [ ] Generate 5 prompts with default generator.
  - [ ] Toggle theme and verify persistence.
  - [ ] Lock variable and ensure new seed respects lock.
- [ ] Performance budget
  - [ ] Keep dev bundle <200 KB gzip.
- [ ] Accessibility
  - [ ] Run Lighthouse a11y audit and hit ≥90 score.

### 4. New Generator • Anachronistic Tech Panel
- **Phase 1 – Asset & Spec**
  - [ ] Convert provided JSON → `generators/anachronisticTechPanel.json`.
  - [ ] Optimise `previewImage` ≤150 KB.
- **Phase 2 – Integration**
  - [ ] Import in `generators/index.js` & dropdown label “Tech Panel (Retro-Future)”.
- **Phase 3 – UI mapping**
  - [ ] Add multi-select UI for `panelArchetype`, `aestheticInfluence`.
  - [ ] Display color-palette swatches.
- **Phase 4 – Logic**
  - [ ] Update `RandomizerEngine.generate()` for nested arrays.
  - [ ] Extend variable-lock rules to cover new categories.
- **Phase 5 – Tests**
  - [ ] Snapshot test sample prompt.
  - [ ] Validate error on invalid `grammar` entry.
- **Phase 6 – Docs**
  - [ ] README section with usage & example image.

### Advanced Options Modal – Dynamic Refactor
The goal is to replace the hard-coded lockable-fields modal with a generator-aware, auto-built UI.

**Steps**
1. **Determine Lockable Rules**  
   • Any grammar rule whose value is an array of strings or objects (`{label, value}`) qualifies.  
   • Exclude numeric or free-form variables.
2. **Engine Helper**  
   • Add `getLockableRules(generatorName)` in `RandomizerEngine` to return qualifying rule names.
3. **App Data Flow**  
   • On `selectGenerator`, compute `this.lockableRules = engine.getLockableRules(name)`.
4. **Modal Builder Refactor** (`src/ui/advancedModal.js`)  
   • For each rule in `app.lockableRules`, create label, `<select>`, and lock toggle.  
   • Populate `<select>` options with string or `value/label` pairs.
5. **Sync & Apply Logic**  
   • Iterate `app.lockableRules` to update dropdown states and copy locked values into `engine.lockedValues`.
6. **Remove Legacy Code**  
   • Delete `LOCKABLE_FIELDS` in `constants.js` and related static logic.
7. **Testing**  
   • Tech-panel generator shows 12 categories, locks respected.  
   • Televangelist generator still works.  
   • Unit tests for `getLockableRules`.
8. **Polish (optional)**  
   • Alphabetical sort of rules, search/filter, persist locks in `localStorage`.

---

### 5. Expand Existing Generators
- **Generator A**
  - [ ] Add 12 new `possibleCharacters` entries.
  - [ ] Introduce `tone` grammar with 6 moods.
- **Generator B**
  - [ ] Expand `adjectives` list to 30 items.
  - [ ] Add `lighting` category (e.g., rim-light, dusk).
- **Common**
  - [ ] Generate new 512×512 thumbnails.
  - [ ] Increment `version` & add CHANGELOG entry.

### 6. Milestone close-out
- [ ] Update `CHANGELOG.md`.
- [ ] Tag git release `v1.1.0`.

---

## Completed Tasks (archived)

### Project setup 
- npm initialisation, dependency installation and npm scripts.

### Build tooling 
- `vite.config.js` created (publicDir aliasing, JSON import support).
- Logger utility added.

### Testing suite 
- Vitest configuration, unit & integration tests written.
- CI workflow configured.

### Quality & docs 
- ESLint & Prettier configured.
- README expanded with dev, build & test instructions.

### Other completed refactor items 
- Directories `src/`, `public/`, `generators/`, `tests/` created.
- UI/helpers extracted, deprecated methods removed.
- `RandomizerEngine.js` converted to ES module.
- Build verified with `npm run build`.
- Add/update JSDoc for all RandomizerApp class methods.

---
_Last updated: 2025-06-25 10:52 CT_

## Goals
1. Modularize the front-end codebase (split `app.js`, rely on `RandomizerEngine.js`).
2. Introduce Vite for fast dev server and production bundle.
3. Keep this `plan.md` in sync with task updates.

## Tasks (detailed)

### Project setup
- [x] Initialize npm project (`npm init -y`).
- [x] Install development dependencies:
  - Vite (`npm i -D vite`) ✅
  - Vitest + jsdom (`npm i -D vitest @testing-library/dom jsdom`) ✅
  - ESLint + Prettier (`npm i -D eslint prettier eslint-config-prettier eslint-plugin-import`)
- [x] Add the following npm scripts to `package.json`:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `vitest run`
  - `test:watch`: `vitest --watch`

### Folder restructure & source migration
- [x] Create `src/`, `public/`, `generators/`, `tests/` directories.
- [ ] Move existing JS into `src/` and split modules:
  - [x] `src/ui/init.js` – bootstrap code.
  - [x] `src/ui/events.js` – DOM event bindings.
  - [x] `src/ui/state.js` – UI state rendering helpers.
  - `src/services/generatorLoader.js` – async fetch 
  - [x] Move generator loader logic → src/services/generatorLoader.js
  - [x] Move text generator logic → src/services/textGenerator.js
  - [x] Extract modal helpers → src/ui/advancedModal.js
  - [x] Extract theme toggle → src/ui/theme.js
  - [x] Extract variable lock helpers → src/services/variableLocks.js
  - [x] Remove large methods from RandomizerApp (use thin wrappers)
  - [x] Delete deprecated initializeGenerators method
  - [ ] Refactor main.js:
    - [x] Extract UI initialization logic
    - [x] Extract event binding logic
    - [x] Extract state rendering logic
    - [ ] Remove redundant code
- [x] Convert `RandomizerEngine.js` to an ES module (`export default class RandomizerEngine`).
- [ ] Update all internal imports after file moves.

### Build tooling
- [x] Create `vite.config.js` with:
  - `publicDir: 'generators'`.
  - Alias `@/` to `./src`.
  - JSON import support.
- [x] Add lightweight logger utility (`src/utils/logger.js`) toggled via `import.meta.env.MODE`.

### HTML / CSS
- [x] Update `index.html` to load `src/main.js` via `<script type="module">`.
- [ ] Verify all IDs/classes referenced in JS exist in HTML.
- [ ] Dark-mode and modal styling touch-ups.

### Testing
- [x] Create `vitest.config.js` with JSDOM environment and alias config.
- [x] Write unit tests:
  - **engine.spec.js**
    - Loads valid generator JSON without errors.
    - Throws on malformed JSON.
    - `generate()` returns non-empty string.
  - **stateHelpers.spec.js**
    - `updateEntryPoints` populates select element correctly for default & alternatives.
    - `updateVariablesDisplay` renders table rows equal to variables count.
- [x] Write integration test:
  - **app.init.spec.js** – mounts DOM, runs `init`, verifies generator dropdown populated.
- [x] Add CI workflow (`.github/workflows/test.yml`) to run `npm ci && npm test`.

### Quality & docs
- [x] Add ESLint config + initial `npm run lint` script.
- [x] Prettier config for consistent formatting.
- [x] Update README with:
  - Dev server usage.
  - Build instructions.
  - Running tests.
  - Project structure diagram.

### Verification
- [ ] Run `npm run dev` and manually exercise UI to ensure no regressions.
- [x] Run `npm run build` and serve `/dist` to confirm production bundle works.
- [ ] Ensure all tasks above are checked off before closing milestone.
- [x] Audit codebase and list refactor opportunities.
- [x] Decide on build tool: **Vite**.

---
_Last updated: 2025-06-25 09:47 CT_
