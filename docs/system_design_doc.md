# Randomizer Engine System Design Document

## Overview

The Randomizer Engine is a flexible, modular system for creating and executing probabilistic text generation based on JSON-defined decision trees. The system allows users to create "generator bundles" that can be loaded dynamically to produce varied, humorous, or themed content.

## Architecture

### Core Components

#### 1. RandomizerEngine Core
- **Bundle Loader**: Loads and validates JSON generator files
- **Rule Processor**: Executes grammar rules with weighted selection
- **Variable Manager**: Tracks and updates generator variables
- **Asset Manager**: Handles images, audio, and styling assets

#### 2. Generator Bundle Format
Each generator bundle is a JSON file containing:
- **Metadata**: Name, version, description, author info
- **Assets**: Images, audio files, fonts, styling
- **Variables**: Dynamic values that change during generation
- **Grammar**: Rules defining text generation logic
- **Entry Points**: Starting points for generation

#### 3. Rule Types
- **Simple Arrays**: Basic random selection from list
- **Weighted**: Probability-based selection
- **Conditional**: Logic-based branching
- **Sequential**: Ordered execution
- **Markov**: Chain-based generation

## JSON Schema

```json
{
  "metadata": {
    "name": "Generator Name",
    "version": "1.0.0",
    "description": "What this generator creates",
    "author": "Creator Name",
    "category": "humor|educational|creative",
    "tags": ["tag1", "tag2"]
  },
  "assets": {
    "images": ["file1.jpg", "file2.png"],
    "audio": ["sound1.mp3"],
    "fonts": ["font1.ttf"],
    "styles": {
      "background": "#color",
      "text_color": "#color"
    }
  },
  "variables": {
    "variable_name": {
      "type": "string|number|boolean|array",
      "default": "initial_value",
      "description": "What this variable represents"
    }
  },
  "grammar": {
    "rule_name": [
      "simple string option",
      {
        "text": "weighted option",
        "weight": 5,
        "conditions": {"var": {"$gt": 10}},
        "actions": {"set": {"var": 20}}
      }
    ]
  },
  "entry_points": {
    "default": "main_rule",
    "alternatives": ["alternate_rule"]
  }
}
```

## Features

### Weighted Random Selection
The system supports sophisticated probability weighting:
- Basic weights (higher = more likely)
- Conditional weights (based on variable states)
- Dynamic weight adjustment during generation

### Variable System
Variables enable:
- State tracking across generations
- Conditional logic branching
- Dynamic content modification
- Memory between rule executions

### Text Processing
Advanced text substitution supports:
- Variable interpolation: `#variable_name#`
- **Rule Expansion**: `#rule_name#` (Python & JS).
- **Text Modifiers**: In both Python and JavaScript, rule expansions can include modifiers: `#rule_name.modifier1.modifier2#`. Standard modifiers (e.g., `capitalize`, `plural`, `a_an`) are built-in, and custom modifiers can be registered.
- **Nested processing** and recursive expansion.
- **Grammar Includes**: Grammar rules can use an `$include` directive, e.g., `{"$include": "path/to/other_rules.json"}`. Python reads relative files by default. JavaScript requires an `includeResolver` function to be passed in the options to `loadGenerator`. This function `(path) => resolvedContent` is called to provide the content for any `$include` directives.

### Seedable PRNG (Python)
The Python engine can be initialized with a seed (string or int) or by calling `set_seed()` to ensure reproducible random generation sequences. It uses a Linear Congruential Generator (LCG) when seeded.

### Include Directive Resolution
- **Python**: `load_generator` resolves `{"$include": "path"}` by attempting to read `generators/path`.
- **JavaScript**: `loadGenerator` accepts an `options.includeResolver` function. This function `(path) => resolvedContent` is called to provide the content for any `$include` directives.

### Conditional Logic
Supports MongoDB-style operators:
- `$lt`, `$gt`: Less than, greater than
- `$eq`, `$ne`: Equal, not equal  
- `$gte`, `$lte`: Greater/less than or equal
- `$in`, `$nin`: In/not in array

## Error Handling

### Validation
- JSON schema validation on load
- Grammar rule validation
- Circular reference detection
- Missing asset checking

### Runtime Safety
- Graceful degradation for missing rules
- Fallback options for failed conditions
- Variable bounds checking
- Memory leak prevention

## Performance Considerations

### Optimization Strategies
- Rule compilation caching
- Variable lookup optimization
- Asset preloading
- Memory pool management

### Scalability
- Generator unloading for memory management
- Lazy asset loading
- Configurable recursion limits
- Batch generation support

## Future Extensions

### Planned Features
- Visual grammar editor
- Generator marketplace/sharing
- Real-time collaboration
- Multi-language support
- Statistical analysis tools
- Export to multiple formats

### Integration Possibilities
- Discord bot integration
- Web service API
- Mobile app support
- Game engine plugins
- Social media automation

## Getting Started

1. **Install Requirements**: Python 3.7+ or modern JavaScript environment
2. **Load Core**: Import RandomizerEngine class
3. **Create Generator**: Write JSON following schema
4. **Load and Test**: Use demo script to verify
5. **Generate Content**: Call generate() method
6. **Iterate and Improve**: Refine weights and rules

## Best Practices

### Generator Design
- Start simple, add complexity gradually
- Test edge cases and variable states
- Use meaningful variable names
- Document complex conditional logic
- Provide fallback options

### Performance
- Avoid deep recursion in rules
- Limit variable count per generator
- Use appropriate weights (avoid extremes)
- Cache frequently used generators
- Monitor memory usage with many generators

### Content Quality
- Balance randomness with coherence
- Test generated content for humor/appropriateness
- Iterate based on output quality
- Consider user feedback loops
- Maintain consistent tone/style

---

*This document serves as the complete specification for implementing and extending the Randomizer Engine system.*