import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveIncludes } from '../src/services/generatorLoader.js';

/**
 * Tests error-handling paths in resolveIncludes – specifically failed fetches and
 * unresolvable $include directives. Uses Vitest mock for global fetch.
 */

describe('generatorLoader.resolveIncludes error handling', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  it('returns original node and logs when fetch fails', async () => {
    // Arrange – mock fetch to reject with 404
    global.fetch.mockResolvedValue({ ok: false, status: 404 });

    const node = { $include: '/does_not_exist.json' };

    const resolved = await resolveIncludes(node, '/');

    // fetch should have been called once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Should fall back to original node since fetch failed
    expect(resolved).toEqual(node);
  });
});
