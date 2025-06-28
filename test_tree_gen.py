from RandomizerEngine import RandomizerEngine
import json
import os

# Ensure paths are relative to the script's directory if needed,
# but for sandbox, direct paths should work.
GENERATOR_FILE = "generators/deciduous_tree_generator.json"
INCLUDES_DIR = "generators/deciduous_tree_includes/"

def main():
    engine = RandomizerEngine(seed="test_validation_seed") # Use a seed for repeatable test runs

    # Custom include resolver for Python engine
    def python_include_resolver(path):
        full_path = os.path.join(INCLUDES_DIR, path)
        try:
            with open(full_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Resolver: File not found: {full_path}")
            return None
        except json.JSONDecodeError:
            print(f"Resolver: Invalid JSON in: {full_path}")
            return None

    try:
        with open(GENERATOR_FILE, 'r') as f:
            generator_data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Main generator file not found: {GENERATOR_FILE}")
        return
    except json.JSONDecodeError:
        print(f"ERROR: Invalid JSON in main generator file: {GENERATOR_FILE}")
        return

    # Python engine's load_generator doesn't take an options dict with include_resolver
    # It has its own hardcoded include logic.
    generator_name = engine.load_generator(generator_data, bundle_name="DeciduousTreeGen")
    if not generator_name:
        print("Failed to load generator.")
        return

    print(f"--- Generating {generator_name} Prompts (default entry point) ---")
    for i in range(15):
        prompt = engine.generate(generator_name)
        print(f"{i+1}. {prompt}")
        # Also generate debug output for the same run to see variables
        debug_info = engine.generate(generator_name, options={"entry_point": "debug"}) # This will use the same internal state
        print(f"   DEBUG: {debug_info}\n")
        # Reset seed for next iteration to get different results if top level choices are limited
        # Or, more simply, re-initialize engine for truly independent runs if state is an issue across generate calls
        # For this test, assuming engine.generate() is reasonably stateless for top-level choices per call with a fixed seed for the engine instance
        # For more varied outputs from a single engine instance, one might need to re-seed or make many more calls.
        # Let's re-initialize for better variety in this test given fixed engine seed.
        # This is a bit heavy for normal use but good for validation variety.
        engine = RandomizerEngine(seed=f"test_validation_seed_{i}")
        engine.load_generator(generator_data, bundle_name="DeciduousTreeGen", options={"include_resolver": python_include_resolver})


if __name__ == "__main__":
    main()
