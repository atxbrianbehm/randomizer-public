import RandomizerEngine from '../RandomizerEngine.js';
import bindEvents from './ui/events.js';
import { updateEntryPoints as uiUpdateEntryPoints, updateVariablesDisplay as uiUpdateVariablesDisplay, updateGeneratorStructure as uiUpdateGeneratorStructure } from './ui/state.js';
import { loadDefaultGenerators } from './services/generatorLoader.js';
import { generateText as generateWithService } from './services/textGenerator.js';
import { createLockObjects } from './services/variableLocks.js';
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
        // Load generators asynchronously, then populate UI
        loadDefaultGenerators(this.engine).then(names => {
            this.generatorNames = names;
            this.updateGeneratorDropdown();
            if (this.generatorNames.length > 0) {
                this.selectGenerator(this.generatorNames[0]);
            }
        });
        // Don't call setupAdvancedModal here - it will be called when needed
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
        // Use locked value if set and this is a lockable field
        const lockable = ['preacher_name', 'platforms', 'mediaContexts', 'divine_title'];
        if (ruleName && lockable.includes(ruleName) && this.Locked && this.Locked[ruleName] !== undefined) {
            return this.Locked[ruleName];
        }
        if (typeof rule === 'string') {
            return this.substituteVariables(rule);
        }
        if (Array.isArray(rule)) {
            return this.processArrayRule(rule, ruleName);
        }
        if (typeof rule === 'object') {
            return this.processObjectRule(rule, ruleName);
        }
        return String(rule);
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
        if (!this.generators.has(id)) return null;
        return this.generators.get(id);
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
                const result = generateWithService(this.engine, entryArg);
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
        const existing = document.querySelector('.error-message, .success-message');
        if (existing) {
            existing.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message fade-in`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Export for testing
export default RandomizerApp;