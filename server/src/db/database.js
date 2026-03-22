import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../data/urls.json');

const defaultData = {
    urls: [],
    categories: [
        { id: 'work', name: 'Work', color: '#00f0ff' },
        { id: 'learning', name: 'Learning', color: '#ff00e5' },
        { id: 'inspiration', name: 'Inspiration', color: '#39ff14' },
        { id: 'tools', name: 'Tools', color: '#ffaa00' },
        { id: 'entertainment', name: 'Entertainment', color: '#ff3366' },
        { id: 'other', name: 'Other', color: '#8855ff' }
    ]
};

let db = null;

export async function initDb() {
    db = await JSONFilePreset(DB_PATH, defaultData);
    await db.write();
    console.log(`📦 Database initialized at ${DB_PATH}`);
    return db;
}

export function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDb() first.');
    return db;
}
