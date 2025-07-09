import { describe, it, expect, vi } from 'vitest';
import { resolveIncludes, deriveBasePath } from '../src/utils/resolveIncludes.js';

// Helper to mock global fetch for include resolution
function mockFetch(map) {
  global.fetch = vi.fn((url) => {
    // console.log(`Mock fetch called with URL: ${url}`); // Debugging line
    // console.log(`Available keys in map: ${Object.keys(map)}`); // Debugging line
    if (!map[url]) {
      // console.error(`Mock fetch: URL ${url} not found in map.`); // Debugging line
      return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found in Mock' });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(map[url])
    });
  });
}

describe('resolveIncludes', () => {
  it('inlines single include object', async () => {
    const base = '/irrelevant_base_for_this_test_case/'; // Base path for recursive calls, not this direct include
    const includeData = [ 'A', 'B' ];
    // resolveIncludes will call fetch with '/platforms.json' because 'platforms.json' doesn't start with '/'
    mockFetch({ ['/platforms.json']: includeData });

    const input = { "$include": 'platforms.json' }; // $include value does not start with '/'
    const output = await resolveIncludes(input, base);
    expect(output).toEqual(includeData);
  });

  it('preserves _meta when present', async () => {
    const base = '/irrelevant_base_for_this_test_case/';
    // resolveIncludes will call fetch with '/downfalls.json'
    mockFetch({ ['/downfalls.json']: [ 'x' ] });

    const input = { _meta: { slot: 's' }, "$include": 'downfalls.json' }; // $include value does not start with '/'
    const output = await resolveIncludes(input, base);
    expect(output[0]).toEqual({ _meta: { slot: 's' } });
    expect(output.slice(1)).toEqual([ 'x' ]);
  });

  it('resolves nested includes inside arrays and objects', async () => {
    const base = '/irrelevant_base_for_this_test_case/'; // This base is passed along in recursive calls
    mockFetch({
      ['/foo.json']: { bar: { "$include": 'baz.json' } }, // $include: 'foo.json' results in fetch('/foo.json')
      ['/baz.json']: ['Z']  // $include: 'baz.json' (from within foo.json) results in fetch('/baz.json')
    });

    const spec = { section: { "$include": 'foo.json' } }; // $include value does not start with '/'
    const resolved = await resolveIncludes(spec, base);
    expect(resolved.section.bar).toEqual(['Z']);
  });
});

describe('deriveBasePath', () => {
  it('converts root json path to a base path', () => { // Test description updated
    // This test now reflects the actual behavior of deriveBasePath for Vite's publicDir setup
    expect(deriveBasePath('/televangelist_generator.json')).toBe('/televangelist_generator/');
  });
});
