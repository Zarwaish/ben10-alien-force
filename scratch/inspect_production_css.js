import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[CONSOLE] [${msg.type()}] ${text}`);
    console.log(`[CONSOLE] [${msg.type()}] ${text}`);
  });

  page.on('pageerror', err => {
    consoleLogs.push(`[BROWSER ERROR] ${err.message}`);
    console.error(`[BROWSER ERROR] ${err.message}`);
  });

  const baseUrl = 'https://ben10-alien-force.vercel.app';
  const email = 'inspect_22674@gmail.com';
  const password = 'Password123!';

  try {
    console.log(`Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Check if logout button exists (already logged in)
    const isAlreadyLoggedIn = await page.locator('.logout-icon-btn').count() > 0;
    if (!isAlreadyLoggedIn) {
      console.log('Not logged in. Clicking Login button in Navbar...');
      await page.click('.login-link');
      await page.waitForTimeout(1000);
      
      console.log(`Filling login credentials: ${email}`);
      await page.fill('input[placeholder="Enter your email..."]', email);
      await page.fill('input[placeholder="••••••••"]', password);
      
      console.log('Submitting login form...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    } else {
      console.log('Already logged in.');
    }

    console.log('Current URL:', page.url());

    // Click Omnitrix in navbar to navigate to the watch gallery view
    console.log('Clicking Omnitrix in Navbar...');
    const omnitrixBtn = page.locator('button.nav-item:has-text("Omnitrix")');
    if (await omnitrixBtn.count() > 0) {
      await omnitrixBtn.click();
    } else {
      console.log('Navbar Omnitrix button not found. Direct navigate to /omnitrix...');
      await page.goto(`${baseUrl}/omnitrix`, { waitUntil: 'networkidle' });
    }
    
    // Wait for loader to finish and watch to render
    console.log('Waiting for .watch-omni selector to load...');
    await page.waitForSelector('.watch-omni', { timeout: 15000 });
    console.log('.watch-omni is visible.');

    // Save initial screenshot
    await page.screenshot({ path: 'scratch/omnitrix_initial.png' });
    console.log('Saved initial screenshot: scratch/omnitrix_initial.png');

    // Inspect initial dimensions of .watch-omni
    const watchDims = await page.evaluate(() => {
      const watch = document.querySelector('.watch-omni');
      if (!watch) return null;
      const rect = watch.getBoundingClientRect();
      const style = window.getComputedStyle(watch);
      return {
        width: rect.width + 'px',
        height: rect.height + 'px',
        computedWidth: style.width,
        computedHeight: style.height
      };
    });
    console.log('Rendered watch dimensions:', watchDims);

    // Click watch to activate hologram
    console.log('Clicking the watch to activate the beam...');
    await page.click('.watch-omni');
    await page.waitForTimeout(4000); // Wait for the active state to settle

    // Save active screenshot
    await page.screenshot({ path: 'scratch/omnitrix_active.png' });
    console.log('Saved active screenshot: scratch/omnitrix_active.png');

    // Extract computed CSS
    const cssData = await page.evaluate(() => {
      const getStyle = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          selector,
          rectWidth: rect.width + 'px',
          rectHeight: rect.height + 'px',
          computedWidth: style.width,
          computedHeight: style.height,
          computedMarginBottom: style.marginBottom,
          computedPosition: style.position,
          computedBottom: style.bottom,
          computedTop: style.top,
          computedTransform: style.transform,
          computedOpacity: style.opacity,
          computedZIndex: style.zIndex,
          computedFilter: style.filter
        };
      };

      return {
        alienCenter: getStyle('.alien-center'),
        alienImage: getStyle('.alien-image-large'),
        lightOmni: getStyle('.light-omni'),
        lightOmniActive: getStyle('.light-omni.active')
      };
    });

    console.log('COMPUTED CSS VALUES:');
    console.log(JSON.stringify(cssData, null, 2));

  } catch (err) {
    console.error('Test script error:', err);
    try {
      await page.screenshot({ path: 'scratch/error_screenshot.png' });
      console.log('Saved error screenshot to scratch/error_screenshot.png');
    } catch (ssErr) {
      console.error('Failed to take error screenshot:', ssErr);
    }
  }

  await browser.close();
  console.log('Done.');
})();
