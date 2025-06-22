
import json
import random
import re
from typing import Dict, List, Any, Optional

class RandomizerEngine:
    def __init__(self):
        self.loaded_generators = {}
        self.variables = {}
        self.assets = {}

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

    def generate(self, generator_name, entry_point=None, context=None):
        """Generate text from a loaded generator"""
        if generator_name not in self.loaded_generators:
            raise ValueError(f"Generator '{generator_name}' not found")

        generator = self.loaded_generators[generator_name]
        start_rule = entry_point or generator['entry_points']['default']

        generation_context = {
            **(context or {}),
            'generator_name': generator_name,
            'variables': self._get_variables_for_generator(generator_name)
        }

        return self._expand_rule(generator, start_rule, generation_context)

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
        rand = random.random() * total_weight
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
        rand = random.random() * total_weight

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
        results = []
        for option in rule['options']:
            results.append(self._process_text(option, context))
        return ' '.join(results)

    def _process_markov_rule(self, generator, rule, context):
        """Process Markov chain rules"""
        # Simplified Markov implementation
        return self._select_from_array(rule['options'], context)

    def _process_text(self, text, context):
        """Process text with variable substitution and rule expansion"""
        if not text:
            return ''

        # Variable substitution
        def replace_var(match):
            var_name = match.group(1)
            full_var_name = f"{context['generator_name']}.{var_name}"
            value = context['variables'].get(var_name) or self.variables.get(full_var_name)
            return str(value) if value is not None else match.group(0)

        text = re.sub(r'#([a-zA-Z_][a-zA-Z0-9_]*)#', replace_var, text)

        # Rule expansion  
        def replace_rule(match):
            rule_name = match.group(1)
            generator = self.loaded_generators[context['generator_name']]
            if rule_name in generator['grammar']:
                return self._expand_rule(generator, rule_name, context)
            return match.group(0)

        text = re.sub(r'#([a-zA-Z_][a-zA-Z0-9_]*)#', replace_rule, text)

        return text

    def _check_conditions(self, conditions, context):
        """Check conditions"""
        if not conditions:
            return True

        for var_name, condition in conditions.items():
            full_var_name = f"{context['generator_name']}.{var_name}"
            value = context['variables'].get(var_name) or self.variables.get(full_var_name)

            if '$lt' in condition and value >= condition['$lt']:
                return False
            if '$gt' in condition and value <= condition['$gt']:
                return False
            if '$eq' in condition and value != condition['$eq']:
                return False
            if '$gte' in condition and value < condition['$gte']:
                return False
            if '$lte' in condition and value > condition['$lte']:
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
