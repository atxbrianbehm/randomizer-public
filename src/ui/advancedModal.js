// Modular helpers for the Advanced Settings modal
// All functions operate on the provided `app` instance so that no global
// state is leaked. This makes them testable and keeps RandomizerApp slim.

function extractVals(rule) {
  if (!rule) return [];
  if (Array.isArray(rule)) {
    return rule.map(v => (typeof v === 'string' ? v : v.text)).filter(Boolean);
  }
  return [];
}

export function showModal(app) {
  syncModal(app);
  document.getElementById('advanced-modal').style.display = 'block';
}

export function hideModal() {
  document.getElementById('advanced-modal').style.display = 'none';
}

export function applyModal(app) {
  app.engine.lockedValues = app.engine.lockedValues || {};
  ['preacher_name', 'divine_title', 'platforms', 'mediaContexts'].forEach(cat => {
    const sel = document.getElementById(
      'adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_', '-'))
    );
    if (app.LockState[cat]) {
      app.engine.lockedValues[cat] = sel.value;
    } else {
      delete app.engine.lockedValues[cat];
    }
  });
  hideModal();
  app.updateVariablesDisplay();
}

export function syncModal(app) {
  const generatorName = app.engine.currentGenerator;
  if (!generatorName) return;
  const generator = app.engine.loadedGenerators.get(generatorName);
  if (!generator) return;
  const grammar = generator.grammar || {};
  const fillSelect = (id, arr, lockedVal) => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    arr.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      if (lockedVal === val) opt.selected = true;
      sel.appendChild(opt);
    });
  };
  fillSelect('adv-preacher-name', extractVals(grammar.preacher_name), app.Locked.preacher_name);
  fillSelect('adv-divine-title', extractVals(grammar.divine_title), app.Locked.divine_title);
  fillSelect('adv-platforms', extractVals(grammar.platforms), app.Locked.platforms);
  fillSelect('adv-media-contexts', extractVals(grammar.mediaContexts), app.Locked.mediaContexts);

  const mapIdToField = {
    'adv-preacher-name': 'preacher_name',
    'adv-divine-title': 'divine_title',
    'adv-platforms': 'platforms',
    'adv-media-contexts': 'mediaContexts'
  };
  Object.entries(mapIdToField).forEach(([id, fieldName]) => {
    const select = document.getElementById(id);
    select.onchange = () => {
      const selectedValue = select.value;
      if (selectedValue) {
        app.Locked[fieldName] = selectedValue;
        app.LockState[fieldName] = true;
        const lockBtn = document.getElementById('lock-' + fieldName);
        lockBtn.textContent = '🔒';
        lockBtn.className = 'lock-toggle locked';
      }
    };
  });

  ['preacher_name', 'divine_title', 'platforms', 'mediaContexts'].forEach(cat => {
    const btn = document.getElementById('lock-' + cat);
    btn.textContent = app.LockState[cat] ? '🔒' : '🔓';
    btn.className = 'lock-toggle' + (app.LockState[cat] ? ' locked' : '');
    btn.onclick = () => {
      app.LockState[cat] = !app.LockState[cat];
      syncModal(app);
    };
    const sel = document.getElementById(
      'adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_', '-'))
    );
    sel.disabled = !app.LockState[cat];
  });
}

export function setupModal(app) {
  const applyBtn = document.getElementById('apply-advanced');
  if (applyBtn) applyBtn.onclick = () => applyModal(app);
  const cancelBtn = document.getElementById('cancel-advanced');
  if (cancelBtn) cancelBtn.onclick = hideModal;
  const closeModal = document.querySelector('.close-modal');
  if (closeModal) closeModal.onclick = hideModal;
  const modal = document.getElementById('advanced-modal');
  if (modal) modal.style.display = 'none';
}
