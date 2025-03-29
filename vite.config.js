import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Origin': 'https://www.espn.com'
        }
      },
      '/data': {
        target: 'http://localhost:3456',
        changeOrigin: true
      },
      '/mlb': {
        target: 'http://localhost:3456',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  css: {
    postcss: './postcss.config.js'
  }
}); 