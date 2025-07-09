# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
