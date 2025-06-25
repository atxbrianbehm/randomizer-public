# LLM Content Development Guide for Generator Packs

This guide explains how to expand, modularize, and maintain generator content for the Randomizer Engine using Markdown documentation. It is written for both LLMs and human contributors.

---

## Overview

- **Purpose:** Enable contributors to safely and effectively expand generator packs, including new categories, entries, and modular subfiles.
- **Audience:** LLMs, developers, writers, and content creators.

---

## 1. Schema and Category Reference

### Generator Pack Structure

- `metadata`: Pack info (name, version, previewImage, description, etc.)
- `assets`: Images, audio, fonts, styles
- `variables`: Dynamic values for use in prompts
- `grammar`: Main categories (platforms, mediaContexts, downfalls, etc.)
- `entryPoints`: Default and alternative entry points for generation

### Example: metadata
```json
"metadata": {
  "name": "Televangelist Generator",
  "version": "2.0.0",
  "previewImage": "televangelistPackThumb.png",
  "description": "Generates elaborate, humorous televangelist scenarios.",
  "author": "Your Name",
  "created": "2025-06-21",
  "category": "comedy",
  "tags": ["humor", "satire", "television", "religion"]
}
```

### Category Details
For each `grammar` category:
- **Purpose:** What this category controls in output
- **Example:**
  - `platforms`: ["Instagram Live", "Facebook", "Satellite TV", ...]
  - `mediaContexts`: Array of objects with `label`, `desc`, `eras`, `snafus`
  - `downfalls`: ["IRS audit scandal", ...]
- **Guidelines:**
  - Use humor, exaggeration, and period-appropriate language
  - Avoid duplicating existing entries
  - Keep entries concise and punchy

### Advanced Features
- Weighted entries, conditional logic, and nested categories are allowed (see core engine docs for syntax).
- Use `advancedFields` and `uiText` for UI-driven features.


### UI & Lockable Rule Guidelines (Advanced Options Modal)

These rules ensure generator packs integrate cleanly with the Randomizer’s dynamic Advanced Options UI.

- **Lockable Rules**: Any grammar key whose value is
  - An array of strings, or
  - An array of objects using `{ "label": "...", "value": "..." }`
  qualifies as *lockable* and will appear in the modal.
- **Input Type Mapping**
  - Arrays of simple strings → single-select dropdown.
  - Arrays of `{label,value}` objects → single-select dropdown using `label` for UI and `value` for output.
  - Designated multi-select categories (e.g., `keyMaterials`, `screenType`, `dominantControls`) render as checkbox grids. Document any new multi-select categories in the pack’s `uiConfig.multiSelect` array to opt-in.
- **Human-Readable Labels**: Override default key-to-label mapping with optional `uiLabel` in the generator JSON:
  ```json
  "keyMaterials": {
    "_meta": { "uiLabel": "Key Materials (multiple)" },
    "$values": [ ... ]
  }
  ```
  If `uiLabel` is absent, the engine will auto-format the key (camelCase → "Camel Case").
- **Display Order**: Packs may specify a `uiOrder` array at the root to dictate field ordering. Unlisted keys follow alphabetic order.
- **Optional Detail Grouping**: Less-critical or verbose categories can be listed in `uiOptional` to appear inside the collapsible "Optional Details" section.
- **Randomization Helpers**: The engine’s randomizer respects the lock state. Checkbox groups will randomly select up to the max specified in `uiConfig.maxCheckboxSelect` (default = 4).
- **Narrative Prompt Templates**: Packs may include a `promptTemplate` string with Handlebars-style `{{placeholder}}` tokens referencing grammar keys/variables to produce richer prose. If omitted, the default concatenation template is used.
- **Copy-to-Clipboard UX**: No action required by content authors, but ensure `promptTemplate` stays under 2 KB for smooth clipboard operations.
- **Styling Advice**: Stick to semantic names; visual theming is handled by the host app.

---

## 2. Modularization Guidelines

### When to Modularize
- If a category is large or likely to be expanded independently, move it to a subfile (e.g., `mediaContexts.json`).

### How to Modularize
- Create a camelCase-named JSON file (e.g., `mediaContexts.json`).
- In the main generator JSON, reference it with:
  ```json
  "mediaContexts": { "$include": "mediaContexts.json" }
  ```
- Ensure subfiles are valid JSON arrays or objects as required.

### Validating Modular Packs
- Use the loader to check for missing or malformed subfiles.
- Optionally, use a schema validator (if available).

---

## 3. Expansion Recipes for LLMs

### Adding New Entries
- "Add 10 new 1980s TV platforms to `platforms.json`."
- "Expand `downfalls.json` with 5 more social media scandals."

### Creating New Categories
- "Create a new category `miracleTypes` for use in flavor text."
- "Add a new subfile `taglines.json` with 20 humorous televangelist taglines."

### Writing for Style and Variety
- Use humor, exaggeration, and period-appropriate language.
- Avoid duplicating existing entries.
- Keep entries concise and punchy.

---

## 4. Contribution Best Practices

- **Naming:** Use camelCase for all fields and files.
- **Duplication:** Check for and avoid duplicate entries.
- **Testing:** After editing, reload the generator in the browser to verify new content appears and works as expected.
- **Preview Images:** Add or update the `previewImage` in metadata when creating a new pack.

---

## 5. Example Templates

### Generator Pack Template
```json
{
  "metadata": { ... },
  "assets": { ... },
  "variables": { ... },
  "grammar": {
    "platforms": { "$include": "platforms.json" },
    "mediaContexts": { "$include": "mediaContexts.json" },
    ...
  },
  "entryPoints": { ... }
}
```

### Subfile Template (`mediaContexts.json`)
```json
[
  {
    "label": "Infomercial",
    "desc": "Late-night TV infomercial",
    "eras": ["1980s TV era", "1990s cable boom"],
    "snafus": ["microphone fails", "product malfunction"]
  },
  ...
]
```

---

## 6. FAQ and Troubleshooting

- **Malformed JSON:** Use a linter or validator to check for errors.
- **Missing Fields:** Compare with the schema or template.
- **Loader Errors:** Check file paths, `$include` directives, and JSON validity.
- **Preview Image Not Displaying:** Ensure `previewImage` exists in the pack directory and is referenced correctly in metadata.

---

## 7. Contact / Issues

- For help, contact the maintainer or submit an issue in the project repository.
