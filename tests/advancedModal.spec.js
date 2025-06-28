import { describe, it, expect, beforeEach } from 'vitest';
import { humanLabel, extractValues, isMultiSelect, buildModal } from '@/ui/advancedModal.js';

function createMockApp() {
  // Minimal mock matching fields referenced in advancedModal.js
  return {
    LockState: {},
    Locked: {},
    engine: {},
    generatorSpec: {
      name: 'mock',
      grammar: {
        // simple rules used by buildModal
        color: ['red', 'green', 'blue'],
        size: [{ value: 'small', label: 'Small' }, { value: 'big', label: 'Big' }],
      },
      lockableRules: ['color', 'size'],
      uiConfig: {}
    }
  };
}

describe('advancedModal helpers', () => {
  it('humanLabel converts camelCase', () => {
    expect(humanLabel('someKeyName')).toBe('Some Key Name');
  });

  it('extractValues pulls string & object values', () => {
    const arr = ['a', { value: 'b', label: 'Bee' }, { text: 'c' }];
    expect(extractValues(arr)).toEqual(['a', 'b', 'c']);
  });

  
});

describe('advancedModal buildModal integration', () => {
  let body;
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = '<div id="advanced-modal-body"></div>';
    body = document.getElementById('advanced-modal-body');
  });

  it('renders lock buttons with aria labels', () => {
    const app = createMockApp();
    buildModal(app);
    const lockBtns = body.querySelectorAll('.lock-button');
    expect(lockBtns.length).toBeGreaterThan(0);
    lockBtns.forEach(btn => {
      expect(btn.getAttribute('aria-label')).toMatch(/Lock/);
    });
  });
});
