# Randomizer Refactor & Build Plan

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
  - `src/ui/init.js` – bootstrap code.
  - `src/ui/events.js` – DOM event bindings.
  - `src/ui/state.js` – UI state rendering helpers.
  - `src/services/generatorLoader.js` – async fetch 
  - [x] Move generator loader logic → src/services/generatorLoader.js
  - [x] Move text generator logic → src/services/textGenerator.js
  - [x] Extract modal helpers → src/ui/advancedModal.js
  - [x] Extract theme toggle → src/ui/theme.js
  - [x] Extract variable lock helpers → src/services/variableLocks.js
  - [x] Remove large methods from RandomizerApp (use thin wrappers)
  - [x] Delete deprecated initializeGenerators method
  - [ ] Refactor main.js:
    - [ ] Extract UI initialization logic
    - [x] Extract event binding logic
    - [ ] Extract state rendering logic
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
_Last updated: 2025-06-25 00:14 CT_
