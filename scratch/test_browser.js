import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER EXCEPTION] ${err.message}`);
  });

  console.log('Navigating to http://localhost:4173/...');
  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Let's also check /login
    console.log('Navigating to http://localhost:4173/login...');
    await page.goto('http://localhost:4173/login', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Let's also check /admin
    console.log('Navigating to http://localhost:4173/admin...');
    await page.goto('http://localhost:4173/admin', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error('Navigation error:', err);
  }

  await browser.close();
  console.log('Done.');
})();
