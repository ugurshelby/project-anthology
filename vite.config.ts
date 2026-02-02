import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Environment validation (production only)
    if (mode === 'production') {
      // Optional: Validate required environment variables
      // const requiredVars = ['VITE_SENTRY_DSN']; // Example: make Sentry required
      // requiredVars.forEach((varName) => {
      //   if (!env[varName]) {
      //     console.warn(`Warning: ${varName} is not set. Some features may not work.`);
      //   }
      // });
    }
    
    return {
      root: __dirname,
      publicDir: 'public',
      appType: 'spa',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
            timeout: 15000,
          },
        },
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
            timeout: 15000,
          },
        },
      },
      plugins: [
        react(),
        ViteImageOptimizer({
          png: {
            quality: 80
          },
          jpeg: {
            quality: 80
          },
          webp: {
            quality: 80
          },
          avif: {
            quality: 80
          },
          svg: {
            multipass: true
          },
          includePublic: true
        }),
        VitePWA({
          registerType: 'autoUpdate',
          outDir: 'dist',
          includeAssets: ['images/favicon.ico', 'images/favicon.svg', 'images/logo.png'],
          manifest: {
            name: 'Project Anthology: The F1 Narrative',
            short_name: 'Anthology',
            description: 'A cinematic, editorial exploration of Formula 1 history',
            theme_color: '#ff1801',
            background_color: '#0a0a0a',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              { src: '/images/favicon.ico', sizes: '48x48', type: 'image/x-icon', purpose: 'any' },
              { src: '/images/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
            ],
            categories: ['entertainment', 'sports', 'news'],
            lang: 'en',
            dir: 'ltr',
            prefer_related_applications: false
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,woff,woff2,ttf}'],
            runtimeCaching: [
              { urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'cloudinary-images', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } } },
              { urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp|avif|svg)$/i, handler: 'CacheFirst', options: { cacheName: 'external-images', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 } } },
              { urlPattern: /^https:\/\/api\.allorigins\.win\/.*/i, handler: 'NetworkFirst', options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, networkTimeoutSeconds: 10 } },
              { urlPattern: /\/api\/news/i, handler: 'NetworkFirst', options: { cacheName: 'news-api', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 6 }, networkTimeoutSeconds: 10 } }
            ],
            skipWaiting: true,
            clientsClaim: true,
            cleanupOutdatedCaches: true
          },
          devOptions: { enabled: false, type: 'module' }
        })
      ],
      resolve: {
        alias: {
          react: path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
          '@': path.resolve(__dirname, '.'),
        },
        dedupe: ['react', 'react-dom'],
        preserveSymlinks: true
      },
      optimizeDeps: {
        include: ['react', 'react-dom']
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Minification optimization
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production', // Remove console.log in production
            drop_debugger: true,
            pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
            passes: 3, // Multiple passes for better compression
            unsafe: true, // Enable unsafe optimizations
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            dead_code: true, // Remove dead code
            unused: true, // Remove unused variables
          },
          format: {
            comments: false, // Remove comments
            ecma: 2022, // Target modern ECMAScript
          },
          mangle: {
            safari10: false, // Don't mangle Safari 10 (not needed for modern browsers)
          },
        },
        // Source map strategy: minimal in production
        sourcemap: mode === 'production' ? false : true,
        // Chunk size optimization
        chunkSizeWarningLimit: 500, // Lower warning threshold for better optimization awareness
        // Report compressed size (gzip)
        reportCompressedSize: true,
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html'),
          output: {
            manualChunks: (id) => {
              // More aggressive code splitting
              if (id.includes('node_modules')) {
                // Vendor chunks - split by library for better caching
                if (id.includes('framer-motion')) {
                  return 'framer-vendor';
                }
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'react-vendor';
                }
                if (id.includes('@sentry')) {
                  return 'sentry-vendor';
                }
                if (id.includes('dompurify')) {
                  return 'dompurify-vendor';
                }
                if (id.includes('@fontsource')) {
                  return 'fonts-vendor';
                }
                if (id.includes('@vercel')) {
                  return 'vercel-vendor';
                }
                // Other vendor libraries
                return 'vendor';
              }
              // Route-based splitting for better code splitting
              if (id.includes('components/StoryModal') || id.includes('data/storyContent')) {
                return 'story-modal';
              }
              if (id.includes('components/Gallery')) {
                return 'gallery';
              }
              if (id.includes('components/Timeline')) {
                return 'timeline';
              }
              if (id.includes('components/News') || id.includes('utils/newsService')) {
                return 'news';
              }
              // Utils splitting
              if (id.includes('utils/') && !id.includes('utils/newsService')) {
                // Group small utils together
                return 'utils';
              }
            },
            // Optimize chunk file names
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name?.split('.') || [];
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
                return 'assets/images/[name]-[hash].[ext]';
              }
              if (/woff2?|eot|ttf|otf/i.test(ext)) {
                return 'assets/fonts/[name]-[hash].[ext]';
              }
              return 'assets/[ext]/[name]-[hash].[ext]';
            },
          },
        },
        // Target modern browsers for smaller bundles
        target: 'es2022',
        // CSS code splitting
        cssCodeSplit: true,
        // Reduce asset inline limit (smaller files inline, larger files separate)
        assetsInlineLimit: 4096, // 4KB
      }
    };
  });
