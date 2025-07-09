// Shared include-resolution utilities for generator loading.
// Extracted from src/services/generatorLoader.js (2025-07-08).

/**
 * Derive a base path for resolving relative $include files.
 * Example: "/televangelist_generator.json" → "/televangelist_generator/"
 * @param {string} url Absolute URL (leading slash) of the root generator JSON.
 * @returns {string} Base directory path always ending with `/`.
 */
export function deriveBasePath(url) {
  const trimmed = url.startsWith('/') ? url.slice(1) : url;
  const baseName = trimmed.replace(/\.json$/i, '');
  return `/${baseName}/`;
}

/**
 * Recursively resolve any objects/arrays that contain {"$include": "file.json"} directives.
 * Supports the two-element array pattern [{_meta: ...}, {$include: ...}].
 * Detects circular references via a visited-path Set and aborts that branch gracefully.
 * @param {*} node Current JSON node (object, array, primitive).
 * @param {string} basePath Directory prefix for relative include files.
 * @param {Set<string>} [visited] Internal accumulator of already-visited paths.
 * @param {number} [depth] Current recursion depth used for an optional hard cap.
 * @returns {Promise<*>} The same structure with includes inlined.
 */
export async function resolveIncludes(node, basePath = '/', visited = new Set(), depth = 0) {
  const MAX_DEPTH = 20;
  if (depth > MAX_DEPTH) {
    console.error('[resolveIncludes] Max include depth exceeded');
    return node;
  }

  // Helper to resolve a sub-node with incremented depth
  const sub = (n) => resolveIncludes(n, basePath, visited, depth + 1);

  if (Array.isArray(node)) {
    const out = [];
    for (let i = 0; i < node.length; i++) {
      const cur = node[i];
      const next = node[i + 1];
      if (cur && typeof cur === 'object' && cur._meta && next && typeof next === 'object' && next.$include) {
        // [_meta, $include] pattern
        const includePath = toAbsolute(next.$include);
        const resolvedArr = await fetchAndResolve(includePath, basePath, visited, depth + 1, next);
        out.push(cur, ...resolvedArr);
        i++; // skip next item
      } else {
        out.push(await sub(cur));
      }
    }
    return out;
  }

  if (node && typeof node === 'object') {
    if (Object.prototype.hasOwnProperty.call(node, '$include')) {
      const includePath = toAbsolute(node.$include);
      const resolved = await fetchAndResolve(includePath, basePath, visited, depth + 1, node);
      if (node._meta) {
        if (Array.isArray(resolved)) return [{ _meta: node._meta }, ...resolved];
        return { _meta: node._meta, ...resolved };
      }
      return resolved;
    }

    const outObj = {};
    for (const [k, v] of Object.entries(node)) outObj[k] = await sub(v);
    return outObj;
  }

  return node; // primitive
}

// --- helpers -------------------------------------------------------------

function toAbsolute(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

async function fetchAndResolve(includePath, basePath, visited, depth, originalNode) {
  if (visited.has(includePath)) {
    console.error(`[resolveIncludes] Circular include detected for ${includePath}`);
    return originalNode ?? { $include: includePath };
  }
  visited.add(includePath);
  try {
    const resp = await fetch(includePath);
    if (!resp.ok) throw new Error(`fetch ${includePath} → ${resp.status}`);
    const json = await resp.json();
    return await resolveIncludes(json, basePath, visited, depth);
  } catch (e) {
    console.error('[resolveIncludes] failed', includePath, e);
    return originalNode ?? { $include: includePath };
  }
}
