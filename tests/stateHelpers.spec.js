import { JSDOM } from 'jsdom';
import RandomizerEngine from '@/RandomizerEngine.js';
import { updateEntryPoints, updateVariablesDisplay } from '../src/ui/state.js';

const mockGenerator = {
  metadata: { name: 'mock' },
  variables: {
    adjective: { type: 'string', default: 'funny', description: 'An adjective' }
  },
  grammar: {
    origin: ['This is a {{adjective}} test.']
  },
  entry_points: {
    default: 'origin',
    alternatives: ['origin']
  }
};

function setupDom() {
  const dom = new JSDOM(`<!DOCTYPE html><body>
    <select id="entry-point"></select>
    <div id="variables-table"></div>
    <div id="advanced-modal" style="display:none;"></div>
  </body>`);
  global.document = dom.window.document;
  global.window = dom.window;
}

describe('UI state helpers', () => {
  let app;
  beforeEach(async () => {
    setupDom();
    const engine = new RandomizerEngine();
    await engine.loadGenerator(mockGenerator);
    engine.selectGenerator('mock');

    app = {
      engine,
      currentGeneratorId: 'mock',
      syncAdvancedModal: () => {},
    };
  });

  it('populates entry-point dropdown', () => {
    updateEntryPoints(app);
    const options = [...document.querySelectorAll('#entry-point option')].map(o => o.value);
    expect(options).toEqual(expect.arrayContaining(['default', 'origin']));
  });

  it('renders variables table rows', () => {
    updateVariablesDisplay(app);
    const html = document.getElementById('variables-table').innerHTML;
    expect(html).toMatch('adjective');
  });
});
