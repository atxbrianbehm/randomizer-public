import unittest
import json
from RandomizerEngine import RandomizerEngine

class TestPythonRandomizerEngine(unittest.TestCase):

    def setUp(self):
        self.engine = RandomizerEngine()
        self.generator_data = {
            "metadata": {
                "name": "test-generator"
            },
            "variables": {
                "score": {"type": "number", "default": 0}
            },
            "grammar": {
                "greeting": ["Hello", "Hi"],
                "farewell": ["Goodbye", "Bye"],
                "conditional_test": {
                    "type": "conditional",
                    "options": [
                        {
                            "text": "Score is high",
                            "conditions": {"score": {"$gt": 5}}
                        },
                        {
                            "text": "Score is low",
                            "conditions": {"score": {"$lte": 5}}
                        }
                    ]
                },
                "and_test": {
                    "type": "conditional",
                    "options": [
                        {
                            "text": "AND_SUCCESS",
                            "conditions": {
                                "$and": [
                                    {"score": {"$gt": 0}},
                                    {"score": {"$lt": 10}}
                                ]
                            }
                        }
                    ],
                    "fallback": "AND_FAIL"
                },
                "or_test": {
                    "type": "conditional",
                    "options": [
                        {
                            "text": "OR_SUCCESS",
                            "conditions": {
                                "$or": [
                                    {"score": {"$eq": 0}},
                                    {"score": {"$eq": 100}}
                                ]
                            }
                        }
                    ],
                    "fallback": "OR_FAIL"
                },
                "not_test": {
                    "type": "conditional",
                    "options": [
                        {
                            "text": "NOT_SUCCESS",
                            "conditions": {
                                "$not": {"score": {"$eq": 5}}
                            }
                        }
                    ],
                    "fallback": "NOT_FAIL"
                },
                "sequential_test": {
                    "type": "sequential",
                    "options": [
                        {"text": "Part1", "joiner": ". "},
                        {"text": "Part2", "joiner": ", "},
                        {"text": "Part3"}
                    ]
                },
                "subject": ["A brave knight"],
                "style": ["fantasy art"],
                "target_template": "#subject# in #style#",
                "quality": ["high"],
                "midjourney_template": "#subject#, #style# #quality# --ar 16:9",
                "imagen_template": "A #style# image of #subject#."
            },
            "entry_points": {
                "default": "#greeting# #subject#"
            },
            "targeting": {
                "midjourney": {
                    "template": "#subject#, #style# #quality# --ar 16:9",
                    "parameterMap": {
                        "quality": {
                            "high": "--quality 2"
                        }
                    }
                },
                "imagen": {
                    "template": "A #style# image of #subject#."
                }
            }
        }
        self.engine.load_generator(self.generator_data, "test-generator")

    def test_variable_substitution_and_rule_expansion_order(self):
        # Test that rule expansion happens before variable substitution
        # This test relies on the corrected _process_text behavior
        generator_with_nested_var = {
            "metadata": {"name": "nested-test"},
            "variables": {"item": {"default": "sword"}},
            "grammar": {
                "description": ["a magical #item#"],
                "full_phrase": ["You found #description#."]
            },
            "entry_points": {"default": "full_phrase"}
        }
        self.engine.load_generator(generator_with_nested_var, "nested-test")
        result = self.engine.generate("nested-test")
        self.assertEqual(result, "You found a magical sword.")

    def test_conditional_logic_and_operators(self):
        # Test $gt condition
        self.engine.variables["test-generator.score"] = 10
        result = self.engine.generate("test-generator", {"entry_point": "conditional_test"})
        self.assertEqual(result, "Score is high")

        # Test $lte condition
        self.engine.variables["test-generator.score"] = 5
        result = self.engine.generate("test-generator", {"entry_point": "conditional_test"})
        self.assertEqual(result, "Score is low")

        # Test $and operator
        self.engine.variables["test-generator.score"] = 5
        result = self.engine.generate("test-generator", {"entry_point": "and_test"})
        self.assertEqual(result, "AND_SUCCESS")

        self.engine.variables["test-generator.score"] = 15
        result = self.engine.generate("test-generator", {"entry_point": "and_test"})
        self.assertEqual(result, "AND_FAIL")

        # Test $or operator
        self.engine.variables["test-generator.score"] = 0
        result = self.engine.generate("test-generator", {"entry_point": "or_test"})
        self.assertEqual(result, "OR_SUCCESS")

        self.engine.variables["test-generator.score"] = 50
        result = self.engine.generate("test-generator", {"entry_point": "or_test"})
        self.assertEqual(result, "OR_FAIL")

        # Test $not operator
        self.engine.variables["test-generator.score"] = 10
        result = self.engine.generate("test-generator", {"entry_point": "not_test"})
        self.assertEqual(result, "NOT_SUCCESS")

        self.engine.variables["test-generator.score"] = 5
        result = self.engine.generate("test-generator", {"entry_point": "not_test"})
        self.assertEqual(result, "NOT_FAIL")

    def test_sequential_rule_with_custom_joiners(self):
        result = self.engine.generate("test-generator", {"entry_point": "sequential_test"})
        self.assertEqual(result, "Part1. Part2, Part3")

    def test_prompt_targeting_midjourney(self):
        result = self.engine.generate("test-generator", {"target": "midjourney"})
        self.assertEqual(result, "A brave knight, fantasy art --quality 2 --ar 16:9")

    def test_prompt_targeting_imagen(self):
        result = self.engine.generate("test-generator", {"target": "imagen"})
        self.assertEqual(result, "A fantasy art image of A brave knight.")

    def test_prompt_targeting_invalid_target(self):
        with self.assertRaisesRegex(ValueError, "Target 'invalid' not found"): # Updated regex
            self.engine.generate("test-generator", {"target": "invalid"})

    def test_fallback_to_default_entry_point(self):
        # Test that if no target is specified, it falls back to the default entry point
        result = self.engine.generate("test-generator")
        # The default entry point is "#greeting# #subject#"
        # Since greeting can be "Hello" or "Hi", we check for either
        self.assertIn(result, ["Hello A brave knight", "Hi A brave knight"])

    def test_prng_reproducibility(self):
        engine1 = RandomizerEngine(seed="test_seed")
        engine1.load_generator(self.generator_data, "gen1")

        engine2 = RandomizerEngine(seed="test_seed")
        engine2.load_generator(self.generator_data, "gen2")

        results1 = [engine1.generate("gen1", {"entry_point": "greeting"}) for _ in range(10)]
        results2 = [engine2.generate("gen2", {"entry_point": "greeting"}) for _ in range(10)]
        self.assertEqual(results1, results2, "Engines with same seed should produce identical results.")

        engine3 = RandomizerEngine(seed="another_seed")
        engine3.load_generator(self.generator_data, "gen3")
        results3 = [engine3.generate("gen3", {"entry_point": "greeting"}) for _ in range(10)]
        self.assertNotEqual(results1, results3, "Engines with different seeds should produce different results.")

        engine4 = RandomizerEngine(seed=12345)
        engine4.load_generator(self.generator_data, "gen4")
        results4_1 = [engine4.generate("gen4", {"entry_point": "greeting"}) for _ in range(5)]
        engine4.set_seed(12345) # Resetting seed
        results4_2 = [engine4.generate("gen4", {"entry_point": "greeting"}) for _ in range(5)]
        self.assertEqual(results4_1, results4_2, "Resetting seed should reproduce sequence.")

    def test_text_modifiers(self):
        mod_generator_data = {
            "metadata": {"name": "mod-test"},
            "grammar": {
                "word": ["apple"],
                "phrase": ["long sentence"],
                "test_cap": ["#word.capitalize#"],
                "test_upper": ["#word.upper#"],
                "test_lower": ["#WORD.lower#"], # Assuming WORD is uppercased by some means or direct input
                "test_a_an_vowel": ["#word.a_an#"],
                "test_a_an_consonant": ["#phrase.a_an#"],
                "test_plural_s": ["#word.plural#"],
                "test_plural_y": ["story"],
                "test_plural_y_mod": ["#test_plural_y.plural#"],
                "test_chained": ["#word.capitalize.plural#"],
                "test_unknown_mod": ["#word.unknown.capitalize#"],
                "custom_mod_rule": ["#word.shout#"]
            },
            "entry_points": {"default": "#word#"}
        }
        self.engine.load_generator(mod_generator_data, "mod-test")

        # Register a custom modifier
        self.engine.register_modifier("shout", lambda s: f"{s.upper()}!!!")

        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_cap"}), "Apple")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_upper"}), "APPLE")
        # For test_lower, we need to ensure the input to the rule is uppercase if we want to test it.
        # Let's adjust the grammar for a direct test or assume self.engine.modifiers["lower"]("WORD")
        self.engine.loaded_generators["mod-test"]["grammar"]["WORD"] = ["TESTWORD"]
        self.assertEqual(self.engine.modifiers["lower"]("TESTWORD"), "testword")

        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_a_an_vowel"}), "an apple")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_a_an_consonant"}), "a long sentence")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_plural_s"}), "apples")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_plural_y_mod"}), "stories")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_chained"}), "Apples")

        # Test unknown modifier (should capitalize, warn about unknown, but not fail)
        # Capture print output to check for warning (optional, more complex)
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "test_unknown_mod"}), "Apple")
        self.assertEqual(self.engine.generate("mod-test", {"entry_point": "custom_mod_rule"}), "APPLE!!!")

    def test_variable_and_rule_conflict_with_modifiers(self):
        # Test that #varName.modifier# does not try to apply modifier if varName is only a variable
        # And #ruleName.modifier# works if ruleName is a rule.
        var_mod_gen = {
            "metadata": {"name": "var-mod-conflict"},
            "variables": {"username": {"default": "testUser"}},
            "grammar": {
                "greeting_rule": ["hello"],
                "message_var_only": ["Hi #username.capitalize#"], # capitalize should not apply to username
                "message_rule_mod": ["#greeting_rule.capitalize# #username#"]
            },
            "entry_points": {"default": "message_var_only"}
        }
        self.engine.load_generator(var_mod_gen, "var-mod-conflict")

        # Since "username" is not a rule, "capitalize" should not be processed by expand_and_modify_rule
        # The variable substitution regex r'#([a-zA-Z_][a-zA-Z0-9_]*)#' will match #username.capitalize# as a whole
        # and fail to find a variable named "username.capitalize". So it will return the literal.
        # This is the current behavior based on the implementation.
        # If we wanted #var.mod# to work, _process_text would need another phase or different logic.
        self.assertEqual(self.engine.generate("var-mod-conflict", {"entry_point": "message_var_only"}), "Hi #username.capitalize#")

        self.assertEqual(self.engine.generate("var-mod-conflict", {"entry_point": "message_rule_mod"}), "Hello testUser")


if __name__ == '__main__':
    unittest.main()
