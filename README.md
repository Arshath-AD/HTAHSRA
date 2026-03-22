# HTAHSRA - URL Manager

A full-stack modern URL management command center designed to help you save, organize, and never forget *why* you visited a webpage. Built with a sleek GenZ neon dark theme.

## Features
- **Auto-Extract Metadata:** Automatically fetches title, description, favicon, and OG images.
- **Page Previews:** Takes automated screenshots of saved pages (via Puppeteer).
- **Categories & Statuses:** Tag items with custom categories or statuses (In Progress, Paused, Completed, Revisit).
- **Global Search:** Instant searching through titles, URLs, and your custom notes.
- **Keyboard Shortcut:** Quickly add a new URL from anywhere using `Alt + Shift + N`.
- **Responsive Neon UI:** A beautiful, animated black `#000000` dark mode interface with cyan/magenta glows.

## Tech Stack
- **Frontend:** React + Vite + Framer Motion (Served via Nginx)
- **Backend:** Express.js Node API with a fast JSON file DB (`lowdb`)
- **Scraping:** Puppeteer for screenshots, `open-graph-scraper` for metadata.
- **Deployment:** Fully Dockerized (multi-container `docker-compose`)

## Setup & Running

1. Ensure Docker is installed and running.
2. In the project root, run:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - **Frontend:** `http://localhost:7742`
   - **Backend API:** `http://localhost:7743/api`

## Data Persistence
All URLs, categories, and generated screenshots are persisted in the local `./data` directory on your host machine, ensuring your items are safe even across container restarts.
