import unittest
import json
from RandomizerEngine import RandomizerEngine

class TestTelevangelistNarrative(unittest.TestCase):

    def setUp(self):
        self.engine = RandomizerEngine()
        with open('generators/televangelist_generator.json', 'r') as f:
            self.generator_data = json.load(f)
        self.engine.load_generator(self.generator_data, "Televangelist Generator")

    def test_narrative_progression(self):
        print("\n--- Televangelist Narrative Arc Test ---")

        # Stage 1: Humble Calling
        print("\nStage 1: The Humble Calling")
        prompt1 = self.engine.generate("Televangelist Generator")
        print(f"Prompt: {prompt1}")
        self.assertTrue(any(keyword in prompt1.lower() for keyword in ["humble", "garage", "microphone", "beginnings"]))
        self.assertTrue(any(keyword in prompt1.lower() for keyword in ["seed", "$10", "$20", "$100"]))
        self.assertTrue(any(keyword in prompt1.lower() for keyword in ["fisherman", "carpenter", "shepherd", "tax collector", "tentmaker", "scribe", "physician", "farmer", "baker", "blacksmith", "potter", "weaver", "merchant", "soldier", "teacher", "philosopher", "musician", "artist", "builder", "sailor", "miner", "hunter", "trapper", "logger", "cobbler", "tailor", "jeweler", "innkeeper", "messenger", "guard", "cook", "gardener", "librarian", "cartographer", "astronomer", "alchemist", "apothecary", "barber", "butcher", "candlemaker", "dyer", "engraver", "furrier", "glassblower", "hatter", "locksmith", "miller", "perfumer", "saddler", "sculptor", "tanner", "vintner", "wheelwright", "cooper"]))
        self.assertEqual(self.engine.variables["Televangelist Generator.career_stage"], 2)

        # Stage 2: Growing Ministry
        print("\nStage 2: Growing Ministry")
        prompt2 = self.engine.generate("Televangelist Generator")
        print(f"Prompt: {prompt2}")
        self.assertTrue(any(keyword in prompt2.lower() for keyword in ["expanding", "growth", "beacon", "millions"]))
        self.assertTrue(any(keyword in prompt2.lower() for keyword in ["jet", "cathedral", "station", "yacht"]))
        self.assertEqual(self.engine.variables["Televangelist Generator.career_stage"], 3)

        # Stage 3: Crisis & Grand Vision
        print("\nStage 3: Crisis & Grand Vision")
        prompt3 = self.engine.generate("Televangelist Generator")
        print(f"Prompt: {prompt3}")
        self.assertTrue(any(keyword in prompt3.lower() for keyword in ["storm", "crisis", "attack", "threatens"]))
        self.assertTrue(any(keyword in prompt3.lower() for keyword in ["vision", "strategy", "crusade", "empire"]))
        self.assertEqual(self.engine.variables["Televangelist Generator.career_stage"], 4)

        # Stage 4: Rebirth & Renewed Plea
        print("\nStage 4: Rebirth & Renewed Plea")
        prompt4 = self.engine.generate("Televangelist Generator")
        print(f"Prompt: {prompt4}")
        self.assertTrue(any(keyword in prompt4.lower() for keyword in ["risen", "delivered", "victory", "reborn", "stronger", "good"]))
        self.assertTrue(any(keyword in prompt4.lower() for keyword in ["anointing", "revelation", "revival", "new word", "breakthrough"]))
        self.assertEqual(self.engine.variables["Televangelist Generator.career_stage"], 5)

        # Stage 5: Legacy & Final Offering
        print("\nStage 5: Legacy & Final Offering")
        prompt5 = self.engine.generate("Televangelist Generator")
        print(f"Prompt: {prompt5}")
        self.assertTrue(any(keyword in prompt5.lower() for keyword in ["legacy", "testament", "reflection", "culmination"]))
        self.assertTrue(any(keyword in prompt5.lower() for keyword in ["final", "ultimate", "best", "last chance"]))
        self.assertEqual(self.engine.variables["Televangelist Generator.career_stage"], 1) # Resets to 1

if __name__ == '__main__':
    unittest.main()
