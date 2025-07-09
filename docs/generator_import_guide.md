---
title: Generator Import & Schema Integration Guide
description: Granular plan for importing new generator bundles into the Randomizer Engine so they interoperate with PromptScape Randomizer Graph
last_updated: 2025-07-09
---

# 0 · Purpose
Define **exact steps, data contracts, and validation rules** that let authors drop a *Generator Bundle* (exported from the new node-based PromptScape Randomizer Graph) into the existing Randomizer Engine without manual tweaks.

# 1 · Supported Import Sources
1. **`.json` Generator Bundle** – single-file export created by the graph’s `graphToBundle()`.
2. **Directory Zip** – folder containing `bundle.json` + optional asset subfolders (images, includes).
3. **Legacy Grammar Folder** – classic `grammar.yaml` + `variables.yaml` + `metadata.json`. A shim converts this to the canonical bundle on import.

> All import paths converge to the **GeneratorBundle** object defined in §2.

# 2 · Canonical `GeneratorBundle` Schema
```ts
interface GeneratorBundle {
  metadata: {
    name: string;                 // display name in UI sidebar
    version: string;              // semver – bump on every export
    author: string;
    created: string;              // ISO-8601
    debug?: {
      seed?: number;              // last preview seed
      originGraphGuid?: string;   // GUID of source graph (optional)
    };
  };
  variables: Record<string, unknown>;     // arbitrary author vars
  grammar: Record<string, GrammarRule>;   // see rule spec below
  entry_points: {
    default: string;                       // key of starting rule
    alternatives?: string[];               // opt. additional entry rules
  };
  lockedValues?: Record<string, string>;   // generated when author locks a choice
  seed?: number;                           // persisted seed for deterministic reload
}
```
**GrammarRule (union):**
- `ArrayRule` – `string[]`
- `WeightedArrayRule` – `{text: string; weight?: number}[]`
- `ConditionalRule` – `{type: "conditional"; cases: ConditionalCase[]}`
- `SequentialRule`  – `{type: "sequential"; items: string[]}`
- `IncludeRule`     – `{$include: string}` *or* `[ {_meta?: {...}}, {$include: string} ]`
- `ModifierChainRule` – `{type: "modifier_chain"; base: string; mods: string[]}`

# 3 · Import Pipeline
| Step | Module | Action | Failure Mode |
| ---- | ------ | ------ | ------------ |
| 1 | `filePicker` | Read file(s) / drag-drop | Show *Unsupported file type* toast |
| 2 | `importDetector` | Identify source flavour (bundle/zip/legacy) | – |
| 3 | `legacyShim` | If legacy → convert to `GeneratorBundle` | Throw *Legacy conversion error* with line ref |
| 4 | `bundleValidator` | Validate against Zod schema `GeneratorBundleSchema` | List all validation errors in modal |
| 5 | `includeResolver` | Inline any `$include` paths, honour `_meta`+include pattern | Circular include ⇒ error & abort |
| 6 | `registerGenerator` | Add to engine registry, write to local store | Duplicate name ⇒ prompt *overwrite?* |

# 4 · Validation Rules & Edge Cases
1. **Unique Rule Keys** – `grammar` keys must be unique & match `/^[a-zA-Z0-9_]+$/`.
2. **Entry Exists** – `entry_points.default` **must** exist in `grammar`.
3. **Weights** – omit `weight` = 1; sum need not equal 1 (normalised at runtime).
4. **_meta+Include Merge** – If rule is `[ {_meta}, { $include } ]` the imported include is spliced **after** the `_meta` element.
5. **Circular `$include`** – depth-first traversal with a `seen` Set; error after 25 levels or repeat.
6. **Locked Values** – keys must map to arrays present in `grammar`; value must exist inside the array.
7. **Determinism** – When `seed` present, regenerate → result string **must** match snapshot.

# 5 · Mapping From Graph Nodes → Bundle Rules
| Node Type | Export Logic |
| --------- | ------------ |
| `SimpleArray` | Produces `string[]` rule |
| `WeightedArray` | Produces weighted object array |
| `Conditional` | Builds `ConditionalRule` object |
| `Sequential` | Builds `SequentialRule` |
| `Include` | Emits `$include` string or `_meta` pattern depending on author choice |
| `SetVariable` / `GetVariable` | Updates `variables` root |
| `ModifierChain` | Emits `ModifierChainRule` |

# 6 · Import UX Flow
1. **User action**: *Import Generator…* → file picker
2. **Preview Modal**: show metadata summary + list of rule keys
3. **Validate Button**: runs all checks; green tick or red list of issues
4. **Add to Library**: on success, the generator appears in sidebar under *My Generators* with a coloured badge *New*.

# 7 · CLI Support (headless)
```bash
randomizer import ./myGenerator.bundle.json --dest ~/.randomizer/generators
```
- Exits `0` on success, non-zero with JSON error report.
- Flag `--force` overwrites existing generator with same name.

# 8 · Testing Matrix
| Scenario | Expected |
| -------- | -------- |
| Valid bundle → import | Appears in library; engine.generate succeeds |
| Legacy folder → import | Shim produces identical prompts as original workflow |
| Circular include | Import fails with `ERR_CIRCULAR_INCLUDE` |
| Locked values respected | Regeneration repeats same choices |
| Seed persistence | Saving & reloading bundle keeps same preview results |

# 9 · Open Tasks
- [ ] Implement `GeneratorBundleSchema` in `src/shared/schemas.ts`
- [ ] Write `legacyShim.ts` with YAML → bundle conversion
- [ ] Build `bundleValidator.ts` using Zod
- [ ] Add Jest tests covering §8 matrix
- [ ] Extend CLI with `import` command
- [ ] Update docs/index.md TOC to link this guide

# 10 · Change Log
2025-07-09 – Initial draft (brianbehm + Cascade)
