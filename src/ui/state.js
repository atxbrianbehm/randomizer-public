// State & UI helper functions extracted from main.js
import { LOCKABLE_FIELDS } from '@/constants.js';
import { q } from '@/ui/query.js';

export function updateEntryPoints(app) {
    const select = q('#entry-point');
    select.innerHTML = '<option value="default">Default</option>';

    if (app.currentGeneratorId) {
        const generatorName = app.engine.currentGenerator;
        if (!generatorName) return;

        const generator = app.engine.loadedGenerators.get(generatorName);
        if (!generator || !generator.entry_points) return;

        const entryPoints = generator.entry_points;

        if (entryPoints.alternatives) {
            entryPoints.alternatives.forEach(point => {
                const option = document.createElement('option');
                option.value = point;
                option.textContent = point.charAt(0).toUpperCase() + point.slice(1).replace('_', ' ');
                select.appendChild(option);
            });
        }
    }
}

export function updateVariablesDisplay(app) {
    // Also update advanced modal if open
    const advModal = q('#advanced-modal');
    if (advModal && advModal.style.display !== 'none') {
        app.syncAdvancedModal();
    }

    const container = q('#variables-table');

    if (!app.currentGeneratorId) {
        container.innerHTML = '<p class="text-secondary">Select a generator to view variables</p>';
        return;
    }

    const generatorName = app.engine.currentGenerator;
    if (!generatorName) {
        container.innerHTML = '<p class="text-secondary">No generator selected</p>';
        return;
    }

    const generator = app.engine.loadedGenerators.get(generatorName);
    if (!generator) {
        container.innerHTML = '<p class="text-secondary">Generator not found</p>';
        return;
    }

    const variables = app.engine.getCurrentVariables();
    const variableConfigs = generator.variables || {};
    const lockable = LOCKABLE_FIELDS;
    app.engine.lockedValues = app.engine.lockedValues || {};

    if (Object.keys(variables).length === 0) {
        container.innerHTML = '<p class="text-secondary">No variables in this generator</p>';
        return;
    }

    let html = `
        <table class="variables-table">
            <thead>
                <tr>
                    <th>Variable</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Lock</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [name, value] of Object.entries(variables)) {
        const config = variableConfigs[name] || {};
        const isLockable = lockable.includes(name);
        const locked = app.engine.lockedValues[name] !== undefined;
        html += `
            <tr>
                <td class="variable-name">${name}</td>
                <td class="variable-type">${config.type || 'unknown'}</td>
                <td class="variable-value">${locked ? app.engine.lockedValues[name] : value}</td>
                <td>${config.description || 'No description'}</td>
                <td>${isLockable ? `<button class="lock-btn" data-var="${name}">${locked ? '🔒' : '🔓'}</button>` : ''}</td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach lock button listeners
    container.querySelectorAll('.lock-btn').forEach(btn => {
        btn.onclick = () => {
            const varName = btn.getAttribute('data-var');
            if (app.engine.lockedValues[varName] !== undefined) {
                delete app.engine.lockedValues[varName];
            } else {
                app.engine.lockedValues[varName] = variables[varName];
            }
            updateVariablesDisplay(app);
            app.persistState?.();
        };
    });
}

export function updateGeneratorDropdown(app) {
    const select = q('#generator-select');
    if (!select) return;
    select.innerHTML = '';
    const generatorList = app.engine.listGenerators();
    for (const name of generatorList) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

export function updateGenerateButton(app) {
    const generateBtn = q('#generate-btn');
    if (!generateBtn) return;
    generateBtn.disabled = !app.currentGeneratorId;
}

export function updateGeneratorStructure(app) {
    const container = q('#generator-structure');

    if (!app.currentGeneratorId) {
        container.innerHTML = '<p class="text-secondary">Select a generator to view its structure</p>';
        return;
    }

    const generator = app.engine.loadedGenerators.get(app.currentGeneratorId);
    if (!generator) return;

    const grammar = generator.grammar || {};
    const entryPoints = generator.entry_points || {};

    let html = '<div class="structure-section">';
    html += '<h4>Grammar Rules</h4>';
    html += '<ul class="structure-list">';

    for (const ruleName of Object.keys(grammar)) {
        html += `<li>${ruleName}</li>`;
    }

    html += '</ul></div>';

    html += '<div class="structure-section">';
    html += '<h4>Entry Points</h4>';
    html += '<div class="entry-points">';

    if (entryPoints.default) {
        html += `<span class="entry-point-tag">default: ${entryPoints.default}</span>`;
    }

    if (entryPoints.alternatives) {
        entryPoints.alternatives.forEach(point => {
            html += `<span class="entry-point-tag">${point}</span>`;
        });
    }

    html += '</div></div>';
    container.innerHTML = html;
}
