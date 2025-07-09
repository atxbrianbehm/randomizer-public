# Changelog

---

## [1.5.0] – 2025-07-09

### Added
- Generator Import / Export pipeline with `GeneratorBundle` JSON schema (`src/schema/generatorBundle.json`).
- AJV-based validator & helpers (`src/utils/validateGeneratorBundle.js`).
- Vitest suite `tests/validator.bundle.test.js` (+3 cases).
- Developer docs: `docs/generator_import_guide.md` & updated architecture diagram (`docs/design/architecture.md`).

### Changed
- `package.json` devDependencies: added `ajv-formats`.
- `plan.md` import/export tasks completed.

### Fixed
- All tests pass (118); removed obsolete snapshot.

---

## [1.4.0] – 2025-07-09

### Added
- Slot taxonomy integration across documentation.
- New generator docs: Anachronistic Tech Panel, Deciduous Tree, Evergreen Tree, Satanic Panic, Televangelist.
- System design doc updated with Slot Taxonomy & Prompt Targeting sections.
- Metadata storage decision doc updated with Slot Taxonomy alignment guidance.

### Changed
- Refactor opportunities doc marks all high-priority items as completed.
- Plan.md refreshed to reflect completion of documentation overhaul.

### Fixed
- n/a

---

## [1.3.3] – 2025-07-09

### Added
- Comprehensive edge-case unit tests for `$include` resolver covering malformed JSON, multiple include items, depth cap, non-string values, relative paths, and circular chains (2- and 3-file).
- New test file `tests/resolveIncludes_edgecases.test.js` and `tests/generatorLoader_circular.test.js`.

### Changed
- `resolveIncludes` now logs full circular include chains, flattens multi-include arrays, enforces depth cap, validates `$include` value type, and handles non-JSON responses gracefully.
- README and `docs/LLM_Content_Development_Guide.md` updated with detailed error-handling guidelines.

### Fixed
- Potential crash when `$include` value is non-string.

---

## [1.3.2] – 2025-07-09

### Changed
- Removed System Architecture and JSON Viewer panels from the UI (HTML, CSS, JS) for a cleaner interface.
- Generated prompt list now appends individual prompt capsules, flows naturally without internal scrollbar, and history is capped to 20.

### Added
- `clearOutput()` method in `RandomizerApp` and event bindings for prompt history clearing.

### Fixed
- Eliminated dead `toggleJsonViewer` handler and related CSS selectors.

---

## [1.3.1] – 2025-07-09

### Added
- Test helper factory (`tests/helpers/mockGenerator.js`) and corresponding helper-loading utility.

### Changed
- Refactored existing tests to use the helper; new file `tests/stateHelpers_refactored.spec.js` replaces legacy inline-generator tests.
- `vitest.config.js` updated to exclude helper directory and legacy `stateHelpers.spec.js`.

### Fixed
- Removed repetitive inline generator JSON blobs from test suites, reducing duplication and improving maintainability.

---

## [1.3.0] – 2025-07-09

### Added
- **Opera Character Generator v0.3.0** with
  - Lockable rule UI integration and state persistence.
  - Arrays extracted to `/generators/includes/opera/*` and referenced via `$include` for modular maintenance.
- Unit tests for locking UI and `$include` resolution now pass across full suite (104 tests).
- **Anachronistic Tech Panel Generator v1.0** integrated with color-palette swatches, multi-select UI, lockable categories, snapshot tests, and placeholder preview image.

### Changed
- `resolveIncludes` recursion performance optimized; generator loader fully supports nested `$include` patterns.

### Fixed
- Removed obsolete snapshot from `tests/opera_locking_snapshot.test.js` (flagged as obsolete by Vitest).

---

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] – 2025-07-08

### Added
- **Utility Helpers** (`src/utils/helpers.js`)
  - `fetchJsonCached` – session-cached JSON fetch
  - `deepMergePreserveArrays` – safe deep merge that keeps arrays intact
  - `slugify` – lower-case dash slugs
  - `randomPickWeighted` – weighted random selection
  - `flattenIncludes` – static analysis helper listing all `$include` paths
  - `validateGeneratorSpec` – AJV-powered JSON schema validator
  - `parseRulePlaceholders` – grammar placeholder tokenizer
- **JSON Schema** for generators at `src/schema/generator.json`.
- **Unit Tests** covering all helpers (`tests/utils.helpers.test.js`).

### Changed
- Development dependency **Vite upgraded to 7.x**, fixing esbuild dev-server vulnerability.

### Fixed
- n/a

---

## [1.1.0] – 2025-07-08

### Added
- **≥ 90 % unit-test coverage** for JavaScript codebase (Vitest + jsdom).
- Snapshot tests for prompt readability (`readablePrompt_snapshot.test.js`) with CI gating.
- Comprehensive tests for:
  - `src/ui/advancedModal.js` helpers (lock button, grouping, auto-lock).
  - `scripts/grammarInventory.js`, `scripts/metadataLinter.js`, `src/utils/logger.js`.
  - `services/generatorLoader.js` `$include` resolver (happy-path, meta merge, circular guard).
- Local coverage badge in README.
- Modifier reference table, persistence diagram, and debug-overlay GIF in `docs/LLM_Content_Development_Guide.md`.
- Pre-commit Husky hook that runs `eslint` and `vitest`.
- `npm run watch:test` script for TDD loops.

### Changed
- CI workflow now fails if coverage < 90 % or snapshots drift.
- `vitest.config.js` updated with coverage thresholds and exclude patterns for dead code.
- README quick-start instructions and project badges refreshed.

### Fixed
- Loader now supports array pattern `[{ _meta }, { $include }]` without losing `_meta` entry.
- Cyclic-rule detection in `RandomizerEngine` prevents infinite recursion.
- Advanced modal lock-button icon sync.

### Removed
- Obsolete snapshot test `tests/readablePrompt_snapshot.test.js` (replaced by new snapshots).

---

## [1.0.0] – 2025-06-01
Initial public release.
