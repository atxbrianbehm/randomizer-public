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
  injectAdvStyles();
  // Ensure generatorSpec present
  if (!app?.generatorSpec) return;

  const { grammar, lockableRules, name } = app.generatorSpec;
  // Refresh lockableRules in case spec updated
  app.lockableRules = lockableRules;



  const modalBody = document.getElementById('advanced-modal-body');
  if (!modalBody) return; // Modal not present
  modalBody.innerHTML = '';

  // Header
  const h = document.createElement('h3');
  h.textContent = name;
  modalBody.appendChild(h);

    // Exclude composite sermon placeholder rules
  const meaningful = lockableRules.filter(r => !/stage_\d+_sermon$/.test(r));

  // Build mapping by inspecting stage_X_sermon templates
  const stageVars = {};
  for (let s = 1; s <= 5; s++) {
    const key = `stage_${s}_sermon`;
    const arr = grammar[key];
    if (!Array.isArray(arr)) continue;
    const set = new Set();
    arr.forEach(t => {
      if (typeof t === 'string') {
        const matches = t.match(/#(.*?)#/g) || [];
        matches.forEach(m => set.add(m.replace(/#/g, '')));
      }
    });
    stageVars[`Stage ${s}`] = set;
  }

  const groups = {};
  meaningful.forEach(ruleKey => {
    let foundStage = 'General';
    for (const [stageName, set] of Object.entries(stageVars)) {
      if (set.has(ruleKey)) { foundStage = stageName; break; }
    }
    groups[foundStage] = groups[foundStage] || [];
    groups[foundStage].push(ruleKey);
  });


  const ordered = Object.keys(groups).sort((a, b) => {
    const na = /^Stage (\d+)/.exec(a)?.[1];
    const nb = /^Stage (\d+)/.exec(b)?.[1];
    if (na && nb) return parseInt(na) - parseInt(nb);
    if (na) return 1; // General first
    if (nb) return -1;
    return a.localeCompare(b);
  });

  ordered.forEach(groupName => {
    // Wrapper box for stage group
    const stageBox = document.createElement('div');
    stageBox.className = 'stage-box';
    stageBox.style.border = '1px solid var(--color-border)';
    stageBox.style.borderRadius = '12px';
    stageBox.style.padding = '1rem';
    stageBox.style.marginBottom = '2rem';
    // Group header
    const gh = document.createElement('h4');
    gh.textContent = groupName;
    gh.style.margin = '1rem 0 0.4rem';
    modalBody.appendChild(gh);
    modalBody.appendChild(stageBox);

    // Grid container (2 columns)
    const gridWrap = document.createElement('div');
    gridWrap.style.display = 'grid';
    gridWrap.style.gridTemplateColumns = '1fr 1fr';
    gridWrap.style.columnGap = '1.5rem';
    gridWrap.style.rowGap = '0.75rem';
    stageBox.appendChild(gridWrap);

    groups[groupName].forEach(ruleKey => {
    const ruleArr = grammar[ruleKey] || [];
    // Skip if no options
    if (!Array.isArray(ruleArr) || ruleArr.length === 0) return;
    // Extract user-facing options (skip _meta objects)
    const options = ruleArr.filter(it => typeof it === 'string' || (typeof it === 'object' && (it.value || it.text))).map(it => typeof it === 'string' ? it : (it.label || it.value || it.text));

    const label = document.createElement('label');
    label.textContent = `${ruleKey}:`;
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
    select.disabled = false;
    select.onchange = () => {
      app.LockState[ruleKey] = true;
      app.Locked[ruleKey] = select.value;
      app.engine.lockedValues = app.engine.lockedValues || {};
      app.engine.lockedValues[ruleKey] = select.value;
      lockBtn.classList.add('locked');
      lockBtn.textContent = '🔒';
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
  });

  return; // skip legacy builder below until fully removed

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

