import { describe, it, expect, beforeEach } from 'vitest';
import RandomizerEngine from '@/RandomizerEngine.js';

// Minimal helper that registers and selects a generator from a JS object
function load(engine, generator) {
  return engine.loadGenerator(generator).then(name => {
    engine.selectGenerator(name);
    return name;
  });
}

describe('RandomizerEngine core expansion', () => {
  let engine;
  beforeEach(() => {
    engine = new RandomizerEngine();
  });

  it('expands simple grammar rules', async () => {
    const gen = {
      metadata: { name: 'simple' },
      grammar: {
        origin: ['#adjective# #noun#'],
        adjective: ['quick'],
        noun: ['fox']
      },
      entry_points: { default: 'origin' }
    };
    await load(engine, gen);
    const text = engine.generate();
    expect(text).toBe('quick fox');
  });

  it('supports built-in plural modifier', async () => {
    const gen = {
      metadata: { name: 'plural' },
      grammar: {
        origin: ['#animal.plural#'],
        animal: ['cat']
      },
      entry_points: { default: 'origin' }
    };
    await load(engine, gen);
    const text = engine.generate();
    expect(text).toBe('cats');
  });

  it('evals conditional rules and actions', async () => {
    const gen = {
      metadata: { name: 'cond' },
      grammar: {
        origin: [
          {
            _meta: { slot: 'template' },
            options: [
              {
                conditions: { $eq: { '#{fuel}': 0 } },
                text: 'out of fuel',
                actions: { set: { fuel: 100 } }
              },
              {
                conditions: {},
                text: 'flying',
                actions: { decrement: { fuel: 10 } }
              }
            ],
            fallback: 'idle'
          }
        ]
      },
      variables: { fuel: { default: 0 } },
      entry_points: { default: 'origin' }
    };
    await load(engine, gen);
    // first call meets first condition
    expect(engine.generate()).toBe('out of fuel');
    // variable was set, second call meets second path
    expect(engine.generate()).toBe('flying');
  });
});
