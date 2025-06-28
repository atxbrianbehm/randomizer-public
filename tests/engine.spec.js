import RandomizerEngine from '@/RandomizerEngine.js';

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

  describe('loadGenerator with $include directive', () => {
    let engine;
    const includedContent = ["This is included content."];
    const includedPath = "path/to/included.json";

    beforeEach(() => {
      engine = new RandomizerEngine();
      vi.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn during tests
    });

    afterEach(() => {
      console.warn.mockRestore();
    });

    const getFreshGeneratorWithInclude = () => JSON.parse(JSON.stringify({
      metadata: { name: 'include-test-gen' },
      grammar: {
        mainRule: ["This is main."],
        ruleToInclude: { "$include": includedPath }
      },
      entry_points: { default: 'mainRule' }
    }));

    it('successfully resolves and embeds included content via includeResolver', async () => {
      const generatorToLoad = getFreshGeneratorWithInclude();
      const mockResolver = vi.fn((path) => {
        if (path === includedPath) {
          return JSON.parse(JSON.stringify(includedContent)); // Deep copy
        }
        return null;
      });

      await engine.loadGenerator(generatorToLoad, null, { includeResolver: mockResolver });
      const loadedGen = engine.loadedGenerators.get('include-test-gen');

      expect(mockResolver).toHaveBeenCalledWith(includedPath);
      expect(loadedGen.grammar.ruleToInclude).toEqual(includedContent);
    });

    it('handles resolver returning no data with a warning and error string', async () => {
      const generatorToLoad = getFreshGeneratorWithInclude();
      const mockResolver = vi.fn(() => null);
      await engine.loadGenerator(generatorToLoad, null, { includeResolver: mockResolver });
      const loadedGen = engine.loadedGenerators.get('include-test-gen');

      expect(loadedGen.grammar.ruleToInclude).toBe(`[INCLUDE_ERROR: Resolver no data - ${includedPath}]`);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Include resolver returned no data for: ${includedPath}`));
    });

    it('handles resolver throwing an error with a warning and error string', async () => {
      const generatorToLoad = getFreshGeneratorWithInclude();
      const mockResolver = vi.fn(() => { throw new Error("Test resolver error"); });
      await engine.loadGenerator(generatorToLoad, null, { includeResolver: mockResolver });
      const loadedGen = engine.loadedGenerators.get('include-test-gen');

      expect(loadedGen.grammar.ruleToInclude).toBe(`[INCLUDE_ERROR: Resolver failed - ${includedPath}]`);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Error in include resolver for path ${includedPath}`), expect.any(Error));
    });

    it('handles missing includeResolver with a warning and error string', async () => {
      const generatorToLoad = getFreshGeneratorWithInclude();
      await engine.loadGenerator(generatorToLoad); // No includeResolver provided
      const loadedGen = engine.loadedGenerators.get('include-test-gen');

      expect(loadedGen.grammar.ruleToInclude).toBe(`[INCLUDE_ERROR: No resolver - ${includedPath}]`);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Found $include directive for "${includedPath}" but no includeResolver function was provided.`));
    });

    it('processes non-$include rules normally even if resolver is present', async () => {
      const generatorToLoad = getFreshGeneratorWithInclude();
      const mockResolver = vi.fn(() => null);
      await engine.loadGenerator(generatorToLoad, null, { includeResolver: mockResolver });
      const loadedGen = engine.loadedGenerators.get('include-test-gen');
      expect(loadedGen.grammar.mainRule).toEqual(["This is main."]);
    });
  });
});
