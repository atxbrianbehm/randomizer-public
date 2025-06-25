// Bootstrap script to initialize the Randomizer application
// Kept separate so main.js only contains the class definition & core logic

import RandomizerApp from '../main.js';

// Instantiate the app once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RandomizerApp();
  });
} else {
  // Document already parsed
  new RandomizerApp();
}
