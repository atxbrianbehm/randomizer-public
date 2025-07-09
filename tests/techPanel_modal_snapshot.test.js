import { describe, it, expect, beforeEach } from 'vitest';
import palettes from '../generators/techPanel_generator/primary_color_palettes.json';
import techSpec from '../generators/anachronisticTechPanel.json';
import { buildModal } from '@/ui/advancedModal.js';

function setupDom() {
  document.body.innerHTML = `
    <div id="advanced-modal">
      <div id="advanced-modal-body"></div>
      <button id="apply-advanced"></button>
      <button id="cancel-advanced"></button>
    </div>`;
}

describe('Tech Panel modal rendering', () => {
  beforeEach(() => {
    setupDom();
  });

  it('renders palette swatches (snapshot)', () => {
    const app = {
      generatorSpec: {
        ...techSpec,
        lockableRules: ['primaryColorPalette']
      },
      LockState: {},
      Locked: {},
      engine: { lockedValues: {} }
    };
    buildModal(app);
    const bodyHTML = document.getElementById('advanced-modal-body').innerHTML;
    expect(bodyHTML).toMatchSnapshot();

    // Trigger a change to ensure swatches render
    const sel = document.getElementById('adv-primaryColorPalette');
    sel.value = 'Military Greens, Browns & Khaki';
    sel.dispatchEvent(new Event('change'));

    const swWrap = document.querySelector('.palette-swatch-wrap');
    expect(swWrap).not.toBeNull();
    
  });

  it('falls back to text when palette mapping missing', () => {
    const app = {
      generatorSpec: {
        ...techSpec,
        lockableRules: ['primaryColorPalette']
      },
      LockState: {},
      Locked: {},
      engine: { lockedValues: {} }
    };
    buildModal(app);
    const sel = document.getElementById('adv-primaryColorPalette');
    // Add a fake option & select it
    const o = document.createElement('option');
    o.value = 'Unknown Palette';
    o.textContent = 'Unknown Palette';
    sel.appendChild(o);
    sel.value = 'Unknown Palette';
    sel.dispatchEvent(new Event('change'));

    const wrap = document.querySelector('.palette-swatch-wrap');
    expect(wrap.textContent).toBe('Unknown Palette');
  });
});
