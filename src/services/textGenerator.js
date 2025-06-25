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
