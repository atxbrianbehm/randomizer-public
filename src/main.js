import { RandomizerApp } from '@/core/RandomizerApp.js';

// Main entry for Vite – initializes the Randomizer application
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new RandomizerApp();
    });
}
