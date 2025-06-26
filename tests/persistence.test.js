import { describe, it, expect, beforeEach } from 'vitest';

import { saveState, loadState, clearState } from '../src/services/persistence.js';

// JSDOM already provides localStorage mock via @vitest/browser environment

describe('persistence service', () => {
  beforeEach(() => {
    clearState();
    // Defensive: ensure localStorage cleared
    localStorage.clear();
  });

  it('saves and loads state round-trip', () => {
    const sample = {
      generator: 'televangelist',
      lockedValues: { preacher_name: 'Bob' },
      lastPrompt: { raw: 'foo' }
    };

    saveState(sample);

    const loaded = loadState();
    // Version key is added internally – ignore when comparing
    delete loaded.version;
    expect(loaded).toEqual(sample);
  });

  it('clears state correctly', () => {
    saveState({ generator: 'x' });
    clearState();
    expect(loadState()).toBeNull();
  });

  it('returns null on version mismatch', () => {
    // Manually craft payload with wrong version
    localStorage.setItem('randomizer_state_v1', JSON.stringify({ version: 999, foo: 'bar' }));
    expect(loadState()).toBeNull();
  });
});
