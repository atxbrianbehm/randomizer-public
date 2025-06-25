// Simple theme toggle utility
// Flips the `data-color-scheme` attribute between "light" and "dark" on <html>
export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-color-scheme', current);
}
