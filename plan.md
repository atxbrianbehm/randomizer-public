# Randomizer Project Plan

## Notes
- This plan consolidates all active and unfinished tasks from previous plans (including .codeium/windsurf/brain/0e859844-e41d-48b0-b8fa-524135974618/plan.md).
- Integrated tasks and notes from other project plans; archived redundant/old plans.
- Reflects current status of Randomizer refactor, build, and new generator integration.
- 2025-07-07 CI & Housekeeping updates:
  - Codecov integration fixed (v5 action, slug, token, .codecov.yml, vitest coverage output, `fail_ci_if_error: true`).
  - Redundant `node-ci.yml` workflow removed; main `ci.yml` unified.
  - Legacy Python prototype archived to `legacy-python/`.
  - Obsolete artifacts deleted (`coverage/`, `dist/`, `__pycache__/`, demo zip, Lighthouse report).
  - Documentation files and architecture diagram moved into `docs/`.
  - Project root now clean; ready for next development phase.
  - 2025-07-08 Opera generator lockable UI fix: Advanced Options modal now supports both array and object-wrapped rules; locked values persist.
  - 2025-07-08 Opera generator: Gender-aware prompt logic added (pronoun tokens, locked gender support).
  - 2025-07-08 Opera generator: v0.2.0 JSON integrated, old generator files removed.
  - 2025-07-08 Opera generator: Deleted stale copies (`public/generators/`, `generators/`, `dist/`); dropdown should now list generator.
  - 2025-07-08 Opera generator: Male attire restriction bug fixed (gender sets appropriate attire_type).


## Optimized Plan (2025-07-07)

### 1. Testing & Documentation Hardening
- [ ] Increase unit test coverage to ≥90%
- [ ] Add snapshot tests for prompt readability
- [x] Implement CI workflow: lint → test → build → size-budget check → upload coverage
- [ ] Expand `LLM_Content_Development_Guide.md` with examples, modifier reference, persistence schema, and debug overlay tips
- [ ] Update README badges (coverage, CI, bundle size)
- [ ] Update CHANGELOG for v1.1.0
- [ ] Add pre-commit hook for lint+tests
- [ ] Add `npm run watch:test` script for TDD loop

### 2. Documentation & Developer Experience
- [ ] Audit and update README and developer guides
- [ ] Write updated LLM guide for assembling generators
- [ ] Identify further code-refactor opportunities and log in `docs/refactor_opportunities.md`

### 3. Folder Restructure & Source Migration
- [ ] `src/services/generatorLoader.js`
  - [ ] Extract `fetchGeneratorSpec()` helper (wrap fetch/error-handling)
  - [ ] Move registration logic into `registerGenerator()` util
  - [ ] Add JSDoc comments & unit tests
- [ ] `src/main.js` cleanup
  - [ ] Abstract lockable list into `constants.js`
  - [ ] Wrap DOM queries in `ui/query.js` helper
  - [ ] Remove redundant code & unused event listeners
  - [ ] Add/update JSDoc for all `RandomizerApp` methods
- [ ] Asset moves
  - [ ] Move `randomizer.css` → `src/styles/randomizer.css`
  - [ ] Relocate preview images → `public/preview/`
- [ ] Imports
  - [ ] Update paths to use `@/` alias and run ESLint autofix

### 4. New Generator – Anachronistic Tech Panel
- [ ] Convert provided JSON → `generators/anachronisticTechPanel.json`
- [ ] Optimize preview image ≤150 KB
- [ ] Import in `generators/index.js` & dropdown label "Tech Panel (Retro-Future)"
- [ ] Add multi-select UI for `panelArchetype`, `aestheticInfluence`
- [ ] Display color-palette swatches
- [ ] Update `RandomizerEngine.generate()` for nested arrays
- [ ] Extend variable-lock rules to cover new categories
- [ ] Snapshot test sample prompt & validate error handling
- [ ] Add README section with usage & example image

### 5. Advanced Options Modal Refactor
- [ ] Add `getLockableRules(generatorName)` in `RandomizerEngine`
- [ ] Compute dynamic `lockableRules` on generator select
- [ ] Refactor modal builder to auto-generate UI
- [ ] Sync dropdown states with `engine.lockedValues`
- [ ] Remove legacy `LOCKABLE_FIELDS` logic
- [ ] Unit tests for lockable rule detection & modal logic
- [ ] Polish: alphabetical sort, search/filter, persist locks in `localStorage`

### 6. Expand Existing Generators
- [ ] Generator A: +12 `possibleCharacters`; add `tone` grammar (6 moods)
- [ ] Generator B: expand `adjectives` to 30 items; add `lighting` category
- [ ] Generate new 512×512 thumbnails
- [ ] Increment `version` & update CHANGELOG

### 7. Verification & QA
- [ ] Manual smoke-test scenarios (prompts, theme toggle, variable lock)
- [ ] Ensure dev bundle <200 KB gzip
- [ ] Run Lighthouse a11y audit and hit ≥90 score

### Immediate Next Steps (2025-07-07)
- [ ] Add edge-case & error-handling tests for engine and generatorLoader
- [ ] Increase overall coverage to ≥50 % on way to 90 %
- [ ] Add `npm run watch:test` and pre-commit lint+test hook
- [ ] Stub expanded sections in `LLM_Content_Development_Guide.md`
- [ ] Decide fate of unused helpers in `src/core/RandomizerApp.js` (delete or keep for refactor)

### 8. Milestone Close-Out
- [ ] Update `CHANGELOG.md`
- [ ] Tag git release `v1.1.0`

---

## Task List
### Active Tasks

<!-- Completed phases moved to bottom -->
<!-- Active tasks begin below -->


- [x] Phase 5 – Debug Overlay / Expansion Tree

- [ ] Phase 6 – Testing & Documentation Hardening
  - [ ] Test coverage
    - [ ] Bring unit test coverage to ≥90 %
    - [ ] Add snapshot tests for prompt readability
  - [ ] Continuous Integration
    - [x] Add workflow: lint → test → build → size-budget check → upload coverage
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
- [ ] Phase 7 – Documentation & Developer Experience
  - [ ] Audit and update documentation (README, dev guides)
  - [ ] Write updated LLM guide for assembling new generators
  - [ ] Identify further code refactoring opportunities
- [ ] Phase 8 – Visual Rule Graph (stretch)
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
    - [x] Replace direct `document.querySelector` calls with UI helpers.
    - [x] Delete unused event listeners (`onGenerateClick`, `onHelpClick`).
    - [ ] Add JSDoc for all RandomizerApp class methods.
  - [ ] Source moves
    - [ ] Move `randomizer.css` → `src/styles/randomizer.css`.
    - [ ] Relocate preview images → `public/preview/`.
  - [ ] Imports
    - [ ] Update paths to use `@/` alias.
    - [ ] Run ESLint autofix to catch broken paths.

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
Verify Opera generator now appears in dropdown and test UI/prompt generation (male & female, locked variables). After confirmation, bump generator version to 0.2.0 and commit.

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

### Opera Character Generator Enhancements
  - Phase 1 – Analysis & Design
    - [ ] Review current `opera_character_generator.json` structure
    - [ ] Identify categories suitable for locking (e.g., `character`, `setting`, `tone`)
  - Phase 2 – Locking Support
    - [ ] Mark lockable rules in generator metadata or register via `getLockableRules`
    - [ ] Ensure advanced-options modal lists Opera categories
    - [ ] Persist locked values and write Vitest snapshot test for locked prompt
  - Phase 3 – $include Refactor
    - [ ] Extract large/overlapping arrays into `/generators/includes/opera/*.json`
    - [ ] Replace arrays in Opera generator with `$include` directives
    - [ ] Confirm `generatorLoader` correctly resolves nested includes (unit test)
  - Phase 4 – Docs & Versioning
    - [ ] Update README/LLM guide with Opera locking instructions and examples
    - [ ] Bump generator `version` and add CHANGELOG entry

### 6. Milestone close-out
- [ ] Update `CHANGELOG.md`.
- [ ] Tag git release `v1.1.0`.

---

## Completed Tasks (archived)

### 1970s Opera Character Generator Integration (Completed)
- Legacy Opera character generator code converted into `generators/opera_character_generator.json` using the modern JSON grammar schema.
- Added `displayMode: "rawOnly"` metadata flag and updated front-end to respect it, eliminating duplicate prompt rendering.
- Patched `RandomizerEngine` (Python & JS) to support object-wrapped option lists and empty-string options.
- Integrated generator into dropdown via `public/generators/index.js` and `src/config/generatorIndex.js`.
- Created `docs/opera_character_generator.md` for documentation.
- Verified prompt generation on back-end and front-end; committed and pushed to GitHub.


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

---

## Consolidated Notes from Secondary Plans

### 1970s Opera Character Generator Refactor & Integration (historical notes)
- User provided legacy HTML/JS for a 1970s Opera Character Generator.
- Refactored into JSON generator `opera_character_generator.json`.
- Engine patched for object-wrapped option lists and empty-string safeguards.
- Added `displayMode: "rawOnly"` to metadata and UI logic to prevent duplicate text.
- Generator fully integrated, documented, and tested both back-end & front-end.


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
- [x] Dark-mode and modal styling touch-ups.

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
