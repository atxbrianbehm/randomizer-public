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
