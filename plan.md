# Randomizer Refactor & Build Plan

## Goals
1. Modularize the front-end codebase (split `app.js`, rely on `RandomizerEngine.js`).
2. Introduce Vite for fast dev server and production bundle.
3. Keep this `plan.md` in sync with task updates.
4. Grow the library of content generators.

---

## Active Tasks

### 1. Folder restructure & source migration
- [ ] `src/services/generatorLoader.js`
  - [x] Extract `fetchGeneratorSpec()` helper wrapping `fetch()`/error-handling.
  - [x] Move registration logic into `registerGenerator()` util.
  - [x] Add JSDoc comments & unit tests.
- [ ] `src/main.js` cleanup
  - [ ] Abstract repetitive lockable list into `constants.js`.
  - [ ] Wrap DOM queries in `ui/query.js` helper (e.g., `q('#id')`).
  - [ ] Remove legacy global variables (`this.variables`, outdated `this.generators` map usage).
  - [x] Eliminate unused event listeners (`onGenerateClick`, `onHelpClick`) – none found.
  - [x] Extract `generateText` body to `services/textGenerator.js` (thin wrapper in class).
  - [x] Write Vitest unit tests for new helper functions.
  - [x] Update JSDoc across class methods.
  - [ ] Remove legacy global variables.
  - [x] Replace direct `document.querySelector` calls with UI helpers.
  - [ ] Delete unused event listeners (`onGenerateClick`, `onHelpClick`).
- [ ] Source moves
  - [ ] Move `randomizer.css` → `src/styles/randomizer.css`.
  - [ ] Relocate preview images → `public/preview/`.
- [ ] Imports
  - [ ] Update paths to use `@/` alias.
  - [ ] Run ESLint autofix to catch broken paths.

### Comment Cleanup – minimal safe diff
1. Confirm baseline compiles: `npm run build` passes. ✅
2. Open `src/main.js` in editor.
3. Locate first JSDoc opener `/**` above `constructor()`.
4. If it is missing a closer, insert `*/` on a new line **immediately before** `constructor()`.
5. Search for the single line `/* legacy grammar helpers removed` and convert it to `// legacy grammar helpers removed` (retain following code).
6. Run `npm run dev`; verify no new syntax errors.
7. Grep for lone `*/` lines (`grep -n "^\s*\*/" src/main.js`).  For each match:
   a. Check which opening comment it pairs with.
   b. Delete the `*/` only if its corresponding opener was already closed earlier.
8. After each deletion, re-run `npm run dev` to confirm still compiling.
9. When grep returns **no** orphan `*/`, run `npm run build` again to double-check production bundle.
10. Commit the minimal diff: `git add src/main.js && git commit -m "chore: tidy block comments (minimal safe diff)"`.
11. Push branch / open PR.

### 2. HTML / CSS polish
- [ ] ID/class audit
  - [ ] Build checklist of expected selectors from JS.
  - [ ] Cross-verify against `index.html` and templates.
- [ ] Dark-mode
  - [ ] Migrate hard-coded colors to CSS variables.
  - [ ] Add prefers-color-scheme fallback.
- [ ] Modal styling
  - [ ] Ensure focus-trap & scroll-lock utilities work in Safari.
  - [ ] Add drop-shadow in light theme.

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
