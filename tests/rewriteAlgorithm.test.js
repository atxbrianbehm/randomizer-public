import { describe, it, expect } from 'vitest';
import RandomizerEngine from '../RandomizerEngine.js';

function createMockGenerator() {
  return {
    metadata: {
      name: 'mock',
      slotOrder: [
        'subject',
        'condition',
        'purpose',
        'materials',
        'colour',
        'view'
      ]
    },
    grammar: {
      subject: [
        { _meta: { slot: 'subject', connector: '', priority: 1 } },
        'retro console'
      ],
      condition: [
        { _meta: { slot: 'condition', connector: 'with', priority: 2 } },
        'heavy wear'
      ],
      purpose: [
        { _meta: { slot: 'purpose', connector: 'for', priority: 3 } },
        'controlling engines'
      ],
      colour: [
        { _meta: { slot: 'colour', connector: 'in', priority: 4 } },
        'neon green'
      ]
    },
    entry_points: { default: 'subject' }
  };
}

describe('buildReadablePrompt algorithm', () => {
  const engine = new RandomizerEngine();
  engine.loadGenerator(createMockGenerator());
  engine.selectGenerator('mock');

  it('orders chips by slotOrder and applies connectors', () => {
    const segments = [
      { key: 'purpose', text: 'controlling engines' },
      { key: 'subject', text: 'retro console' },
      { key: 'condition', text: 'heavy wear' },
      { key: 'colour', text: 'neon green' }
    ];

    const result = engine.buildReadablePrompt('mock', segments);
    expect(result).toBe(
      'retro console with heavy wear for controlling engines in neon green'
    );
  });

  it('joins same connector with comma', () => {
    const segments = [
      { key: 'subject', text: 'retro console' },
      { key: 'condition', text: 'heavy wear' },
      { key: 'condition', text: 'rusty screws' }
    ];

    const result = engine.buildReadablePrompt('mock', segments);
    expect(result).toBe('retro console with heavy wear, rusty screws');
  });
});
