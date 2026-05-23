import { chromium } from 'playwright';

async function main() {
  const wsUrl = process.env.AGY_BROWSER_WS_URL;
  if (!wsUrl) {
    console.error('AGY_BROWSER_WS_URL is not set.');
    process.exit(1);
  }
  console.log('Connecting to browser at', wsUrl);
  try {
    const browser = await chromium.connectOverCDP(wsUrl);
    console.log('Connected! Fetching contexts and pages...');
    const contexts = browser.contexts();
    for (const ctx of contexts) {
      const pages = ctx.pages();
      console.log(`Context has ${pages.length} pages:`);
      for (const page of pages) {
        console.log(`- URL: ${page.url()}, Title: ${await page.title()}`);
      }
    }
    await browser.close();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
