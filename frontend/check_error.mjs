import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    
    // Capture page errors
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    // Capture failed requests
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    console.log('ROOT HTML LENGTH:', rootHTML?.length);
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER SCRIPT ERROR:', err);
  }
})();
