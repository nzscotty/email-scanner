import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.join(__dirname, 'tests', 'e2e'),
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run dev',
    cwd: __dirname,
    url: 'http://localhost:5173',
    timeout: 45_000,
    reuseExistingServer: !process.env.CI,
  },
});