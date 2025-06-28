import RandomizerEngine from '@/RandomizerEngine.js';
import bindEvents from '@/ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay, updateGeneratorStructure as uiUpdateGeneratorStructure } from '@/ui/state.js';
import { setupModal as setupAdvancedModal, buildModal as rebuildAdvancedModal } from '@/ui/advancedModal.js';
import { createLockObjects } from '@/services/variableLocks.js';
import { q } from '@/ui/query.js';
import { openPromptEditor } from '@/ui/promptEditorModal.js';
import { saveState, loadState, clearState } from '@/services/persistence.js';

// Main entry ignores browser bootstrap; this class can be imported in tests & UI
import { GENERATOR_FILES, GENERATOR_LABELS } from '@/config/generatorIndex.js';
import * as GeneratorLoader from '@/services/generatorLoader.js';
import { renderExpansionTree } from '@/ui/expansionTree.js';

/**
 * Core application logic for Randomizer. This class is environment-agnostic and can be
 * instantiated in both browser (via main.js) and Vitest/JSDOM tests.
 */
export class RandomizerApp {
    constructor() {
        // Load persisted state early
        this.persistedState = loadState() || null;
        this.engine = new RandomizerEngine();
        this.currentGeneratorId = null;
        this.isPrettyPrint = true;
        // Array of grammar keys that can be locked in Advanced Options (populated per generator)
        this.lockableRules = [];
        // Comprehensive spec object for currently selected generator (name, grammar, variables, lockableRules, uiConfig)
        this.generatorSpec = null;
        const { Locked, LockState } = createLockObjects(this.lockableRules);
        this.Locked = Locked;
        this.LockState = LockState;
        bindEvents(this);
        // Restore locked values from persisted state if available
        if (this.persistedState?.lockedValues) {
            this.engine.lockedValues = { ...this.persistedState.lockedValues };
            this.Locked = { ...this.persistedState.lockedValues };
            Object.keys(this.persistedState.lockedValues).forEach(k => {
                this.LockState[k] = true;
            });
        }
        this.initializeGenerators();
        // Prepare advanced modal DOM listeners
        setupAdvancedModal(this);
        this.initializeDebugOverlay();
    }

    /* ---- debug overlay helpers (unchanged) ---- */
    initializeDebugOverlay() {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const overlayDiv = q('#debug-overlay');
        if (params.has('dev') && params.get('dev') === '1' && overlayDiv) {
            console.log('Dev mode active, debug overlay enabled.');
            this.setupDebugOverlayToggle();
            this.setupExpansionTreeSearch();
            this.setupCopyExpansionJsonButton();
        } else if (overlayDiv) {
            overlayDiv.style.display = 'none';
        }
    }
    setupCopyExpansionJsonButton() {
        const copyButton = q('#copy-expansion-json');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                if (this.lastSegments) {
                    const jsonString = JSON.stringify(this.lastSegments, null, 2);
                    navigator.clipboard.writeText(jsonString).then(() => {
                        this.showSuccess('Expansion JSON copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy expansion JSON:', err);
                        this.showError('Failed to copy expansion JSON.');
                    });
                } else {
                    this.showError('No expansion data to copy.');
                }
            });
        }
    }
    setupExpansionTreeSearch() {
        const searchInput = q('#expansion-tree-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDebugOverlayTree();
            });
        }
    }
    setupDebugOverlayToggle() {
        const overlayDiv = q('#debug-overlay');
        if (!overlayDiv) return;
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
                event.preventDefault();
                const isHidden = overlayDiv.style.display === 'none' || overlayDiv.style.display === '';
                overlayDiv.style.display = isHidden ? 'block' : 'none';
            } else if (event.key === 'Escape') {
                if (overlayDiv.style.display !== 'none') {
                    overlayDiv.style.display = 'none';
                    event.preventDefault();
                }
            }
        });
    }

    /* ---- generator loading + UI helpers (original methods remain) ---- */
    async initializeGenerators() {
        const persistedGen = this.persistedState?.generator || null;
        const { loadGenerators } = GeneratorLoader;
        this.generatorNames = await loadGenerators(this.engine, GENERATOR_FILES);
        this.updateGeneratorDropdown();
        if (this.generatorNames.length > 0) {
            const pick = persistedGen && this.generatorNames.includes(persistedGen)
                ? persistedGen
                : this.generatorNames[0];
            this.selectGenerator(pick);
        }
    }
    updateGeneratorDropdown() {
        const select = q('#generator-select');
        if (!select) return;
        select.innerHTML = '';
        let generatorList = this.engine.listGenerators();
        if (generatorList.length === 0 && Array.isArray(this.generatorNames)) {
            generatorList = [...new Set(this.generatorNames)];
        }
        for (const name of generatorList) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            option.title = GENERATOR_LABELS[name] || name;
            select.appendChild(option);
        }
    }

    selectGenerator(name) {
        this.engine.selectGenerator(name);
        const genObj = this.engine.loadedGenerators.get(name);
        this.lockableRules = this.engine.getLockableRules(name) || [];
        this.generatorSpec = {
            name,
            grammar: genObj?.grammar || {},
            variables: genObj?.variables || {},
            lockableRules: this.lockableRules,
            uiConfig: genObj?.uiConfig || {}
        };
        this.currentGeneratorId = name;
        uiUpdateEntryPoints(this);
        if (typeof this.updateVariablesDisplay === 'function') {
            this.updateVariablesDisplay();
        }
        this.updateGenerateButton();
    }
    updateGenerateButton() {
       
        
        const generateBtn = q('#generate-btn');
        if (!generateBtn) return;
        generateBtn.disabled = !this.currentGeneratorId;
    }

    // Generate one or more prompts and append cards to #output-area
    // Uses RandomizerEngine.generateDetailed to obtain readable prompts.
    generateText(count = 1, options = {}) {
        const output = q('#output-area');
        if (!output || !this.currentGeneratorId) return;
        const { entryPoint = null, target = null, append = false } = options;

        if (!append) {
            output.innerHTML = '';
        }

        for (let i = 0; i < count; i++) {
            let promptText = '';
            try {
                const detail = this.engine.generateDetailed(this.currentGeneratorId, { entryPoint, target });
                promptText = detail.readable || detail.raw;
            } catch (err) {
                console.error('Prompt generation failed', err);
                promptText = '[Generation error]';
            }
            const card = document.createElement('div');
            card.className = 'prompt-card';
            const p = document.createElement('p');
            p.textContent = promptText;
            card.appendChild(p);
            output.appendChild(card);
        }
    }

    syncAdvancedModal() {
        rebuildAdvancedModal(this);
    }
    resetToDefaults() {
        this.engine.lockedValues = {};
        this.Locked = {};
        clearState();
        this.updateVariablesDisplay();
        this.showSuccess?.('Reset to defaults');
    }
    /* remaining methods (processRuleContent etc.) are unchanged; */
}

export default RandomizerApp;
