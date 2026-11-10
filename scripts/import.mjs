import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { load } from 'cheerio';
const origin = 'https://aburizalsiregar.com';
await mkdir('.reference', { recursive: true });
await mkdir('content/pages', { recursive: true });
await mkdir('public/assets', { recursive: true });
execFileSync('curl.exe', ['-fLsS', origin + '/wp-json/wp/v2/pages?per_page=100', '-o', '.reference/pages.json']);
const pages = JSON.parse(await readFile('.reference/pages.json', 'utf8'));
const downloads = new Map();
function download(url) {
  url = url.replaceAll('&amp;', '&');
  const remote = new URL(url, origin);
  const local = remote.hostname === 'aburizalsiregar.com' ? '/assets' + remote.pathname.replace(/^\/wp-content/, '') : '/assets/fonts/' + path.basename(remote.pathname);
  if (!downloads.has(remote.href)) downloads.set(remote.href, local);
  return local;
}
const manifest = [];
const styles = new Set();
for (const page of pages) {
  const slug = page.id === 15 ? 'home' : page.slug;
  const raw = execFileSync('curl.exe', ['-fLsS', '--retry', '2', page.link], { maxBuffer: 10 * 1024 * 1024 }).toString();
  await writeFile(`.reference/${slug}.html`, raw);
  const $ = load(raw);
  $('style').each((_, el) => { if (!($(el).attr('id') || '').includes('emoji')) styles.add($(el).html()); });
  const content = load(page.content.rendered, null, false);
  content('script').remove();
  content('[src], [href], [poster]').each((_, el) => {
    for (const attr of ['src', 'href', 'poster']) {
      const value = content(el).attr(attr);
      if (!value) continue;
      const url = new URL(value, origin);
      if (url.hostname === 'aburizalsiregar.com') content(el).attr(attr, url.pathname.startsWith('/wp-content/') ? download(url.href) : url.pathname + url.search + url.hash);
    }
  });
  content('[srcset]').each((_, el) => {
    content(el).attr('srcset', content(el).attr('srcset').split(',').map(item => {
      const [url, size] = item.trim().split(/\s+/);
      return `${download(url)} ${size}`;
    }).join(', '));
  });
  content('iframe').each((_, el) => { content(el).attr('loading', 'lazy'); if (!content(el).attr('title')) content(el).attr('title', `${load(page.title.rendered).text()} video`); });
  const ids = new Set();
  content('[id]').each((_, el) => { const id = content(el).attr('id'); if (ids.has(id)) content(el).removeAttr('id'); else ids.add(id); });
  await writeFile(`content/pages/${slug}.html`, content.html());
  manifest.push({ slug, path: new URL(page.link).pathname, title: load(page.title.rendered).text() });
}
await writeFile('content/pages.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile('public/assets/blocks.css', [...styles].join('\n'));
for (const file of ['style.css', 'assets/css/bootstrap.min.css', 'assets/css/font-awesome.min.css']) download(`${origin}/wp-content/themes/onepress/${file}`);
for (const [url, local] of downloads) {
  const target = 'public' + local;
  await mkdir(path.dirname(target), { recursive: true });
  execFileSync('curl.exe', ['-fLsS', '--retry', '2', url, '-o', target]);
  if (local.endsWith('.css')) {
    let css = await readFile(target, 'utf8');
    css = css.replace(/url\(['"]?([^)'"\s]+)['"]?\)/g, (match, ref) => {
      if (ref.startsWith('data:') || ref.startsWith('#')) return match;
      return `url("${download(new URL(ref, url).href)}")`;
    });
    await writeFile(target, css);
  }
}
console.log(`Imported ${manifest.length} pages and ${downloads.size} assets.`);
