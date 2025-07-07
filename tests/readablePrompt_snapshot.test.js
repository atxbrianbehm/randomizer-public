import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

function load(engine, generator) {
  return engine.loadGenerator(generator).then((name) => {
    engine.selectGenerator(name);
    return name;
  });
}

describe('buildReadablePrompt snapshots', () => {
  let engine;
  beforeEach(() => {
    engine = new RandomizerEngine();
  });

  it('renders connectors & slot order correctly', () => {
    const segments = [
      { _meta: { slot: 'subject', connector: '' }, text: 'cat' },
      { _meta: { slot: 'condition', connector: ' in ' }, text: 'space' },
      { _meta: { slot: 'purpose', connector: ' under ' }, text: 'water' }
    ];
    const readable = engine.buildReadablePrompt('connector-gen', segments);
    expect(readable).toBe('cat in space under water');
  });

  it('returns template segment verbatim', async () => {
    const gen = {
      metadata: { name: 'template-gen' },
      grammar: {
        origin: [
          {
            _meta: { slot: 'template' },
            text: 'A lone wolf howls at night.'
          }
        ]
      },
      entry_points: { default: 'origin' }
    };
    await load(engine, gen);
    const { readable } = engine.generateDetailed();
    expect(readable).toMatchSnapshot();
  });
});
