// Dynamic Advanced Options Modal helpers
// Build UI controls based on app.lockableRules determined by RandomizerEngine.
// This replaces the previous hard-coded implementation.

// --- Utility helpers -------------------------------------------------------
let __advStylesInjected = false;
function injectAdvStyles() {
  if (__advStylesInjected) return;
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
    .modal-content::-webkit-scrollbar-track { background: var(--color-bg2); }
    .modal-content::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 5px; }
    @supports (scrollbar-width: thin) {
      .modal-content { scrollbar-width: thin; scrollbar-color: var(--color-border) var(--color-bg2); }
    }
  `;
  document.head.appendChild(styleTag);
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
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lock-button' + (app.LockState[key] ? ' locked' : '');
  btn.setAttribute('aria-label', (app.LockState[key] ? 'Unlock ' : 'Lock ') + key);
  btn.setAttribute('title', (app.LockState[key] ? 'Unlock ' : 'Lock ') + key);
  btn.textContent = app.LockState[key] ? '🔒' : '🔓';
  btn.onclick = () => {
    const newState = !app.LockState[key];
    app.LockState[key] = newState;
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
  injectAdvStyles();
  // Ensure generatorSpec present
  if (!app?.generatorSpec) return;

  const { grammar, lockableRules, name } = app.generatorSpec;

  const modalBody = document.getElementById('advanced-modal-body');
  if (!modalBody) return; // Modal not present
  modalBody.innerHTML = '';

  // Header
  const h = document.createElement('h3');
  h.textContent = name;
  modalBody.appendChild(h);

  const gridWrap = document.createElement('div');
  gridWrap.style.display = 'grid';
  gridWrap.style.gridTemplateColumns = '1fr 1fr';
  gridWrap.style.columnGap = '1.5rem';
  gridWrap.style.rowGap = '0.75rem';
  modalBody.appendChild(gridWrap);

  lockableRules.forEach(ruleKey => {
    const ruleArr = grammar[ruleKey] || [];
    // Skip if no options
    if (!Array.isArray(ruleArr) || ruleArr.length === 0) return;
    // Extract user-facing options (skip _meta objects)
    const options = ruleArr.filter(it => typeof it === 'string' || (typeof it === 'object' && (it.value || it.text))).map(it => typeof it === 'string' ? it : (it.label || it.value || it.text));

    const label = document.createElement('label');
    label.textContent = humanLabel(ruleKey, app.generatorSpec) + ':';
    label.className = 'adv-label';
    // add lock toggle
    const lockBtn = createLockBtn(ruleKey, app);
    lockBtn.style.marginLeft = '6px';
    label.appendChild(lockBtn);

    const field = document.createElement('div');
    field.style.display = 'flex';
    field.style.flexDirection = 'column';
    field.appendChild(label);

    const select = document.createElement('select');
    select.id = `adv-${ruleKey}`;
    select.name = ruleKey;
    // always enabled; on change auto-lock
    select.disabled = !app.LockState[ruleKey]; // Set disabled state based on LockState
    select.onchange = () => {
      app.LockState[ruleKey] = true;
      app.Locked[ruleKey] = select.value;
      app.engine.lockedValues = app.engine.lockedValues || {};
      app.engine.lockedValues[ruleKey] = select.value;
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
    if (app.Locked[ruleKey]) select.value = app.Locked[ruleKey];
    field.appendChild(select);
    gridWrap.appendChild(field);
  });
}

export function showModal(app) {
  const modal = document.getElementById('advanced-modal');
  buildModal(app);
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
  const modal = document.getElementById('advanced-modal');
  if (!modal) return;
  modal.style.display = 'none';
  if (modal.__trapHandler) {
    modal.removeEventListener('keydown', modal.__trapHandler);
    delete modal.__trapHandler;
  }
  
}

export function applyModal(app) {
  app.engine.lockedValues = app.engine.lockedValues || {};
  app.lockableRules.forEach(key => {
    if (app.LockState[key]) {
      const sel = document.getElementById(`adv-${key}`);
      if (sel) {
        app.engine.lockedValues[key] = sel.value;
        app.Locked[key] = sel.value;
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