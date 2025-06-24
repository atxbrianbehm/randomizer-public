# 🎲 Randomizer Engine

A flexible, modular system for creating and executing probabilistic text generation based on JSON-defined decision trees. Build your own comedy generators, story prompters, or any procedural text content with sophisticated randomization logic.

## 🚀 Quick Start

### Try the Interactive Demo
Visit the [live demo](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/2cedf96edb6dc31a07a9692d1545eda2/30396d72-8c2a-4862-aae9-c090a812687c/index.html) to see the system in action with example generators.

### Run Locally (Python)
```bash
# Run the demo script
python demo.py

# Or use the engine directly
python usage_example.py
```

### Local Development (Vite)
```bash
npm install      # install dependencies
npm run dev      # start Vite dev server (http://localhost:5173)
```

### Build & Preview
```bash
npm run build    # production bundle in dist/
npm run preview  # serve the bundled dist/ locally
```

### Quality Tasks
```bash
npm run lint     # ESLint static analysis
npm test         # Vitest unit/integration tests
```

### Use in JavaScript/Web
```html
<script src="RandomizerEngine.js"></script>
<script>
const engine = new RandomizerEngine();
// Load and use generators
</script>
```

## 🗂️ Project Structure (key paths)
```
randomizer/
├── src/              # application source code
│   ├── ui/           # UI helpers & event wiring
│   ├── services/     # data-fetch & engine adapters
│   └── utils/        # misc utilities (e.g. logger)
├── generators/       # JSON generator bundles served statically
├── tests/            # Vitest test suites
├── public/           # static assets (if any)
├── vite.config.js    # Vite build configuration
├── vitest.config.js  # Vitest configuration
└── .github/workflows/ci.yml  # GitHub Actions pipeline
```

## 📁 Repository Contents

### Core Engine Files
- **`RandomizerEngine.js`** - JavaScript implementation of the core engine
- **`RandomizerEngine.py`** - Python implementation of the core engine
- **`system_design_doc.md`** - Complete technical specification

### Example Generators
- **`televangelist_generator.json`** - Humorous televangelist money requests
- **`satanic_panic_generator.json`** - 1980s moral panic headlines
- **`randomization_schema.json`** - JSON schema for validation

### Demo & Usage
- **`demo.py`** - Interactive command-line demonstration
- **`usage_example.py`** - Simple usage examples
- **`randomizer-engine-demo/`** - Web application demo

### Documentation
- **`system_design_doc.md`** - Complete system documentation
- **`README.md`** - This file

## 🎯 Key Features

### 🎮 Multiple Generation Types
- **Weighted Random**: Probability-based selection with custom weights
- **Conditional Logic**: Branching based on variable states
- **Sequential**: Ordered execution of multiple rules
- **Variable System**: Dynamic state tracking across generations

### 📦 Plugin Architecture
- **Hot-Swappable**: Load/unload generators at runtime
- **Self-Contained**: Each generator is an independent JSON bundle
- **Asset Support**: Include images, audio, fonts, and styling
- **Version Management**: Track generator versions and metadata

### 🔧 Advanced Text Processing
- **Variable Substitution**: `#variable_name#` interpolation
- **Rule Expansion**: `#rule_name#` recursive processing
- **Conditional Actions**: Modify variables based on selections
- **Error Handling**: Graceful fallbacks for missing content

## 📋 Generator Bundle Format

Each generator is a JSON file with this structure:

```json
{
  "metadata": {
    "name": "Your Generator Name",
    "version": "1.0.0",
    "description": "What this creates",
    "author": "Your Name",
    "category": "humor|educational|creative",
    "tags": ["tag1", "tag2"]
  },
  "variables": {
    "counter": {
      "type": "number",
      "default": 0,
      "description": "Tracks something important"
    }
  },
  "grammar": {
    "simple_rule": [
      "Basic text option 1",
      "Basic text option 2"
    ],
    "weighted_rule": [
      {"text": "Common option", "weight": 5},
      {"text": "Rare option", "weight": 1}
    ],
    "conditional_rule": {
      "type": "conditional",
      "options": [
        {
          "text": "If counter is low: #counter#",
          "conditions": {"counter": {"$lt": 5}},
          "actions": {"increment": {"counter": 1}}
        }
      ],
      "fallback": "Default text"
    }
  },
  "entry_points": {
    "default": "simple_rule"
  }
}
```

## 💡 Example Usage

### Python
```python
from RandomizerEngine import RandomizerEngine
import json

# Create engine
engine = RandomizerEngine()

# Load generator
with open('my_generator.json', 'r') as f:
    data = json.load(f)
name = engine.load_generator(data)

# Generate content
result = engine.generate(name)
print(result)

# Generate multiple
for i in range(5):
    print(f"{i+1}. {engine.generate(name)}")
```

### JavaScript
```javascript
const engine = new RandomizerEngine();

// Load generator
fetch('my_generator.json')
  .then(response => response.json())
  .then(data => {
    const name = engine.loadGenerator(data);
    
    // Generate content
    const result = engine.generate(name);
    console.log(result);
  });
```

## 🎨 Creating Your Own Generator

### 1. Start Simple
```json
{
  "metadata": {
    "name": "Simple Name Generator",
    "version": "1.0.0",
    "description": "Creates random character names"
  },
  "grammar": {
    "first_name": ["Alice", "Bob", "Charlie", "Diana"],
    "last_name": ["Smith", "Jones", "Williams", "Brown"],
    "full_name": ["#first_name# #last_name#"]
  },
  "entry_points": {
    "default": "full_name"
  }
}
```

### 2. Add Weights
```json
{
  "grammar": {
    "rarity": [
      {"text": "common", "weight": 10},
      {"text": "rare", "weight": 3},
      {"text": "legendary", "weight": 1}
    ]
  }
}
```

### 3. Include Variables
```json
{
  "variables": {
    "level": {"type": "number", "default": 1}
  },
  "grammar": {
    "power_up": {
      "type": "conditional",
      "options": [
        {
          "text": "You gained a level! Now level #level#",
          "actions": {"increment": {"level": 1}}
        }
      ]
    }
  }
}
```

## 🛠️ Development

### Prerequisites
- Python 3.7+ (for Python version)
- Modern browser with ES6 support (for JavaScript version)

### Running Tests
```bash
# Test the system with examples
python demo.py

# Quick functionality test
python -c "
from RandomizerEngine import RandomizerEngine
import json
engine = RandomizerEngine()
with open('televangelist_generator.json') as f:
    data = json.load(f)
name = engine.load_generator(data)
print(engine.generate(name))
"
```

### Architecture Overview
```
Generator Bundles (JSON + Assets)
           ↓
    RandomizerEngine Core
    ├── Bundle Loader
    ├── Rule Processor  
    ├── Variable Manager
    └── Asset Manager
           ↓
    Generated Text Output
```

## 🎭 Example Generators Included

### Televangelist Generator
Creates humorous televangelist-style money requests with:
- Dynamic donation amounts that increase over time
- Weighted selection of increasingly absurd needs
- Conditional logic based on current donation levels
- Variable tracking for "miracle count"

**Sample Output:**
> "Blessed viewers! I am Pastor Moneybags, and the Lord has spoken to me! Send just $100 and wealth will rain upon you! But if you delay, beware of spiritual bankruptcy! Call now!"

### 1980s Satanic Panic Generator
Generates absurd moral panic headlines featuring:
- Innocent activities transformed into evil conspiracies
- Period-appropriate language and concerns
- Weighted selection for maximum comedic effect
- Authority figures making dramatic claims

**Sample Output:**
> "SHOCKING: Local concerned mother warns that playing Dungeons & Dragons leads to summoning demons!"

## 🤝 Contributing

1. **Create Generators**: Share your JSON generator files
2. **Improve Engine**: Enhance the core processing logic
3. **Add Features**: Implement new rule types or processing modes
4. **Documentation**: Help improve guides and examples

## 📜 License

This project is open source. Use it to create your own generators, modify the engine, or integrate it into larger projects.

## 🔗 Links

- [Live Demo](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/2cedf96edb6dc31a07a9692d1545eda2/30396d72-8c2a-4862-aae9-c090a812687c/index.html)
- [System Design Document](system_design_doc.md)
- [Architecture Diagram](randomizer_engine_architecture.png)

## 💬 Inspiration

This system draws inspiration from:
- **Tracery** by Kate Compton - Grammar-based text generation
- **Twine** - Interactive story creation tools  
- **Plugin Architectures** - Modular, extensible design patterns
- **Comedy Generators** - The joy of procedural humor

Create your own generators and let randomness spark creativity! 🎲✨