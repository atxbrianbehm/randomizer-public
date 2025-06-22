import json
import random

# First, let's create a comprehensive JSON schema for the randomization decision tree
randomization_schema = {
    "type": "object",
    "properties": {
        "metadata": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "version": {"type": "string"},
                "description": {"type": "string"},
                "author": {"type": "string"},
                "created": {"type": "string"},
                "category": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["name", "version", "description"]
        },
        "assets": {
            "type": "object",
            "properties": {
                "images": {"type": "array", "items": {"type": "string"}},
                "audio": {"type": "array", "items": {"type": "string"}},
                "fonts": {"type": "array", "items": {"type": "string"}},
                "styles": {"type": "object"}
            }
        },
        "variables": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z_][a-zA-Z0-9_]*$": {
                    "type": "object",
                    "properties": {
                        "type": {"enum": ["string", "number", "boolean", "array"]},
                        "default": {},
                        "description": {"type": "string"}
                    },
                    "required": ["type"]
                }
            }
        },
        "grammar": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z_][a-zA-Z0-9_]*$": {
                    "oneOf": [
                        {
                            "type": "array",
                            "items": {
                                "oneOf": [
                                    {"type": "string"},
                                    {
                                        "type": "object",
                                        "properties": {
                                            "text": {"type": "string"},
                                            "weight": {"type": "number", "minimum": 0},
                                            "conditions": {"type": "object"},
                                            "actions": {"type": "object"}
                                        },
                                        "required": ["text"]
                                    }
                                ]
                            }
                        },
                        {
                            "type": "object",
                            "properties": {
                                "type": {"enum": ["weighted", "conditional", "sequential", "markov"]},
                                "options": {"type": "array"},
                                "weights": {"type": "array", "items": {"type": "number"}},
                                "conditions": {"type": "object"},
                                "fallback": {"type": "string"}
                            },
                            "required": ["type", "options"]
                        }
                    ]
                }
            }
        },
        "entry_points": {
            "type": "object",
            "properties": {
                "default": {"type": "string"},
                "alternatives": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["default"]
        }
    },
    "required": ["metadata", "grammar", "entry_points"]
}

print("JSON Schema for Randomization Decision Tree:")
print(json.dumps(randomization_schema, indent=2))