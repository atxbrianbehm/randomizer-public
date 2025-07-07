import { describe, it, expect } from 'vitest';
import RandomizerEngine from '../src/RandomizerEngine.js';

/**
 * Unit tests that assert RandomizerEngine throws helpful errors when given
 * malformed generator specifications. These add coverage for the validation
 * branch as well as reject-paths in the async load flow.
 */

describe('RandomizerEngine.validateGenerator', () => {
  const engine = new RandomizerEngine();

  it('throws when metadata.name is missing', async () => {
    const badSpec = {
      metadata: {},
      grammar: { foo: ['bar'] },
      entry_points: { default: 'foo' }
    };
    await expect(engine.loadGenerator(badSpec)).rejects.toThrow('metadata');
  });

  it('throws when grammar object is missing', async () => {
    const badSpec = {
      metadata: { name: 'noGrammar' },
      entry_points: { default: 'foo' }
    };
    await expect(engine.loadGenerator(badSpec)).rejects.toThrow('grammar');
  });

  it('throws when entry_points.default is missing', async () => {
    const badSpec = {
      metadata: { name: 'noEntry' },
      grammar: { foo: ['bar'] },
      entry_points: {}
    };
    await expect(engine.loadGenerator(badSpec)).rejects.toThrow('entry_points');
  });
});
