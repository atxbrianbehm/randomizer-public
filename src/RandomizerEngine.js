export default class RandomizerEngine {
    constructor() {
        this.loadedGenerators = new Map();
        this.variables = new Map();
        this.assets = new Map();
        this._seed = null;
        this._prng = null;
        this.currentGenerator = null; // Track the current generator name
        // Built-in modifier functions (can be extended)
        this.modifiers = {
            capitalize: (txt) => txt.charAt(0).toUpperCase() + txt.slice(1),
            a_an: (txt) => {
                const first = txt.trim()[0]?.toLowerCase() || 'a';
                const vowel = ['a', 'e', 'i', 'o', 'u'].includes(first);
                return (vowel ? 'an ' : 'a ') + txt;
            },
            plural: (txt) => {
                if (txt.endsWith('s')) return txt; // naive
                if (txt.endsWith('y') && !/[aeiou]y$/i.test(txt)) {
                    return txt.slice(0, -1) + 'ies';
                }
                return txt + 's';
            }
        };
        // Map of locked grammar rule names to fixed values (set by UI)
        this.lockedValues = {};
    }

    /**
     * Select the current generator by name.
     * @param {string} name
     */
    selectGenerator(name) {
        if (!this.loadedGenerators.has(name)) {
            console.warn(`Generator '${name}' not found.`);
            this.currentGenerator = null;
        } else {
            this.currentGenerator = name;
            // Optionally log for debugging
            console.log(`Current generator set to '${name}'`);
        }
    }

    // Set the random seed (for reproducible generations)
    setSeed(seed) {
        this._seed = seed;
        this._prng = this._mulberry32(this._xfnv1a(seed));
    }

    // Get the current seed
    getSeed() {
        return this._seed;
    }

    // Mulberry32 PRNG (fast, good for UI)
    _mulberry32(a) {
        return function() {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    // xfnv1a hash (string to 32-bit int)
    _xfnv1a(str) {
        for(var i = 0, h = 2166136261 >>> 0; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        return h >>> 0;
    }

    // Load a generator bundle from JSON
    async loadGenerator(generatorData, bundleName = null, options = {}) {
        const { includeResolver } = options;
        try {
            const generator = typeof generatorData === 'string'
                ? JSON.parse(generatorData)
                : generatorData;

            // Validate the generator structure
            this.validateGenerator(generator);

            const name = bundleName || generator.metadata.name;

            // Process $include directives in grammar
            if (generator.grammar) {
                for (const ruleName in generator.grammar) {
                    const ruleContent = generator.grammar[ruleName];
                    if (typeof ruleContent === 'object' && ruleContent !== null && ruleContent.$include) {
                        const includePath = ruleContent.$include;
                        if (typeof includeResolver === 'function') {
                            try {
                                const includedData = includeResolver(includePath);
                                if (includedData) {
                                    generator.grammar[ruleName] = includedData;
                                } else {
                                    console.warn(`Include resolver returned no data for: ${includePath}`);
                                    generator.grammar[ruleName] = `[INCLUDE_ERROR: Resolver no data - ${includePath}]`;
                                }
                            } catch (e) {
                                console.warn(`Error in include resolver for path ${includePath}:`, e);
                                generator.grammar[ruleName] = `[INCLUDE_ERROR: Resolver failed - ${includePath}]`;
                            }
                        } else {
                            console.warn(`Found $include directive for "${includePath}" but no includeResolver function was provided.`);
                            generator.grammar[ruleName] = `[INCLUDE_ERROR: No resolver - ${includePath}]`;
                        }
                    }
                }
            }

            // Initialize variables
            if (generator.variables) {
                for (const [varName, varDef] of Object.entries(generator.variables)) {
                    this.variables.set(`${name}.${varName}`, varDef.default);
                }
            }

            // Load assets
            if (generator.assets) {
                this.assets.set(name, generator.assets);
            }

            // Store the generator
            this.loadedGenerators.set(name, generator);

            console.log(`Successfully loaded generator: ${name}`);
            return name;
        } catch (error) {
            console.error('Failed to load generator:', error);
            throw error;
        }
    }

    // Validate generator structure
    validateGenerator(generator) {
        if (!generator.metadata || !generator.metadata.name) {
            throw new Error('Generator must have metadata with name');
        }
        if (!generator.grammar) {
            throw new Error('Generator must have grammar rules');
        }
        if (!generator.entry_points || !generator.entry_points.default) {
            throw new Error('Generator must have entry_points with default');
        }
    }

    // Generate text from a loaded generator
    // If generatorName not provided, use currentGenerator if set
    /**
     * Generate prompt text (simple version – returns string only)
     */
    // Build a human-readable prompt from generated segments using _meta info
    /**
     * Build a human-readable prompt from generated segments.
     * Implements Phase-3 rules:
     *  – Sort chips by canonical slot order (overridable via metadata.slotOrder)
     *  – Insert connectors defined by the _meta of each rule.
     *  – If two adjacent chips share the same connector, join them with a comma.
     *  – If the first chip lacks a connector but a second exists, use the second’s connector.
     */
    buildReadablePrompt(generatorName, segments) {
        if (!segments || segments.length === 0) return '';

        // Ignore placeholder/root segments that lack metadata. These usually represent
        // top-level rules such as "origin" that already combine other segments and would
        // otherwise result in duplicate text (e.g. "cat in space cat in space").
        const segs = segments.filter((s) => s && s._meta);
        if (segs.length === 0) {
            // Nothing with metadata – fall back to simple join
            return segments.map((s) => s.text).join(' ');
        }
        // (moved above)

        const generator = this.loadedGenerators.get(generatorName);
        if (!generator) return segments.map((s) => s.text).join(' ');

        // Default canonical order (may be overridden per-generator)
        const defaultOrder = [
            'subject', 'condition', 'purpose', 'materials', 'colour', 'controls',
            'displays', 'lighting', 'markings', 'density', 'view'
        ];
        const slotOrder = generator.metadata?.slotOrder || defaultOrder;
        const orderMap = new Map(slotOrder.map((s, i) => [s, i]));

        // Enrich each segment with slot + connector info
        const enriched = segs.map((seg) => {
            const meta = seg._meta;
            return {
                text: seg.text,
                slot: meta?.slot ?? null,
                connector: meta?.connector ?? null,
                order: orderMap.has(meta?.slot) ? orderMap.get(meta.slot) : 999
            };
        });

        // Order by slot ranking
        enriched.sort((a, b) => a.order - b.order);

        let prompt = '';
        let lastUsedConnector = null; // Stores the connector that was actually used for the previous segment

        enriched.forEach((item, idx) => {
            if (idx === 0) {
                prompt += item.text;
                lastUsedConnector = item.connector; // Store the connector of the first item
                return;
            }

            let connectorToAdd = '';

            // Rule: If current item's connector is the same as the last used connector, join with comma
            if (item.connector && lastUsedConnector && item.connector === lastUsedConnector) {
                connectorToAdd = ', ';
            } else if (item.connector) {
                // If current item has a connector, use it (with proper spacing)
                connectorToAdd = item.connector.startsWith(' ') ? item.connector : ' ' + item.connector + ' ';
            } else {
                // If current item has no connector, just add a space
                connectorToAdd = ' ';
            }

            prompt += connectorToAdd + item.text;
            lastUsedConnector = item.connector; // Update lastUsedConnector for the next iteration
        });

        return prompt.trim();
    }

    _generateFromTarget(generator, target, context) {
        if (!generator.targeting || !generator.targeting[target]) {
            throw new Error(`Target '${target}' not found in generator '${generator.metadata.name}'`);
        }

        const template = generator.targeting[target].template;
        const placeholders = [...template.matchAll(/#([a-zA-Z_][a-zA-Z0-9_]*)#/g)];

        const expandedValues = {};
        for (const match of placeholders) {
            const ruleName = match[1];
            if (!expandedValues[ruleName]) {
                expandedValues[ruleName] = this.expandRule(generator, ruleName, context);
            }
        }

        // Apply parameter mapping if available
        const parameterMap = generator.targeting[target].parameterMap;
        if (parameterMap) {
            for (const ruleName in parameterMap) {
                if (expandedValues[ruleName] !== undefined && parameterMap[ruleName][expandedValues[ruleName]] !== undefined) {
                    expandedValues[ruleName] = parameterMap[ruleName][expandedValues[ruleName]];
                }
            }
        }

        let result = template;
        for (const [ruleName, value] of Object.entries(expandedValues)) {
            result = result.replace(new RegExp(`#${ruleName}#`, 'g'), value);
        }

        return result;
    }

    generate(generatorName = null, options = {}) {
        const { entryPoint = null, context = {}, target = null } = options;
        const nameToUse = generatorName || this.currentGenerator;
        if (!nameToUse) {
            throw new Error('No generator selected.');
        }
        const generator = this.loadedGenerators.get(nameToUse);
        if (!generator) {
            throw new Error(`Generator '${nameToUse}' not found`);
        }

        const generationContext = {
            ...context,
            generatorName: nameToUse,
            variables: this.getVariablesForGenerator(nameToUse),
            segments: context.segments || [] // Ensure segments is always an array
        };

        if (target) {
            return this._generateFromTarget(generator, target, generationContext);
        }

        const startRule = entryPoint || generator.entry_points.default;

        // If startRule is a string with placeholders, process it as text
        if (typeof startRule === 'string' && startRule.includes('#')) {
            return this.processText(startRule, generationContext);
        } else {
            // Otherwise, treat it as a rule name
            return this.expandRule(generator, startRule, generationContext);
        }
    }

    /**
     * Detailed generation – returns { text, segments }
     * segments: ordered array of { key, text } entries used when building the prompt.
     */
    generateDetailed(generatorName = null, options = {}) {
        const { entryPoint = null, context = {} } = options;
        const nameToUse = generatorName || this.currentGenerator;
        if (!nameToUse) {
            throw new Error('No generator selected.');
        }
        const generator = this.loadedGenerators.get(nameToUse);
        if (!generator) {
            throw new Error(`Generator '${nameToUse}' not found`);
        }
        const startRule = entryPoint || generator.entry_points.default;
        const generationContext = {
            ...context,
            generatorName: nameToUse,
            variables: this.getVariablesForGenerator(nameToUse),
            segments: [] // collect token info here
        };
        // Expand the primary rule first
        const text = this.expandRule(generator, startRule, generationContext);

        // If caller did not explicitly request an entryPoint and the generator defines a slotOrder,
        // automatically expand any additional grammar rules found in slotOrder so that the
        // resulting `readable` prompt can incorporate all chips (e.g., subject + condition + purpose).
        if (!entryPoint && Array.isArray(generator.metadata?.slotOrder)) {
            for (const slot of generator.metadata.slotOrder) {
                if (slot === startRule) continue; // already expanded
                if (generator.grammar[slot] && !generationContext.segments.some(s => s.key === slot)) {
                    // Expand but ignore returned text – we're only interested in segments for readable prompt
                    this.expandRule(generator, slot, generationContext);
                }
            }
        }
        const readable = this.buildReadablePrompt(nameToUse, generationContext.segments);
        return { raw: text, readable, segments: generationContext.segments };
    
    }

    // Core rule expansion logic
    expandRule(generator, ruleName, context) {
        // If this rule is locked, immediately return the locked value
        if (this.lockedValues && Object.prototype.hasOwnProperty.call(this.lockedValues, ruleName)) {
            return this.lockedValues[ruleName];
        }
        const rule = generator.grammar[ruleName];
        if (!rule) {
            return `[MISSING RULE: ${ruleName}]`;
        }

        let expandedText;
        let segmentIndex = -1;

        // If segments array is available, add a placeholder segment for this rule
        if (Array.isArray(context.segments)) {
            const meta = (Array.isArray(rule) && rule[0]?._meta) ? rule[0]._meta : (rule && typeof rule === 'object' && rule._meta) ? rule._meta : null;
            segmentIndex = context.segments.length;
            context.segments.push({ key: ruleName, text: '', _meta: meta });
        }

        if (Array.isArray(rule)) {
            // Simple array of options
            expandedText = this.selectFromArray(rule, context);
        } else if (typeof rule === 'string') {
            // Plain text with potential nested tokens
            expandedText = this.processText(rule, context);
        } else if (rule && typeof rule === 'object' && rule.type) {
            // Complex rule with explicit type field
            expandedText = this.processComplexRule(generator, rule, context);
        } else {
            expandedText = '[INVALID RULE FORMAT]';
        }

        // Update the text of the segment after expansion
        if (segmentIndex !== -1) {
            context.segments[segmentIndex].text = expandedText;
        }

        return expandedText;
    }

    // Select from array (with optional weights)
    selectFromArray(options, context) {
        const weightedOptions = [];
        let totalWeight = 0;

        for (const option of options) {
            if (typeof option === 'string') {
                weightedOptions.push({ text: option, weight: 1 });
                totalWeight += 1;
            } else if (option.text || option.value) {
                const textVal = option.text || option.value;
                const weight = option.weight || 1;
                if (this.checkConditions(option.conditions, context)) {
                    weightedOptions.push({ ...option, text: textVal, weight });
                    totalWeight += weight;
                }
            }
        }

        if (weightedOptions.length === 0) {
            return '[NO VALID OPTIONS]';
        }

        // Weighted random selection
        let random = this._prng ? this._prng() * totalWeight : Math.random() * totalWeight;
        for (const option of weightedOptions) {
            random -= option.weight;
            if (random <= 0) {
                this.executeActions(option.actions, context);
                return this.processText(option.text, context);
            }
        }

        return weightedOptions[0].text;
    }

    // Process complex rules
    processComplexRule(generator, rule, context) {
        switch (rule.type) {
            case 'weighted':
                return this.processWeightedRule(generator, rule, context);
            case 'conditional':
                return this.processConditionalRule(generator, rule, context);
            case 'sequential':
                return this.processSequentialRule(generator, rule, context);
            case 'markov':
                return this.processMarkovRule(generator, rule, context);
            default:
                return `[UNKNOWN RULE TYPE: ${rule.type}]`;
        }
    }

    // Process weighted rules
    processWeightedRule(generator, rule, context) {
        const options = rule.options;
        const weights = rule.weights || options.map(() => 1);

        let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = this._prng ? this._prng() * totalWeight : Math.random() * totalWeight;

        for (let i = 0; i < options.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return this.processText(options[i], context);
            }
        }

        return this.processText(options[0], context);
    }

    // Process conditional rules
    processConditionalRule(generator, rule, context) {
        for (const option of rule.options) {
            if (this.checkConditions(option.conditions, context)) {
                this.executeActions(option.actions, context);
                return this.processText(option.text, context);
            }
        }

        return rule.fallback ? this.processText(rule.fallback, context) : '[NO CONDITIONS MET]';
    }

    // Process sequential rules
    processSequentialRule(generator, rule, context) {
        let finalResult = '';
        for (let i = 0; i < rule.options.length; i++) {
            const option = rule.options[i];
            let textToProcess;
            let joiner = ' '; // Default joiner

            if (typeof option === 'string') {
                textToProcess = option;
            } else if (typeof option === 'object' && option.text !== undefined) {
                textToProcess = option.text;
                if (option.joiner !== undefined) {
                    joiner = option.joiner;
                }
            } else {
                // Handle invalid option format, though validation should ideally catch this
                textToProcess = '[INVALID SEQUENTIAL OPTION]';
            }

            finalResult += this.processText(textToProcess, context);

            // Add joiner if it's not the last option
            if (i < rule.options.length - 1) {
                finalResult += joiner;
            }
        }
        return finalResult;
    }

    // Process Markov chain rules
    processMarkovRule(generator, rule, context) {
        // Simplified Markov implementation
        return this.selectFromArray(rule.options, context);
    }

    // Register a custom modifier
    registerModifier(name, fn) {
        this.modifiers[name] = fn;
    }

    // Apply modifier chain to text
    applyModifiers(text, mods) {
        let result = text;
        for (const m of mods) {
            const fn = this.modifiers[m];
            if (fn) {
                result = fn(result);
            }
        }
        return result;
    }

    // Process text with variable substitution and rule expansion
    processText(text, context) {
        if (!text) return '';

        // Rule and modifier regex: #ruleName.mod1.mod2#
        const rule_modifier_regex = /#([a-zA-Z_][a-zA-Z0-9_]*)(?:\.([a-zA-Z0-9_.]+))?#/g;

        // First expand rules and apply modifiers
        text = text.replace(rule_modifier_regex, (match, ruleName, modsStr) => {
            const generator = this.loadedGenerators.get(context.generatorName);
            let expandedText = "";

            if (generator && generator.grammar[ruleName]) {
                const ruleObj = generator.grammar[ruleName];
                const meta = (Array.isArray(ruleObj) && ruleObj[0]?._meta) ? ruleObj[0]._meta : (ruleObj && typeof ruleObj === 'object' && ruleObj._meta) ? ruleObj._meta : null;
                expandedText = this.expandRule(generator, ruleName, context);
            } else {
                // If ruleName is not in grammar, it might be a variable.
                // So, we don't return match yet, let variable substitution handle it.
                // However, if modifiers were present, they are lost, which is intended.
                return match; // Keep original if not a rule
            }

            if (modsStr) {
                const modifierNames = modsStr.split('.');
                for (const modName of modifierNames) {
                    const fn = this.modifiers[modName];
                    if (fn) {
                        try {
                            expandedText = fn(expandedText);
                        } catch (e) {
                            console.warn(`Error applying modifier '${modName}' to text '${expandedText}':`, e);
                            // Keep text as is before modifier error
                        }
                    } else {
                        console.warn(`Warning: Modifier '${modName}' not found.`);
                    }
                }
            }
            return expandedText;
        });

        // Then variable substitution on any remaining placeholders (e.g. #varName# without modifiers)
        // This regex should not conflict with the rule_modifier_regex because rules are processed first.
        const variable_regex = /#([a-zA-Z_][a-zA-Z0-9_]*)#/g;
        text = text.replace(variable_regex, (match, varName) => {
            // Check if it was already processed as a rule; if so, it won't be a simple #varName# anymore.
            // This check is somewhat implicit: if it still matches '#varName#', it wasn't a rule.

            const fullVarName = `${context.generatorName}.${varName}`;
            let value = context.variables[varName]; // Check context specific vars first
            if (value === undefined) {
                 value = this.variables.get(fullVarName); // Check global engine vars
            }

            return value !== undefined ? value : match; // Keep original if not found
        });

        return text;
    }

    // Check conditions
    checkConditions(conditions, context) {
        if (!conditions) return true;

        for (const [key, value] of Object.entries(conditions)) {
            if (key === '$and') {
                if (!value.every(cond => this.checkConditions(cond, context))) {
                    return false;
                }
            } else if (key === '$or') {
                if (!value.some(cond => this.checkConditions(cond, context))) {
                    return false;
                }
            } else if (key === '$not') {
                if (this.checkConditions(value, context)) {
                    return false;
                }
            } else {
                const varName = key;
                const condition = value;
                const varValue = context.variables[varName] || this.variables.get(`${context.generatorName}.${varName}`);

                if (condition.$lt !== undefined && varValue >= condition.$lt) return false;
                if (condition.$gt !== undefined && varValue <= condition.$gt) return false;
                if (condition.$eq !== undefined && varValue !== condition.$eq) return false;
                if (condition.$gte !== undefined && varValue < condition.$gte) return false;
                if (condition.$lte !== undefined && varValue > condition.$lte) return false;
            }
        }

        return true;
    }

    // Execute actions
    executeActions(actions, context) {
        if (!actions) return;

        if (actions.set) {
            for (const [varName, value] of Object.entries(actions.set)) {
                if (typeof value === 'object' && value.$multiply) {
                    const currentValue = context.variables[varName] || this.variables.get(`${context.generatorName}.${varName}`) || 0;
                    this.variables.set(`${context.generatorName}.${varName}`, currentValue * value.$multiply);
                } else {
                    this.variables.set(`${context.generatorName}.${varName}`, value);
                }
            }
        }

        if (actions.increment) {
            for (const [varName, amount] of Object.entries(actions.increment)) {
                const currentValue = context.variables[varName] || this.variables.get(`${context.generatorName}.${varName}`) || 0;
                this.variables.set(`${context.generatorName}.${varName}`, currentValue + amount);
            }
        }
    }

    // Get variables for a specific generator
    getVariablesForGenerator(generatorName) {
        const result = {};
        for (const [fullName, value] of this.variables.entries()) {
            if (fullName.startsWith(`${generatorName}.`)) {
                const varName = fullName.substring(generatorName.length + 1);
                result[varName] = value;
            }
        }
        return result;
    }

    /**
     * Return array of variable keys explicitly declared in generator.variables
     * @param {string} generatorName
     * @returns {string[]}
     */
    getAllVariableKeys(generatorName) {
        const gen = this.loadedGenerators.get(generatorName);
        if (!gen || !gen.variables) return [];
        return Object.keys(gen.variables);
    }

    // List all loaded generators
    listGenerators() {
        return Array.from(this.loadedGenerators.keys());
    }
    
    // Get all variables for the current generator
    getCurrentVariables() {
        if (!this.currentGenerator) {
            return {};
        }
        return this.getVariablesForGenerator(this.currentGenerator);
    }

    // Determine lockable grammar rules based on array structure
    /**
     * Return an array of grammar keys that qualify as lockable for UI.
     * A rule is lockable if its value is:
     *  - An array of strings, or
     *  - An array of objects each with a `value` *or* `text` property (label/value pairs)
     * This mirrors the guidelines documented in LLM_Content_Development_Guide.md.
     * The host app may further filter or convert this list to include multi-select designations.
     * @param {string} generatorName
     * @returns {string[]} list of lockable rule names
     */
    getLockableRules(generatorName) {
        const name = generatorName || this.currentGenerator;
        if (!name) return [];
        const generator = this.loadedGenerators.get(name);
        if (!generator || !generator.grammar) return [];

        const uiConfig = generator.uiConfig || {};
        const explicitLockable = uiConfig.lockable || null; // optional whitelist/blacklist arrays
        const blacklist = uiConfig.lockableExclude || [];

        const result = [];
        for (const [key, rule] of Object.entries(generator.grammar)) {
            if (explicitLockable && !explicitLockable.includes(key)) continue; // whitelist mode
            if (blacklist.includes(key)) continue;
            if (this._isRuleLockable(rule)) {
                result.push(key);
            }
        }
        return result;
    }

    /**
     * Internal helper to test whether a grammar rule fits lockable criteria.
     * @param {*} rule
     * @returns {boolean}
     */
    _isRuleLockable(rule) {
        if (!Array.isArray(rule) || rule.length === 0) return false;

        // Skip leading _meta-only objects which are used for rule metadata.
        let idx = 0;
        while (idx < rule.length) {
            const item = rule[idx];
            if (typeof item === 'object' && Object.keys(item).length === 1 && item._meta) {
                idx += 1;
                continue; // Ignore pure _meta objects
            }
            // Found first substantive option – evaluate it
            if (typeof item === 'string') return true;
            if (typeof item === 'object' && (item.value !== undefined || item.text !== undefined)) return true;
            break;
        }
        return false;
    }

    // Get generator metadata
    getGeneratorInfo(generatorName) {
        const generator = this.loadedGenerators.get(generatorName);
        return generator ? generator.metadata : null;
    }

    // Remove a generator
    unloadGenerator(generatorName) {
        this.loadedGenerators.delete(generatorName);

        // Clean up variables
        for (const [fullName] of this.variables.entries()) {
            if (fullName.startsWith(`${generatorName}.`)) {
                this.variables.delete(fullName);
            }
        }

        // Clean up assets
        this.assets.delete(generatorName);
    }
}

