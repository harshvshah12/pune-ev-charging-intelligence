import { chromium } from '@playwright/test';
import fs from 'fs';

if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Try port 3000, fallback to 3001
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  } catch {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  }
  
  await page.waitForTimeout(4000); // Wait for 3D map tiles & shaders to initialize
  await page.screenshot({ path: 'screenshots/01_3d_overview.png', fullPage: false });
  
  console.log('Successfully captured 3D spatial intelligence screenshot to screenshots/01_3d_overview.png');
  await browser.close();
})();
