import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure output directories exist
for (const dir of ['screenshots', 'docs']) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureScreenshots() {
  console.log('Launching browser to capture high-fidelity Playwright screenshots...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1536, height: 960 },
    deviceScaleFactor: 1.5 // High DPI for crystal-clear retina screenshots
  });

  const page = await context.newPage();
  
  // Navigate to application
  const url = 'http://localhost:3001';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for 3D shaders and initial datasets to settle
  await page.waitForTimeout(3000);

  // 1. Screenshot: Landing Hero with 3D CyberGridShader
  console.log('Capturing Screenshot 1: Landing Hero View...');
  await page.screenshot({ path: 'docs/screenshot_01_landing_hero.png' });
  await page.screenshot({ path: 'screenshots/01_landing_hero.png' });

  // Dismiss Landing Hero to enter 3D Command Platform
  console.log('Entering 3D Geospatial Command Platform...');
  const launchBtn = page.getByRole('button', { name: /LAUNCH 3D COMMAND PLATFORM/i });
  if (await launchBtn.isVisible()) {
    await launchBtn.click();
  } else {
    const enterBtn = page.getByText(/ENTER 3D GEOSPATIAL COMMAND WORKSPACE/i);
    await enterBtn.click();
  }

  // Allow 3D MapLibre viewport & layer tiles to render
  await page.waitForTimeout(4000);

  // 2. Screenshot: 3D Spatial Overview
  console.log('Capturing Screenshot 2: 3D Spatial Overview...');
  await page.screenshot({ path: 'docs/screenshot_02_3d_spatial_overview.png' });
  await page.screenshot({ path: 'screenshots/dashboard_full.png', fullPage: true });

  // 3. Screenshot: Dynamic Submodular Optimizer Panel
  console.log('Capturing Screenshot 3: Dynamic Optimizer Panel...');
  // Ensure solver tab is active
  const solverTab = page.getByRole('button', { name: /Submodular Solver/i }).or(page.getByText(/Submodular Solver/i));
  if (await solverTab.isVisible()) {
    await solverTab.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'docs/screenshot_03_dynamic_optimizer.png' });

  // 4. Screenshot: Layers Panel & Wards Choropleth
  console.log('Capturing Screenshot 4: Layers Panel & Ward Choropleth...');
  const layersTab = page.getByRole('button', { name: /Map Layers/i }).or(page.getByText(/Map Layers/i));
  if (await layersTab.isVisible()) {
    await layersTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshot_04_layers_and_wards.png' });
    
    // Switch back to solver tab
    if (await solverTab.isVisible()) {
      await solverTab.click();
      await page.waitForTimeout(1000);
    }
  }

  // 5. Screenshot: Corridor Journey Simulation
  console.log('Capturing Screenshot 5: Transit Corridor Journey Simulation...');
  // Look for corridor selection button or play simulation button
  const simPlayBtn = page.getByTitle(/Simulate Live Vehicle Journey/i).or(page.getByText(/Run Trip Simulation/i));
  if (await simPlayBtn.first().isVisible()) {
    await simPlayBtn.first().click();
    await page.waitForTimeout(3000); // Let vehicle drive along glowing route
  }
  await page.screenshot({ path: 'docs/screenshot_05_corridor_simulation.png' });

  // 6. Screenshot: Recommendation Selection & 3-Line Rationale
  console.log('Capturing Screenshot 6: Siting Rationale & Selected Station Detail...');
  const recCard = page.locator('div[class*="RecommendationCard"], div:has-text("OPT-01"), div:has-text("Hadapsar Gadital")').first();
  if (await recCard.isVisible()) {
    await recCard.click();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: 'docs/screenshot_06_siting_rationale.png' });

  // 7. Screenshot: Algorithmic Methodology Modal
  console.log('Capturing Screenshot 7: Algorithmic Methodology Modal...');
  const methodBtn = page.getByRole('button', { name: 'Methodology', exact: true }).first();
  if (await methodBtn.isVisible()) {
    await methodBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshot_07_methodology_modal.png' });

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Close/i }).or(page.locator('button:has-text("✕"), button:has-text("×")')).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }

  // 8. Screenshot: Data Provenance Modal
  console.log('Capturing Screenshot 8: Data Provenance & Statutory Registry Modal...');
  const provBtn = page.getByRole('button', { name: 'Data Sources', exact: true }).first();
  if (await provBtn.isVisible()) {
    await provBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshot_08_provenance_modal.png' });

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  console.log('All screenshots successfully captured and saved to docs/ and screenshots/!');
  await browser.close();
}

captureScreenshots().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
