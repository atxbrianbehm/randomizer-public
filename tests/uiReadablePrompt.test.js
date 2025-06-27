import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- mock DOM-related dependencies used inside RandomizerApp ------------
vi.mock('@/ui/events.js', () => ({ default: () => {} }));
vi.mock('@/ui/state.js', () => ({
  updateEntryPoints: () => {},
  updateVariablesDisplay: () => {},
  updateGeneratorStructure: () => {},
}));
vi.mock('@/ui/advancedModal.js', () => ({
  setupModal: () => {},
  showModal: () => {},
  buildModal: () => {},
}));

// Generator loader will attempt to fetch json files – stub it to no-op
vi.mock('@/services/generatorLoader.js', () => ({
  loadGenerators: async () => [],
}));

// Navigator.clipboard mock for jsdom
Object.assign(globalThis.navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

import { JSDOM } from 'jsdom';
import RandomizerApp from '../src/main.js';
import RandomizerEngine from '../RandomizerEngine.js';

function createMockGenerator() {
  return {
    metadata: {
      name: 'mock',
      slotOrder: ['subject', 'condition', 'purpose'],
    },
    grammar: {
      subject: [
        { _meta: { slot: 'subject', connector: '', priority: 1 } },
        'retro console',
      ],
      condition: [
        { _meta: { slot: 'condition', connector: 'with', priority: 2 } },
        'heavy wear',
      ],
      purpose: [
        { _meta: { slot: 'purpose', connector: 'for', priority: 3 } },
        'controlling engines',
      ],
    },
    entry_points: { default: 'subject' },
  };
}

// -----------------------------------------------------------------------

describe('UI ➜ readable prompt rendering', () => {
  let window, document, app;

  beforeEach(async () => {
    const dom = new JSDOM(`<!DOCTYPE html><body>
      <div class="container"></div>
      <select id="entry-point"><option value="default">Default</option></select>
      <input id="generation-count" value="1" />
      <div id="output-area"></div>
      <div id="generator-structure"></div>
      <select id="generator-select"></select>
    </body>`);
    window = dom.window;
    document = window.document;
    // expose globals expected by code
    global.document = document;
    global.window = window;

    // Instantiate app (constructor will use mocked dependencies)
    app = new RandomizerApp();

    // Load mock generator manually
    const gen = createMockGenerator();
    await app.engine.loadGenerator(gen);
    app.selectGenerator('mock');
  });

  it('displays readable prompt in DOM after generateText()', () => {
    // Call generateText which modifies DOM
    app.generateText();

    const cards = document.querySelectorAll('.prompt-card');
    expect(cards.length).toBeGreaterThan(0);
    const p = cards[0].querySelector('p');
    expect(p && p.textContent.trim().length).toBeGreaterThan(0);
  });
});
