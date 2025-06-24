# Randomizer Refactor & Build Plan

## Goals
1. Modularize the front-end codebase (split `app.js`, rely on `RandomizerEngine.js`).
2. Introduce Vite for fast dev server and production bundle.
3. Keep this `plan.md` in sync with task updates.

## Tasks (detailed)

### Project setup
- [ ] Initialize npm project (`npm init -y`).
- [ ] Install development dependencies:
  - Vite (`npm i -D vite`)
  - Vitest + jsdom (`npm i -D vitest @testing-library/dom jsdom`)
  - ESLint + Prettier (`npm i -D eslint prettier eslint-config-prettier eslint-plugin-import`)
- [ ] Add the following npm scripts to `package.json`:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `vitest`
  - `test:watch`: `vitest --watch`

### Folder restructure & source migration
- [ ] Create `src/`, `public/`, `generators/`, `tests/` directories.
- [ ] Move existing JS into `src/` and split modules:
  - `src/ui/init.js` – bootstrap code.
  - `src/ui/events.js` – DOM event bindings.
  - `src/ui/state.js` – UI state rendering helpers.
  - `src/services/generatorLoader.js` – async fetch & load of JSON generators.
  - `src/services/textGenerator.js` – thin wrapper around `RandomizerEngine.generate`.
- [ ] Convert `RandomizerEngine.js` to an ES module (`export default class RandomizerEngine`).
- [ ] Update all internal imports after file moves.

### Build tooling
- [ ] Create `vite.config.js` with:
  - `publicDir: 'generators'`.
  - Alias `@/` to `./src`.
  - JSON import support.
- [ ] Add lightweight logger utility (`src/utils/logger.js`) toggled via `import.meta.env.MODE`.

### HTML / CSS
- [ ] Update `index.html` to load `src/main.js` via `<script type="module">`.
- [ ] Verify all IDs/classes referenced in JS exist in HTML.
- [ ] Dark-mode and modal styling touch-ups.

### Testing
- [ ] Create `vitest.config.js` with JSDOM environment and alias config.
- [ ] Write unit tests:
  - **engine.spec.js**
    - Loads valid generator JSON without errors.
    - Throws on malformed JSON.
    - `generate()` returns non-empty string.
  - **stateHelpers.spec.js**
    - `updateEntryPoints` populates select element correctly for default & alternatives.
    - `updateVariablesDisplay` renders table rows equal to variables count.
- [ ] Write integration test:
  - **app.init.spec.js** – mounts DOM, runs `init`, verifies generator dropdown populated.
- [ ] Add CI workflow (`.github/workflows/test.yml`) to run `npm ci && npm test`.

### Quality & docs
- [ ] Add ESLint config + initial `npm run lint` script.
- [ ] Prettier config for consistent formatting.
- [ ] Update README with:
  - Dev server usage.
  - Build instructions.
  - Running tests.
  - Project structure diagram.

### Verification
- [ ] Run `npm run dev` and manually exercise UI to ensure no regressions.
- [ ] Run `npm run build` and serve `/dist` to confirm production bundle works.
- [ ] Ensure all tasks above are checked off before closing milestone.
- [x] Audit codebase and list refactor opportunities.
- [x] Decide on build tool: **Vite**.
- [ ] Set up npm project and add Vite (`npm init -y && npm i -D vite`).
- [ ] Restructure folders:
  - `src/` – all JS/TS modules
  - `generators/` – JSON generator bundles
  - `public/` – static assets if needed
- [ ] Move `app.js` → `src/ui/init.js` (temporary entry) and split into:
  - `ui/init.js`
  - `ui/events.js`
  - `ui/state.js`
  - `services/generatorLoader.js`
  - `services/textGenerator.js`
- [ ] Convert `RandomizerEngine.js` to export as ES module.
- [ ] Update `index.html` to load script via `<script type="module" src="/src/main.js"></script>`.
- [ ] Add `vite.config.js` (copy JSON assets, dev server config).
- [ ] Add lightweight logger (toggle via `import.meta.env.MODE`).
- [ ] Consolidate Python examples into `examples/` or CLI.
- [ ] Run Vite dev server and verify functionality.
- [ ] Write README section on build / run instructions.
- [ ] Set up automated testing infrastructure (Vitest or Jest).
  - Create `tests/` directory at project root.
  - Add sample tests:
    - `RandomizerEngine` loads generators without errors.
    - `generate()` returns a non-empty string for default entry point.
    - UI helpers (`ui/state.js`) correctly build entry-point dropdown given mock generator.
  - Add npm scripts: `"test": "vitest", "test:watch": "vitest --watch"`.
  - Configure `vitest.config.js` to alias src imports and include JSON asset handling.
  - Ensure CI workflow can run `npm test`.


---
_Last updated: 2025-06-24 14:46 CT_
