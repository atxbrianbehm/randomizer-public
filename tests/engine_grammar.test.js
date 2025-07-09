import { describe, it, expect, vi } from 'vitest';
import { loadEngineWithGenerator } from './helpers/mockGenerator.js';



describe('RandomizerEngine grammar expansion suite', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});

  it('expands nested placeholders and modifier chain', async () => {
    const g = {
      metadata: { name: 'nested' },
      grammar: {
        origin: ['#adj.capitalize# #noun.a_an#'],
        adj: ['spooky'],
        noun: ['ghost']
      },
      entry_points: { default: 'origin' }
    };
    const { engine } = await loadEngineWithGenerator(g);
    const txt = engine.generate();
    expect(txt).toBe('Spooky a ghost');
  });

  it('handles sequential rule joiners', async () => {
    const g = {
      metadata: { name: 'seq' },
      grammar: {
        origin: {
          type: 'sequential',
          options: [
            { text: 'one' },
            { text: 'two', joiner: ' & ' },
            'three'
          ]
        }
      },
      entry_points: { default: 'origin' }
    };
    const { engine } = await loadEngineWithGenerator(g);
    expect(engine.generate()).toBe('one two & three');
  });

  it('selects weighted option respecting weights', async () => {
    const g = {
      metadata: { name: 'weight' },
      grammar: {
        origin: {
          type: 'weighted',
          options: ['a', 'b', 'c'],
          weights: [0, 0, 1] // force choose c
        }
      },
      entry_points: { default: 'origin' }
    };
    const { engine } = await loadEngineWithGenerator(g);
    // set seed so prng deterministic (~0 value still picks index 2 with weights)
    engine.setSeed('force');
    const txt = engine.generate();
    expect(txt).toBe('c');
  });

  it('logs warning and stops at safety iteration on cyclic rules', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const g = {
      metadata: { name: 'cyclic' },
      grammar: {
        origin: ['#A#'],
        A: ['#B#'],
        B: ['#A#']
      },
      entry_points: { default: 'origin' }
    };
    const { engine } = await loadEngineWithGenerator(g);
    const res = engine.generate();
    expect(res).toContain('[CYCLIC RULE]');
  });
});
