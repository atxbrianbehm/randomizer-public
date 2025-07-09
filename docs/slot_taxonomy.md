# Canonical Slot Taxonomy

This taxonomy defines the semantic "slots" used by the Smart Prompt Rewriter to order and join chips into natural-language prompts.

| Slot | Description | Typical Connectors | Example Values |
|------|-------------|--------------------|----------------|
| **subject** | Core noun phrase or object being described. | — (start of sentence) | “retro-futuristic control panel”, “fire-and-brimstone sermon” |
| **condition** | State, quality or style adjectives/phrases that directly modify the subject. | adjectives before subject, or post-modifiers with “with” | “weather-beaten”, “glowing”, “state-of-the-art” |
| **purpose** | The intended function or goal of the subject. | “for”, “designed to”, comma | “guiding lost spacecraft”, “raising donations” |
| **materials** | Key materials, finishes, or construction details. | “made of”, “fashioned from”, comma list | “brushed aluminium”, “oak veneer”, “unobtainium” |
| **colour** | Dominant colour palette or accents. | “in”, comma | “sun-bleached pastel tones”, “neon magenta highlights” |
| **controls** | Interactive elements the user can manipulate. | “with”, comma | “toggle switches”, “glowing runes”, “rotary dials” |
| **displays** | Read-only visual output elements. | “featuring”, “with”, comma | “CRT read-outs”, “LED bar graphs” |
| **lighting** | Ambient or accent lighting around/on the subject. | “bathed in”, “under”, comma | “moody teal backlight”, “flickering candles” |
| **markings** | Text/graphics printed or engraved on the subject. | “bearing”, “adorned with”, comma | “caution stripes”, “holy sigils” |
| **density** | Level of complexity / amount of detail / greeble. | “covered in”, comma | “dense wiring”, “minimalist layout” |
| **texture** | Tactile surface qualities. | “with”, comma | “rough-hewn”, “velvety”, “corrugated” |
| **size** | Overall dimensions or scale. | adjectives before subject, or “measuring” | “miniature”, “room-sized”, “towering” |
| **age** | Era or wear level. | adjectives before subject, or “from” | “Victorian-era”, “battle-scarred”, “newly forged” |
| **style** | Artistic or genre influence distinct from condition. | adjectives before subject | “cyberpunk”, “art-nouveau” |
| **setting** | Immediate surroundings or environment. | preposition (“in”, “on”, “inside”) | “inside a neon-lit arcade”, “on a desert planet” |
| **mood** | Emotional ambience or vibe. | “with”, “radiating” | “ominous atmosphere”, “whimsical vibe” |
| **sound** | Auditory elements. | “emitting”, “with” | “low humming”, “crackling static” |
| **motion** | Dynamic behaviour or animation. | gerund verb or “with” | “slowly rotating”, “flickering intermittently” |
| **background** | Secondary objects or backdrop. | “with”, comma | “distant mountains”, “surrounded by technicians” |
| **provenance** | Origin, maker, or source. | “by”, “from” | “crafted by dwarven smiths”, “NASA-issued” |
| **view** | Desired camera angle or framing for renders. | placed at end; preposition varies | “top-down view”, “dramatic ¾ perspective” |

Default order: `subject → style → condition → size → age → purpose → materials → colour → texture → controls → displays → lighting → sound → motion → background → markings → density → provenance → setting → view`. (Feel free to customise per-generator.)

*Rules*
1. Slots are optional; missing slots are simply skipped.
2. Connectors may be customised per rule via its `_meta.connector` value.
3. If two adjacent slots share the same connector, join with a comma. (Eg. “with glowing runes, toggle switches”).
4. Edge cases: one chip = output as-is; two chips = join with default connector of second chip if first lacks one.
