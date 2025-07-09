// Dedicated helper to register a parsed generator spec with a RandomizerEngine instance.
// Keeping it in its own module makes it easier to unit-test and avoids circular deps.

/**
 * Register a generator specification with an engine instance.
 * Any errors are caught and logged; `null` is returned on failure (so upstream loading can continue).
 *
 * @param {import('../engine/RandomizerEngine.js').RandomizerEngine} engine RandomizerEngine instance
 * @param {object} spec Parsed generator JSON
 * @returns {Promise<string|null>} Name under which the generator was registered, or null on failure
 */
export async function registerGenerator(engine, spec) {
  if (!spec) return null;
  try {
    const name = await engine.loadGenerator(spec, spec?.metadata?.name);
    return name;
  } catch (err) {
    console.error('[registerGenerator] failed', spec?.metadata?.name, err);
    return null;
  }
}
