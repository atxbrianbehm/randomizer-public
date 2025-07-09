import { describe, it, expect, beforeEach } from 'vitest';
import { humanLabel, extractValues, createLockBtn, buildModal } from '@/ui/advancedModal.js';

function setupDom() {
  document.body.innerHTML = `
    <div id="advanced-modal" style="display:none">
      <div id="advanced-modal-body"></div>
      <button id="apply-advanced"></button>
      <button id="cancel-advanced"></button>
    </div>`;
}

describe('advancedModal helpers', () => {
  beforeEach(() => {
    setupDom();
  });
  it('humanLabel formats camelCase and respects uiLabel override', () => {
    const gen = { grammar: { AgeGroup: { _meta: { uiLabel: 'Age Group' } } } };
    expect(humanLabel('AgeGroup', gen)).toBe('Age Group');
    expect(humanLabel('camelCaseKey')).toBe('Camel Case Key');
  });

  it('extractValues pulls strings and object text/value', () => {
    const arr = ['A', { text: 'B' }, { value: 'C' }, { foo: 'ignore' }];
    expect(extractValues(arr)).toEqual(['A', 'B', 'C']);
  });

  it('createLockBtn toggles state and icon', () => {
    const app = { LockState: { foo: false }, Locked: {}, engine: { lockedValues: {} } };
    // mock select element expected by createLockBtn
    const sel = document.createElement('select');
    sel.id = 'adv-foo';
    const opt = document.createElement('option');
    opt.value = 'Bar';
    sel.appendChild(opt);
    document.body.appendChild(sel);
    const btn = createLockBtn('foo', app);
    expect(btn.textContent).toBe('🔓');
    // simulate click
    btn.onclick();
    expect(app.LockState.foo).toBe(true);
    expect(app.engine.lockedValues.foo).toBeDefined();
  });

  it('buildModal groups Stage_ prefixes and auto-locks on change', () => {
    const app = {
      generatorSpec: {
        name: 'TestGen',
        grammar: {
          Stage_1_sermon: ['Intro'],
          Stage_1_topic: ['Faith', 'Hope'],
          Stage_2_quote: ['Quote1', 'Quote2']
        },
        lockableRules: ['Stage_1_topic', 'Stage_2_quote']
      },
      LockState: {},
      Locked: {},
      engine: { lockedValues: {} }
    };
    setupDom();
    buildModal(app);
    // expect stage headers rendered
    const headers = [...document.querySelectorAll('.stage-box h4')].map(h => h.textContent);
    expect(headers).toEqual(['Stage 1', 'Stage 2']);
    // change select to trigger auto lock
    const sel = document.getElementById('adv-Stage_1_topic');
    sel.value = 'Hope';
    sel.onchange();
    expect(app.LockState['Stage_1_topic']).toBe(true);
    expect(app.engine.lockedValues['Stage_1_topic']).toBe('Hope');
  });
});
