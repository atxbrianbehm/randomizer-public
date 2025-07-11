import { describe, it, expect } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

const gen = {
  metadata: {
    name: 'bench',
    slotOrder: ['subject', 'theme']
  },
  grammar: {
    origin: ['#subject# #theme#'],
    subject: [
      { _meta: { slot: 'subject', connector: '' }, text: 'cat' },
      { _meta: { slot: 'subject', connector: '' }, text: 'dog' }
    ],
    theme: [
      { _meta: { slot: 'theme', connector: ' in ' }, text: 'space' },
      { _meta: { slot: 'theme', connector: ' under ' }, text: 'water' }
    ]
  },
  entry_points: { default: 'origin' }
};

describe('Prompt rewriter', () => {
  const engine = new RandomizerEngine();
  engine.loadGenerator(gen);
  engine.selectGenerator('bench');

  it('returns readable prompt with two chips', () => {
    const { readable } = engine.generateDetailed();
    expect(readable).toMatch(/^(cat|dog) (space|water) \1 \2$/);
  });

  it('handles zero segments gracefully', () => {
    expect(engine.buildReadablePrompt('bench', [])).toBe('');
  });

  it('benchmark: 1000 rewrites under 30ms', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      engine.generateDetailed();
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
