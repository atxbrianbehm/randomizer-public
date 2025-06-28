
import json
import random
import re
from typing import Dict, List, Any, Optional

class RandomizerEngine:
    def __init__(self, seed=None):
        self.loaded_generators = {}
        self.variables = {}
        self.assets = {}
        self._seed = None
        self._prng_state = None
        self.modifiers = {
            "capitalize": lambda s: s.capitalize(),
            "upper": lambda s: s.upper(),
            "lower": lambda s: s.lower(),
            "a_an": self._modifier_a_an,
            "plural": self._modifier_plural,
        }
        if seed is not None:
            self.set_seed(seed)

    def _modifier_a_an(self, text: str) -> str:
        if not text: return text
        first_word = text.split()[0]
        if first_word[0].lower() in "aeiou":
            return f"an {text}"
        return f"a {text}"

    def _modifier_plural(self, text: str) -> str:
        if not text: return text
        # Simplified pluralization
        if text.endswith('y') and len(text) > 1 and text[-2].lower() not in "aeiou":
            return text[:-1] + "ies"
        elif text.endswith('s') or text.endswith('sh') or text.endswith('ch') or text.endswith('x') or text.endswith('z'):
            return text + "es"
        else:
            return text + "s"

    def register_modifier(self, name: str, func: callable):
        self.modifiers[name] = func

    def _xfnv1a(self, string_seed: str) -> int:
        """Simple string to int hash for seeding."""
        h = 2166136261
        for char in string_seed:
            h = (h ^ ord(char)) * 16777619
        return h & 0xFFFFFFFF # Ensure 32-bit unsigned like behavior

    def _lcg(self):
        """Linear Congruential Generator."""
        # Parameters from Numerical Recipes
        self._prng_state = (1664525 * self._prng_state + 1013904223) & 0xFFFFFFFF
        return (self._prng_state / 0xFFFFFFFF)

    def set_seed(self, seed: Any):
        if isinstance(seed, str):
            self._seed = seed
            self._prng_state = self._xfnv1a(seed)
        elif isinstance(seed, int):
            self._seed = seed # Store original seed
            self._prng_state = seed & 0xFFFFFFFF # Ensure 32-bit
        else:
            # Fallback to system random if seed is weird, but store None for _seed
            self._seed = None
            self._prng_state = random.randint(0, 0xFFFFFFFF)

        # Call LCG a few times to warm it up, as first few numbers can be less random
        for _ in range(5):
            self._lcg()

    def get_seed(self) -> Any:
        return self._seed

    def _get_random_float(self) -> float:
        if self._prng_state is not None:
            return self._lcg()
        else:
            # Fallback to Python's default random if no seed was set
            return random.random()

    def load_generator(self, generator_data, bundle_name=None):
        """Load a generator bundle from JSON"""
        try:
            if isinstance(generator_data, str):
                generator = json.loads(generator_data)
            else:
                generator = generator_data

            # Validate the generator structure
            self._validate_generator(generator)

            name = bundle_name or generator['metadata']['name']

            # Initialize variables
            if 'variables' in generator:
                for var_name, var_def in generator['variables'].items():
                    self.variables[f"{name}.{var_name}"] = var_def.get('default')

            # Load assets
            if 'assets' in generator:
                self.assets[name] = generator['assets']

            # Store the generator
            self.loaded_generators[name] = generator

            # Process $include directives in grammar
            if 'grammar' in generator:
                for rule_name, rule_content in generator['grammar'].items():
                    if isinstance(rule_content, dict) and '$include' in rule_content:
                        include_path = rule_content['$include']
                        # Assuming include_path is relative to the generator file
                        # For simplicity, we'll assume it's in the same 'generators' directory
                        full_include_path = f"generators/{include_path}"
                        try:
                            with open(full_include_path, 'r') as f:
                                included_data = json.load(f)
                            generator['grammar'][rule_name] = included_data
                        except FileNotFoundError:
                            print(f"Warning: Included file not found: {full_include_path}")
                            generator['grammar'][rule_name] = f"[INCLUDE_ERROR: {include_path}]"
                        except json.JSONDecodeError:
                            print(f"Warning: Invalid JSON in included file: {full_include_path}")
                            generator['grammar'][rule_name] = f"[INCLUDE_ERROR: {include_path}]"

            print(f"Successfully loaded generator: {name}")
            return name
        except Exception as error:
            print(f"Failed to load generator: {error}")
            raise error

    def _validate_generator(self, generator):
        """Validate generator structure"""
        if 'metadata' not in generator or 'name' not in generator['metadata']:
            raise ValueError('Generator must have metadata with name')
        if 'grammar' not in generator:
            raise ValueError('Generator must have grammar rules')
        if 'entry_points' not in generator or 'default' not in generator['entry_points']:
            raise ValueError('Generator must have entry_points with default')

    def generate(self, generator_name, options=None):
        """Generate text from a loaded generator"""
        if options is None:
            options = {}

        entry_point = options.get('entry_point')
        context = options.get('context', {})
        target = options.get('target')

        if generator_name not in self.loaded_generators:
            raise ValueError(f"Generator '{generator_name}' not found")

        generator = self.loaded_generators[generator_name]

        generation_context = {
            **context,
            'generator_name': generator_name,
            'variables': self._get_variables_for_generator(generator_name)
        }

        if target:
            return self._generate_from_target(generator, target, generation_context)

        start_rule = entry_point or generator['entry_points']['default']

        # If start_rule is a string with placeholders, process it as text
        if isinstance(start_rule, str) and '#' in start_rule:
            return self._process_text(start_rule, generation_context)
        else:
            # Otherwise, treat it as a rule name
            return self._expand_rule(generator, start_rule, generation_context)

    def _generate_from_target(self, generator, target, context):
        if 'targeting' not in generator or target not in generator['targeting']:
            raise ValueError(f"Target '{target}' not found in generator '{generator['metadata']['name']}'")

        target_config = generator['targeting'][target]
        template = target_config['template']

        placeholders = re.findall(r'#([a-zA-Z_][a-zA-Z0-9_]*)#', template)

        expanded_values = {}
        for rule_name in placeholders:
            if rule_name not in expanded_values:
                expanded_values[rule_name] = self._expand_rule(generator, rule_name, context)

        # Apply parameter mapping if available
        parameter_map = target_config.get('parameterMap')
        if parameter_map:
            for rule_name, mapping in parameter_map.items():
                if rule_name in expanded_values and expanded_values[rule_name] in mapping:
                    expanded_values[rule_name] = mapping[expanded_values[rule_name]]

        result = template
        for rule_name, value in expanded_values.items():
            result = result.replace(f'#{rule_name}#', str(value))

        return result

    def _expand_rule(self, generator, rule_name, context):
        """Core rule expansion logic"""
        if rule_name not in generator['grammar']:
            return f"[MISSING RULE: {rule_name}]"

        rule = generator['grammar'][rule_name]

        if isinstance(rule, list):
            # Simple array of options
            return self._select_from_array(rule, context)
        elif isinstance(rule, dict) and 'type' in rule:
            # Complex rule with type
            return self._process_complex_rule(generator, rule, context)

        return '[INVALID RULE FORMAT]'

    def _select_from_array(self, options, context):
        """Select from array (with optional weights)"""
        weighted_options = []
        total_weight = 0

        for option in options:
            if isinstance(option, str):
                weighted_options.append({'text': option, 'weight': 1})
                total_weight += 1
            elif isinstance(option, dict) and 'text' in option:
                weight = option.get('weight', 1)
                if self._check_conditions(option.get('conditions'), context):
                    weighted_options.append({**option, 'weight': weight})
                    total_weight += weight

        if not weighted_options:
            return '[NO VALID OPTIONS]'

        # Weighted random selection
        rand = self._get_random_float() * total_weight
        for option in weighted_options:
            rand -= option['weight']
            if rand <= 0:
                self._execute_actions(option.get('actions'), context)
                return self._process_text(option['text'], context)

        return weighted_options[0]['text']

    def _process_complex_rule(self, generator, rule, context):
        """Process complex rules"""
        rule_type = rule.get('type')

        if rule_type == 'weighted':
            return self._process_weighted_rule(generator, rule, context)
        elif rule_type == 'conditional':
            return self._process_conditional_rule(generator, rule, context)
        elif rule_type == 'sequential':
            return self._process_sequential_rule(generator, rule, context)
        elif rule_type == 'markov':
            return self._process_markov_rule(generator, rule, context)
        else:
            return f"[UNKNOWN RULE TYPE: {rule_type}]"

    def _process_weighted_rule(self, generator, rule, context):
        """Process weighted rules"""
        options = rule['options']
        weights = rule.get('weights', [1] * len(options))

        total_weight = sum(weights)
        rand = self._get_random_float() * total_weight

        for i, option in enumerate(options):
            rand -= weights[i]
            if rand <= 0:
                return self._process_text(option, context)

        return self._process_text(options[0], context)

    def _process_conditional_rule(self, generator, rule, context):
        """Process conditional rules"""
        for option in rule['options']:
            if self._check_conditions(option.get('conditions'), context):
                self._execute_actions(option.get('actions'), context)
                return self._process_text(option['text'], context)

        fallback = rule.get('fallback')
        return self._process_text(fallback, context) if fallback else '[NO CONDITIONS MET]'

    def _process_sequential_rule(self, generator, rule, context):
        """Process sequential rules"""
        final_result = ''
        for i, option in enumerate(rule['options']):
            text_to_process = ''
            joiner = ' '  # Default joiner

            if isinstance(option, str):
                text_to_process = option
            elif isinstance(option, dict) and 'text' in option:
                text_to_process = option['text']
                if 'joiner' in option:
                    joiner = option['joiner']
            else:
                text_to_process = '[INVALID SEQUENTIAL OPTION]'

            final_result += self._process_text(text_to_process, context)

            # Add joiner if it's not the last option
            if i < len(rule['options']) - 1:
                final_result += joiner
        return final_result

    def _process_markov_rule(self, generator, rule, context):
        """Process Markov chain rules"""
        # Simplified Markov implementation
        return self._select_from_array(rule['options'], context)

    def _process_text(self, text, context):
        """Process text with rule expansion and variable substitution"""
        if not text:
            return ''

        # Rule and modifier regex: #ruleName.mod1.mod2#
        rule_modifier_regex = r'#([a-zA-Z_][a-zA-Z0-9_]*)(?:\.([a-zA-Z0-9_.]+))?#'

        # First expand rules and apply modifiers
        def expand_and_modify_rule(match):
            rule_name = match.group(1)
            modifier_str = match.group(2)

            generator = self.loaded_generators[context['generator_name']]
            expanded_text = ""

            if rule_name in generator['grammar']:
                expanded_text = self._expand_rule(generator, rule_name, context)
            else:
                # If rule_name is not in grammar, it might be a variable.
                # So, we don't return match.group(0) yet, let variable substitution handle it.
                # However, if modifiers were present, they are lost, which is intended.
                return match.group(0) # Keep original if not a rule

            if modifier_str:
                modifier_names = modifier_str.split('.')
                for mod_name in modifier_names:
                    if mod_name in self.modifiers:
                        try:
                            expanded_text = self.modifiers[mod_name](expanded_text)
                        except Exception as e:
                            print(f"Error applying modifier '{mod_name}' to text '{expanded_text}': {e}")
                            # Keep text as is before modifier error
                    else:
                        print(f"Warning: Modifier '{mod_name}' not found.")
            return expanded_text

        processed_text = re.sub(rule_modifier_regex, expand_and_modify_rule, text)

        # Then variable substitution on any remaining placeholders (e.g. #varName# without modifiers)
        # This regex should not conflict with the rule_modifier_regex because rules are processed first.
        variable_regex = r'#([a-zA-Z_][a-zA-Z0-9_]*)#'
        def replace_var(match):
            var_name = match.group(1)
            # Check if it was already processed as a rule; if so, it won't be a simple #varName# anymore.
            # This check is somewhat implicit: if it still matches '#varName#', it wasn't a rule.

            full_var_name = f"{context['generator_name']}.{var_name}"
            value = context['variables'].get(var_name) # Check context specific vars first
            if value is None:
                 value = self.variables.get(full_var_name) # Check global engine vars

            return str(value) if value is not None else match.group(0) # Keep original if not found

        final_text = re.sub(variable_regex, replace_var, processed_text)

        return final_text

    def _check_conditions(self, conditions, context):
        """Check conditions"""
        if not conditions:
            return True

        for key, value in conditions.items():
            if key == '$and':
                if not all(self._check_conditions(cond, context) for cond in value):
                    return False
            elif key == '$or':
                if not any(self._check_conditions(cond, context) for cond in value):
                    return False
            elif key == '$not':
                if self._check_conditions(value, context):
                    return False
            else:
                var_name = key
                condition = value
                full_var_name = f"{context['generator_name']}.{var_name}"
                var_value = context['variables'].get(var_name) or self.variables.get(full_var_name)

                if '$lt' in condition and var_value >= condition['$lt']:
                    return False
                if '$gt' in condition and var_value <= condition['$gt']:
                    return False
                if '$eq' in condition and var_value != condition['$eq']:
                    return False
                if '$gte' in condition and var_value < condition['$gte']:
                    return False
                if '$lte' in condition and var_value > condition['$lte']:
                    return False

        return True

    def _execute_actions(self, actions, context):
        """Execute actions"""
        if not actions:
            return

        if 'set' in actions:
            for var_name, value in actions['set'].items():
                full_var_name = f"{context['generator_name']}.{var_name}"
                if isinstance(value, dict) and '$multiply' in value:
                    current_value = context['variables'].get(var_name) or self.variables.get(full_var_name, 0)
                    self.variables[full_var_name] = current_value * value['$multiply']
                else:
                    self.variables[full_var_name] = value

        if 'increment' in actions:
            for var_name, amount in actions['increment'].items():
                full_var_name = f"{context['generator_name']}.{var_name}"
                current_value = context['variables'].get(var_name) or self.variables.get(full_var_name, 0)
                self.variables[full_var_name] = current_value + amount

    def _get_variables_for_generator(self, generator_name):
        """Get variables for a specific generator"""
        result = {}
        prefix = f"{generator_name}."
        for full_name, value in self.variables.items():
            if full_name.startswith(prefix):
                var_name = full_name[len(prefix):]
                result[var_name] = value
        return result

    def list_generators(self):
        """List all loaded generators"""
        return list(self.loaded_generators.keys())

    def get_generator_info(self, generator_name):
        """Get generator metadata"""
        generator = self.loaded_generators.get(generator_name)
        return generator['metadata'] if generator else None

    def unload_generator(self, generator_name):
        """Remove a generator"""
        if generator_name in self.loaded_generators:
            del self.loaded_generators[generator_name]

        # Clean up variables
        to_remove = [key for key in self.variables.keys() if key.startswith(f"{generator_name}.")]
        for key in to_remove:
            del self.variables[key]

        # Clean up assets
        if generator_name in self.assets:
            del self.assets[generator_name]
