import RandomizerEngine from '../RandomizerEngine.js';
import bindEvents from '@/ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay, updateGeneratorStructure as uiUpdateGeneratorStructure } from '@/ui/state.js';
import { createLockObjects } from '@/services/variableLocks.js';
import { q } from '@/ui/query.js';
// Main entry for Vite – initializes the Randomizer application

export class RandomizerApp {
    constructor() {
        this.engine = new RandomizerEngine();
        this.currentGeneratorId = null;
        this.isPrettyPrint = true;
        const { Locked, LockState } = createLockObjects();
        this.Locked = Locked;
        this.LockState = LockState;
        bindEvents(this);
        this.initializeGenerators();
        // Don't call setupAdvancedModal here - it will be called when needed
    }

    async initializeGenerators() {
        // Find all .json generator files in the project directory
        const generatorFiles = [
            '/televangelist_generator.json',
            '/satanic_panic_generator.json'
        ];
        this.generatorNames = [];
        for (const file of generatorFiles) {
            try {
                console.log('Fetching generator file:', file);
                const response = await fetch(file);
                if (!response.ok) {
                    console.error('Fetch failed for', file, response.status);
                    continue;
                }
                const data = await response.json();
                console.log('Loaded JSON for', file, data);
                const name = await this.engine.loadGenerator(data, data.metadata.name);
                console.log('Loaded generator into engine:', name);
                this.generatorNames.push(name);
            } catch (e) {
                console.error('Failed to load generator', file, e);
            }
        }
        console.log('All loaded generator names:', this.generatorNames);
        this.updateGeneratorDropdown();
        // Auto-select the first generator if available
        if (this.generatorNames.length > 0) {
            this.selectGenerator(this.generatorNames[0]);
        }
    }

    updateGeneratorDropdown() {
        const select = document.getElementById('generator-select');
        select.innerHTML = '';
        const generatorList = this.engine.listGenerators();
        console.log('Populating dropdown with generators:', generatorList);
        for (const name of generatorList) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        }
    }

    selectGenerator(name) {
        this.engine.selectGenerator(name);
        this.currentGeneratorId = name;
        uiUpdateEntryPoints(this);
        this.updateVariablesDisplay();
        this.updateGenerateButton();
        // Update other UI as needed
    }

    // Enable or disable the Generate Text button depending on state
    updateGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn) return;
        // Enable if a generator is selected; otherwise keep disabled
        generateBtn.disabled = !this.currentGeneratorId;
    }

    // ...rest of RandomizerApp methods remain unchanged...


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

    getCurrentVariables() {
        return { ...this.variables };
    }

    getGeneratorInfo(id) {
        return this.engine.getGeneratorInfo(id);
    }

    showAdvancedModal() {
        this.syncAdvancedModal();
        document.getElementById('advanced-modal').style.display = 'block';
    }

    hideAdvancedModal() {
        document.getElementById('advanced-modal').style.display = 'none';
    }

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

    updateEntryPoints() {
        return uiUpdateEntryPoints(this);
    }
            

    updateVariablesDisplay() {
        return uiUpdateVariablesDisplay(this);
    }

    updateGeneratorStructure() {
        return uiUpdateGeneratorStructure(this);
    }


    
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
                const result = this.engine.generate(null, entryArg);
                lastResult = result;
                if (outputDiv) {
                    const p = document.createElement('p');
                    p.textContent = result;
                    p.className = 'generated-text';
                    // Copy to clipboard on click
                    p.onclick = () => {
                        navigator.clipboard.writeText(p.textContent).then(() => {
                            this.showSuccess('Copied to clipboard');
                        });
                    };
                    outputDiv.insertBefore(p, outputDiv.firstChild);
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
    
    clearOutput() {
        const outputDiv = document.getElementById('output-area');
        if (outputDiv) {
            outputDiv.innerHTML = '';
        }
    }
    
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

    togglePrettyPrint() {
        this.isPrettyPrint = !this.isPrettyPrint;
        const button = document.getElementById('pretty-print');
        button.textContent = this.isPrettyPrint ? 'Compact' : 'Pretty Print';
        
        if (!document.getElementById('json-content').classList.contains('hidden')) {
            this.showJsonViewer();
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

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