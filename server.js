import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3456;

// Proxy ESPN API requests
app.use('/api', createProxyMiddleware({
  target: 'https://site.api.espn.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));

// Serve static files
app.use(express.static('dist'));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 