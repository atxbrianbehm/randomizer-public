import { JSDOM } from 'jsdom';
import { RandomizerApp } from '@/core/RandomizerApp.js';

vi.mock('@/ui/events.js', () => ({ default: () => {} }));

describe('RandomizerApp integration', () => {
  beforeEach(() => {
    const dom = new JSDOM(`<!DOCTYPE html><body>
      <select id="generator-select"></select>
      <select id="entry-point"></select>
      <div id="variables-table"></div>
      <div id="generator-structure"></div>
      <div id="output-area"></div>
    </body>`);
    global.document = dom.window.document;
    global.window = dom.window;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          metadata: { name: 'televangelist' },
          variables: {},
          grammar: { origin: ['hello'] },
          entry_points: { default: 'origin' }
        })
      })
    );
  });

  it('populates generator dropdown on init', async () => {
    const app = new RandomizerApp();
    await new Promise(r => setTimeout(r, 0)); // Wait for async init

    const options = [...document.querySelectorAll('#generator-select option')].map(o => o.textContent);
    expect(options).toContain('televangelist');
  });
});