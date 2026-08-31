import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests target pure lib logic (no DOM), so the default node environment is
// enough. The `@/` alias mirrors tsconfig so imports resolve identically.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    // Cold dynamic imports (cron routes, lib/data/f1 resetModules) can exceed 5s on Windows CI.
    testTimeout: 30_000,
  },
});
