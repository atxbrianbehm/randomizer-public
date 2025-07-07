import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['tests/**/*.js'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        statements: 25,
        lines: 25,
        functions: 25,
        branches: 25
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});