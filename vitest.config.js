import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    exclude: ['tests/helpers/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['tests/**/*.js'],
    coverage: {
      all: false,
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'src/constants.js',
        'src/core/**',
        'src/ui/advancedModal.js',
        'src/RandomizerEngine.js',
        'src/ui/expansionTree.js',
        'src/ui/promptEditorModal.js',
        'src/ui/virtualTree.js',
        'src/ui/init.js',
        'src/ui/theme.js',
        'src/services/variableLocks.js',
        'src/config/**',
        'src/services/textGenerator.js',
        'src/services/persistence.js',
        'randomizer-generator-lab/**',
        'scripts/metadataLinter.js',
        'src/ui/state.js',
        'src/main.js',
        '**/src/ui/events.js',
        '**/src/ui/expansionTree.js',
        '**/src/ui/promptEditorModal.js',
        '**/src/ui/virtualTree.js',
        '**/src/ui/init.js',
        '**/src/ui/theme.js',
        '**/src/ui/state.js',
        '**/src/ui/advancedModal.js',
        '**/src/RandomizerEngine.js',
        '**/scripts/metadataLinter.js'
      ],
      threshold: {
        statements: 90,
        lines: 90,
        functions: 90,
        branches: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});