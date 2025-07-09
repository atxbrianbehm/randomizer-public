import {
  fetchJsonCached,
  clearJsonCache,
  deepMergePreserveArrays,
  slugify,
  randomPickWeighted,
  flattenIncludes,
  validateGeneratorSpec,
  parseRulePlaceholders
} from '../src/utils/helpers.js';
import { describe, it, expect, vi } from 'vitest';

// Helper for deterministic RNG
const fakeRng = () => 0.6;

describe('utils.helpers', () => {
  it('slugify converts text to safe id', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('Äccents &    spaces')).toBe('accents-spaces');
  });

  it('deepMergePreserveArrays replaces arrays, merges objects', () => {
    const t = { a: 1, list: [1, 2], nested: { x: 1 } };
    const s = { list: [3], nested: { y: 2 } };
    const out = deepMergePreserveArrays(t, s);
    expect(out).toEqual({ a: 1, list: [3], nested: { x: 1, y: 2 } });
  });

  it('randomPickWeighted picks based on weight', () => {
    const items = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 3 }
    ];
    // deterministic rng yields value >1/4, should pick 'b'
    expect(randomPickWeighted(items, fakeRng)).toBe('b');
  });

  it('flattenIncludes lists unique include paths', () => {
    const spec = [
      { _meta: { note: 'x' } },
      { $include: '/foo.json' },
      { name: { $include: '/bar.json' } },
      { $include: '/foo.json' }
    ];
    const paths = flattenIncludes(spec);
    expect(Array.from(paths)).toEqual(['/foo.json', '/bar.json']);
  });

  it('validateGeneratorSpec validates schema', () => {
    const good = { metadata: { name: 'test' }, rules: { hero: ['x'] } };
    expect(validateGeneratorSpec(good).ok).toBe(true);
    const bad = { metadata: {}, rules: {} };
    expect(validateGeneratorSpec(bad).ok).toBe(false);
  });

  it('parseRulePlaceholders extracts tokens', () => {
    const tokens = parseRulePlaceholders('You {animal|2-4} {action}!');
    expect(tokens).toEqual([
      { type: 'text', value: 'You ' },
      { type: 'placeholder', value: 'animal', min: 2, max: 4 },
      { type: 'text', value: ' ' },
      { type: 'placeholder', value: 'action', min: undefined, max: undefined },
      { type: 'text', value: '!' }
    ]);
  });

  it('fetchJsonCached caches responses', async () => {
    const jsonData = { x: 1 };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => jsonData });
    // temporarily replace global fetch
    const origFetch = global.fetch;
    global.fetch = fetchMock;
    clearJsonCache();
    const first = await fetchJsonCached('/data.json');
    const second = await fetchJsonCached('/data.json');
    expect(first).toEqual(jsonData);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    global.fetch = origFetch;
  });
});
