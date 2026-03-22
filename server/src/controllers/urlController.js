import { getDb } from '../db/database.js';
import { extractMetadata } from '../services/metadataService.js';
import { captureScreenshot, deleteScreenshot } from '../services/screenshotService.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../data/screenshots');

/**
 * GET /api/urls — List all URLs with optional filtering
 */
export async function getAllUrls(req, res, next) {
    try {
        const db = getDb();
        let urls = [...db.data.urls];

        const { search, category, status, sort } = req.query;

        // Filter by search query
        if (search) {
            const q = search.toLowerCase();
            urls = urls.filter(u =>
                u.title?.toLowerCase().includes(q) ||
                u.url?.toLowerCase().includes(q) ||
                u.notes?.toLowerCase().includes(q) ||
                u.description?.toLowerCase().includes(q) ||
                u.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // Filter by category
        if (category && category !== 'all') {
            urls = urls.filter(u => u.category === category);
        }

        // Filter by status
        if (status && status !== 'all') {
            urls = urls.filter(u => u.status === status);
        }

        // Sort
        if (sort === 'oldest') {
            urls.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({ success: true, data: urls, count: urls.length });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/urls/:id — Get single URL
 */
export async function getUrlById(req, res, next) {
    try {
        const db = getDb();
        const url = db.data.urls.find(u => u.id === req.params.id);

        if (!url) {
            return res.status(404).json({ success: false, error: 'URL not found' });
        }

        res.json({ success: true, data: url });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/urls — Add new URL
 */
export async function createUrl(req, res, next) {
    try {
        const db = getDb();
        const { url, notes, category, status, tags } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        // Create initial entry
        const urlEntry = {
            id,
            url,
            title: '',
            description: '',
            siteName: '',
            favicon: '',
            ogImage: '',
            screenshot: null,
            notes: notes || '',
            category: category || 'other',
            status: status || 'in-progress',
            tags: tags || [],
            createdAt: now,
            updatedAt: now,
            metadataStatus: 'pending',
            screenshotStatus: 'pending'
        };

        db.data.urls.unshift(urlEntry);
        await db.write();

        // Send response immediately
        res.status(201).json({ success: true, data: urlEntry });

        // Extract metadata asynchronously
        try {
            const metadata = await extractMetadata(url);
            const entry = db.data.urls.find(u => u.id === id);
            if (entry) {
                Object.assign(entry, metadata, {
                    metadataStatus: 'done',
                    updatedAt: new Date().toISOString()
                });
                // Fix relative favicon
                if (entry.favicon && !entry.favicon.startsWith('http')) {
                    try {
                        const urlObj = new URL(url);
                        entry.favicon = `${urlObj.protocol}//${urlObj.host}${entry.favicon.startsWith('/') ? '' : '/'}${entry.favicon}`;
                    } catch (e) { /* ignore */ }
                }
                await db.write();
            }
        } catch (e) {
            const entry = db.data.urls.find(u => u.id === id);
            if (entry) {
                entry.metadataStatus = 'failed';
                await db.write();
            }
        }

        // Capture screenshot asynchronously
        try {
            const screenshotFile = await captureScreenshot(url, id);
            const entry = db.data.urls.find(u => u.id === id);
            if (entry) {
                entry.screenshot = screenshotFile;
                entry.screenshotStatus = screenshotFile ? 'done' : 'failed';
                entry.updatedAt = new Date().toISOString();
                await db.write();
            }
        } catch (e) {
            const entry = db.data.urls.find(u => u.id === id);
            if (entry) {
                entry.screenshotStatus = 'failed';
                await db.write();
            }
        }
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/urls/:id — Update URL
 */
export async function updateUrl(req, res, next) {
    try {
        const db = getDb();
        const entry = db.data.urls.find(u => u.id === req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, error: 'URL not found' });
        }

        const { notes, category, status, tags, title } = req.body;

        if (notes !== undefined) entry.notes = notes;
        if (category !== undefined) entry.category = category;
        if (status !== undefined) entry.status = status;
        if (tags !== undefined) entry.tags = tags;
        if (title !== undefined) entry.title = title;
        entry.updatedAt = new Date().toISOString();

        await db.write();

        res.json({ success: true, data: entry });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/urls/:id — Delete URL
 */
export async function deleteUrl(req, res, next) {
    try {
        const db = getDb();
        const index = db.data.urls.findIndex(u => u.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'URL not found' });
        }

        const [removed] = db.data.urls.splice(index, 1);

        // Delete screenshot
        if (removed.screenshot) {
            deleteScreenshot(removed.screenshot);
        }

        await db.write();

        res.json({ success: true, message: 'URL deleted' });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/urls/:id/refresh — Re-fetch metadata & screenshot
 */
export async function refreshUrl(req, res, next) {
    try {
        const db = getDb();
        const entry = db.data.urls.find(u => u.id === req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, error: 'URL not found' });
        }

        entry.metadataStatus = 'pending';
        entry.screenshotStatus = 'pending';
        await db.write();

        res.json({ success: true, data: entry, message: 'Refresh started' });

        // Re-extract metadata
        try {
            const metadata = await extractMetadata(entry.url);
            Object.assign(entry, metadata, {
                metadataStatus: 'done',
                updatedAt: new Date().toISOString()
            });
            if (entry.favicon && !entry.favicon.startsWith('http')) {
                try {
                    const urlObj = new URL(entry.url);
                    entry.favicon = `${urlObj.protocol}//${urlObj.host}${entry.favicon.startsWith('/') ? '' : '/'}${entry.favicon}`;
                } catch (e) { /* ignore */ }
            }
            await db.write();
        } catch (e) {
            entry.metadataStatus = 'failed';
            await db.write();
        }

        // Re-capture screenshot
        try {
            if (entry.screenshot) deleteScreenshot(entry.screenshot);
            const screenshotFile = await captureScreenshot(entry.url, entry.id);
            entry.screenshot = screenshotFile;
            entry.screenshotStatus = screenshotFile ? 'done' : 'failed';
            entry.updatedAt = new Date().toISOString();
            await db.write();
        } catch (e) {
            entry.screenshotStatus = 'failed';
            await db.write();
        }
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/urls/:id/image — Upload custom preview image
 */
export async function uploadCustomImage(req, res, next) {
    try {
        const db = getDb();
        const entry = db.data.urls.find(u => u.id === req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, error: 'URL not found' });
        }

        const { base64Data } = req.body;
        if (!base64Data) {
            return res.status(400).json({ success: false, error: 'No image data provided' });
        }

        // Extract base64 part
        const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, error: 'Invalid base64 image data' });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `custom-${entry.id}-${Date.now()}.${ext}`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);

        // Ensure directory exists
        if (!fs.existsSync(SCREENSHOTS_DIR)) {
            fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
        }

        fs.writeFileSync(filepath, buffer);

        // Delete old custom screenshot if exists and different
        if (entry.screenshot) {
            deleteScreenshot(entry.screenshot);
        }

        entry.screenshot = filename;
        entry.screenshotStatus = 'done';
        entry.updatedAt = new Date().toISOString();

        await db.write();

        res.json({ success: true, data: entry, message: 'Custom image uploaded successfully' });
    } catch (error) {
        next(error);
    }
}
