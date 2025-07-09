# LLM Generator Assembly Guide

*Status: Draft – 2025-07-08*

This guide explains how to create and maintain JSON generators for the Randomizer Engine. It targets:

- Developers and technical writers
- LLM agents collaborating via PRs
- Designers extending existing generators

---

## Contents
1. [Generator JSON Essentials](#1-generator-json-essentials)
2. [Authoring Patterns](#2-authoring-patterns)
3. [Worked Examples](#3-worked-examples)
4. [Advanced Topics](#4-advanced-topics)
5. [Testing Workflow](#5-testing-workflow)
6. [Common Pitfalls & FAQ](#6-common-pitfalls--faq)
7. [Quick-Start Templates](#7-quick-start-templates)

---

## 1. Generator JSON Essentials
A generator JSON file has four required sections:

| Key | Purpose |
|-----|---------|
| `metadata` | Name, version, description, tags, preview image |
| `variables` | Numeric or string variables tracked during generation |
| `grammar` | Rule definitions (arrays, weighted objects, conditional objects) |
| `entry_points` | Default rule(s) the engine starts from |

### Minimal Example
```jsonc
{
  "metadata": { "name": "Hello World", "version": "1.0.0" },
  "grammar": {
    "greeting": ["Hello", "Hi", "Hey"],
    "default": ["#greeting# world!"]
  },
  "entry_points": { "default": "default" }
}
```

---

## 2. Authoring Patterns

### 2.1 Plain Arrays (string values)
Most basic form:
```jsonc
"colors": ["red", "green", "blue"]
```

### 2.2 Object-Wrapped Arrays
Useful for UI labels or weights:
```jsonc
"tones": [
  { "label": "Serious", "value": "serious" },
  { "label": "Playful", "value": "playful", "weight": 2 }
]
```

### 2.3 `$include` Single Object
```jsonc
"platforms": { "$include": "platforms.json" }
```

### 2.4 `_meta` + `$include` Array Pattern (2025-07-08)
```jsonc
"platforms": [
  { "_meta": { "uiLabel": "Streaming Platforms" } },
  { "$include": "platforms.json" }
]
```
The loader merges the included array *after* `_meta`. Keep `_meta` first.

---

## 3. Worked Examples

### 3.1 Opera Character Generator (object-wrapped arrays)

The Opera generator stores most categories as **object arrays** so that each option can have both a human-readable label and an internal value. Every lockable rule therefore appears in the Advanced Options modal.

```jsonc
"voiceType": [
  { "label": "Dramatic Soprano", "value": "dramatic_soprano" },
  { "label": "Coloratura Soprano", "value": "coloratura_soprano" },
  { "label": "Lyric Tenor",        "value": "lyric_tenor" }
],
"_meta": { "uiLabel": "Operatic Voice Type" }
```

Key points:
* **Lockable** – because the value is an array, the modal shows a dropdown.
* **`label` vs `value`** – UI shows the label; engine inserts the value.
* **Custom label** – `_meta.uiLabel` overrides the auto-generated label.

### 3.2 Anachronistic Tech Panel (include-array pattern)

The Tech-Panel generator keeps huge option lists in subfiles and merges them with local overrides using the new two-element array pattern.

```jsonc
"panelArchetype": [
  { "_meta": { "uiLabel": "Panel Archetype", "multiSelect": true } },
  { "$include": "panelArchetype.json" },
  "retro_command_console",           // local additions
  "biofeedback_interface"
],
"aestheticInfluence": [
  { "_meta": { "uiLabel": "Aesthetic Influences", "multiSelect": true } },
  { "$include": "aestheticInfluence.json" }
]
```

*The loader* flattens the included arrays after the `_meta` object, so UI metadata stays intact.

Additional highlights:
* **Multi-select** – `_meta.multiSelect` makes the modal render checkbox grids.
* **Color palette** – Tech-Panel includes a `palette` category with hex values for UI swatches.


### 2.5 Assigning Slots for the Prompt Rewriter

Every grammar rule that contributes a *chip* to the final sentence is mapped to a **slot**—see `docs/slot_taxonomy.md` for the canonical list and order.

If your rule name clearly matches a slot (e.g. `colour`, `materials`) the engine infers it automatically. Otherwise, pin the slot explicitly via `_meta.slot`:

```jsonc
"weatherMood": [
  { "_meta": { "slot": "mood" } },
  "sun-drenched optimism",
  "foreboding thunderclouds"
]
```

When inventing a brand-new slot, add it to `slot_taxonomy.md` first, then reference it here.

---

## 4. Advanced Topics

- **Weighted Rules & Probabilities** – syntax and examples.
- **Conditional Logic** – `type:"conditional"`, `conditions`, `actions`.
- **Modifiers** – chaining (`#rule.capitalize.a_an#`). Full reference in [`LLM_Content_Development_Guide.md`](LLM_Content_Development_Guide.md#6-modifier-reference-table).
- **Lockable Rules & UI** – how arrays translate to dropdowns; using `_meta.uiLabel`, `uiOrder`, `uiOptional`.

---

## 5. Testing Workflow

1. **Unit tests (Vitest)**  
   ```bash
   npm run test -- tests/generatorLoader_includes.test.js
   ```
   – Ensure generator loads without errors.  
   – Snapshot the prompt output.

2. **Manual QA**  
   Run the web app (`npm run dev`) and load your generator:  
   `http://localhost:5173/?generator=myGenerator`  
   Toggle `?dev=1` for the debug overlay.

3. **Coverage** – aim to keep overall coverage ≥90 %.

---

## 6. Common Pitfalls & FAQ

| Issue | Cause | Fix |
|-------|-------|-----|
| `[NO VALID OPTIONS]` | `$include` failed or empty array | Check file path and array syntax |
| Circular `$include` recursion | File A includes B, B includes A | Avoid; loader will throw. |
| UI dropdown missing | Array items not strings/objects | Ensure correct pattern |

---

## 7. Quick-Start Templates

### Blank Generator Template
```jsonc
{
  "metadata": {
    "name": "New Generator",
    "version": "0.1.0",
    "description": "…"
  },
  "variables": {},
  "grammar": {
    "placeholder": ["example"]
  },
  "entry_points": { "default": "placeholder" }
}
```

---

Contributions welcome! Open a PR with your new generator JSON and follow the testing workflow above.
