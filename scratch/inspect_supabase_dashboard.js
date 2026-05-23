import { chromium } from 'playwright';

async function main() {
  const wsUrl = process.env.AGY_BROWSER_WS_URL;
  if (!wsUrl) {
    console.error('AGY_BROWSER_WS_URL is not set.');
    process.exit(1);
  }
  console.log('Connecting to browser...');
  try {
    const browser = await chromium.connectOverCDP(wsUrl);
    console.log('Connected! Creating context and navigating...');
    const context = browser.contexts()[0];
    const page = await context.newPage();
    
    console.log('Navigating to Supabase Dashboard projects page...');
    await page.goto('https://supabase.com/dashboard/projects', { waitUntil: 'networkidle', timeout: 15000 });
    
    console.log('Current page URL:', page.url());
    console.log('Current page Title:', await page.title());
    
    // Check if we are on the login page or projects page
    if (page.url().includes('login') || page.url().includes('sign-in')) {
      console.log('User is NOT logged in to Supabase.');
    } else {
      console.log('User is LOGGED IN to Supabase!');
    }
    
    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
