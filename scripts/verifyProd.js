import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  try {
    await page.goto('https://ben10-alien-force.vercel.app', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(5000);
  } catch (e) {
    console.error('Navigation error', e);
  }
  if (errors.length) {
    console.log('Console errors:', errors);
  } else {
    console.log('No console errors detected');
  }
  await browser.close();
})();
