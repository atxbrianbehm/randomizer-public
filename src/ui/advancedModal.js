// Dynamic Advanced Options Modal helpers
// Build UI controls based on app.lockableRules determined by RandomizerEngine.
// This replaces the previous hard-coded implementation.

// --- Utility helpers -------------------------------------------------------
function humanLabel(key, generator) {
  // 1) explicit override via _meta.uiLabel
  const meta = generator?.grammar?.[key]?._meta;
  if (meta && meta.uiLabel) return meta.uiLabel;
  // 2) auto format camelCase → "Camel Case"
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

function extractValues(rule) {
  if (!Array.isArray(rule)) return [];
  return rule.map(v => (typeof v === 'string' ? v : v.value || v.text)).filter(Boolean);
}

function isMultiSelect(key, generator) {
  const uiCfg = generator.uiConfig || {};
  const multi = uiCfg.multiSelect || ['keyMaterials', 'screenType', 'dominantControls'];
  return multi.includes(key);
}

function createLockBtn(key, app) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lock-button' + (app.LockState[key] ? ' locked' : '');
  btn.textContent = app.LockState[key] ? '🔒' : '🔓';
  btn.onclick = () => {
    app.LockState[key] = !app.LockState[key];
    // When unlocking, also clear stored value
    if (!app.LockState[key]) {
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
  const modalBody = document.getElementById('advanced-modal-body');
  if (!modalBody) return; // Modal not present
  modalBody.innerHTML = '';

  const generator = app.engine.loadedGenerators.get(app.engine.currentGenerator);
  if (!generator) return;

  app.lockableRules.forEach(key => {
    const rule = generator.grammar[key];
    const values = extractValues(rule);
    if (values.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'adv-field my-3';

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-slate-300 mb-1 flex-label';
    label.textContent = humanLabel(key, generator) + ':';

    // lock toggle
    const lockBtn = createLockBtn(key, app);
    label.appendChild(lockBtn);
    wrapper.appendChild(label);

    if (isMultiSelect(key, generator)) {
      // Checkbox grid
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-2 sm:grid-cols-3 gap-2';
      values.forEach(val => {
        const cbLbl = document.createElement('label');
        cbLbl.className = 'flex items-center space-x-2 p-2 bg-slate-600 rounded-md hover:bg-slate-500 cursor-pointer';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.name = key;
        cb.value = val;
        cb.checked = Array.isArray(app.Locked[key]) ? app.Locked[key].includes(val) : false;
        cb.disabled = !app.LockState[key];
        cbLbl.appendChild(cb);
        const span = document.createElement('span');
        span.textContent = val;
        cbLbl.appendChild(span);
        grid.appendChild(cbLbl);
      });
      wrapper.appendChild(grid);
    } else {
      // Single-select dropdown
      const sel = document.createElement('select');
      sel.id = `adv-${key}`;
      sel.className = 'w-full p-3 bg-slate-700 border border-slate-600 rounded-lg';
      values.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        if (app.Locked[key] === val) opt.selected = true;
        sel.appendChild(opt);
      });
      if (app.Locked[key]) sel.value = app.Locked[key];
      sel.disabled = !app.LockState[key];
      wrapper.appendChild(sel);
    }

    modalBody.appendChild(wrapper);
  });
}

export function showModal(app) {
  buildModal(app);
  document.getElementById('advanced-modal').style.display = 'block';
}

export function hideModal() {
  document.getElementById('advanced-modal').style.display = 'none';
}

export function applyModal(app) {
  app.engine.lockedValues = app.engine.lockedValues || {};
  app.lockableRules.forEach(key => {
    if (app.LockState[key]) {
      if (isMultiSelect(key, app.engine.loadedGenerators.get(app.engine.currentGenerator))) {
        // gather checked boxes
        const checked = Array.from(document.querySelectorAll(`input[name="${key}"]:checked`)).map(cb => cb.value);
        if (checked.length) {
          app.engine.lockedValues[key] = checked;
          app.Locked[key] = checked;
        }
      } else {
        const sel = document.getElementById(`adv-${key}`);
        if (sel) {
          app.engine.lockedValues[key] = sel.value;
          app.Locked[key] = sel.value;
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
  const applyBtn = document.getElementById('apply-advanced');
  if (applyBtn) applyBtn.onclick = () => applyModal(app);
  const cancelBtn = document.getElementById('cancel-advanced');
  if (cancelBtn) cancelBtn.onclick = hideModal;
  const closeModal = document.querySelector('#advanced-modal .close-modal');
  if (closeModal) closeModal.onclick = hideModal;
  const modal = document.getElementById('advanced-modal');
  if (modal) modal.style.display = 'none';
}

