import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

function createMockGenerator() {
  return {
    metadata: {
      name: 'mock',
      slotOrder: ['subject', 'condition', 'purpose'],
    },
    grammar: {
      // simplified direct text rules to avoid duplicate chips
      subject: [
        { _meta: { slot: 'subject', connector: '', priority: 1 }, text: 'retro console' },
      ],
      condition: [
        { _meta: { slot: 'condition', connector: 'with', priority: 2 }, text: 'heavy wear' },
      ],
      purpose: [
        { _meta: { slot: 'purpose', connector: 'for', priority: 3 }, text: 'controlling engines' },
      ],
    },
    entry_points: { default: 'subject' },
  };
}

describe('UI ➜ readable prompt rendering', () => {
  let engine;

  beforeEach(async () => {
    engine = new RandomizerEngine();
    const gen = createMockGenerator();
    await engine.loadGenerator(gen);
    engine.selectGenerator('mock');
  });

  it('displays readable prompt in DOM after generateText()', () => {
    const result = engine.generateDetailed('mock');
    expect(result.readable).toBe('retro console with heavy wear for controlling engines');
  });
});