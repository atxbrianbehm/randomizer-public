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
- [ ] Expand `LLM_Content_Development_Guide.md` with examples, modifier reference, persistence schema, and debug overlay tips


- [ ] Write updated LLM guide for assembling generators


### 2. New Generator – Anachronistic Tech Panel
- [ ] Convert provided JSON → `generators/anachronisticTechPanel.json`
- [ ] Optimize preview image ≤150 KB
- [ ] Import in `generators/index.js` & dropdown label "Tech Panel (Retro-Future)"
- [ ] Extend variable-lock rules to cover new categories
- [ ] Add README section with usage & example image

### 3. Advanced Options Modal Refactor
- [ ] Add `getLockableRules(generatorName)` in `RandomizerEngine`
- [ ] Compute dynamic `lockableRules` on generator select
- [ ] Refactor modal builder to auto-generate UI
- [ ] Sync dropdown states with `engine.lockedValues`
- [ ] Remove legacy `LOCKABLE_FIELDS` logic
  - [ ] Maintain prompt history array in state; cap to last N (e.g., 20) and prune old nodes
  - [ ] Provide clear-history button functionality & modal logic
- [ ] Polish: alphabetical sort, search/filter, persist locks in `localStorage`
- [ ] Refactor generated prompt container to flex-column flow
- [ ] Render each prompt in its own capsule component (CSS card)
- [ ] Append new prompt capsules at top (or bottom) without replacing existing ones

### 4. Expand Existing Generators
- [ ] Generator A: +12 `possibleCharacters`; add `tone` grammar (6 moods)
- [ ] Generator B: expand `adjectives` to 30 items; add `lighting` category
- [ ] Generate new 512×512 thumbnails
- [ ] Increment `version` & update CHANGELOG

### 5. Verification & QA
- [ ] Manual smoke-test scenarios (prompts, theme toggle, variable lock)
- [ ] Ensure dev bundle <200 KB gzip
- [ ] Run Lighthouse a11y audit and hit ≥90 score



### Immediate Next Steps (2025-07-09)
- Edge-case & error-handling tests for engine and generatorLoader
- Expand `LLM_Content_Development_Guide.md` sections

- Clean up legacy `stateHelpers.spec.js` when confident, then remove exclusion from `vitest.config.js`.
- [ ] Add edge-case & error-handling tests for engine and generatorLoader
- [ ] Stub expanded sections in `LLM_Content_Development_Guide.md`


## Task List
### Active Tasks

<!-- Completed phases moved to bottom -->
<!-- Active tasks begin below -->


- [x] Phase 5 – Debug Overlay / Expansion Tree

- [ ] Phase 6 – Testing & Documentation Polish
  - [ ] Harden CI workflow (size-budget, coverage upload)
  - [ ] Finalize LLM Content Development Guide rewrite

- [ ] Phase 7 – Documentation & Developer Experience Audit and update documentation (README, dev guides)
  - [ ] Write updated LLM guide for assembling new generators Identify further code refactoring opportunities
- [ ] Phase 8 – Visual Rule Graph (stretch)
  - [ ] Render grammar DOT graph with Viz.js for authors.

- [ ] Codebase cleanup
  - [ ] Abstract lockable list into `constants.js`
  - [ ] Add JSDoc for all `RandomizerApp` methods

- [ ] Advanced Options Modal UI Polish
  - [ ] Gray out conditional variable options in modal when not valid (e.g., gendered options when mismatched with locked selections)

### Archive
All completed milestones up to v1.3.0 are documented in CHANGELOG and Git history.







  - [ ] Keep dev bundle <200 KB gzip.

  - [ ] Run Lighthouse a11y audit and hit ≥90 score.

### 4. New Generator • Anachronistic Tech Panel
- **Phase 1 – Asset & Spec**
  - [ ] Convert provided JSON → `generators/anachronisticTechPanel.json`.
  - [ ] Optimise `previewImage` ≤150 KB.
- **Phase 2 – Integration**
  - [ ] Import in `generators/index.js` & dropdown label “Tech Panel (Retro-Future)”.
- **Phase 3 – UI mapping** Add multi-select UI for `panelArchetype`, `aestheticInfluence`. Display color-palette swatches.
- **Phase 4 – Logic** Update `RandomizerEngine.generate()` for nested arrays.
  - [ ] Extend variable-lock rules to cover new categories.
- **Phase 5 – Tests** Snapshot test sample prompt.
  - [ ] Validate error on invalid `grammar` entry.
- **Phase 6 – Docs**
  - [ ] README section with usage & example image.

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


### Documentation Overhaul (2025-07-09)
- [ ] Expand slot taxonomy with 10 new slots in `docs/slot_taxonomy.md` and update rules/order.
- [ ] Update `docs/LLM_Content_Development_Guide.md` with slot references and prompt diagram.
- [ ] Update `docs/LLM_Generator_Assembly_Guide.md` with examples using new slots.
- [ ] Revise `docs/advanced_modal.md` to show new slots in UI.
- [ ] Extend `docs/grammar_inventory.md` with canonical variable names for new slots.
- [ ] Refresh generator-specific docs (Opera, etc.) with slot-rich examples.
- [ ] Add notes in `docs/FUTURE_DIRECTIONS.md` about semantic richness.
- [ ] Prune completed items from `docs/refactor_opportunities.md` and add automation idea.
- [ ] Update diagrams/images if needed in `docs/system_design_doc.md`.
- [ ] Audit `docs/metadata_storage_decision.md` for outdated slot references.

---

## Completed Tasks (archived)

---
_Last updated: 2025-07-09 01:17 CT_

## Tasks (detailed)

### Folder restructure & source migration
- [ ] Move existing JS into `src/` and split modules: `src/ui/init.js` – bootstrap code. `src/ui/events.js` – DOM event bindings. `src/ui/state.js` – UI state rendering helpers.
  - `src/services/generatorLoader.js` – async fetch  Move generator loader logic → src/services/generatorLoader.js Move text generator logic → src/services/textGenerator.js Extract modal helpers → src/ui/advancedModal.js Extract theme toggle → src/ui/theme.js Extract variable lock helpers → src/services/variableLocks.js Remove large methods from RandomizerApp (use thin wrappers) Delete deprecated initializeGenerators method
  - [ ] Refactor main.js:
    - [ ] Remove redundant code
- [ ] Update all internal imports after file moves.


### HTML / CSS
- [ ] Verify all IDs/classes referenced in JS exist in HTML.

### Verification
- [ ] Run `npm run dev` and manually exercise UI to ensure no regressions.
- [x] Run `npm run build` and serve `/dist` to confirm production bundle works.
- [ ] Ensure all tasks above are checked off before closing milestone.
- [x] Audit codebase and list refactor opportunities.
- [x] Decide on build tool: **Vite**.

---
_Last updated: 2025-06-25 09:47 CT_
