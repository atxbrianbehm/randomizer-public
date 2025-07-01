import '@/styles/randomizer.css';
import RandomizerApp from './core/RandomizerApp.js';

// Main entry for Vite – initializes the Randomizer application
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new RandomizerApp();
    });
}

// Re-export for other entry points (e.g., ui/init.js)
export { RandomizerApp };
