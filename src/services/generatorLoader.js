// Service module responsible for loading JSON generator bundles into a RandomizerEngine instance.
// New in v1.1: helper utilities `fetchGeneratorSpec` and `registerGenerator` extracted for easier
// unit-testing and reuse across the app.
// Keeping this logic separate keeps `RandomizerApp` cleaner and makes it reusable in tests.

/**
 * Fetches each JSON file, loads it into the provided RandomizerEngine, and returns
 * an array of generator names successfully registered.
 * @param {RandomizerEngine} engine The engine instance to load generators into.
 * @param {string[]} files List of file paths to fetch. Should begin with `/` so that Vite serves them from project root.
 * @returns {Promise<string[]>} names of loaded generators
 */
/**
 * Fetch a generator specification JSON from the given URL and return the parsed object.
 * Errors are caught and logged; `null` is returned in that case so callers can continue.
 * @param {string} url Absolute path (served by Vite) to a generator JSON file.
 * @returns {Promise<object|null>} Parsed spec or `null` on failure.
 */
export async function fetchGeneratorSpec(url) {
  try {
    console.log('[generatorLoader] fetching', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[generatorLoader] fetch failed', url, response.status);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error('[generatorLoader] fetch threw', url, err);
    return null;
  }
}

/**
 * Register a generator specification with an engine instance.
 * Any errors are caught and logged; `null` is returned on failure.
 * @param {RandomizerEngine} engine Engine instance
 * @param {object} spec Parsed generator JSON
 * @returns {Promise<string|null>} Name under which the generator was registered.
 */
export async function registerGenerator(engine, spec) {
  if (!spec) return null;
  try {
    const name = await engine.loadGenerator(spec, spec?.metadata?.name);
    return name;
  } catch (err) {
    console.error('[generatorLoader] register failed', spec?.metadata?.name, err);
    return null;
  }
}

/**
 * Fetches each JSON file, loads it into the provided RandomizerEngine, and returns
 * an array of generator names successfully registered.
 * @param {RandomizerEngine} engine The engine instance to load generators into.
 * @param {string[]} files List of file paths to fetch. Should begin with `/` so that Vite serves them from project root.
 * @returns {Promise<string[]>} names of loaded generators
 */
export async function loadGenerators(engine, files) {
  const loadedNames = [];

  for (const file of files) {
    const spec = await fetchGeneratorSpec(file);
    if (!spec) continue;

    const name = await registerGenerator(engine, spec);
    if (name) loadedNames.push(name);
  }

  return loadedNames;
}

/**
 * Convenience helper that loads the project’s two default generator bundles.
 * @param {RandomizerEngine} engine
 */
export async function loadDefaultGenerators(engine) {
  const defaultFiles = [
    '/televangelist_generator.json',
    '/satanic_panic_generator.json'
  ];
  return loadGenerators(engine, defaultFiles);
}
