
import { describe, it, expect, beforeEach } from 'vitest';
import { saveState, loadState, clearState } from '../src/services/persistence.js';

describe('Persistence Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads state', () => {
    const state = { 
      generator: 'test-generator', 
      lockedValues: { foo: 'bar' },
      lastPrompt: { raw: 'raw', readable: 'readable' },
      theme: 'dark',
      seed: 123
    };
    saveState(state);
    const loadedState = loadState();
    expect(loadedState).toEqual({ version: 1, ...state });
  });

  it('clears state', () => {
    const state = { generator: 'test-generator' };
    saveState(state);
    clearState();
    const loadedState = loadState();
    expect(loadedState).toBeNull();
  });
});
