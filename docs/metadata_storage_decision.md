# Metadata Storage Decision

Date: 2025-06-26
Author: Randomizer Team

## Requirement
Each prompt-visible grammar rule needs metadata (slot, connector, priority, modifiers). We must choose where to store this metadata so that:
1. Generator authors can understand and edit it easily.
2. The loader can access it quickly without extra network fetches.
3. Backwards-compat and tooling (linter) stay simple.

## Options Considered

### A. Inline `_meta` Block (chosen)
```jsonc
"panelArchetype": {
  "_meta": { "slot": "subject", "priority": 10 },
  "$values": ["industrial console", "medical terminal"]
}
```
*Pros*
- Single file: content + metadata co-located → easy for authors to keep in sync.
- No additional HTTP fetch in browser.
- JSON schema evolution is straight-forward.
*Cons*
- Adds a small amount of size to generator JSON (≈3–5 %).
- Requires `$values` wrapper for simple arrays.

### B. External Map per Generator
```jsonc
// metadata.json
{"panelArchetype": {"slot": "subject"}, ...}
```
*Pros*
- Leaves grammar arrays untouched (cleaner diff).
- Could be reused across multiple packs.
*Cons*
- Extra file to maintain; easy for metadata & grammar to diverge.
- Additional network request or bundling step.

### C. Central Registry in Codebase
*Store a JS/JSON map inside the app code*
*Pros*: Zero impact on generator assets.
*Cons*: Requires code deploy to update metadata, blocking content authors.

## Decision
**Option A – Inline `_meta`** is adopted.

Rationale:
- Simplicity for pack authors; metadata sits next to the rule it describes.
- Avoids extra files & requests.
- Minor size impact is acceptable (generators are already <150 KB).

## Implementation Notes
1. For simple string arrays, convert to object form with `$values` key (as above) so `_meta` can coexist.
2. Loader must ignore unknown keys starting with `_`.
3. Linter ensures each prompt-visible rule has `_meta.slot`.
4. Future metadata fields should be documented in `LLM_Content_Development_Guide.md`.

### Slot Taxonomy Alignment
With the adoption of the **canonical slot taxonomy** (`docs/slot_taxonomy.md`) and the Smart Prompt Rewriter, `_meta.slot` values **must** reference one of the approved slot keys. This ensures:
1. UI components map cleanly to grammar rules.
2. Prompt Rewriter can reorder fragments deterministically.
3. Analytics pipelines receive consistent slot data.

Pack authors should consult the taxonomy table before assigning new slots.
