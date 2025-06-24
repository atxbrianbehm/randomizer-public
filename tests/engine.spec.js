import RandomizerEngine from '../RandomizerEngine.js';

const mockGenerator = {
  metadata: { name: 'mock' },
  variables: {
    adjective: { default: 'funny' }
  },
  assets: {},
  grammar: {
    origin: ['This is a {{adjective}} test.']
  },
  entry_points: {
    default: 'origin'
  }
};

describe('RandomizerEngine', () => {
  it('loads a generator without error', async () => {
    const engine = new RandomizerEngine();
    const name = await engine.loadGenerator(mockGenerator);
    expect(name).toBe('mock');
    expect(engine.loadedGenerators.size).toBe(1);
  });

  it('generate() returns text', async () => {
    const engine = new RandomizerEngine();
    await engine.loadGenerator(mockGenerator);
    engine.selectGenerator('mock');
    const output = engine.generate();
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });
});
