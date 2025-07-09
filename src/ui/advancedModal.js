// Dynamic Advanced Options Modal helpers
import { q } from '@/ui/query.js';
import paletteColors from '../../generators/techPanel_generator/palette_colors.json';
// Build UI controls based on app.lockableRules determined by RandomizerEngine.
// This replaces the previous hard-coded implementation.

// --- Utility helpers -------------------------------------------------------
let __advStylesInjected = false;
function injectAdvStyles() {
  if (typeof document === 'undefined' || __advStylesInjected) return;
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .lock-button { background:none;border:none;font-size:1rem;cursor:pointer;color: var(--color-accent);vertical-align:middle;margin-left:4px; }
    .lock-button.locked { color: var(--color-accent2); }
    .modal-content { width: 96%; max-width: 760px; max-height: 80vh; overflow-y: auto; }
    #advanced-modal-body { max-height: none; overflow: visible; }
    
    /* stage box */
    .stage-box { background: var(--color-bg2); }
    /* modal scrollbar */
    .modal-content::-webkit-scrollbar { width: 10px; }
    .modal-content::-webkit-scrollbar-track { background: var(--color-secondary); }
    .modal-content::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 5px; }
    .modal-content::-webkit-scrollbar-thumb:hover { background: var(--color-primary-hover); }
    @supports (scrollbar-width: thin) {
      .palette-swatch-wrap { display:inline-flex; align-items:center; gap:2px; margin-left:6px; }
      .palette-swatch { width:14px; height:14px; border:1px solid #666; }
      .modal-content { scrollbar-width: thin; scrollbar-color: var(--color-primary) var(--color-secondary); }
    }
  `;
  if (document && document.head) {
    document.head.appendChild(styleTag);
  }
  __advStylesInjected = true;
}
export function humanLabel(key, generator) {
  // 1) explicit override via _meta.uiLabel
  const meta = generator?.grammar?.[key]?._meta;
  if (meta && meta.uiLabel) return meta.uiLabel;
  // 2) auto format camelCase → "Camel Case"
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

export function extractValues(rule) {
  if (!Array.isArray(rule)) return [];
  return rule.map(v => {
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v !== null) return v.value !== undefined ? v.value : v.text;
    return undefined;
  }).filter(val => val !== undefined);
}

export function createLockBtn(key, app) {
  if (typeof document === 'undefined') return null;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lock-button' + (app.LockState[key] ? ' locked' : '');
  btn.setAttribute('aria-label', (app.LockState[key] ? 'Unlock ' : 'Lock ') + key);
  btn.setAttribute('title', (app.LockState[key] ? 'Unlock ' : 'Lock ') + key);
  btn.textContent = app.LockState[key] ? '🔒' : '🔓';
  btn.onclick = () => {
    const newState = !app.LockState[key];
    app.LockState[key] = newState;
    const sel = q(`#adv-${key}`);
    if (newState) {
      // capture current selection as locked value
      if (sel) {
        app.Locked[key] = sel.value;
        app.engine.lockedValues = app.engine.lockedValues || {};
        app.engine.lockedValues[key] = sel.value;
      }
    } else {
      // unlocking -> clear
      delete app.Locked[key];
      delete app.engine.lockedValues[key];
    }
    // Re-render to update disabled state
    buildModal(app);
  };
  return btn;
}

// --- Main builders ---------------------------------------------------------
export function buildModal(app) {
  if (typeof document === 'undefined') return;
  injectAdvStyles();
  // Ensure generatorSpec present
  if (!app?.generatorSpec) return;

  const { grammar, lockableRules, name } = app.generatorSpec;

  const modalBody = q('#advanced-modal-body');
  if (!modalBody) return; // Modal not present
  modalBody.innerHTML = '';

  // Header
  const h = document.createElement('h3');
  h.textContent = name;
  modalBody.appendChild(h);

  const gridWrap = document.createElement('div');
  gridWrap.style.display = 'grid';
  gridWrap.style.gridTemplateColumns = 'minmax(0,1fr) minmax(0,1fr)';
  gridWrap.style.columnGap = '1.5rem';
  gridWrap.style.rowGap = '0.75rem';
  modalBody.appendChild(gridWrap);

  let currentStage = null;
  let stageGrid = null; // scoped outside loop so subsequent rules can access
  lockableRules.forEach(ruleKey => {
    // Detect Stage grouping by prefix e.g. Stage_1_, Stage_2_
    const stageMatch = ruleKey.match(/^Stage_(\d+)_/i);
    const stageName = stageMatch ? `Stage ${stageMatch[1]}` : null;
    if (stageName && stageName !== currentStage) {
      // Start a new stage-box section
      currentStage = stageName;
      const stageBox = document.createElement('div');
      stageBox.className = 'stage-box';
      stageBox.style.gridColumn = '1 / -1';
      const stageHeader = document.createElement('h4');
      stageHeader.textContent = stageName;
      stageHeader.style.margin = '0 0 0.5rem 0';
      stageBox.appendChild(stageHeader);
      gridWrap.appendChild(stageBox);
      // Inner container for controls
      stageGrid = document.createElement('div');
      stageGrid.style.display = 'grid';
      stageGrid.style.gridTemplateColumns = 'minmax(0,1fr) minmax(0,1fr)';
      stageGrid.style.columnGap = '1rem';
      stageGrid.style.rowGap = '0.5rem';
      stageBox.appendChild(stageGrid);
    }
    // Skip the grouping key itself e.g. Stage_1_sermon – we don't need a dropdown for entire sermon
    if (stageMatch && /_sermon$/i.test(ruleKey)) return;

    // Determine the container: if currently inside a stage section use its inner grid, otherwise the root gridWrap
    const container = currentStage ? stageGrid : gridWrap;
    // Support both direct array rules (Tech Panel style) and object-wrapped rules (Opera style)
    let ruleArr = grammar[ruleKey];
    if (Array.isArray(ruleArr)) {
      // ok
    } else if (ruleArr && typeof ruleArr === 'object') {
      // find first property that is an array (e.g., { ages: [...] })
      const firstArr = Object.values(ruleArr).find(v => Array.isArray(v));
      ruleArr = firstArr || [];
    } else {
      ruleArr = [];
    }
    // Skip if still not an array or empty
    if (!Array.isArray(ruleArr) || ruleArr.length === 0) return;
    // Extract user-facing options (skip _meta objects)
    const options = ruleArr.filter(it => typeof it === 'string' || (typeof it === 'object' && (it.value || it.text))).map(it => typeof it === 'string' ? it : (it.label || it.value || it.text));

    const label = document.createElement('label');
    label.textContent = humanLabel(ruleKey, app.generatorSpec) + ':';
    label.className = 'adv-label';
    const lockBtn = createLockBtn(ruleKey, app);
    lockBtn.style.marginLeft = '6px';
    label.appendChild(lockBtn);

    const field = document.createElement('div');
    field.className = 'advanced-row';
    field.appendChild(label);

    const select = document.createElement('select');
    const isMulti = Array.isArray(app.generatorSpec.uiConfig?.multiSelect) && app.generatorSpec.uiConfig.multiSelect.includes(ruleKey);
    if (isMulti) {
      select.multiple = true;
      select.size = Math.min(options.length, 6);
    }
    select.id = `adv-${ruleKey}`;
    select.name = ruleKey;
    // always enabled; on change auto-lock
    // Disable the select when the rule is already locked, otherwise keep it interactive
    select.disabled = app.LockState[ruleKey];
    select.onchange = () => {
      const value = isMulti ? Array.from(select.selectedOptions).map(o => o.value).join(', ') : select.value;
      app.LockState[ruleKey] = true;
      app.Locked[ruleKey] = value;
      app.engine.lockedValues = app.engine.lockedValues || {};
      app.engine.lockedValues[ruleKey] = value;
      lockBtn.classList.add('locked');
      lockBtn.textContent = '🔒';
      lockBtn.setAttribute('aria-label', 'Unlock ' + ruleKey);
      lockBtn.setAttribute('title', 'Unlock ' + ruleKey);
    }
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });
    if (app.Locked[ruleKey]) {
      if (isMulti) {
        const vals = Array.isArray(app.Locked[ruleKey]) ? app.Locked[ruleKey] : app.Locked[ruleKey].split(/,\s*/);
        Array.from(select.options).forEach(optEl => { optEl.selected = vals.includes(optEl.value); });
      } else {
        select.value = app.Locked[ruleKey];
      }
    }
    field.appendChild(select);
    // If this is the primaryColorPalette, add live color swatches
    if (ruleKey === 'primaryColorPalette') {
      const wrap = document.createElement('span');
      wrap.className = 'palette-swatch-wrap';
      const render = () => {
        wrap.innerHTML = '';
        const selectedLabel = select.options[select.selectedIndex]?.textContent;
        const hexes = paletteColors[select.value] || paletteColors[selectedLabel] || [];
        if (hexes.length === 0) { wrap.textContent = select.value; return; }
        hexes.forEach(hex => {
          const box = document.createElement('span');
          box.className = 'palette-swatch';
          box.style.background = hex;
          wrap.appendChild(box);
        });
      };
      render();
      select.addEventListener('change', render);
      field.appendChild(wrap);
    }
    container.appendChild(field);
  });
}

export function showModal(app) {
  if (typeof document === 'undefined') return;
  const modal = q('#advanced-modal');
  try {
    buildModal(app);
  } catch (err) {
    console.error('[advancedModal] build failed', err);
    const body = q('#advanced-modal-body');
    if (body) {
      body.innerHTML = '<p style="color:var(--color-error)">Advanced options failed to load.</p>';
    }
  }
  if (!modal) return;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.tabIndex = -1;
  modal.style.display = 'block';

  // Basic focus trap within modal
  const focusable = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled);
  const firstEl = focusable[0];
  const lastEl = focusable[focusable.length - 1];
  function handleTrap(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    } else if (e.key === 'Escape') {
      hideModal();
    }
  }
  modal.addEventListener('keydown', handleTrap);
  modal.__trapHandler = handleTrap;
  setTimeout(() => firstEl?.focus(), 0);
}

export function hideModal() {
  if (typeof document === 'undefined') return;
  const modal = q('#advanced-modal');
  if (!modal) return;
  modal.style.display = 'none';
  if (modal.__trapHandler) {
    modal.removeEventListener('keydown', modal.__trapHandler);
    delete modal.__trapHandler;
  }
  
}

export function applyModal(app) {
  if (typeof document === 'undefined') return;
  app.engine.lockedValues = app.engine.lockedValues || {};
  app.lockableRules.forEach(key => {
    if (app.LockState[key]) {
      const sel = q(`#adv-${key}`);
      if (sel) {
        app.engine.lockedValues[key] = sel.value;
        app.Locked[key] = sel.value;
        if (key === 'pick_gender') {
          // Update engine variable so pronouns match locked gender
          const g = sel.value.includes('man') ? 'male' : 'female';
          app.engine.variables.set?.(`${app.engine.currentGenerator || app.currentGenerator}.gender`, g);
        }
      }
    } else {
      delete app.engine.lockedValues[key];
      delete app.Locked[key];
    }
  });
  hideModal();
  app.updateVariablesDisplay?.();
  app.persistState?.();
}

export function setupModal(app) {
  if (typeof document === 'undefined') return;
  const applyBtn = q('#apply-advanced');
  if (applyBtn) applyBtn.onclick = () => applyModal(app);
  const cancelBtn = q('#cancel-advanced');
  if (cancelBtn) cancelBtn.onclick = hideModal;
  const closeModal = document.querySelector('#advanced-modal .close-modal');
  if (closeModal) closeModal.onclick = hideModal;
  const modal = q('#advanced-modal');
  if (modal) modal.style.display = 'none';
}
