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
// Derive a base path (directory) for resolving $include files based on the URL of
// the main generator bundle.
// With Vite we declare `publicDir: 'generators'`, which means every file inside
// that folder is served at the site root with the `generators/` prefix stripped.
// Therefore:
//   '/televangelist_generator.json' (served from generators/)  → base '/televangelist_generator/'
// so that $include paths like `platforms.json` will be resolved to
//   '/televangelist_generator/platforms.json'
export function deriveBasePath(url) {
  const trimmed = url.startsWith('/') ? url.slice(1) : url;
  const baseName = trimmed.replace(/\.json$/i, '');
  // Files in the publicDir are served at site root, so the directory containing
  // foo_generator.json will be available at /foo_generator/.
  // Therefore strip the .json and add a trailing slash only.
  return `/${baseName}/`;
}

// Recursively walk a generator spec and inline any objects of the form
// { "$include": "foo.json", ... } by fetching the referenced JSON from the
// given basePath and merging it (preserving optional _meta).
export async function resolveIncludes(node, basePath, visited = new Set()) {
  if (Array.isArray(node)) {
    const newArray = [];
    for (let i = 0; i < node.length; i++) {
      const currentItem = node[i];
      const nextItem = node[i + 1];

      // Check for the [{_meta: ...}, {$include: ...}] pattern
      if (
        currentItem && typeof currentItem === 'object' && currentItem._meta &&
        nextItem && typeof nextItem === 'object' && nextItem.$include
      ) {
        const metaObj = currentItem;
        const includeObj = nextItem;
        const includePath = includeObj['$include'].startsWith('/')
          ? includeObj['$include']
          : `/${includeObj['$include']}`; // Ensure leading slash

        try {
          const resp = await fetch(includePath);
          if (!resp.ok) throw new Error(`fetch ${includePath} → ${resp.status} for ${includePath}`);
          const includedJson = await resp.json();
          if (visited.has(includePath)) {
            console.error(`[resolveIncludes] Circular include detected for ${includePath}`);
            newArray.push(currentItem);
            newArray.push(includeObj);
            i++;
            continue;
          }
          visited.add(includePath);
          const resolvedIncludedContent = await resolveIncludes(includedJson, basePath, visited);

          newArray.push(metaObj); // Push the _meta object
          if (Array.isArray(resolvedIncludedContent)) {
            newArray.push(...resolvedIncludedContent); // Spread if it's an array
          } else {
            newArray.push(resolvedIncludedContent); // Push as single item
          }
          i++; // Increment i to skip the nextItem (the $include object) as it has been processed
        } catch (e) {
          console.error(`[resolveIncludes] Failed to process $include with _meta for ${includePath}:`, e);
          newArray.push(currentItem); // Push current item (meta) on error
          newArray.push(nextItem);    // Push next item (include) on error
          i++; // Still increment, as we've considered both
        }
      } else {
        // For all other items, or standalone $include objects, resolve normally.
        // An $include object not preceded by _meta will be handled by the object recursion part if it's standalone,
        // or by this recursive call if it's just an element in an array.
        newArray.push(await resolveIncludes(currentItem, basePath));
      }
    }
    return newArray;
  }

  if (node && typeof node === 'object') {
    // If the node itself is an include directive
    if (Object.prototype.hasOwnProperty.call(node, '$include')) {
      const includePath = node['$include'].startsWith('/')
        ? node['$include']
        : `/${node['$include']}`; // Ensure leading slash
      try {
        const resp = await fetch(includePath);
        if (!resp.ok) throw new Error(`fetch ${includePath} → ${resp.status}`);
        const includedJson = await resp.json();
        // Detect circular includes
        if (visited.has(includePath)) {
          console.error(`[resolveIncludes] Circular include detected for ${includePath}`);
          return node; // return original node to break the loop
        }
        visited.add(includePath);
        const resolvedIncluded = await resolveIncludes(includedJson, basePath, visited);
        // Preserve any _meta key that co-exists with the $include object.
        if (node._meta) {
          if (Array.isArray(resolvedIncluded)) {
            // Embed _meta at index 0 per existing pattern
            return [{ _meta: node._meta }, ...resolvedIncluded];
          }
          return { _meta: node._meta, ...resolvedIncluded };
        }
        return resolvedIncluded;
      } catch (e) {
        console.error('[resolveIncludes] failed', includePath, e);
        return node; // fallback to original node so generation can continue
      }
    }

    // Otherwise recurse into object properties
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = await resolveIncludes(value, basePath, visited);
    }
    return out;
  }

  // Primitive value – return as-is.
  return node;
}

export async function fetchGeneratorSpec(url) {
  try {
    console.log('[generatorLoader] fetching', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[generatorLoader] fetch failed', url, response.status);
      return null;
    }
    const spec = await response.json();

    // Inline any $include references before returning
    const basePath = deriveBasePath(url);
    const resolvedSpec = await resolveIncludes(spec, basePath);
    return resolvedSpec;
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
    '/satanic_panic_generator.json',
    '/deciduous_tree_generator.json',
    '/evergreen_tree_generator.json'
  ];
  return loadGenerators(engine, defaultFiles);
}
