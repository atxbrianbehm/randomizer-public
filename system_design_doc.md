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
- Rule expansion: `#rule_name#`
- Nested processing and recursive expansion

### Asset Management
Complete multimedia support:
- Image files for visual generators
- Audio files for sound-based content
- Custom fonts and styling
- Bundled asset distribution

## Example Generators

### Televangelist Generator
Creates humorous televangelist-style money requests with:
- Dynamic donation amounts that increase
- Weighted selection of urgent needs
- Conditional logic based on donation levels
- Variable tracking for miracle counts

### Satanic Panic Generator
Generates 1980s-style moral panic headlines featuring:
- Innocent activities transformed into evil
- Absurd evidence and conspiracy theories
- Period-appropriate language and concerns
- Weighted selection for maximum humor

## Usage Examples

### Basic Usage
```python
from RandomizerEngine import RandomizerEngine
import json

# Create and load generator
engine = RandomizerEngine()
with open('generator.json', 'r') as f:
    data = json.load(f)
generator_name = engine.load_generator(data)

# Generate content
result = engine.generate(generator_name)
print(result)
```

### Advanced Usage
```python
# Generate with specific entry point
result = engine.generate(generator_name, 'custom_entry')

# Generate with context
context = {"special_mode": True}
result = engine.generate(generator_name, context=context)

# Check generator state
variables = engine._get_variables_for_generator(generator_name)
print(f"Current state: {variables}")
```

## Plugin Architecture

The system follows plugin architecture principles:

### Core System
- Minimal, stable core functionality
- Well-defined interfaces for generators
- Runtime loading/unloading capabilities
- No modification required for new content

### Generator Plugins
- Self-contained JSON bundles
- Independent operation
- Hot-swappable without system restart
- Version and dependency management

### Benefits
- **Modularity**: Each generator is isolated
- **Extensibility**: Easy to add new generators
- **Flexibility**: Mix and match generators
- **Maintainability**: Update individual generators
- **Scalability**: Add generators without core changes

## Implementation Details

### Weighted Selection Algorithm
```python
def weighted_select(options, weights):
    total_weight = sum(weights)
    random_value = random.random() * total_weight
    
    for option, weight in zip(options, weights):
        random_value -= weight
        if random_value <= 0:
            return option
    
    return options[0]  # fallback
```

### Variable Substitution
```python
def substitute_variables(text, variables):
    def replace_var(match):
        var_name = match.group(1)
        return str(variables.get(var_name, match.group(0)))
    
    return re.sub(r'#([a-zA-Z_][a-zA-Z0-9_]*)#', replace_var, text)
```

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