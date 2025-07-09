/* Utility helpers to improve DX when working with generator bundles.
 * These are framework-agnostic and safe to tree-shake.
 */

// --- fetchJsonCached ----------------------------------------------------
// Very small in-memory cache for GET JSON requests during a session.
const _jsonCache = new Map();

/**
 * Fetch JSON with simple memoisation. On success, response JSON is cloned and cached.
 * Errors are never cached; they bubble so callers can handle/retry.
 * @param {string} url absolute path beginning with '/'
 * @param {number} [ttlMs] optional TTL in ms; default=Infinity (session-long)
 */
export async function fetchJsonCached(url, ttlMs = Infinity) {
  const now = Date.now();
  const cached = _jsonCache.get(url);
  if (cached && (now - cached.t) < cached.ttl) {
    // return deep clone to avoid accidental mutation
    return structuredClone(cached.data);
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${url} → ${resp.status}`);
  const json = await resp.json();
  _jsonCache.set(url, { data: json, t: now, ttl: ttlMs });
  return structuredClone(json);
}

export function clearJsonCache() {
  _jsonCache.clear();
}

// --- deepMergePreserveArrays -------------------------------------------
/**
 * Recursively merge source into target where objects are deep-merged and arrays
 * are replaced wholesale (no element merge). Returns a new object; does not mutate inputs.
 */
export function deepMergePreserveArrays(target, source) {
  if (Array.isArray(target) || Array.isArray(source)) {
    return structuredClone(source);
  }
  if (typeof target !== 'object' || target === null) return structuredClone(source);
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMergePreserveArrays(target[k] ?? {}, v);
    } else {
      out[k] = structuredClone(v);
    }
  }
  return out;
}

// --- slugify ------------------------------------------------------------
/**
 * Convert text to lower-case, alphanumeric-and-dashes slug.
 */
export function slugify(str) {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// --- randomPickWeighted --------------------------------------------------
/**
 * items: Array<{ value: any, weight: number }> (weight > 0)
 * returns value picked proportionally to weight.
 */
export function randomPickWeighted(items, rng = Math.random) {
  const sum = items.reduce((acc, it) => acc + it.weight, 0);
  const r = rng() * sum;
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r < acc) return it.value;
  }
  return items[items.length - 1].value; // fallback due to float error
}

// --- flattenIncludes ----------------------------------------------------
/**
 * Walks a (possibly unresolved) generator spec and returns a flat list of
 * all $include paths encountered, unique and in order of discovery.
 */
export function flattenIncludes(node, out = new Set()) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const cur = node[i];
      const next = node[i + 1];
      if (cur && cur._meta && next && next.$include) {
        out.add(next.$include);
        i++;
        flattenIncludes(cur, out);
      } else {
        flattenIncludes(cur, out);
      }
    }
    return out;
  }
  if (node && typeof node === 'object') {
    if (Object.prototype.hasOwnProperty.call(node, '$include')) {
      out.add(node.$include);
      return out;
    }
    for (const val of Object.values(node)) flattenIncludes(val, out);
  }
  return out;
}

// --- validateGeneratorSpec ---------------------------------------------
import Ajv from 'ajv';
import schema from '../schema/generator.json' assert { type: 'json' };
const ajv = new Ajv({ allErrors: true, strict: false });
const validateFn = ajv.compile(schema);

export function validateGeneratorSpec(spec) {
  const ok = validateFn(spec);
  return { ok, errors: ok ? [] : validateFn.errors };
}

// --- parseRulePlaceholders ---------------------------------------------
/**
 * Parses a grammar string and returns an array of tokens:
 * { type: 'text' | 'placeholder', value, min?, max? }
 * Handles forms: {foo}, {bar|2}, {baz|1-3}
 */
export function parseRulePlaceholders(str) {
  const tokens = [];
  let lastIndex = 0;
  const regex = /\{([^}|]+)(?:\|([0-9]+)(?:-([0-9]+))?)?}/g;
  let m;
  while ((m = regex.exec(str))) {
    if (m.index > lastIndex) {
      tokens.push({ type: 'text', value: str.slice(lastIndex, m.index) });
    }
    tokens.push({
      type: 'placeholder',
      value: m[1].trim(),
      min: m[2] ? Number(m[2]) : undefined,
      max: m[3] ? Number(m[3]) : m[2] ? Number(m[2]) : undefined
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < str.length) tokens.push({ type: 'text', value: str.slice(lastIndex) });
  return tokens;
}

// re-export deriveBasePath for convenience
export { deriveBasePath } from './resolveIncludes.js';
