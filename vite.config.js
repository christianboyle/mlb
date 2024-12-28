import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3456,
    proxy: {
      '/api': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Origin': 'https://www.espn.com'
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  css: {
    postcss: './postcss.config.js'
  }
}); 