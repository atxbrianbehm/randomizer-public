# 1970s Opera Character Prompt Generator

This generator creates detailed portrait prompts of solo opera attendees in a 1970s aesthetic. It was refactored from a legacy HTML/JS implementation into the JSON grammar format used by the RandomizerEngine.

## Location
`generators/opera_character_generator.json`

## Key Variables
| Variable | Type | Purpose |
|----------|------|---------|
| `attire_type` | string | Core clothing category (`gown`, `tuxedo`, `jacket`) |
| `gender` | string | Derived from attire (`female` / `male`) |

## Grammar Highlights
* **pick_attire** – first rule; sets both `attire_type` and `gender`.
* Conditional rules build gender-appropriate quirks, footwear, and clothing details.
* `generate_prompt` assembles the final descriptive string.

## Entry Points
* `default` – expands `#pick_attire# #generate_prompt#` to produce a full prompt in one call.

## Example Output
```
1970s color photograph, character sheet style. A single French person a young professional, with short and stout. She has with long, straight hair and a center part. She is wearing a glamorous wrap dress in shocking pink, featuring a bold, geometric pattern and chunky-heeled pumps. For a unique detail, the character is wearing oversized, tinted sunglasses. Full-body shot from head to toe, looking over their shoulder at the camera. The background is a solid, neutral gray color. Clean, even studio lighting.
```

## Slot Usage & UI Integration

All rules that surface in the prompt map to canonical slots so the Smart Prompt Rewriter can arrange the sentence fluidly.

| Rule | Slot | UI Control |
|------|------|------------|
| `attire_type` | style | dropdown (locked by default) |
| `fabric` | texture | dropdown |
| `colour` (derived) | colour | dropdown |
| `age_status` | age | dropdown |
| `quirk` | background elements | dropdown |

The Advanced Options modal therefore exposes these categories for fine-tuning. Feel free to add additional texture or mood rules following the same pattern—just tag them with the appropriate `_meta.slot`.

## Engine Enhancements
During integration, `RandomizerEngine` gained:
* Support for plain-string rules.
* Support for dict-wrapped option lists (e.g. `{ "species": [...] }`).
* Safer handling of empty-string fallbacks in conditional rules.
These improvements benefit all existing and future generators.
