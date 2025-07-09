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

### 1. Docs & Developer Experience
- [x] Expand `LLM_Content_Development_Guide.md` with examples, modifier reference, persistence schema, and debug overlay tips


- [x] Write updated LLM guide for assembling generators


### 2. New Generator – Anachronistic Tech Panel
- [x] Convert provided JSON → `generators/anachronisticTechPanel.json`
- [x] Optimize preview image ≤150 KB
- [x] Import in `generators/index.js` & dropdown label "Tech Panel (Retro-Future)"
- [x] Extend variable-lock rules to cover new categories
- [x] Add README section with usage & example image

### 3. Advanced Options Modal Refactor
- [x] Add `getLockableRules(generatorName)` in `RandomizerEngine`
- [x] Compute dynamic `lockableRules` on generator select
- [x] Refactor modal builder to auto-generate UI
- [x] Sync dropdown states with `engine.lockedValues`
- [x] Remove legacy `LOCKABLE_FIELDS` logic
  - [x] Maintain prompt history array in state; cap to last N (e.g., 20) and prune old nodes
  - [x] Provide clear-history button functionality & modal logic
- [x] Polish: alphabetical sort, search/filter, persist locks in `localStorage`
- [x] Refactor generated prompt container to flex-column flow
- [x] Render each prompt in its own capsule component (CSS card)
- [x] Append new prompt capsules at top (or bottom) without replacing existing ones

### 4. Expand Existing Generators
- [x] Generator A: +12 `possibleCharacters`; add `tone` grammar (6 moods)
- [x] Generator B: expand `adjectives` to 30 items; add `lighting` category
- [x] Generate new 512×512 thumbnails
- [x] Increment `version` & update CHANGELOG

### 5. Verification & QA
- [x] Manual smoke-test scenarios (prompts, theme toggle, variable lock)
- [x] Ensure dev bundle <200 KB gzip
- [x] Run Lighthouse a11y audit and hit ≥90 score



### Immediate Next Steps (2025-07-09)
- Edge-case & error-handling tests for engine and generatorLoader
- Expand `LLM_Content_Development_Guide.md` sections

- Clean up legacy `stateHelpers.spec.js` when confident, then remove exclusion from `vitest.config.js`.
- [x] Add edge-case & error-handling tests for engine and generatorLoader
- [x] Stub expanded sections in `LLM_Content_Development_Guide.md`


## Task List
### Active Tasks

<!-- Completed phases moved to bottom -->
<!-- Active tasks begin below -->


- [x] Phase 5 – Debug Overlay / Expansion Tree

- [x] Phase 6 – Testing & Documentation Polish
  - [x] Harden CI workflow (size-budget, coverage upload)
  - [x] Finalize LLM Content Development Guide rewrite

- [x] Phase 7 – Documentation & Developer Experience Audit and update documentation (README, dev guides)
  - [x] Write updated LLM guide for assembling new generators Identify further code refactoring opportunities
- [x] Phase 8 – Visual Rule Graph (stretch)
  - [x] Render grammar DOT graph with Viz.js for authors.

- [x] Codebase cleanup
  - [x] Abstract lockable list into `constants.js`
  - [x] Add JSDoc for all `RandomizerApp` methods

- [x] Advanced Options Modal UI Polish
  - [x] Gray out conditional variable options in modal when not valid (e.g., gendered options when mismatched with locked selections)

### Archive
All completed milestones up to v1.3.0 are documented in CHANGELOG and Git history.







  - [x] Keep dev bundle <200 KB gzip.

  - [x] Run Lighthouse a11y audit and hit ≥90 score.

### 4. New Generator • Anachronistic Tech Panel
- **Phase 1 – Asset & Spec**
  - [x] Convert provided JSON → `generators/anachronisticTechPanel.json`.
  - [x] Optimise `previewImage` ≤150 KB.
- **Phase 2 – Integration**
  - [x] Import in `generators/index.js` & dropdown label “Tech Panel (Retro-Future)”.
- **Phase 3 – UI mapping** Add multi-select UI for `panelArchetype`, `aestheticInfluence`. Display color-palette swatches.
- **Phase 4 – Logic** Update `RandomizerEngine.generate()` for nested arrays.
  - [x] Extend variable-lock rules to cover new categories.
- **Phase 5 – Tests** Snapshot test sample prompt.
  - [x] Validate error on invalid `grammar` entry.
- **Phase 6 – Docs**
  - [x] README section with usage & example image.

---

### 5. Expand Existing Generators
- **Generator A**
  - [x] Add 12 new `possibleCharacters` entries.
  - [x] Introduce `tone` grammar with 6 moods.
- **Generator B**
  - [x] Expand `adjectives` list to 30 items.
  - [x] Add `lighting` category (e.g., rim-light, dusk).
- **Common**
  - [x] Generate new 512×512 thumbnails.
  - [x] Increment `version` & add CHANGELOG entry.

### Opera Character Generator Enhancements (completed)
  - Phase 1 – Analysis & Design
    - [x] Review current `opera_character_generator.json` structure
    - [x] Identify categories suitable for locking (e.g., `character`, `setting`, `tone`)
  - Phase 2 – Locking Support
    - [x] Mark lockable rules in generator metadata or register via `getLockableRules`
    - [x] Ensure advanced-options modal lists Opera categories
    - [x] Persist locked values and write Vitest snapshot test for locked prompt
  - Phase 3 – $include Refactor
    - [x] Extract large/overlapping arrays into `/generators/includes/opera/*.json`
    - [x] Replace arrays in Opera generator with `$include` directives
    - [x] Confirm `generatorLoader` correctly resolves nested includes (unit test)
  - Phase 4 – Docs & Versioning
    - [x] Update README/LLM guide with Opera locking instructions and examples
    - [x] Bump generator `version` and add CHANGELOG entry


### Documentation Overhaul (2025-07-09)
- [x] Expand slot taxonomy with 10 new slots in `docs/slot_taxonomy.md` and update rules/order.
- [x] Update `docs/LLM_Content_Development_Guide.md` with slot references and prompt diagram.
- [x] Update `docs/LLM_Generator_Assembly_Guide.md` with examples using new slots.
- [x] Revise `docs/advanced_modal.md` to show new slots in UI.
- [x] Extend `docs/grammar_inventory.md` with canonical variable names for new slots.
- [x] Refresh generator-specific docs (Opera, etc.) with slot-rich examples.
- [x] Add notes in `docs/FUTURE_DIRECTIONS.md` about semantic richness.
- [x] Prune completed items from `docs/refactor_opportunities.md` and add automation idea.
- [x] Update diagrams/images if needed in `docs/system_design_doc.md`.
- [x] Audit `docs/metadata_storage_decision.md` for outdated slot references.

---

## Completed Tasks (archived)

---
_Last updated: 2025-07-09 01:17 CT_

## Tasks (detailed)

### Folder restructure & source migration
- [x] Move existing JS into `src/` and split modules: `src/ui/init.js` – bootstrap code. `src/ui/events.js` – DOM event bindings. `src/ui/state.js` – UI state rendering helpers.
  - `src/services/generatorLoader.js` – async fetch  Move generator loader logic → src/services/generatorLoader.js Move text generator logic → src/services/textGenerator.js Extract modal helpers → src/ui/advancedModal.js Extract theme toggle → src/ui/theme.js Extract variable lock helpers → src/services/variableLocks.js Remove large methods from RandomizerApp (use thin wrappers) Delete deprecated initializeGenerators method
  - [x] Refactor main.js:
    - [x] Remove redundant code
- [x] Update all internal imports after file moves.


### HTML / CSS
- [x] Verify all IDs/classes referenced in JS exist in HTML.

### Verification
- [x] Run `npm run dev` and manually exercise UI to ensure no regressions.
- [x] Run `npm run build` and serve `/dist` to confirm production bundle works.
- [x] Ensure all tasks above are checked off before closing milestone.
- [x] Audit codebase and list refactor opportunities.
- [x] Decide on build tool: **Vite**.

---
_Last updated: 2025-06-25 09:47 CT_
