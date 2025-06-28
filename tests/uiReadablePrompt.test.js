import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { RandomizerApp } from '@/core/RandomizerApp.js';
import RandomizerEngine from '../src/RandomizerEngine.js'; // Use relative path

vi.mock('@/ui/events.js', () => ({ default: () => {} })); // Use relative path
vi.mock('../src/ui/state.js', () => ({ // Use relative path
  updateEntryPoints: () => {},
  updateVariablesDisplay: () => {},
  updateGeneratorStructure: () => {},
}));
vi.mock('../src/ui/advancedModal.js', () => ({ // Use relative path
  setupModal: () => {},
  showModal: () => {},
  buildModal: () => {},
}));

vi.mock('../src/services/generatorLoader.js', () => ({ // Use relative path
  loadGenerators: async () => [],
}));

Object.assign(globalThis.navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

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
    global.document = document;
    global.window = window;

    app = new RandomizerApp();

    const gen = createMockGenerator();
    await app.engine.loadGenerator(gen);
    app.selectGenerator('mock');
  });

  it('displays readable prompt in DOM after generateText()', () => {
    app.generateText();

    const cards = document.querySelectorAll('.prompt-card');
    expect(cards.length).toBeGreaterThan(0);
    const p = cards[0].querySelector('p');
    expect(p && p.textContent.trim().length).toBeGreaterThan(0);
  });
});