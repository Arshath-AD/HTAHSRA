import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/database.js';
import urlRoutes from './routes/urlRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 7743;

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve screenshots as static files
const screenshotsPath = path.resolve(__dirname, '../data/screenshots');
app.use('/screenshots', express.static(screenshotsPath));

// API Routes
app.use('/api/urls', urlRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'HTAHSRA', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`\n🚀 HTAHSRA Server running on http://localhost:${PORT}`);
        console.log(`📦 API: http://localhost:${PORT}/api`);
        console.log(`📸 Screenshots: http://localhost:${PORT}/screenshots\n`);
    });
}

start().catch(console.error);
