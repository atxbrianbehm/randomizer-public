// src/services/persistence.js
// Lightweight localStorage wrapper for persisting Randomizer app state.
// State shape (v1):
// {
//   version: 1,
//   generator: string,
//   lockedValues: { [rule: string]: any },
//   lastPrompt: { raw: string, readable: string },
//   theme: 'light' | 'dark',
//   seed: number | null
// }

const STORAGE_KEY = 'randomizer_state_v1';
const CURRENT_VERSION = 1;

/**
 * Save arbitrary state to localStorage.
 * @param {object} state - Plain JSON-serialisable object.
 */
export function saveState(state) {
  try {
    const payload = { version: CURRENT_VERSION, ...state };
    const json = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[persistence] save failed', err);
  }
}

/**
 * Load state from localStorage.
 * @returns {object|null} state object or null if not available/invalid
 */
export function loadState() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const data = JSON.parse(json);
    if (typeof data !== 'object' || data.version !== CURRENT_VERSION) return null;
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[persistence] load failed', err);
    return null;
  }
}

/**
 * Remove saved state from localStorage.
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[persistence] clear failed', err);
  }
}
