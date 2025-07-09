# Changelog

---

## [1.3.0] – 2025-07-09

### Added
- **Opera Character Generator v0.3.0** with
  - Lockable rule UI integration and state persistence.
  - Arrays extracted to `/generators/includes/opera/*` and referenced via `$include` for modular maintenance.
- Unit tests for locking UI and `$include` resolution now pass across full suite (104 tests).

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
