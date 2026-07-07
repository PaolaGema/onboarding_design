const { chromium } = require('playwright');
const OUT = 'C:/Users/USUARIO/AppData/Local/Temp/claude/C--Users-USUARIO-Desktop-Onboarding-design/10e6a7e6-2ea6-4833-8eda-595e49114980/scratchpad/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:5174/onboarding/plantillas', { waitUntil: 'networkidle' });
  // switch to list view if not already (icon button near "+ Nueva ruta")
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '40_table.png', fullPage: true });

  await page.click('text=Nueva ruta');
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + '41_modal_required.png', fullPage: true });

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
