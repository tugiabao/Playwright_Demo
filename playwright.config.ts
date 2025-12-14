import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Tự động tạo folder output nếu chưa có
const outputDir = path.resolve(__dirname, 'result');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

export default defineConfig({
  testDir: './modules/tests',
  /* Chạy local nên set timeout cao hơn chút */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Reporter to use. */
  reporter: [['line'],['html', { outputFolder: 'result/playwright-report' }]],
  outputDir: 'result/test-results',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    headless: false, // Theo yêu cầu: hiện trình duyệt để xem demo
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});