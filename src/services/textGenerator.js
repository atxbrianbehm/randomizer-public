// Thin wrapper around RandomizerEngine.generate so that UI code doesn't
// touch the engine implementation details directly.
// It also makes it easy to stub or mock in unit tests.

/**
 * Generate a single text output using the provided engine.
 * @param {RandomizerEngine} engine The RandomizerEngine instance.
 * @param {string|null} entryPoint Optional entry point; null lets engine pick default.
 * @returns {string}
 */
export function generateText(engine, entryPoint = null) {
  return engine.generate(null, entryPoint);
}

/**
 * Generate multiple outputs and return them in an array.
 * @param {RandomizerEngine} engine
 * @param {number} count How many outputs to produce (defaults to 1).
 * @param {string|null} entryPoint
 */
export function generateMany(engine, count = 1, entryPoint = null) {
  const outputs = [];
  for (let i = 0; i < count; i += 1) {
    outputs.push(generateText(engine, entryPoint));
  }
  return outputs;
}

/**
 * Generate multiple outputs and append them as <p> elements to the given container.
 * Each paragraph gets the class 'generated-text' and click-to-copy behaviour.
 * @param {RandomizerEngine} engine
 * @param {HTMLElement} container Parent element where <p> nodes are inserted (prepended).
 * @param {number} count How many outputs.
 * @param {string|null} entryPoint Entry point for the engine.
 * @returns {string[]} array of generated strings (last generated value is outputs[outputs.length-1])
 */
export function generateAndRender(engine, container, count = 1, entryPoint = null) {
  const results = [];
  for (let i = 0; i < count; i += 1) {
    const text = generateText(engine, entryPoint);
    results.push(text);
    if (container) {
      const p = document.createElement('p');
      p.textContent = text;
      p.className = 'generated-text';
      p.onclick = () => navigator.clipboard.writeText(text);
      container.insertBefore(p, container.firstChild);
    }
  }
  return results;
}
