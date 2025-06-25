// Simple theme toggle utility
// Flips the `data-color-scheme` attribute between "light" and "dark" on <html>
const STORAGE_KEY = 'randomizer-theme';

export function setTheme(mode) {
  const html = document.documentElement;
  html.setAttribute('data-color-scheme', mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (_) {
    /* ignore quota / privacy errors */
  }
}

export function initTheme() {
  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    saved = null;
  }
  const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const initial = saved || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initial);
}

export function toggleTheme() {
    const html = document.documentElement;
  const current = html.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
    setTheme(current);
}
