import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveIncludes } from '@/services/generatorLoader.js';

// Helper to mock global fetch for each test
function mockFetch(mapping) {
  const fetchMock = vi.fn((path) => {
    if (mapping[path]) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mapping[path])
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('resolveIncludes', () => {
  beforeEach(() => {
    // Reset any previous stubs
    vi.unstubAllGlobals();
  });

  it('inlines a simple $include object', async () => {
    const includeData = { greeting: 'hello' };
    const fetchMap = { '/foo.json': includeData };
    mockFetch(fetchMap);

    const node = { $include: '/foo.json' };
    const result = await resolveIncludes(node, '/');
    expect(result).toEqual(includeData);
  });

  it('preserves _meta when inlining include object', async () => {
    const includeData = { val: 42 };
    mockFetch({ '/bar.json': includeData });

    const node = { _meta: { weight: 2 }, $include: '/bar.json' };
    const result = await resolveIncludes(node, '/');
    expect(result).toEqual({ _meta: { weight: 2 }, ...includeData });
  });

  it('merges [{_meta}, {$include}] array pattern', async () => {
    const includeArr = [ 'red', 'blue' ];
    mockFetch({ '/colors.json': includeArr });

    const node = [
      { _meta: { slot: 'template' } },
      { $include: '/colors.json' }
    ];
    const result = await resolveIncludes(node, '/');
    expect(result).toEqual([{ _meta: { slot: 'template' } }, ...includeArr]);
  });

  it('falls back gracefully when fetch fails', async () => {
    mockFetch({}); // no mapping leads to 404

    const node = { $include: '/missing.json' };
    const result = await resolveIncludes(node, '/');
    // Should return node unchanged on error
    expect(result).toEqual(node);
  });

  it('detects and breaks circular $include chains', async () => {
    // /a.json -> /b.json -> /a.json
    const fetchMap = {
      '/a.json': { $include: '/b.json' },
      '/b.json': { $include: '/a.json' }
    };
    mockFetch(fetchMap);

    const node = { $include: '/a.json' };
    const result = await resolveIncludes(node, '/');
    // Because of circular detection, the deepest include should return original node
    expect(result).toEqual({ $include: '/a.json' });
  });
});
