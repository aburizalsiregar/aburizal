import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';
import path from 'node:path';
const pages = JSON.parse(await readFile('content/pages.json', 'utf8'));
const missing = [];
let checked = 0;
for (const page of pages) {
 const $ = load(await readFile(path.join('dist', page.path, 'index.html'), 'utf8'));
 const refs = [];
 $('[src], [href]').each((_, e) => refs.push($(e).attr('src'), $(e).attr('href')));
 $('[srcset]').each((_, e) => refs.push(...$(e).attr('srcset').split(',').map(s => s.trim().split(/\s+/)[0])));
 for (const ref of refs.filter(Boolean)) {
  if (!ref.startsWith('/') || ref.startsWith('//')) continue;
  const url = new URL(ref, 'http://localhost');
  let file = path.join('dist', decodeURIComponent(url.pathname));
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); await stat(file); checked++; }
  catch { missing.push({ page: page.path, ref }); }
 }
}
console.log(JSON.stringify({ pages: pages.length, checked, missing }, null, 2));
if (missing.length) process.exitCode = 1;
