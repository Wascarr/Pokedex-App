const puppeteer = require('puppeteer');

describe('Pokedex Application Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--window-size=1920,1080']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  describe('Basic Route Tests', () => {
    test('Home page loads successfully', async () => {
      const response = await page.goto('http://localhost:3001');
      expect(response.status()).toBe(200);
    });

    test('Pokemon creation page loads', async () => {
      const response = await page.goto('http://localhost:3001/pokemon/new');
      expect(response.status()).toBe(200);
    });

    test('Regions page loads', async () => {
      const response = await page.goto('http://localhost:3001/regions');
      expect(response.status()).toBe(200);
    });

    test('Types page loads', async () => {
      const response = await page.goto('http://localhost:3001/types');
      expect(response.status()).toBe(200);
    });
  });

  describe('Navigation Tests', () => {
    test('Navigation menu is present', async () => {
      await page.goto('http://localhost:3001');
      
      // Wait for the navbar to be fully loaded
      await page.waitForSelector('.navbar-nav');
      
      // Get all navigation links
      const navLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('.navbar-nav .nav-link');
        return links.length;
      });
      
      // We expect 4 navigation links: Home, New Pokemon, Regions, Types
      expect(navLinks).toBe(4);
      
      // Capture navigation screenshot for visual verification
      await page.screenshot({
        path: 'docs/screenshots/navigation.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1920,
          height: 100
        }
      });
    });
  });

  describe('Theme Toggle Tests', () => {
    test('Dark theme activation works', async () => {
      await page.goto('http://localhost:3001');
      await page.waitForSelector('#themeToggle', { visible: true });
      
      // Take before screenshot
      await page.screenshot({ path: 'docs/screenshots/before-theme.png' });
      
      // Click theme toggle and wait for change
      await page.evaluate(() => {
        document.querySelector('#themeToggle').click();
      });
      
      // Verify dark theme
      const isDark = await page.evaluate(() => 
        document.body.classList.contains('dark-theme')
      );
      expect(isDark).toBe(true);
      
      // Take after screenshot
      await page.screenshot({ path: 'docs/screenshots/after-theme.png' });
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
        describe('Visual Documentation Tests', () => {
      let browser;
      let page;

      beforeAll(async () => {
        browser = await puppeteer.launch({
          headless: "new",
          args: ['--no-sandbox']
        });
        page = await browser.newPage();
      });

      test('Capture key application views', async () => {
        // Home page
        await page.goto('http://localhost:3001');
        await page.screenshot({ path: 'docs/screenshots/home-page.png', fullPage: true });

        // New Pokemon form
        await page.goto('http://localhost:3001/pokemon/new');
        await page.screenshot({ path: 'docs/screenshots/new-pokemon-form.png', fullPage: true });

        // Regions page
        await page.goto('http://localhost:3001/regions');
        await page.screenshot({ path: 'docs/screenshots/regions-page.png', fullPage: true });

        // Types page
        await page.goto('http://localhost:3001/types');
        await page.screenshot({ path: 'docs/screenshots/types-page.png', fullPage: true });

        // Footer
        await page.goto('http://localhost:3001');
        const footer = await page.$('footer');
        await footer.screenshot({ path: 'docs/screenshots/footer.png' });

        // Mobile view
        await page.setViewport({ width: 375, height: 667 });
        await page.screenshot({ path: 'docs/screenshots/mobile-view.png', fullPage: true });
      });

      afterAll(async () => {
        await browser.close();
      });
});