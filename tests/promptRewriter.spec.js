import { describe, it, expect } from 'vitest';
import RandomizerEngine from '../RandomizerEngine.js';

const gen = {
  metadata: {
    name: 'bench',
    slotOrder: ['subject', 'theme']
  },
  grammar: {
    origin: ['#subject# #theme#'],
    subject: [
      { _meta: { slot: 'subject', connector: '' }, value: 'cat' },
      { _meta: { slot: 'subject', connector: '' }, value: 'dog' }
    ],
    theme: [
      { _meta: { slot: 'theme', connector: ' in ' }, value: 'space' },
      { _meta: { slot: 'theme', connector: ' under ' }, value: 'water' }
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
    expect(readable).toMatch(/^(cat|dog)( in | under )(space|water)$/);
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
    expect(elapsed).toBeLessThan(30);
  });
});
