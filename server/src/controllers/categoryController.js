import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/categories
 */
export async function getAllCategories(req, res, next) {
    try {
        const db = getDb();
        res.json({ success: true, data: db.data.categories });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/categories
 */
export async function createCategory(req, res, next) {
    try {
        const db = getDb();
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Category name is required' });
        }

        const id = name.toLowerCase().replace(/\s+/g, '-');

        // Check duplicate
        if (db.data.categories.find(c => c.id === id)) {
            return res.status(409).json({ success: false, error: 'Category already exists' });
        }

        const category = {
            id,
            name,
            color: color || '#00f0ff'
        };

        db.data.categories.push(category);
        await db.write();

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/categories/:id
 */
export async function deleteCategory(req, res, next) {
    try {
        const db = getDb();
        const index = db.data.categories.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        db.data.categories.splice(index, 1);
        await db.write();

        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
}
