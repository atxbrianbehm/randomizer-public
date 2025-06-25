import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGeneratorSpec, registerGenerator } from '@/services/generatorLoader';

// Helper to fabricate a minimal generator spec
const makeSpec = (name = 'Test Generator') => ({
  metadata: { name },
  variables: {},
  grammar: {},
  entryPoints: { default: '' }
});

describe('generatorLoader helpers', () => {
  describe('fetchGeneratorSpec', () => {
    const sampleSpec = makeSpec();

    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('returns parsed JSON on successful fetch', async () => {
      const fetchMock = globalThis.fetch;
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(sampleSpec)
      });

      const result = await fetchGeneratorSpec('/path/to/spec.json');
      expect(result).toEqual(sampleSpec);
      expect(fetchMock).toHaveBeenCalledWith('/path/to/spec.json');
    });

    it('returns null when response not ok', async () => {
      globalThis.fetch.mockResolvedValue({ ok: false, status: 404 });
      const result = await fetchGeneratorSpec('/bad/path.json');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      globalThis.fetch.mockRejectedValue(new Error('network fail'));
      const result = await fetchGeneratorSpec('/boom.json');
      expect(result).toBeNull();
    });
  });

  describe('registerGenerator', () => {
    it('loads generator and returns its name', async () => {
      const spec = makeSpec('Cool Gen');
      const engine = { loadGenerator: vi.fn().mockResolvedValue('Cool Gen') };
      const name = await registerGenerator(engine, spec);
      expect(name).toBe('Cool Gen');
      expect(engine.loadGenerator).toHaveBeenCalledWith(spec, 'Cool Gen');
    });

    it('returns null when engine throws', async () => {
      const spec = makeSpec('Explody');
      const engine = { loadGenerator: vi.fn().mockRejectedValue(new Error('bad')) };
      const name = await registerGenerator(engine, spec);
      expect(name).toBeNull();
    });
  });
});
