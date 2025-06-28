import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadGenerators } from '../src/services/generatorLoader.js';
import RandomizerEngine from '../src/RandomizerEngine.js';

describe('Generator Loading', () => {
  let engine;

  beforeEach(() => {
    engine = new RandomizerEngine();
    global.fetch = vi.fn();
  });

  it('loads generators from a list of files', async () => {
    const mockGenerator = {
      metadata: { name: 'test-generator' },
      grammar: { start: ['hello world'] },
      entry_points: { default: 'start' },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGenerator),
    });

    const generatorFiles = ['/test-generator.json'];
    const loadedNames = await loadGenerators(engine, generatorFiles);

    expect(fetch).toHaveBeenCalledWith('/test-generator.json');
    expect(loadedNames).toEqual(['test-generator']);
    expect(engine.listGenerators()).toContain('test-generator');
  });
});