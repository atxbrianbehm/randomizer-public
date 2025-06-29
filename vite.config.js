import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic Vite configuration for the Randomizer project.
// - Serves `index.html` at project root.
// - Treats `generators/` JSON files as static assets that will be copied to `dist/` during build.
// - Outputs production bundle to `dist/`.

export default defineConfig({

  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    open: true,
    port: 5173
  },
  publicDir: 'generators' // copy JSON generator bundles verbatim
});
