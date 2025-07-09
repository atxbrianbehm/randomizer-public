// Simple logger utility that respects Vite mode.
// In production build (`vite build`), all logger calls become no-ops via tree-shaking.

let _isDev = import.meta.env?.MODE !== 'production';

export function __setDev(value) {
  _isDev = value;
}

export function log(...args) {
  if (_isDev) console.log('[LOG]', ...args);
}

export function warn(...args) {
  if (_isDev) console.warn('[WARN]', ...args);
}

export function error(...args) {
  if (_isDev) console.error('[ERROR]', ...args);
}
