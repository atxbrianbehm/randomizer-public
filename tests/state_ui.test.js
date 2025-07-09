import { describe, it, expect, beforeEach } from 'vitest';
import { updateGeneratorDropdown, updateVariablesDisplay, updateEntryPoints } from '@/ui/state.js';

function createDom() {
  document.body.innerHTML = `
    <select id="generator-select"></select>
    <select id="entry-point"></select>
    <div id="variables-table"></div>
    <div id="advanced-modal" style="display:none"></div>`;
}

function createMockApp() {
  const engine = {
    listGenerators: () => ['genA', 'genB'],
    currentGenerator: 'genA',
    loadedGenerators: new Map(),
    getCurrentVariables: () => ({ preacher_name: 'John' }),
    lockedValues: {}
  };
  const generatorSpec = {
    entry_points: { default: 'origin', alternatives: ['alt_one'] },
    variables: { preacher_name: { type: 'string', description: 'name' } },
    grammar: {}
  };
  engine.loadedGenerators.set('genA', generatorSpec);
  return {
    currentGeneratorId: 'genA',
    engine,
    persistState: () => {},
    syncAdvancedModal: () => {}
  };
}

describe('ui/state helpers', () => {
  let app;
  beforeEach(() => {
    createDom();
    app = createMockApp();
  });

  it('updateGeneratorDropdown populates options', () => {
    updateGeneratorDropdown(app);
    const select = document.getElementById('generator-select');
    expect(select.options.length).toBe(2);
    expect(select.options[0].value).toBe('genA');
  });

  it('updateEntryPoints renders alternative options', () => {
    updateEntryPoints(app);
    const select = document.getElementById('entry-point');
    expect([...select.options].some(o => o.value === 'alt_one')).toBe(true);
  });

  it('updateVariablesDisplay shows variable and toggles lock', () => {
    updateVariablesDisplay(app);
    const table = document.querySelector('.variables-table');
    expect(table).not.toBeNull();
    const lockBtn = document.querySelector('.lock-btn');
    expect(lockBtn).not.toBeNull();
    expect(lockBtn.textContent).toBe('🔓');

    // simulate click to lock
    lockBtn.onclick();
    expect(app.engine.lockedValues.preacher_name).toBe('John');
    const newBtn = document.querySelector('.lock-btn');
    expect(newBtn.textContent).toBe('🔒');
  });
});
