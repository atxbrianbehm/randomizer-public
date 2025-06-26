import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/generatorLoader.js', () => ({
  loadGenerators: vi.fn(async () => [])
}));

vi.mock('@/ui/events.js', () => ({
  default: () => {}
}));
vi.mock('@/ui/advancedModal.js', () => ({
  setupModal: () => {},
  showModal: () => {},
  buildModal: () => {}
}));
vi.mock('@/ui/state.js', () => ({
  updateEntryPoints: () => {},
  updateVariablesDisplay: () => {},
  updateGeneratorStructure: () => {}
}));
vi.mock('@/ui/query.js', () => ({ q: () => null }));

import { saveState, clearState } from '../src/services/persistence.js';
import { RandomizerApp } from '../src/main.js';

function setupBasicDOM() {
  const ids = [
    'generator-select',
    'entry-point',
    'generation-count',
    'output-area'
  ];
  ids.forEach(id => {
    const el = document.createElement(id === 'output-area' ? 'div' : 'select');
    el.id = id;
    document.body.appendChild(el);
  });
}

describe('RandomizerApp hydration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearState();
    localStorage.clear();
    setupBasicDOM();
  });

  it('restores lockedValues on init', async () => {
    const locked = { preacher_name: 'Alice' };
    saveState({ generator: null, lockedValues: locked });

    const app = new RandomizerApp();
    expect(app.engine.lockedValues).toEqual(locked);
    expect(app.Locked).toEqual(locked);
  });
});
