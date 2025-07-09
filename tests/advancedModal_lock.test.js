import { describe, it, expect, beforeEach } from 'vitest';
import { buildModal, applyModal, createLockBtn } from '@/ui/advancedModal.js';
import RandomizerEngine from '@/RandomizerEngine.js';

function setupDom() {
  document.body.innerHTML = `
  <div id="advanced-modal">
    <div id="advanced-modal-body"></div>
    <button id="apply-advanced">Apply</button>
    <button id="cancel-advanced"></button>
    <button class="close-modal"></button>
  </div>`;
}

function createMockApp() {
  const engine = new RandomizerEngine();
  const generatorSpec = {
    name: 'mock',
    grammar: {
      color: ['red', 'green', 'blue']
    },
    lockableRules: ['color'],
    uiConfig: {}
  };
  engine.loadedGenerators.set('mock', generatorSpec); // minimal registration so getLockableRules works
  engine.currentGenerator = 'mock';
  return {
    LockState: {},
    Locked: {},
    engine,
    generatorSpec,
    lockableRules: generatorSpec.lockableRules,
    updateVariablesDisplay: () => {},
    persistState: () => {}
  };
}

describe('Advanced modal lock persistence', () => {
  let app;
  beforeEach(() => {
    setupDom();
    app = createMockApp();
  });

  it('locks selected value and updates engine.lockedValues', () => {
    buildModal(app);
    const select = document.getElementById('adv-color');
    // change selection to 'green'
    select.value = 'green';
    select.onchange();
    expect(app.LockState['color']).toBe(true);
    expect(app.Locked['color']).toBe('green');
    expect(app.engine.lockedValues['color']).toBe('green');
  });

  it('applyModal persists existing lock and hides modal', () => {
    buildModal(app);
    // lock value via onchange
    const select = document.getElementById('adv-color');
    select.value = 'blue';
    select.onchange();

    applyModal(app);
    expect(app.engine.lockedValues['color']).toBe('blue');
    // modal should be hidden (display:none)
    const modal = document.getElementById('advanced-modal');
    expect(modal.style.display).toBe('none');
  });

  it('unlocking removes value from engine.lockedValues', () => {
    buildModal(app);
    // lock first
    const select = document.getElementById('adv-color');
    select.value = 'red';
    select.onchange();
    // find lock button and click to unlock
    const lockBtn = document.querySelector('.lock-button');
    lockBtn.onclick(); // toggles lock state
    expect(app.LockState['color']).toBe(false);
    expect(app.engine.lockedValues['color']).toBeUndefined();
  });
});
