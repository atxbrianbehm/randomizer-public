import { describe, it, expect, vi } from 'vitest';
import { resolveIncludes, deriveBasePath } from '../src/services/generatorLoader.js';

// Helper to mock global fetch for include resolution
function mockFetch(map) {
  global.fetch = vi.fn((url) => {
    if (!map[url]) {
      return Promise.resolve({ ok: false, status: 404 });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(map[url])
    });
  });
}

describe('resolveIncludes', () => {
  it('inlines single include object', async () => {
    const base = '/generators/televangelist_generator/';
    const includeData = [ 'A', 'B' ];
    mockFetch({ [`${base}platforms.json`]: includeData });

    const input = { "$include": 'platforms.json' };
    const output = await resolveIncludes(input, base);
    expect(output).toEqual(includeData);
  });

  it('preserves _meta when present', async () => {
    const base = '/generators/televangelist_generator/';
    mockFetch({ [`${base}downfalls.json`]: [ 'x' ] });

    const input = { _meta: { slot: 's' }, "$include": 'downfalls.json' };
    const output = await resolveIncludes(input, base);
    expect(output[0]).toEqual({ _meta: { slot: 's' } });
    expect(output.slice(1)).toEqual([ 'x' ]);
  });

  it('resolves nested includes inside arrays and objects', async () => {
    const base = '/generators/';
    mockFetch({
      [`${base}foo.json`]: { bar: { "$include": 'baz.json' } },
      [`${base}baz.json`]: ['Z']
    });

    const spec = { section: { "$include": 'foo.json' } };
    const resolved = await resolveIncludes(spec, base);
    expect(resolved.section.bar).toEqual(['Z']);
  });
});

describe('deriveBasePath', () => {
  it('converts root json path to generators dir', () => {
    expect(deriveBasePath('/televangelist_generator.json')).toBe('/generators/televangelist_generator/');
  });
});
