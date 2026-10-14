const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'quality-artifacts');
const server = http.createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  } catch { response.writeHead(404); response.end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    for (const file of ['index.html', 'poster-editor.html']) {
      for (const width of [1280, 320, 390, 768]) {
        const mobile = width < 901;
        const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
        await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.fulfill({ contentType: 'application/json', body: '{}' }));
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
          await page.goto(origin + '/' + file);
          await page.waitForFunction(() => window.APANAM_PROFESSIONAL && window.APANAM_TOOL_SEARCH && document.getElementById('studioMobileAllActions'));
          if (mobile) {
            await page.locator('#studioMobileAllActions').tap();
            const search = page.locator('#studioMobileActionSearch');
            await search.waitFor({ state: 'visible' });
            await search.fill('प्रमाणपत्र');
            await page.locator('#studioMobileActionGrid [data-action=professionalCertificateOpen]').waitFor({ state: 'visible', timeout: 5000 });
            assert.equal(await page.locator('#studioMobileActionGrid > :visible').count(), 1);
            await search.fill('Font रंग');
            const fontButton = page.locator('#studioMobileActionGrid [data-action=mobileFontStyle]');
            await fontButton.waitFor({ state: 'visible' });
            await fontButton.tap();
            assert(await page.locator('#studioMobileSheet .studio-format-strip').isVisible(), 'A search result must open the real tool');
            await page.locator('#mobileSheetClose').tap();
            await page.locator('#studioMobileAllActions').tap();
            await search.fill('no-such-tool-7319');
            assert.equal(await page.locator('#studioMobileActionGrid > :visible').count(), 0);
            assert.match(await page.locator('#studioMobileActionStatus').textContent(), /कोई tool नहीं मिला/);
            await page.locator('.studio-action-feedback button').tap();
            assert.equal(await search.inputValue(), '');
            assert(await page.locator('#studioMobileActionGrid [data-action=professionalCertificateOpen]').isVisible());
            await page.screenshot({ path: path.join(artifacts, `organized-menu-${file}-${width}.png`) });
            await page.locator('#mobileSheetClose').tap();
            await page.locator('.apanam-mobile-bar [aria-label=Tools]').tap();
          }
          const search = page.getByRole('searchbox', { name: 'Search tools', exact: true });
          await search.waitFor({ state: 'visible' });
          await page.evaluate(() => { window.originalFontControl = document.getElementById('apanamEditFont'); });
          const before = await page.locator('.organizer-section').evaluateAll(sections => sections.filter(section => section.open).map(section => section.dataset.title));
          await search.fill('Text');
          await page.waitForFunction(() => [...document.querySelectorAll('.organizer-section')].filter(section => !section.hidden).length > 1);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert(await page.locator('.organizer-section').evaluateAll(sections => sections.filter(section => !section.hidden).every(section => section.open)), 'All matching sections stay expanded during search');
          await search.fill('फ़ॉन्ट');
          assert(await page.locator('#apanamEditFont').isVisible(), 'Hindi search finds the sidebar font control');
          await search.fill('no-such-tool-7319');
          assert(await page.locator('.organizer-empty').isVisible());
          assert.equal(await page.locator('.organizer-panel:visible').count(), 0, 'Do not leave blank category panels in search results');
          await page.locator('.organizer-clear').click();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert.deepEqual(await page.locator('.organizer-section').evaluateAll(sections => sections.filter(section => section.open).map(section => section.dataset.title)), before, 'Clearing search restores the open sections');
          assert(await page.evaluate(() => window.originalFontControl === document.getElementById('apanamEditFont')), 'Keep original inputs and event handlers');
          assert.equal(await page.locator('.organizer-nav [aria-pressed=true]').count(), 1);
          if (!mobile) {
            await page.locator('.organizer-nav [data-group=Text]').focus();
            await page.keyboard.press('End');
            assert.equal(await page.locator('.organizer-nav [aria-pressed=true]').getAttribute('data-group'), 'Export');
            await page.keyboard.press('Home');
            assert.equal(await page.locator('.organizer-nav [aria-pressed=true]').getAttribute('data-group'), 'Templates');
          }
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
          await page.screenshot({ path: path.join(artifacts, `organized-tools-${file}-${width}.png`) });
          assert.deepEqual(errors, []);
          console.log(`PASS ${file} ${width}: Hindi/English search, result actions, empty state, clearing, retained controls and layout`);
        } catch (error) {
          await page.screenshot({ path: path.join(artifacts, `organized-failure-${file}-${width}.png`) });
          console.error('Tool diagnostics', await page.evaluate(() => ({ bodyClass: document.body.className, dialogOpen: document.getElementById('studioMobileSheet')?.open, actions: [...document.querySelectorAll('#studioMobileActionGrid > *')].map(button => ({ text: button.textContent, hidden: button.hidden, disabled: button.disabled, group: button.dataset.menuCategory })), errors: [] })));
          console.error('Page errors', errors);
          throw error;
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
