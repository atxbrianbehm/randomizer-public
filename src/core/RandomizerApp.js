import RandomizerEngine from '@/RandomizerEngine.js';
import bindEvents from '@/ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay } from '@/ui/state.js';
import { setupModal as setupAdvancedModal, buildModal as rebuildAdvancedModal } from '@/ui/advancedModal.js';
import { createLockObjects } from '@/services/variableLocks.js';
import { q } from '@/ui/query.js';
import { openPromptEditor } from '@/ui/promptEditorModal.js';
import { loadState, clearState } from '@/services/persistence.js';

// Main entry ignores browser bootstrap; this class can be imported in tests & UI
import { GENERATOR_FILES, GENERATOR_LABELS } from '@/config/generatorIndex.js';
import * as GeneratorLoader from '@/services/generatorLoader.js';


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
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            bindEvents(this);
        }
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
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            setupAdvancedModal(this);
        }
        this.initializeDebugOverlay();
    }

    /* ---- debug overlay helpers (unchanged) ---- */
    /**
     * Initializes the debug overlay, checking for the `?dev=1` URL parameter.
     * If the parameter is present, the overlay is enabled and its toggle shortcut is set up.
     */
    initializeDebugOverlay() {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }
        const params = new URLSearchParams(window.location.search);
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
        if (typeof document === 'undefined') return;
        const copyButton = q('#copy-expansion-json');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                if (this.lastSegments) {
                    const jsonString = JSON.stringify(this.lastSegments, null, 2);
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(jsonString).then(() => {
                            this.showSuccess?.('Expansion JSON copied to clipboard!');
                        }).catch(err => {
                            console.error('Failed to copy expansion JSON:', err);
                            this.showError?.('Failed to copy expansion JSON.');
                        });
                    } else {
                        this.showError?.('Clipboard API not available.');
                    }
                } else {
                    this.showError('No expansion data to copy.');
                }
            });
        }
    }
    setupExpansionTreeSearch() {
        if (typeof document === 'undefined') return;
        const searchInput = q('#expansion-tree-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDebugOverlayTree();
            });
        }
    }
    setupDebugOverlayToggle() {
        if (typeof document === 'undefined') return;
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
        if (typeof document === 'undefined') return;
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

    /**
     * Handles user selection of a generator from the dropdown.
     * Fetches & loads the generator spec, refreshes related UI, and persists the choice.
     * @public
     * @param {string} name - Display name of the generator to activate.
     */
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
        if (typeof uiUpdateEntryPoints === 'function') {
            uiUpdateEntryPoints(this);
        }
        if (typeof uiUpdateVariablesDisplay === 'function') {
            uiUpdateVariablesDisplay(this);
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
    /**
     * Generates new prompt(s) using the currently selected generator.
     * Renders the output to the UI and updates persisted state.
     * @public
     * @param {number} [count=1] - Number of prompts to generate.
     * @param {object} [options={}] - Additional engine options.
     * @returns {Promise<void>} Resolves when generation and UI updates complete.
     */
    generateText(count = 1, options = {}) {
        if (typeof document === 'undefined') return;
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
                const genMeta = this.engine.loadedGenerators.get(this.currentGeneratorId)?.metadata || {};
                if (genMeta.displayMode === 'rawOnly') {
                    promptText = detail.raw;
                } else {
                    promptText = detail.readable || detail.raw;
                }
            } catch (err) {
                console.error('Prompt generation failed', err);
                promptText = '[Generation error]';
            }
            const card = document.createElement('div');
            card.className = 'prompt-card';

            // Paragraph containing the generated prompt. Adds click-to-copy behaviour.
            const p = document.createElement('p');
            p.textContent = promptText;
            p.className = 'generated-text';
            p.onclick = () => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(promptText).then(() => {
                        p.classList.add('flash');
                        setTimeout(() => p.classList.remove('flash'), 400);
                    });
                }
            };
            card.appendChild(p);

            // --- Prompt card actions (copy + edit) ---
            const actions = document.createElement('div');
            actions.className = 'prompt-actions';

            // Copy button (alternative to clicking the paragraph)
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn tooltip';
            copyBtn.textContent = '📋';
            copyBtn.setAttribute('data-tip', 'Copy prompt');
            copyBtn.onclick = () => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(promptText).then(() => {
                        copyBtn.classList.add('copied');
                        copyBtn.textContent = '✅';
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            copyBtn.textContent = '📋';
                        }, 1200);
                    });
                }
            };
            actions.appendChild(copyBtn);

            // Ellipsis / edit button to open Prompt Editor
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn tooltip';
            editBtn.textContent = '…';
            editBtn.setAttribute('data-tip', 'Edit / rearrange');
            editBtn.onclick = () => {
                openPromptEditor({
                    rawText: promptText,
                    segments: null,
                    onSave: (updated) => {
                        promptText = updated;
                        p.textContent = updated;
                    }
                });
            };
            actions.appendChild(editBtn);

            card.appendChild(actions);
            output.appendChild(card);
        }
    }

    /**
     * Synchronizes the advanced modal UI with current lock states and variable values.
     */
    syncAdvancedModal() {
        rebuildAdvancedModal(this);
    }

    /**
     * Resets locks and persisted settings to defaults.
     */
    /**
     * Restores the application to its initial state: clears persisted data,
     * reloads default generator, and resets UI.
     * @public
     */
    resetToDefaults() {
        this.engine.lockedValues = {};
        this.Locked = {};
        clearState();
        this.updateVariablesDisplay();
        this.showSuccess?.('Reset to defaults');
    }

    /**
     * Processes a grammar rule, handling locks and evaluating its value.
     * @param {any} rule - The rule to process (string, array, or object).
     * @param {string|null} [ruleName=null] - Optional grammar rule name.
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
     * Processes an array grammar rule, supporting lockable fields.
     * @param {Array} rule - The array rule to process.
     * @param {string|null} [ruleName=null] - Optional grammar rule name.
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
     * Processes an object grammar rule (conditional/weighted/other).
     * @param {Object} rule - The object rule to process.
     * @param {string|null} [ruleName=null] - Optional grammar rule name.
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
     * Processes a conditional grammar rule, evaluating conditions and actions.
     * @param {Object} rule - The conditional rule object.
     * @param {string|null} [ruleName=null] - Optional grammar rule name.
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
     * Processes a weighted grammar rule, randomly selecting options by weight.
     * @param {Object} rule - The weighted rule object.
     * @param {string|null} [ruleName=null] - Optional grammar rule name.
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
            if (random <= 0) {
                return this.processRuleContent(options[i], ruleName);
            }
        }
        return this.processRuleContent(options[0], ruleName);
    }

    /**
     * Evaluates a set of conditions for grammar rule selection.
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
     * Executes actions (set, increment, decrement) on variables as part of rule evaluation.
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
     * Substitutes variables and grammar rule references in a text string.
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
     * Gets a shallow copy of the current variables object.
     * @returns {Object} Copy of variables.
     */
    /**
     * Returns a shallow copy of the engine's current variable map.
     * Useful for debugging and external integrations.
     * @public
     * @returns {Record<string, any>} Key/value pairs of current variables.
     */
    getCurrentVariables() {
        return { ...this.variables };
    }

    /**
     * Gets generator information from the engine by ID.
     * @param {string} id - Generator ID.
     * @returns {Object} Generator info object.
     */
    /**
     * Retrieves basic metadata for a given generator.
     * @public
     * @param {string} id - Generator identifier.
     * @returns {{ id: string, name: string, variables: string[] }} Info object.
     */
    getGeneratorInfo(id) {
        return this.engine.getGeneratorInfo(id);
    }

    /**
     * Shows the advanced modal and synchronizes its state with current locks and variables.
     */
    /**
     * Exposes the advanced-options modal.
     * Primarily a thin wrapper around UI helper logic.
     * @public
     */
    showAdvancedModal() {
        if (typeof document === 'undefined') return;
        this.syncAdvancedModal();
        q('#advanced-modal').style.display = 'block';
    }

    /**
     * Hides the advanced modal dialog.
     */
    /**
     * Closes the advanced-options modal if open.
     * @public
     */
    hideAdvancedModal() {
        if (typeof document === 'undefined') return;
        q('#advanced-modal').style.display = 'none';
    }

    // --- END OF CLASS METHODS ---
}

// Provide a default export for environments that import the class directly
export default RandomizerApp;
