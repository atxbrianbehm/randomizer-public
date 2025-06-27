import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import RandomizerEngine from '../RandomizerEngine.js';

// Helper to synchronously read fixture generator JSON
function readGenerator(relPath) {
  const abs = path.resolve(__dirname, '..', relPath);
  return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

describe('RandomizerEngine.getAllVariableKeys', () => {
  it('returns all declared variable keys for Televangelist generator', async () => {
    const genData = readGenerator('generators/televangelist_generator.json');
    const engine = new RandomizerEngine();
    await engine.loadGenerator(genData);

    const keys = engine.getAllVariableKeys('Televangelist Generator');
    // Expect length to match keys in JSON file
    expect(keys.length).toBe(Object.keys(genData.variables).length);
    // Expect a couple known keys to be present
    expect(keys).toContain('donation_amount');
    expect(keys).toContain('miracle_count');
    expect(keys).toContain('media_attention');
  });
});
