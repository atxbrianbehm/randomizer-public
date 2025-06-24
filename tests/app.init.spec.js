import { JSDOM } from 'jsdom';
import { RandomizerApp } from '../src/main.js';

// Mock generator bundle used by RandomizerApp during init
const mockGenerator = {
  metadata: { name: 'televangelist' },
  variables: {},
  grammar: { origin: ['hello'] },
  entry_points: { default: 'origin' }
};

function setupDom() {
  const dom = new JSDOM(`<!DOCTYPE html><body>
    <select id="generator-select"></select>
    <select id="entry-point"></select>
    <div id="variables-table"></div>
    <div id="generator-structure"></div>
    <div id="output-area"></div>
  </body>`);
  global.document = dom.window.document;
  global.window = dom.window;
}

describe('RandomizerApp integration', () => {
  beforeEach(() => {
    setupDom();

    // Mock fetch to return our generator JSON for any requested file
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGenerator)
      })
    );
  });

  it('populates generator dropdown on init', async () => {
    const app = new RandomizerApp();
    // wait a tick for async initializeGenerators
    await new Promise(r => setTimeout(r, 0));

    const options = [...document.querySelectorAll('#generator-select option')].map(o => o.textContent);
    expect(options).toContain('televangelist');
  });
});
