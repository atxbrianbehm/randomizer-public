import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveState, clearState } from '../src/services/persistence.js'; // Use relative path
import { RandomizerApp } from '../src/main.js'; // Use relative path

vi.mock('../src/services/generatorLoader.js', () => ({ // Use relative path
  loadGenerators: vi.fn(async () => [])
}));

vi.mock('../src/ui/events.js', () => ({
  default: () => {}
}));
vi.mock('../src/ui/advancedModal.js', () => ({
  setupModal: () => {},
  showModal: () => {},
  buildModal: () => {}
}));
vi.mock('../src/ui/state.js', () => ({
  updateEntryPoints: () => {},
  updateVariablesDisplay: () => {},
  updateGeneratorStructure: () => {}
}));
vi.mock('../src/ui/query.js', () => ({ q: () => null })); // Use relative path

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