// Use the RandomizerEngine from RandomizerEngine.js
// Assume it is available globally as window.RandomizerEngine

class RandomizerApp {
    constructor() {
        this.engine = new window.RandomizerEngine();
        this.currentGeneratorId = null;
        this.isPrettyPrint = true;
        this.advancedLocked = {
            preacher_name: undefined,
            divine_title: undefined,
            platforms: undefined,
            mediaContexts: undefined
        };
        this.advancedLockState = {
            preacher_name: false,
            divine_title: false,
            platforms: false,
            mediaContexts: false
        };
        this.bindEvents();
        this.initializeGenerators();
        // Don't call setupAdvancedModal here - it will be called when needed
    }

    async initializeGenerators() {
        // Find all .json generator files in the project directory
        const generatorFiles = [
            'televangelist_generator.json',
            'satanic_panic_generator.json'
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
        this.updateEntryPoints();
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
        if (ruleName && lockable.includes(ruleName) && this.lockedValues && this.lockedValues[ruleName] !== undefined) {
            return this.lockedValues[ruleName];
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
        if (ruleName && lockable.includes(ruleName) && this.lockedValues && this.lockedValues[ruleName] !== undefined) {
            return this.lockedValues[ruleName];
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
        if (ruleName && lockable.includes(ruleName) && this.lockedValues && this.lockedValues[ruleName] !== undefined) {
            return this.lockedValues[ruleName];
        }
        // Weighted random selection for array of options
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
            if (this.variables.hasOwnProperty(varName)) {
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
        fillSelect('adv-preacher-name', extractVals(grammar.preacher_name), this.advancedLocked.preacher_name);
        // Divine Title
        fillSelect('adv-divine-title', extractVals(grammar.divine_title), this.advancedLocked.divine_title);
        // Platforms
        fillSelect('adv-platforms', extractVals(grammar.platforms), this.advancedLocked.platforms);
        // Media Contexts
        fillSelect('adv-media-contexts', extractVals(grammar.mediaContexts), this.advancedLocked.mediaContexts);
        
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
                    this.advancedLocked[fieldName] = selectedValue;
                    this.advancedLockState[fieldName] = true;
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
            btn.textContent = this.advancedLockState[cat] ? '🔒' : '🔓';
            btn.className = 'lock-toggle' + (this.advancedLockState[cat] ? ' locked' : '');
            btn.onclick = () => {
                this.advancedLockState[cat] = !this.advancedLockState[cat];
                this.syncAdvancedModal();
            };
            // Dropdown enable/disable
            const sel = document.getElementById('adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_','-')));
            sel.disabled = !this.advancedLockState[cat];
        });
    }

    applyAdvancedModal() {
        // Save locked values to engine.lockedValues
        this.engine.lockedValues = this.engine.lockedValues || {};
        ['preacher_name','divine_title','platforms','mediaContexts'].forEach(cat => {
            const sel = document.getElementById('adv-' + (cat === 'mediaContexts' ? 'media-contexts' : cat.replace('_','-')));
            if (this.advancedLockState[cat]) {
                this.engine.lockedValues[cat] = sel.value;
            } else {
                delete this.engine.lockedValues[cat];
            }
        });
        this.hideAdvancedModal();
        this.updateVariablesDisplay();
    }

        // ... (rest of the code remains the same)

    bindEvents() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generateText();
        } else {
            console.warn('generate-btn not found');
        }

        const clearBtn = document.getElementById('clear-output');
        if (clearBtn) {
            clearBtn.onclick = () => this.clearOutput();
        } else {
            console.warn('clear-output not found');
        }

        const jsonToggleBtn = document.getElementById('toggle-json');
        if (jsonToggleBtn) {
            jsonToggleBtn.onclick = () => this.toggleJsonViewer();
        } else {
            console.warn('toggle-json not found');
        }

        const generatorSelect = document.getElementById('generator-select');
        if (generatorSelect) {
            generatorSelect.onchange = (e) => this.selectGenerator(e.target.value);
        } else {
            console.warn('generator-select not found');
        }

        const advancedBtn = document.getElementById('advanced-btn');
        if (advancedBtn) {
            advancedBtn.onclick = () => this.showAdvancedModal();
        } else {
            console.warn('advanced-btn not found');
        }
        
        const darkToggle = document.getElementById('dark-mode-toggle');
        if (darkToggle) {
            darkToggle.onclick = () => {
                const html = document.documentElement;
                const current = html.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-color-scheme', current);
            };
        }
        // Setup advanced modal buttons
        this.setupAdvancedModal();
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
        
        const closeModal = document.querySelector('.close-modal');
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
        const select = document.getElementById('entry-point');
        select.innerHTML = '<option value="default">Default</option>';
        
        if (this.currentGeneratorId) {
            const generatorName = this.engine.currentGenerator;
            if (!generatorName) return;
            
            const generator = this.engine.loadedGenerators.get(generatorName);
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

    updateVariablesDisplay() {
        // Also update advanced modal if open
        const advModal = document.getElementById('advanced-modal');
        if (advModal && advModal.style.display !== 'none') {
            this.syncAdvancedModal();
        }

        const container = document.getElementById('variables-table');
        
        if (!this.currentGeneratorId) {
            container.innerHTML = '<p class="text-secondary">Select a generator to view variables</p>';
            return;
        }
        
        // Get the actual generator object
        const generatorName = this.engine.currentGenerator;
        if (!generatorName) {
            container.innerHTML = '<p class="text-secondary">No generator selected</p>';
            return;
        }
        
        const generator = this.engine.loadedGenerators.get(generatorName);
        if (!generator) {
            container.innerHTML = '<p class="text-secondary">Generator not found</p>';
            return;
        }
        
        const variables = this.engine.getCurrentVariables();
        const variableConfigs = generator.variables || {};
        const lockable = ['preacher_name', 'platforms', 'mediaContexts', 'divine_title'];
        this.engine.lockedValues = this.engine.lockedValues || {};
        
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
            const locked = this.engine.lockedValues[name] !== undefined;
            html += `
                <tr>
                    <td class="variable-name">${name}</td>
                    <td class="variable-type">${config.type || 'unknown'}</td>
                    <td class="variable-value">${locked ? this.engine.lockedValues[name] : value}</td>
                    <td>${config.description || 'No description'}</td>
                    <td>${isLockable ? `<button class="lock-btn" data-var="${name}">${locked ? '🔒' : '🔓'}</button>` : ''}</td>
                </tr>
            `;
        }
        
        html += '</tbody></table>';
        container.innerHTML = html;

        // Attach lock button listeners
        container.querySelectorAll('.lock-btn').forEach(btn => {
            btn.onclick = (e) => {
                const varName = btn.getAttribute('data-var');
                if (this.engine.lockedValues[varName] !== undefined) {
                    delete this.engine.lockedValues[varName];
                } else {
                    this.engine.lockedValues[varName] = variables[varName];
                }
                this.updateVariablesDisplay();
            };
        });
    }

    updateGeneratorStructure() {
        const container = document.getElementById('generator-structure');
        
        if (!this.currentGeneratorId) {
            container.innerHTML = '<p class="text-secondary">Select a generator to view its structure</p>';
            return;
        }

        const generator = this.engine.loadedGenerators.get(this.currentGeneratorId);
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

    updateVariablesDisplay() {
        // Also update advanced modal if open
        const advModal = document.getElementById('advanced-modal');
        if (advModal && advModal.style.display !== 'none') {
            this.syncAdvancedModal();
        }

        const container = document.getElementById('variables-table');
        
        if (!this.currentGeneratorId) {
            container.innerHTML = '<p class="text-secondary">Select a generator to view variables</p>';
            return;
        }
        
        // Get variables from the engine and display them
        const variables = this.engine.getCurrentVariables();
        let html = '<table class="table table-striped">';
        html += '<thead><tr><th>Variable</th><th>Value</th></tr></thead>';
        html += '<tbody>';
        
        for (const [key, value] of Object.entries(variables)) {
            html += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
        
        html += '</tbody></table>';
        container.innerHTML = html;
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
            this.updateGeneratorStructure();
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RandomizerApp();
});