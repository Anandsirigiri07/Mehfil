import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/engine/**/*.ts'],
      exclude: ['src/engine/index.ts', '**/*.d.ts', '**/*.test.ts', 'tests/**'],
      thresholds: {
        lines: 95,
        functions: 95,
        statements: 95,
        branches: 70,
      },
    },
  },
});
