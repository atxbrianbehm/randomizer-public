// Simple logger utility that respects Vite mode.
// In production build (`vite build`), all logger calls become no-ops via tree-shaking.

const isDev = import.meta.env?.MODE !== 'production';

export function log(...args) {
  if (isDev) console.log('[LOG]', ...args);
}

export function warn(...args) {
  if (isDev) console.warn('[WARN]', ...args);
}

export function error(...args) {
  if (isDev) console.error('[ERROR]', ...args);
}
