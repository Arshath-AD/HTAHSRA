import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../data/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Capture a screenshot of the given URL
 * @returns {string|null} The filename of the saved screenshot, or null on failure
 */
export async function captureScreenshot(url, id) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        // Wait a bit for any lazy-loaded content
        await new Promise(r => setTimeout(r, 2000));

        const filename = `${id}.png`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);

        await page.screenshot({
            path: filepath,
            type: 'png',
            fullPage: false
        });

        console.log(`📸 Screenshot saved: ${filename}`);
        return filename;
    } catch (error) {
        console.error(`⚠️ Failed to capture screenshot for ${url}:`, error.message);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Delete a screenshot file
 */
export function deleteScreenshot(filename) {
    if (!filename) return;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`🗑️ Screenshot deleted: ${filename}`);
    }
}
