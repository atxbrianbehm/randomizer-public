// Simple theme toggle utility
// Flips the `data-color-scheme` attribute between "light" and "dark" on <html>
const STORAGE_KEY = 'randomizer-theme';

function updateToggleIcon() {
  const btn = document.getElementById('dark-mode-toggle');
  if (!btn) return;
  const scheme = document.documentElement.getAttribute('data-color-scheme');
  // Show the opposite icon to indicate the action
  if (scheme === 'dark') {
    btn.textContent = '☀️';
    btn.setAttribute('aria-label', 'Switch to light mode');
    btn.setAttribute('title', 'Switch to light mode');
  } else {
    btn.textContent = '🌙';
    btn.setAttribute('aria-label', 'Switch to dark mode');
    btn.setAttribute('title', 'Switch to dark mode');
  }
}

export function setTheme(mode) {
  const html = document.documentElement;
  html.setAttribute('data-color-scheme', mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (_) {
    /* ignore quota / privacy errors */
  }
  updateToggleIcon();
}

export function initTheme() {
  // Ensure toggle button exists before updating icon later
  // (removed unused 'ready' function to resolve ESLint warning)

  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    saved = null;
  }
  const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const initial = saved || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initial);
  // Wait for DOM ready to sync icon in case script loads in <head>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateToggleIcon);
  } else {
    updateToggleIcon();
  }
}

export function toggleTheme() {
    const html = document.documentElement;
  const current = html.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
    setTheme(current);
  // Icon updated inside setTheme
}
