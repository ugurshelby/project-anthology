import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/storyContent.ts',
        '**/storyMetadata.ts',
        '**/types.ts',
        '**/index.tsx',
        '**/index.html',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/tailwind.config.js',
        '**/postcss.config.js',
        '**/tsconfig.json',
        '**/vercel.json',
        '**/package.json',
        '**/package-lock.json',
        '**/README.md',
        '**/DESIGN_SYSTEM.md',
        '**/KRITIK_ANALIZ_VE_COZUM_RAPORU.md',
        '**/PROJE_ANALIZ.md',
        '**/IMAGE_INVENTORY.md',
        '**/stories.md',
        '**/scripts/**',
        '**/images/**',
        '**/api/**', // Serverless functions tested separately
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  }
});
