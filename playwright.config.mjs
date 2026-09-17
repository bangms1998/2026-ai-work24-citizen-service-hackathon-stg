import { defineConfig } from '@playwright/test';
const port = Number(process.env.WORK24_E2E_PORT || 4184);
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: { command: `WORK24_PORT=${port} npm run dev`, port, reuseExistingServer: false },
});
