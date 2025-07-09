import '@/styles/randomizer.css';
// eslint-disable-next-line import/no-named-as-default
import RandomizerApp from '@/core/RandomizerApp.js';

// Main entry for Vite – initializes the Randomizer application
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new RandomizerApp();
        // Expose for external scripts (e.g., Percy snapshot automation)
        window.__randomizerApp__ = app;
        if (location.hash === '#advanced-modal' && typeof app.showAdvancedModal === 'function') {
            // Wait for modal to mount, then open it
            setTimeout(() => app.showAdvancedModal(), 100);
        }
    });
}

// Re-export for other entry points (e.g., ui/init.js)
export { RandomizerApp };
