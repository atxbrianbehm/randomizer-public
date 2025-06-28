import RandomizerEngine from '@/RandomizerEngine.js';
import bindEvents from '@/ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay, updateGeneratorStructure as uiUpdateGeneratorStructure } from '@/ui/state.js';
import { setupModal as setupAdvancedModal, showModal as openAdvancedModal, buildModal as rebuildAdvancedModal } from '@/ui/advancedModal.js';
import { createLockObjects } from '@/services/variableLocks.js';
import { q } from '@/ui/query.js';
import { openPromptEditor } from '@/ui/promptEditorModal.js';
import { saveState, loadState, clearState } from '@/services/persistence.js';

// Main entry for Vite – initializes the Randomizer application
import { GENERATOR_FILES, GENERATOR_LABELS } from '@/config/generatorIndex.js';
import * as GeneratorLoader from '@/services/generatorLoader.js';
import { renderExpansionTree } from '@/ui/expansionTree.js';

export class RandomizerApp {
    /**
     * Initialize a new RandomizerApp instance.
     * Sets up the RandomizerEngine, lock state, event bindings, and loads generators.
     */
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
        const { Locked, LockState } = createLockObjects();
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
        // Prepare advanced modal DOM listeners (feature flag can disable)
        if (window.FEATURE_ADV_MODAL !== false) {
            setupAdvancedModal(this);
        }
        this.initializeDebugOverlay();
    }

    /**
     * Initializes the debug overlay, checking for ?dev=1 parameter.
     */
    initializeDebugOverlay() {
        const params = new URLSearchParams(window.location.search);
        const overlayDiv = q('#debug-overlay');
        if (params.has('dev') && params.get('dev') === '1' && overlayDiv) {
            // The div is added via HTML. Initial display is 'none'.
            // Keyboard toggle will handle actual display toggling.
            console.log('Dev mode active, debug overlay enabled.');
            this.setupDebugOverlayToggle();
            this.setupExpansionTreeSearch();
            this.setupCopyExpansionJsonButton();
        } else if (overlayDiv) {
            overlayDiv.style.display = 'none'; // Ensure it's hidden if not dev=1
        }
    }

    /**
     * Sets up the copy expansion JSON button.
     */
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

    /**
     * Sets up the search input for the expansion tree.
     */
    setupExpansionTreeSearch() {
        const searchInput = q('#expansion-tree-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDebugOverlayTree();
            });
        }
    }

    /**
     * Sets up the keyboard shortcut (Ctrl+\) to toggle the debug overlay.
     */
    setupDebugOverlayToggle() {
        const overlayDiv = q('#debug-overlay');
        if (!overlayDiv) return;

        document.addEventListener('keydown', (event) => {
            // Check for Ctrl (or Meta for Mac) + \
            if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
                event.preventDefault();
                const isHidden = overlayDiv.style.display === 'none' || overlayDiv.style.display === '';
                overlayDiv.style.display = isHidden ? 'block' : 'none';
                console.log(`Debug overlay ${isHidden ? 'shown' : 'hidden'}`);
            } else if (event.key === 'Escape') {
                // Check for Escape key
                if (overlayDiv.style.display !== 'none') {
                    overlayDiv.style.display = 'none';
                    console.log('Debug overlay hidden with ESC');
                    event.preventDefault(); // Prevent potential browser default ESC behavior
                }
            }
        });
    }

    /**
     * Asynchronously load all generator JSON files, register them with the engine,
     * update the generator dropdown, and auto-select the first generator.
     * @returns {Promise<void>}
     */
    async initializeGenerators() {
        const persistedGen = this.persistedState?.generator || null;
        const { loadGenerators } = GeneratorLoader;
        this.generatorNames = await loadGenerators(this.engine, GENERATOR_FILES);
        console.log('All loaded generator names:', this.generatorNames);
        this.updateGeneratorDropdown();
        // Auto-select the first generator if available
        if (this.generatorNames.length > 0) {
            const pick = persistedGen && this.generatorNames.includes(persistedGen)
                ? persistedGen
                : this.generatorNames[0];
            this.selectGenerator(pick);
        }
    }

    /**
     * Populate the generator select dropdown with available generators from the engine.
     */
    updateGeneratorDropdown() {
        const select = q('#generator-select');
        if (!select) return;
        select.innerHTML = '';
        let generatorList = this.engine.listGenerators();
        // Fallback for environments where listGenerators may be empty (e.g., tests mocking duplicates)
        if (generatorList.length === 0 && Array.isArray(this.generatorNames)) {
            generatorList = [...new Set(this.generatorNames)];
        }
        console.log('Populating dropdown with generators:', generatorList);
        for (const name of generatorList) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name; // ensure predictable label for tests
            option.title = GENERATOR_LABELS[name] || name;
            select.appendChild(option);
        }
    }

    /**
     * Select a generator by name, update UI and state accordingly.
     * @param {string} name - Name of the generator to select.
     */
    selectGenerator(name) {
        this.engine.selectGenerator(name);

        // Build full generator spec for downstream UI modules
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
        this.updateVariablesDisplay();
        this.updateGenerateButton();
        // Update other UI as needed
    }

    // Enable or disable the Generate Text button depending on state
    /**
     * Enable or disable the Generate Text button depending on generator selection state.
     */
    updateGenerateButton() {
        const generateBtn = q('#generate-btn');
        if (!generateBtn) return;
        // Enable if a generator is selected; otherwise keep disabled
        generateBtn.disabled = !this.currentGeneratorId;
    }


    /**
     * Reset locks and persisted settings to defaults.
     */
    resetToDefaults() {
        this.engine.lockedValues = {};
        this.Locked = {};
        clearState();
        this.updateVariablesDisplay();
        this.showSuccess('Reset to defaults');
    }

    // ...rest of RandomizerApp methods remain unchanged...


    /**
     * Process a grammar rule, handling locks and evaluating its value.
     * @param {any} rule - The rule to process (string, array, or object).
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processRuleContent(rule, ruleName = null) {
        // If this field is already locked, use the stored value immediately
        if (ruleName && this.engine.lockedValues && this.engine.lockedValues[ruleName] !== undefined) {
            return this.Locked[ruleName];
        }

        // Compute the value normally
        let result;
        if (typeof rule === 'string') {
            result = this.substituteVariables(rule);
        } else if (Array.isArray(rule)) {
            result = this.processArrayRule(rule, ruleName);
        } else if (typeof rule === 'object') {
            result = this.processObjectRule(rule, ruleName);
        } else {
            result = String(rule);
        }

        // After computing, capture it if the lock toggle is active and value not yet stored
        if (
            ruleName &&
            this.LockState?.[ruleName] &&
            this.engine.lockedValues &&
            this.engine.lockedValues[ruleName] === undefined
        ) {
            this.engine.lockedValues[ruleName] = result;
        }

        return result;
    }

    /**
     * Process an array grammar rule, supporting lockable fields.
     * @param {Array} rule - The array rule to process.
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processArrayRule(rule, ruleName = null) {
        // Use locked value if set and this is a lockable field
        if (ruleName && this.engine.lockedValues && this.engine.lockedValues[ruleName] !== undefined) {
            return this.Locked[ruleName];
        }
        // Randomly select one item from the array
        const idx = Math.floor(Math.random() * rule.length);
        return this.processRuleContent(rule[idx], ruleName);
    }

    /**
     * Process an object grammar rule (conditional/weighted/other).
     * @param {Object} rule - The object rule to process.
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processObjectRule(rule, ruleName = null) {
        // Handle conditional or weighted rules
        if (rule.type === 'conditional') {
            return this.processConditionalRule(rule, ruleName);
        }
        if (rule.type === 'weighted') {
            return this.processWeightedRule(rule, ruleName);
        }
        // Fallback for other object rules
        return '[Unknown object rule]';
    }

    /**
     * Process a conditional grammar rule, evaluating conditions and actions.
     * @param {Object} rule - The conditional rule object.
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processConditionalRule(rule, ruleName = null) {
        // Check conditions and select appropriate option
        if (rule.options) {
            for (const option of rule.options) {
                if (this.evaluateConditions(option.conditions)) {
                    // Execute actions if present
                    if (option.actions) {
                        this.executeActions(option.actions);
                    }
                    return this.processRuleContent(option.text, ruleName);
                }
            }
        }

        // Return fallback if no conditions match
        return rule.fallback ? this.processRuleContent(rule.fallback, ruleName) : '[No matching condition]';
    }

    /**
     * Process a weighted grammar rule, randomly selecting options by weight.
     * @param {Object} rule - The weighted rule object.
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processWeightedRule(rule, ruleName = null) {
        // Use locked value if set and this is a lockable field
        if (ruleName && this.engine.lockedValues && this.engine.lockedValues[ruleName] !== undefined) {
            return this.Locked[ruleName];
        }
        const options = rule.options || [];
        const weights = rule.weights || options.map(() => 1);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < options.length; i++) {
            random -= weights[i];
            if (random < 0) {
                return this.processRuleContent(options[i], ruleName);
            }
        }
        return this.processRuleContent(options[0], ruleName);
    }

    /**
     * Evaluate a set of conditions for grammar rule selection.
     * @param {Object} conditions - Conditions to evaluate.
     * @returns {boolean} True if all conditions pass, false otherwise.
     */
    evaluateConditions(conditions) {
        if (!conditions) return true;

        for (const [variable, condition] of Object.entries(conditions)) {
            const value = this.variables[variable];
            
            if (condition.$lt !== undefined && !(value < condition.$lt)) return false;
            if (condition.$lte !== undefined && !(value <= condition.$lte)) return false;
            if (condition.$gt !== undefined && !(value > condition.$gt)) return false;
            if (condition.$gte !== undefined && !(value >= condition.$gte)) return false;
            if (condition.$eq !== undefined && !(value === condition.$eq)) return false;
            if (condition.$ne !== undefined && !(value !== condition.$ne)) return false;
        }
        
        return true;
    }

    /**
     * Execute actions (set, increment, decrement) on variables as part of rule evaluation.
     * @param {Object} actions - Actions to execute.
     */
    executeActions(actions) {
        if (actions.set) {
            for (const [variable, operation] of Object.entries(actions.set)) {
                if (typeof operation === 'object' && operation.$multiply) {
                    this.variables[variable] = (this.variables[variable] || 0) * operation.$multiply;
                } else {
                    this.variables[variable] = operation;
                }
            }
        }

        if (actions.increment) {
            for (const [variable, amount] of Object.entries(actions.increment)) {
                this.variables[variable] = (this.variables[variable] || 0) + amount;
            }
        }

        if (actions.decrement) {
            for (const [variable, amount] of Object.entries(actions.decrement)) {
                this.variables[variable] = (this.variables[variable] || 0) - amount;
            }
        }
    }

    /**
     * Substitute variables and grammar rule references in a text string.
     * @param {string} text - Text containing #var# placeholders.
     * @returns {string} Text with substitutions applied.
     */
    substituteVariables(text) {
        return text.replace(/#([a-zA-Z_][a-zA-Z0-9_]*)#/g, (match, varName) => {
            if (Object.prototype.hasOwnProperty.call(this.variables, varName)) {
                return this.variables[varName];
            }
            
            // Check if it's a grammar rule reference
            if (this.currentGenerator.grammar[varName]) {
                return this.processRule(varName);
            }
            
            return match; // Return original if not found
        });
    }

    /**
     * Get a shallow copy of the current variables object.
     * @returns {Object} Copy of variables.
     */
    getCurrentVariables() {
        return { ...this.variables };
    }

    /**
     * Get generator info from the engine by ID.
     * @param {string} id - Generator ID.
     * @returns {Object} Generator info object.
     */
    getGeneratorInfo(id) {
        return this.engine.getGeneratorInfo(id);
    }

    /**
     * Show the advanced modal and synchronize its state with current locks and variables.
     */
    showAdvancedModal() {
        this.syncAdvancedModal();
        q('#advanced-modal').style.display = 'block';
    }

    /**
     * Hide the advanced modal dialog.
     */
    hideAdvancedModal() {
        q('#advanced-modal').style.display = 'none';
    }

    /**
     * Synchronize the advanced modal UI with current lock states and variable values.
     */
    syncAdvancedModal() {
        // Get possible values from grammar for each field
        const generatorName = this.engine.currentGenerator;
        if (!generatorName) return;
        
        // Get the actual generator object from the engine using the name
        const generator = this.engine.loadedGenerators.get(generatorName);
        if (!generator) return;
        
        const grammar = generator.grammar;
        if (!grammar) return;
        
        const fillSelect = (id, arr, lockedVal) => {
            const sel = q(`#${id}`);
            sel.innerHTML = '';
            arr.forEach(val => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                if (lockedVal === val) opt.selected = true;
                sel.appendChild(opt);
            });
        };
        // Helper to extract values (array or weighted array)
        const extractVals = rule => {
            if (!rule) return [];
            if (Array.isArray(rule)) {
                return rule.map(v => typeof v === 'string' ? v : v.text).filter(Boolean);
            }
            return [];
        };

        this.lockableRules.forEach(cat => {
            const rule = grammar[cat];
            const values = extractVals(rule);
            if (values.length === 0) return;

            const selId = `adv-${cat.replace(/_/g, '-')}`;
            fillSelect(selId, values, this.Locked[cat]);

            const select = q(`#${selId}`);
            if (select) {
                select.onchange = () => {
                    const selectedValue = select.value;
                    if (selectedValue) {
                        this.Locked[cat] = selectedValue;
                        this.LockState[cat] = true;
                        // Update the lock button appearance
                        const lockBtn = q(`#lock-${cat}`);
                        if (lockBtn) {
                            lockBtn.textContent = '🔒';
                            lockBtn.className = 'lock-toggle locked';
                        }
                    }
                };
                select.disabled = !this.LockState[cat];
            }

            const btn = q(`#lock-${cat}`);
            if (btn) {
                btn.textContent = this.LockState[cat] ? '🔒' : '🔓';
                btn.className = 'lock-toggle' + (this.LockState[cat] ? ' locked' : '');
                btn.onclick = () => {
                    this.LockState[cat] = !this.LockState[cat];
                    this.syncAdvancedModal();
                };
            }
        });
    }
}

// Initialize the application when the DOMContentLoaded event fires
document.addEventListener('DOMContentLoaded', () => {
    new RandomizerApp();
});
