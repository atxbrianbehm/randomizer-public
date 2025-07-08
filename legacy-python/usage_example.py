
# Example usage of the RandomizerEngine

from RandomizerEngine import RandomizerEngine
import json

# Create engine instance
engine = RandomizerEngine()

# Load a generator from JSON file
with open('televangelist_generator.json', 'r') as f:
    generator_data = json.load(f)

generator_name = engine.load_generator(generator_data)

# Generate text
result = engine.generate(generator_name)
print(result)

# Generate with specific entry point
result = engine.generate(generator_name, 'money_request')
print(result)

# Generate multiple times to see variation
for i in range(5):
    print(f"{i+1}. {engine.generate(generator_name)}")
