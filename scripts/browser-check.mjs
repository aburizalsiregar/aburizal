import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, headless: true });
const pages = JSON.parse(await readFile('content/pages.json', 'utf8'));
await mkdir('verification', { recursive: true });
const report = [];
for (const width of [1440, 390]) {
 const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.route('https://www.youtube.com/**', r => r.abort());
 for (const route of pages) {
  const response = await page.goto('http://localhost:3000' + route.path);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const img of document.images) { img.loading = 'eager'; } await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src), heading: document.querySelector('h1')?.textContent }));
  report.push({ width, path: route.path, status: response.status(), ...result });
  if (['/', '/about/', '/evermore-knights/'].includes(route.path)) await page.screenshot({ path: `verification/${route.slug}-${width}.png`, fullPage: true });
 }
 if (width === 390) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Game Jams', exact: true }).click();
  if (!page.url().endsWith('/game-jams/')) throw new Error('Mobile navigation failed');
 }
 report.push({ width, errors });
 await page.close();
}
const ref = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ref.goto('https://aburizalsiregar.com/', { waitUntil: 'networkidle' });
await ref.screenshot({ path: 'verification/reference-home-1440.png', fullPage: true });
await writeFile('verification/report.json', JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report.filter(r => r.overflow || r.brokenImages?.length || r.errors?.length), null, 2));
console.log(`Verified ${pages.length} routes at both desktop and mobile sizes.`);
if (report.some(r => r.status && r.status !== 200 || r.overflow || r.brokenImages?.length || r.errors?.length)) process.exitCode = 1;

