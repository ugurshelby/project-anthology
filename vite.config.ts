import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      publicDir: 'images',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/unsplash': {
            target: 'https://images.unsplash.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/unsplash/, ''),
            configure: (proxy) => {
              proxy.on('proxyRes', (proxyRes, req, res) => {
                const loc = proxyRes.headers['location'] as string | undefined;
                if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && loc) {
                  if (loc.startsWith('https://images.unsplash.com')) {
                    const url = new URL(loc);
                    const proxied = '/unsplash' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                }
              });
            }
          },
          '/commons': {
            target: 'https://commons.wikimedia.org',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/commons/, ''),
            configure: (proxy) => {
              proxy.on('proxyRes', (proxyRes, req, res) => {
                const loc = proxyRes.headers['location'] as string | undefined;
                if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && loc) {
                  if (loc.startsWith('https://commons.wikimedia.org')) {
                    const url = new URL(loc);
                    const proxied = '/commons' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                  if (loc.startsWith('https://upload.wikimedia.org')) {
                    const url = new URL(loc);
                    const proxied = '/upload' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                }
              });
            }
          },
          '/upload': {
            target: 'https://upload.wikimedia.org',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/upload/, '')
          }
        }
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/unsplash': {
            target: 'https://images.unsplash.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/unsplash/, ''),
            configure: (proxy) => {
              proxy.on('proxyRes', (proxyRes, req, res) => {
                const loc = proxyRes.headers['location'] as string | undefined;
                if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && loc) {
                  if (loc.startsWith('https://images.unsplash.com')) {
                    const url = new URL(loc);
                    const proxied = '/unsplash' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                }
              });
            }
          },
          '/commons': {
            target: 'https://commons.wikimedia.org',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/commons/, ''),
            configure: (proxy) => {
              proxy.on('proxyRes', (proxyRes, req, res) => {
                const loc = proxyRes.headers['location'] as string | undefined;
                if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && loc) {
                  if (loc.startsWith('https://commons.wikimedia.org')) {
                    const url = new URL(loc);
                    const proxied = '/commons' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                  if (loc.startsWith('https://upload.wikimedia.org')) {
                    const url = new URL(loc);
                    const proxied = '/upload' + url.pathname + (url.search || '');
                    proxyRes.headers['location'] = proxied;
                  }
                }
              });
            }
          },
          '/upload': {
            target: 'https://upload.wikimedia.org',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/upload/, '')
          }
        }
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
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
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
      }
    };
  });
