// Template for a Landman Command browser check. Copy to the scratchpad, edit, run with:
//   node check.js <screenshot-dir> '{"width":1280,"height":800}'
const { chromium } = require('playwright');
const API = 'http://localhost:8000';
const api = async (path, opts) => (await fetch(API + path, opts)).json();
const results = {}; const failed = [];
const check = (label, ok, extra) => { results[label] = ok ? 'ok' : `FAIL ${extra ?? ''}`; if (!ok) failed.push(label); };

(async () => {
  const out = process.argv[2] || '.';
  const viewport = JSON.parse(process.argv[3] || '{"width":1280,"height":800}');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport, timezoneId: 'America/Chicago', locale: 'en-US',
    geolocation: { latitude: 33.192, longitude: -99.635, accuracy: 4 }, permissions: ['geolocation'],
  });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  const decide = []; page.on('dialog', d => ((decide.shift() ?? 'dismiss') === 'accept' ? d.accept() : d.dismiss()));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // --- checks go here, for example:
  await page.click('.dock-btn:has-text("Projects")');
  const projects = (await api('/projects')).projects;
  check('projects panel lists every project', (await page.locator('.project-list > li').count()) === projects.length);
  await page.screenshot({ path: `${out}/check-1.png` });

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(JSON.stringify(results, null, 1));
  console.log(failed.length ? `FAILED: ${failed.length}` : `ALL ${Object.keys(results).length} OK`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('CRASH', e.message); process.exit(2); });
