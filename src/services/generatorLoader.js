// Service module responsible for loading JSON generator bundles into a RandomizerEngine instance.
// Keeping this logic separate keeps `RandomizerApp` cleaner and makes it reusable in tests.

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
    try {
      console.log('[generatorLoader] fetching', file);
      const response = await fetch(file);
      if (!response.ok) {
        console.error('[generatorLoader] fetch failed', file, response.status);
        continue;
      }
      const data = await response.json();
      const name = await engine.loadGenerator(data, data?.metadata?.name);
      loadedNames.push(name);
    } catch (err) {
      console.error('[generatorLoader] failed to load', file, err);
    }
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
