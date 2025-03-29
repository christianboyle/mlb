import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3456;

// Enable CORS
app.use(cors());

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve data files
app.use('/data', express.static(path.join(__dirname, 'src', 'data')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 