# Effective Design Patterns for Randomizer Engine Generators

This guide outlines useful design patterns, tips, and tricks for creating engaging and complex generators using the Randomizer Engine. These patterns are drawn from practical implementation and aim to help build modular, maintainable, and surprising generators.

## Introduction

Creating compelling procedural text (or prompt) generators involves more than just listing random words. By leveraging the features of the Randomizer Engine, such as `$include` directives, conditional logic, variables, and weighted options, we can build sophisticated systems that produce varied, coherent, and often surprising results. This guide will explore some of these techniques.

*(This guide will be populated as we develop the Deciduous Tree Prompt Generator and discover/implement various patterns.)*

## Core Patterns

### 1. Modularizing Grammar with `$include`

Breaking down large sets of options into separate, focused JSON files makes your main generator file cleaner and easier to manage. These included files can be thought of as specialized sub-grammars or lookup tables.

**Strategy:**

*   Identify categories of descriptions or lists of items that are extensive (e.g., 10+ species, many color names, numerous settings).
*   Create a new JSON file for each category within an `includes` subdirectory (e.g., `project_includes/category_name.json`).
*   Populate these files with arrays of strings or objects (which can include weights, actions, etc.).
*   In your main generator's grammar, use the `{"$include": "project_includes/category_name.json"}` directive to pull in these options.

**Example (from Deciduous Tree Generator):**

Instead of listing all tree species directly in `deciduous_tree_generator.json`, we create `deciduous_tree_includes/species.json`:

```json
// deciduous_tree_includes/species.json
[
  {"text": "Oak", "weight": 10},
  {"text": "Maple", "weight": 10},
  // ... more species
]
```

And in `deciduous_tree_generator.json`, a rule might be:

```json
// deciduous_tree_generator.json (grammar section)
"tree_species": {
  "$include": "deciduous_tree_includes/species.json"
}
```

This approach was used for:
*   `species.json`
*   `seasons.json`
*   `age_sizes.json`
*   `settings.json`
*   `leaf_attributes.json`
*   `bark_attributes.json`
*   Season-specific details (`spring_details.json`, etc.)
*   `cluster_descriptors.json`

**Benefits:**
*   **Readability:** Main generator file focuses on logic and structure, not vast data lists.
*   **Maintainability:** Easier to update or expand specific option sets without navigating a huge single file.
*   **Reusability (Potentially):** Some included files might be reusable across different generators if the categories overlap.

### 2. Conditional Logic with Variables

Variables can store state that influences subsequent rule choices. This is crucial for creating coherent and contextually relevant descriptions.

**Strategy:**

1.  **Define Variables:** In the `variables` section of your main generator file, define variables that will track important states (e.g., `current_season`, `object_material`).
2.  **Set Variables with Actions:** In your grammar rules (often in included files if they represent choices that set state), use the `actions` property on specific options to set these variables.
    ```json
    // deciduous_tree_includes/seasons.json example item
    {
      "text": "Autumn",
      "weight": 12,
      "actions": {
        "set": {"current_season": "autumn"}
      }
    }
    ```
3.  **Use Conditions to Select Rules/Text:** Create "logic" rules that use the `conditional` type. These rules check variable values to decide which further rules to expand or which text to output.

**Example (from Deciduous Tree Generator):**

The `deciduous_tree_generator.json` needs to describe tree details based on the selected season.

*   The `pick_season` rule (which includes `seasons.json`) sets the `current_season` variable.
*   A `seasonal_details_logic` rule then uses this variable:

```json
// deciduous_tree_generator.json (grammar section excerpt)
"seasonal_details_logic": {
  "type": "conditional",
  "options": [
    {
      "text": "#pick_spring_detail#", // Rule that includes spring_details.json
      "conditions": {"current_season": {"$eq": "spring"}}
    },
    {
      "text": "#pick_autumn_leaf_color#", // Rule for autumn colors
      "conditions": {"current_season": {"$eq": "autumn"}}
    },
    // ... other seasons
  ],
  "fallback": "in an indeterminate seasonal state"
}
```
This ensures that if "Autumn" was chosen (setting `current_season` to "autumn"), then the generator will try to expand `#pick_autumn_leaf_color#`.

**Benefits:**
*   **Contextual Relevance:** Descriptions adapt logically to prior choices.
*   **Dynamic Narratives:** Allows for simple cause-and-effect or state changes within the generated text.
*   **Reduced Redundancy:** Avoids creating massive single rules that try to handle all combinations explicitly.

### 3. Creating Conditional Unlocks

Conditional unlocks allow certain descriptive elements or entire rule branches to become available only when specific prior conditions are met, adding depth and discovery to the generator.

**Strategy:**

1.  **Identify Unlock Conditions:** Determine what combination of variable states or previous rule choices should trigger the unlock. (e.g., `tree_age_category` is "ancient" AND `setting_type` is "forest").
2.  **Create Content for Unlocked Feature:** Develop a new rule or include a new file containing the special descriptions for the unlocked feature (e.g., `pick_ancient_mystic_feature` including `ancient_mystic_features.json`).
3.  **Implement Conditional Logic Rule:**
    *   Create a new rule in your main generator that is of `type: "conditional"`.
    *   Define an `option` that points to your unlocked content rule (e.g., `{"text": "#pick_ancient_mystic_feature#"}`).
    *   Set the `conditions` for this option to check for the required variable states using operators like `$eq` and `$and` for multiple conditions, or `$in` for checking against a list of values.
    *   Provide a `fallback` that is an empty string (`""`) or a very subtle, neutral alternative if the conditions are not met. This ensures the generator doesn't break or insert awkward text if the feature isn't unlocked.
4.  **Integrate into Main Prompt:** Include the conditional logic rule in your main prompt structure(s).

**Example (from Deciduous Tree Generator):**

An "ancient mystic feature" is unlocked if the tree is "ancient" and in a "forest," "stone_circle," or "ley_lines" setting.

```json
// deciduous_tree_generator.json (grammar section excerpt)
"pick_ancient_mystic_feature": {"$include": "deciduous_tree_includes/ancient_mystic_features.json"},

"optional_ancient_feature_logic": {
  "type": "conditional",
  "options": [
    {
      "text": ". #pick_ancient_mystic_feature#", // Note leading punctuation for flow
      "conditions": {
        "$and": [
          {"tree_age_category": {"$eq": "ancient"}},
          {"setting_type": {"$in": ["forest", "stone_circle", "ley_lines"]}}
        ]
      }
    }
  ],
  "fallback": "" // Important: results in no text if conditions aren't met
}

// In the main prompt structure:
// "... #seasonal_details_logic##optional_ancient_feature_logic#"
```

**Benefits:**
*   **Sense of Discovery:** Users encounter special content under specific circumstances.
*   **Thematic Richness:** Allows for deeper thematic elements tied to particular combinations.
*   **Controlled Complexity:** Keeps rare or very specific details from appearing inappropriately.

### 4. Injecting Surprise Elements (Rare Features)

Adding very low-probability options to your rules can create delightful surprises and enhance the replayability of your generator.

**Strategy:**

1.  **Identify Surprise Opportunities:** Look for places in your grammar where an unexpected or whimsical detail could fit (e.g., a rare animal in a setting, a peculiar object, an unusual characteristic).
2.  **Create the Surprise Content:** Write the text for the surprise element.
3.  **Assign Very Low Weight:** When adding this as an option in an array of choices, give it a very small `weight` compared to other options (e.g., `0.1` to `0.5` when others are `5` to `15`).
    ```json
    // deciduous_tree_includes/bark_attributes.json example item
    {
      "text": "a tiny, perfectly carved miniature door almost hidden at its base",
      "weight": 0.2,
      "notes": "Surprise element - very rare"
    }
    ```
4.  **Consider Context (Optional):** Sometimes, a surprise might only make sense under certain conditions. You can combine this with conditional logic if needed, but often a simple low weight is effective for broad applicability.

**Benefits:**
*   **Increased Engagement:** Surprises make repeated use of the generator more interesting.
*   **Memorable Outputs:** Rare elements can lead to standout prompts.
*   **Fun Factor:** Adds a touch of playfulness.

**Testing Note:** Testing very rare events can be tricky. You might need to temporarily increase their weights during development to ensure they are being selected and formatted correctly, then reduce the weights for "production."

### 5. Generating Group Entities / Clusters

Sometimes you want to describe not just a single entity, but a small group or cluster. This requires a branching logic and ways to describe both the group and potentially its individual members (or at least a primary member and hints of others).

**Strategy:**

1.  **Decision Point:** Create an initial rule that decides whether to generate a single entity or a group. Use weighting for probabilities.
    *   This rule should set variables like `is_cluster` (boolean), `cluster_size` (number), and `cluster_type` (e.g., 'single_species', 'mixed_species_simple').
    ```json
    // deciduous_tree_generator.json excerpt
    "determine_cluster_or_single": [
      {"text": "#generate_single_tree_description#", "weight": 80, "actions": {"set": {"is_cluster": false, "cluster_size": 1}}},
      {"text": "#generate_cluster_description#", "weight": 20, "actions": [{"set": {"is_cluster": true}}, {"rule": "#_set_cluster_details#"}]}
    ],
    "_set_cluster_details": [ // Sets cluster_type and cluster_size via weighted options
      {"text": "", "weight": 28, "actions": {"set": {"cluster_type": "single_species", "cluster_size": 2}}},
      // ... other size/type options for single_species and mixed_species_simple
    ]
    ```
2.  **Single Entity Path:** Have a dedicated rule for generating the single entity description (this might be your original main generation rule).
3.  **Group Entity Path:** Create a separate rule for generating group descriptions. This rule will likely be conditional based on `cluster_type`.
    *   **Single Type Group:**
        *   Pick the type once (e.g., tree species using a rule like `#pick_species#` which ideally sets a variable like `tree_species_name`).
        *   Use rules or included files to get descriptive phrases for the group (e.g., `#pick_cluster_descriptor#`) and its size (e.g., `#cluster_size_numeric_text#`).
        *   Describe shared characteristics. Use pluralization modifiers where needed (e.g., `#tree_species_name.plural#`).
        ```json
        // deciduous_tree_generator.json excerpt for single_species cluster
        {
          "actions": [{"rule_once":"#pick_species#"}], // Conceptual action to ensure species name is set
          "text": "#pick_cluster_descriptor# #cluster_size_numeric_text# #tree_species_name.plural# stand together. ...",
          "conditions": {"cluster_type": {"$eq": "single_species"}}
        }
        ```
    *   **Mixed Type Group (Simple Approach):**
        *   Generate one primary entity in full detail using the single entity path.
        *   Append a phrase describing additional, less-detailed accompanying entities of a different type.
        *   A rule like `pick_different_species_text` can select another type.
        ```json
        // deciduous_tree_generator.json excerpt for mixed_species_simple cluster
        {
          "text": "#generate_single_tree_description# Nearby, #pick_different_species_text.a_an# other tree, of a different kind, adds to the small grove. ...",
          "conditions": {"cluster_type": {"$eq": "mixed_species_simple"}}
        }
        ```
4.  **Update Entry Point:** Your main generator entry point should now call the initial decision point rule (e.g., `default: "#determine_cluster_or_single#"`).

**Benefits:**
*   **Increased Variety:** Adds another dimension to the possible outputs.
*   **More Natural Descriptions:** Groups of entities are common in many scenarios.
*   **Modular Design:** Separates single vs. group logic, keeping rules manageable.

**Challenges:**
*   **True Mixed Groups:** Generating multiple, distinct, fully-detailed entities of different types within one generator call is complex with current engine features. The simple approach (one detailed, others hinted) is more feasible.
*   **Pronoun Agreement/Collective Nouns:** Pay attention to phrasing when describing groups vs. individuals (e.g., "it has" vs. "they have").
*   **Variable Scope for Actions & Capturing Selected Text:** Actions like `{"set_variable_from_selected_text": "var_name"}` (used conceptually in the Deciduous Tree Generator's `pick_species` rule to try and set `tree_species_name`) are powerful ideas but may not be standard engine features. If the engine doesn't support directly capturing the *text result* of a rule expansion into a variable via an action on the *calling* rule, you would typically need:
    *   The actions to be on the individual items within the included list (e.g., each species definition in `species.json` would need an action `{"set": {"tree_species_name": "Oak"}}`).
    *   Or, more complex rule structures to achieve such dynamic variable setting.

## Advanced Techniques
*(To be populated with more complex scenarios or combinations of patterns)*

## Tips for Development & Testing
*(To be populated)*
