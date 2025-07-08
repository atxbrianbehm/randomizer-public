
#!/usr/bin/env python3
"""
Randomizer Engine Demo
This script demonstrates how to use the RandomizerEngine with the example generators.
"""

import json
from RandomizerEngine import RandomizerEngine

def load_generator_from_file(engine, filename):
    """Load a generator from a JSON file"""
    try:
        with open(filename, 'r') as f:
            generator_data = json.load(f)
        return engine.load_generator(generator_data)
    except FileNotFoundError:
        print(f"Error: Could not find file {filename}")
        return None

def demo_generator(engine, generator_name, num_generations=5):
    """Generate and display multiple outputs from a generator"""
    print(f"\n=== {generator_name.upper()} DEMO ===")

    # Get generator info
    info = engine.get_generator_info(generator_name)
    if info:
        print(f"Description: {info['description']}")
        print(f"Version: {info['version']}")
        print(f"Category: {info['category']}")
        print()

    # Generate multiple outputs
    for i in range(num_generations):
        try:
            result = engine.generate(generator_name)
            print(f"{i+1:2}. {result}")
        except Exception as e:
            print(f"{i+1:2}. ERROR: {e}")

    # Show current variables
    variables = engine._get_variables_for_generator(generator_name)
    if variables:
        print(f"\nCurrent variables: {variables}")

def main():
    """Main demo function"""
    print("🎲 Randomizer Engine Demo")
    print("=" * 50)

    # Create the engine
    engine = RandomizerEngine()

    # Load the example generators
    print("Loading generators...")

    # Load Televangelist Generator
    tv_name = load_generator_from_file(engine, 'televangelist_generator.json')
    if tv_name:
        print(f"✓ Loaded: {tv_name}")

    # Load Satanic Panic Generator  
    sp_name = load_generator_from_file(engine, 'satanic_panic_generator.json')
    if sp_name:
        print(f"✓ Loaded: {sp_name}")

    # List all loaded generators
    generators = engine.list_generators()
    print(f"\nTotal generators loaded: {len(generators)}")

    # Demo each generator
    if tv_name:
        demo_generator(engine, tv_name, 3)

    if sp_name:
        demo_generator(engine, sp_name, 4)

    # Interactive mode
    print("\n" + "=" * 50)
    print("🎮 INTERACTIVE MODE")
    print("Commands: generate <generator_name>, list, info <generator_name>, quit")

    while True:
        try:
            command = input("\n> ").strip().lower()

            if command == 'quit' or command == 'exit':
                print("Goodbye!")
                break
            elif command == 'list':
                generators = engine.list_generators()
                print("Loaded generators:")
                for gen in generators:
                    print(f"  - {gen}")
            elif command.startswith('generate '):
                gen_name = command[9:].strip()
                if gen_name in engine.list_generators():
                    result = engine.generate(gen_name)
                    print(f"📝 {result}")
                else:
                    print(f"❌ Generator '{gen_name}' not found")
            elif command.startswith('info '):
                gen_name = command[5:].strip()
                info = engine.get_generator_info(gen_name)
                if info:
                    print(f"📋 {gen_name}:")
                    for key, value in info.items():
                        print(f"   {key}: {value}")
                else:
                    print(f"❌ Generator '{gen_name}' not found")
            elif command == 'help':
                print("Available commands:")
                print("  generate <name> - Generate text from a generator")
                print("  list           - List all loaded generators")
                print("  info <name>    - Show generator information")
                print("  quit           - Exit the program")
            else:
                print("❓ Unknown command. Type 'help' for available commands.")

        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
