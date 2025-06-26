import RandomizerEngine from '../RandomizerEngine.js';
import bindEvents from '@/ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay, updateGeneratorStructure as uiUpdateGeneratorStructure } from '@/ui/state.js';
import { setupModal as setupAdvancedModal, showModal as openAdvancedModal, buildModal as rebuildAdvancedModal } from '@/ui/advancedModal.js';
import { createLockObjects } from '@/services/variableLocks.js';
import { q } from '@/ui/query.js';
import { openPromptEditor } from '@/ui/promptEditorModal.js';
// Main entry for Vite – initializes the Randomizer application
import { GENERATOR_FILES, GENERATOR_LABELS } from '@/config/generatorIndex.js';

export class RandomizerApp {
    /**
     * Initialize a new RandomizerApp instance.
     * Sets up the RandomizerEngine, lock state, event bindings, and loads generators.
     */
    constructor() {
        this.engine = new RandomizerEngine();
        this.currentGeneratorId = null;
        this.isPrettyPrint = true;
        // Array of grammar keys that can be locked in Advanced Options (populated per generator)
        this.lockableRules = [];
        const { Locked, LockState } = createLockObjects();
        this.Locked = Locked;
        this.LockState = LockState;
        bindEvents(this);
        this.initializeGenerators();
        // Prepare advanced modal DOM listeners
        setupAdvancedModal(this);
    }

    /**
     * Asynchronously load all generator JSON files, register them with the engine,
     * update the generator dropdown, and auto-select the first generator.
     * @returns {Promise<void>}
     */
    async initializeGenerators() {
        // Use loader utility for all generators
        const { loadGenerators } = await import('@/services/generatorLoader.js');
        this.generatorNames = await loadGenerators(this.engine, GENERATOR_FILES);
        console.log('All loaded generator names:', this.generatorNames);
        this.updateGeneratorDropdown();
        // Auto-select the first generator if available
        if (this.generatorNames.length > 0) {
            this.selectGenerator(this.generatorNames[0]);
        }
    }

    /**
     * Populate the generator select dropdown with available generators from the engine.
     */
    updateGeneratorDropdown() {
        const select = document.getElementById('generator-select');
        select.innerHTML = '';
        const generatorList = this.engine.listGenerators();
        console.log('Populating dropdown with generators:', generatorList);
        for (const name of generatorList) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = GENERATOR_LABELS[name] || name;
            select.appendChild(option);
        }
    }

    /**
     * Select a generator by name, update UI and state accordingly.
     * @param {string} name - Name of the generator to select.
     */
    selectGenerator(name) {
        this.engine.selectGenerator(name);
        // Query engine for lockable rules of the newly selected generator
        this.lockableRules = this.engine.getLockableRules(name) || [];

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
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn) return;
        // Enable if a generator is selected; otherwise keep disabled
        generateBtn.disabled = !this.currentGeneratorId;
    }

    // Utility called by UI helpers to refresh modal when variable table updates
    syncAdvancedModal() {
        rebuildAdvancedModal(this);
    }

    // ...rest of RandomizerApp methods remain unchanged...


    /**
     * Process a grammar rule, handling locks and evaluating its value.
     * @param {any} rule - The rule to process (string, array, or object).
     * @param {string|null} ruleName - Optional grammar rule name.
     * @returns {any} The processed value.
     */
    processRuleContent(rule, ruleName = null) {
        const lockable = ['preacher_name', 'platforms', 'mediaContexts', 'divine_title'];

        // If this field is already locked, use the stored value immediately
        if (ruleName && lockable.includes(ruleName) && this.Locked?.[ruleName] !== undefined) {
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
            lockable.includes(ruleName) &&
            this.LockState?.[ruleName] &&
            this.Locked?.[ruleName] === undefined
        ) {
            this.Locked[ruleName] = result;
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
        const lockable = ['preacher_name', 'platforms', 'mediaContexts', 'divine_title'];
        if (ruleName && lockable.includes(ruleName) && this.Locked && this.Locked[ruleName] !== undefined) {
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
        const lockable = ['preacher_name', 'platforms', 'mediaContexts', 'divine_title'];
        if (ruleName && lockable.includes(ruleName) && this.Locked && this.Locked[ruleName] !== undefined) {
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
        document.getElementById('advanced-modal').style.display = 'block';
    }

    /**
     * Hide the advanced modal dialog.
     */
    hideAdvancedModal() {
        document.getElementById('advanced-modal').style.display = 'none';
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
        // Helper to extract values (array or weighted array)
        const extractVals = rule => {
            if (!rule) return [];
            if (Array.isArray(rule)) {
                return rule.map(v => typeof v === 'string' ? v : v.text).filter(Boolean);
            }
            return [];
        };
        // Preacher Name
        fillSelect('adv-preacher-name', extractVals(grammar.preacher_name), this.Locked.preacher_name);
        // Divine Title
        fillSelect('adv-divine-title', extractVals(grammar.divine_title), this.Locked.divine_title);
        // Platforms
        fillSelect('adv-platforms', extractVals(grammar.platforms), this.Locked.platforms);
        // Media Contexts
        fillSelect('adv-media-contexts', extractVals(grammar.mediaContexts), this.Locked.mediaContexts);
        
        // Add change event listeners to automatically lock when a value is selected
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
                    this.Locked[fieldName] = selectedValue;
                    this.LockState[fieldName] = true;
                    // Update the lock button appearance
                    const lockBtn = document.getElementById('lock-' + fieldName);
                    lockBtn.textContent = '🔒';
                    lockBtn.className = 'lock-toggle locked';
                }
            };
        });
        
        // Lock toggles
        ['preacher_name','divine_title','platforms','mediaContexts'].forEach(cat => {
            const btn = document.getElementById('lock-' + cat);
            btn.textContent = this.LockState[cat] ? '🔒' : '🔓';
            btn.className = 'lock-toggle' + (this.LockState[cat] ? ' locked' : '');
            btn.onclick = () => {
                this.LockState[cat] = !this.LockState[cat];
                this.syncAdvancedModal();
            };
            // Dropdown enable/disable
            const sel = document.getElementById('adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_','-')));
            sel.disabled = !this.LockState[cat];
        });
    }

    /**
     * Apply the selections from the advanced modal to the engine's locked values and update UI.
     */
    applyAdvancedModal() {
        // Save locked values to engine.lockedValues
        this.engine.lockedValues = this.engine.lockedValues || {};
        ['preacher_name','divine_title','platforms','mediaContexts'].forEach(cat => {
            const sel = document.getElementById('adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_','-')));
            if (this.LockState[cat]) {
                this.engine.lockedValues[cat] = sel.value;
            } else {
                delete this.engine.lockedValues[cat];
            }
        });
        this.hideAdvancedModal();
        this.updateVariablesDisplay();
    }

    /**
     * Set up advanced modal event handlers and initialize its hidden state.
     */
    setupAdvancedModal() {
        const applyBtn = document.getElementById('apply-advanced');
        if (applyBtn) {
            applyBtn.onclick = () => this.applyAdvancedModal();
        }
        
        const cancelBtn = document.getElementById('cancel-advanced');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.hideAdvancedModal();
        }
        
        const closeModal = q('.close-modal');
        if (closeModal) {
            closeModal.onclick = () => this.hideAdvancedModal();
        }
        
        // Initialize modal to be hidden
        const modal = document.getElementById('advanced-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Update the entry points UI using the current app state.
     * @returns {void}
     */
    updateEntryPoints() {
        return uiUpdateEntryPoints(this);
    }
            

    /**
     * Update the variables display UI using the current app state.
     * @returns {void}
     */
    updateVariablesDisplay() {
        return uiUpdateVariablesDisplay(this);
    }

    /**
     * Update the generator structure UI using the current app state.
     * @returns {void}
     */
    updateGeneratorStructure() {
        return uiUpdateGeneratorStructure(this);
    }


    
    /**
     * Generate text using the currently selected generator and entry point, handling output and errors.
     */
    generateText() {
        console.log('Generate text called');
        if (!this.currentGeneratorId) {
            this.showError('Please select a generator first');
            return;
        }

        try {
            // Get the selected entry point
            const entryPointSelect = document.getElementById('entry-point');
            const entryPoint = entryPointSelect ? entryPointSelect.value : 'default';
            // If the user chose "default", let the engine decide by passing null
            const entryArg = (entryPoint === 'default') ? null : entryPoint;
            
            // Determine how many generations to create (1–10)
            const countInput = document.getElementById('generation-count');
            const count = countInput ? Math.max(1, Math.min(parseInt(countInput.value, 10) || 1, 10)) : 1;
            
            const outputDiv = document.getElementById('output-area');
            let lastResult = '';
            for (let i = 0; i < count; i++) {
                const { text: result, segments } = this.engine.generateDetailed(null, entryArg);
                lastResult = result;
                if (outputDiv) {
                    const card = document.createElement('div');
                    card.className = 'prompt-card';
                    card.style.position = 'relative';

                    const p = document.createElement('p');
                    p.textContent = result;
                    p.className = 'generated-text';
                    p.style.flex = '1';

                    // Copy on click


                    const editBtn = document.createElement('button');
                    editBtn.textContent = '⋯';
                    editBtn.className = 'edit-btn';
                    editBtn.title = 'Edit prompt';
                    editBtn.setAttribute('aria-label', 'Edit prompt');
                    // dark-mode neutral styling
                    editBtn.style.position = 'absolute';
                    editBtn.style.top = '4px';
                    editBtn.style.right = '4px';
                    editBtn.style.background = 'transparent';
                    editBtn.style.color = '#ccc';
                    editBtn.style.border = 'none';
                    editBtn.style.cursor = 'pointer';
                    editBtn.onmouseover = () => { editBtn.style.color = '#fff'; };
                    editBtn.onmouseout = () => { editBtn.style.color = '#ccc'; };
                    editBtn.onmousedown = () => { editBtn.style.transform = 'scale(0.9)'; };
                    editBtn.onmouseup = () => { editBtn.style.transform = 'scale(1)'; };
                    editBtn.onclick = () => {
                        openPromptEditor({
                            segments,
                            rawText: result,
                            onSave: (newText) => {
                                p.textContent = newText;
                            }
                        });
                    };

                    card.style.display = 'flex';
                    card.style.gap = '0.5rem';
                    card.style.alignItems = 'flex-start';
                    card.style.background = '#2a2a2a';
                    card.style.border = '1px solid #444';
                    card.style.borderRadius = '8px';
                    card.style.padding = '0.75rem 1rem';
                    card.style.cursor = 'pointer';
                    card.style.margin = '0 0 1rem';
                    card.onmouseover = () => { card.style.background = '#323232'; };
                    card.onmouseout = () => { card.style.background = '#2a2a2a'; };

                    // copy entire prompt on card click
                    card.onclick = (e) => {
                        // ignore if edit button clicked
                        if (e.target.closest('button')) return;
                        navigator.clipboard.writeText(p.textContent).then(() => {
                            this.showSuccess('Copied to clipboard');
                        });
                    };

                    p.style.margin = '0';
                    card.appendChild(p);
                    card.appendChild(editBtn);

                    outputDiv.insertBefore(card, outputDiv.firstChild);
                }
            }
            
            console.log(`Generated ${count} text snippet(s). Last result:`, lastResult);
            this.showSuccess(`Generated ${count} text snippet${count > 1 ? 's' : ''} successfully`);
            
            // Update the JSON viewer if it's open
            uiUpdateGeneratorStructure(this);
        } catch (error) {
            console.error('Error generating text:', error);
            this.showError('Error generating text: ' + error.message);
        }
    }
    
    /**
     * Clear all generated output from the output area in the UI.
     */
    clearOutput() {
        const outputDiv = document.getElementById('output-area');
        if (outputDiv) {
            outputDiv.innerHTML = '';
        }
    }
    
    /**
     * Display the JSON viewer for the current generator with pretty/compact formatting.
     */
    showJsonViewer() {
        if (!this.currentGeneratorId) {
            this.showError('Please select a generator first');
            return;
        }

        const content = document.getElementById('json-content');
        const code = document.getElementById('json-code');
        
        const generator = this.engine.getGeneratorInfo(this.currentGeneratorId);
        const jsonString = this.isPrettyPrint 
            ? JSON.stringify(generator, null, 2)
            : JSON.stringify(generator);
        
        code.textContent = jsonString;
        content.classList.remove('hidden');
    }

    /**
     * Toggle JSON pretty print/compact mode and update the viewer if open.
     */
    togglePrettyPrint() {
        this.isPrettyPrint = !this.isPrettyPrint;
        const button = document.getElementById('pretty-print');
        button.textContent = this.isPrettyPrint ? 'Compact' : 'Pretty Print';
        
        if (!document.getElementById('json-content').classList.contains('hidden')) {
            this.showJsonViewer();
        }
    }

    /**
     * Display an error message to the user.
     * @param {string} message - Error message to display.
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Display a success message to the user.
     * @param {string} message - Success message to display.
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Display a message (error or success) to the user in the UI.
     * @param {string} message - Message to display.
     * @param {string} type - 'error' or 'success'.
     */
    showMessage(message, type) {
        // Remove existing messages
        const existing = q('.error-message, .success-message');
        if (existing) {
            existing.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message fade-in`;
        messageDiv.textContent = message;
        
        const container = q('.container');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RandomizerApp();
});

// Export for testing
export default RandomizerApp;