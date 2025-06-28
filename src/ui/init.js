// Bootstrap script to initialize the Randomizer application
// Kept separate so main.js only contains the class definition & core logic

import { RandomizerApp } from '../main.js';
import { initTheme } from '@/ui/theme.js';

// Initialise theme and instantiate the app once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
  initTheme();
    new RandomizerApp();
  });
} else {
  // Document already parsed
  initTheme();
  new RandomizerApp();
}
