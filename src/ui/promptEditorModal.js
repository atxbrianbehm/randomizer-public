/**
 * PromptEditorModal
 * Lightweight, dependency-free modal that lets the user:
 *  • Re-order prompt segments via drag-and-drop (mouse or keyboard)
 *  • Mute / un-mute individual segments
 *  • Live-preview the resulting string
 *
 * The modal operates on an array of segments:
 *   [{ key: 'panelArchetype', text: 'Cockpit Surface' }, ... ]
 *
 * Consumer supplies:
 *   openPromptEditor({ segments, rawText, onSave })
 */

const modalId = 'prompt-editor-modal';
let dragSrcEl = null;

function ensureModalExists() {
    if (document.getElementById(modalId)) return; // already built

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
      <div class="pem-backdrop"></div>
      <div class="pem-dialog" role="dialog" aria-modal="true" aria-labelledby="pem-title">
        <h2 id="pem-title">Edit Prompt</h2>
        <p class="pem-preview" id="pem-preview"></p>
        <ul class="pem-token-list" id="pem-token-list"></ul>
        <div class="pem-actions">
          <button id="pem-reset">Reset</button>
          <span style="flex:1"></span>
          <button id="pem-cancel">Cancel</button>
          <button id="pem-save" class="primary">Save</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    // Simple styles (scoped)
    const style = document.createElement('style');
    style.textContent = `
      #${modalId} {position:fixed;inset:0;display:none;align-items:center;justify-content:center;font-family:sans-serif;z-index:9999}
      #${modalId}.open {display:flex}
      #${modalId} .pem-backdrop {position:absolute;inset:0;background:rgba(0,0,0,.5)}
      #${modalId} .pem-dialog {position:relative;background:#1e1e1e;color:#eee;padding:1.25rem 1.5rem;border-radius:8px;max-width:600px;width:90%;max-height:90%;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:.75rem}
      #${modalId} .pem-preview {font-style:italic;background:#2a2a2a;padding:.5rem;border-radius:4px;min-height:2rem}
      #${modalId} .pem-token-list {list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.5rem}
      #${modalId} .pem-token {display:inline-flex;align-items:center;white-space:nowrap;background:#3a3a3a;color:#eee;padding:.25rem .5rem;border-radius:4px;cursor:grab;user-select:none;border:1px solid #555;font-size:0.85rem}
      #${modalId} .pem-token[aria-grabbed="true"] {opacity:.5}
      #${modalId} .pem-token.muted {text-decoration:line-through;opacity:.4}
      #${modalId} .pem-token button {margin-left:.4rem;background:none;border:none;cursor:pointer;font-size:1rem;color:#bbb}
      #${modalId} .pem-actions {display:flex;gap:.5rem;align-items:center;margin-top:.5rem}
      #${modalId} button.primary {background:#0b5ed7;color:#fff;border:none;padding:.4rem .75rem;border-radius:4px}
      .edit-btn.tooltip:hover::after {content:attr(data-tip);position:absolute;top:-1.6rem;right:0;background:#000;color:#fff;padding:2px 6px;border-radius:4px;font-size:.75rem;white-space:nowrap}
    `;
    document.head.appendChild(style);
}

function renderTokens(listEl, segments) {
    listEl.innerHTML = '';
    segments.forEach((seg, idx) => {
        const li = document.createElement('li');
        li.className = 'pem-token' + (seg.muted ? ' muted' : '');
        li.draggable = true;
        li.setAttribute('data-index', idx);
        li.setAttribute('aria-grabbed', 'false');
        li.innerHTML = `<span class="text">${seg.text}</span><button aria-label="Mute toggle">${seg.muted ? '🔈' : '🔇'}</button>`;
        listEl.appendChild(li);
    });
}

function computePreview(segments) {
    return segments.filter(s => !s.muted).map(s => s.text).join(' ');
}

function attachDnD(listEl, segments, previewEl) {
    // Remove any previous listeners by cloning listEl (avoids stacking)
    const cleanList = listEl.cloneNode(false);
    listEl.parentNode.replaceChild(cleanList, listEl);
    listEl = cleanList;
    listEl.addEventListener('dragstart', (e) => {
        const li = e.target.closest('.pem-token');
        dragSrcEl = li;
        li.setAttribute('aria-grabbed', 'true');
        e.dataTransfer.effectAllowed = 'move';
    });

    listEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        const li = e.target.closest('.pem-token');
        if (!li || li === dragSrcEl) return;
        const srcIdx = Number(dragSrcEl.dataset.index);
        const tgtIdx = Number(li.dataset.index);
        if (srcIdx !== tgtIdx) {
            segments.splice(tgtIdx, 0, segments.splice(srcIdx, 1)[0]);
            renderTokens(listEl, segments);
            attachDnD(listEl, segments, previewEl); // rebind indexes
            previewEl.textContent = computePreview(segments);
        }
    });

    listEl.addEventListener('dragend', () => {
        const li = dragSrcEl;
        if (li) li.setAttribute('aria-grabbed', 'false');
        dragSrcEl = null;
    });
}

export function openPromptEditor({ segments, rawText, onSave }) {
    ensureModalExists();
    const modal = document.getElementById(modalId);
    const previewEl = modal.querySelector('#pem-preview');
    const listEl = modal.querySelector('#pem-token-list');

    // Deep copy to avoid mutating caller
    const working = segments.map(s => ({ ...s, muted: false }));

    renderTokens(listEl, working);
    previewEl.textContent = computePreview(working);
    attachDnD(listEl, working, previewEl);

    // Click mute toggle & update preview
    listEl.onclick = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const li = btn.closest('.pem-token');
        const idx = Number(li.dataset.index);
        working[idx].muted = !working[idx].muted;
        renderTokens(listEl, working);
        attachDnD(listEl, working, previewEl);
        previewEl.textContent = computePreview(working);
    };

    // Reset
    modal.querySelector('#pem-reset').onclick = () => {
        working.forEach(w => { w.muted = false; });
        renderTokens(listEl, working);
        attachDnD(listEl, working, previewEl);
        previewEl.textContent = computePreview(working);
    };

    // Cancel
    modal.querySelector('#pem-cancel').onclick = close;

    // Save
    modal.querySelector('#pem-save').onclick = () => {
        const newText = computePreview(working);
        onSave(newText);
        close();
    };

    function close() {
        modal.classList.remove('open');
    }

    // Show modal
    modal.classList.add('open');
    modal.querySelector('.pem-dialog').focus();
}
