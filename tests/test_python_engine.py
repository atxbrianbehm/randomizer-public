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

if __name__ == '__main__':
    unittest.main()
