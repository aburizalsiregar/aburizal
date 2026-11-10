import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { load } from 'cheerio';
import path from 'node:path';
const pages = JSON.parse(await readFile('content/pages.json', 'utf8'));
const nav = [['/', 'Commercial Projects'], ['/game-jams/', 'Game Jams'], ['/tabletop-game-projects/', 'Board Game Projects'], ['/resume/', 'Resume'], ['/about/', 'About']];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function template(page, content) {
  const description = load(content).text().replace(/\s+/g, ' ').trim().slice(0, 160) || `${page.title} - Aburizal Siregar's Game Design Portfolio`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(page.path === '/' ? 'Aburizal Siregar - Game Design Portfolio' : `${page.title} - Aburizal Siregar`)}</title>
<meta name="description" content="${escape(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/themes/onepress/assets/css/bootstrap.min.css">
<link rel="stylesheet" href="/assets/themes/onepress/assets/css/font-awesome.min.css">
<link rel="stylesheet" href="/assets/themes/onepress/style.css">
<link rel="stylesheet" href="/assets/blocks.css">
<link rel="stylesheet" href="/site.css"><script src="/site.js" defer></script></head>
<body class="page no-sidebar"><div id="page" class="site">
<a class="skip-link screen-reader-text" href="#main">Skip to content</a>
<div id="header-section"><header id="masthead" class="site-header header-contained"><div class="container">
<div class="site-branding"><div class="site-brand-inner no-logo-img has-title has-desc"><p class="site-title"><a class="site-text-logo" href="/">Aburizal Siregar</a></p><p class="site-description">Aburizal Siregar's Game Design Portfolio</p></div></div>
<div class="header-right-wrapper"><button id="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu<span></span></button>
<nav id="site-navigation" class="main-navigation" aria-label="Main navigation"><ul id="primary-menu" class="onepress-menu">${nav.map(([href, label]) => `<li><a href="${href}"${page.path === href ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></nav></div></div></header></div>
<div class="page-header"><div class="container"><h1 class="entry-title">${escape(page.title)}</h1></div></div>
<div id="content" class="site-content"><div id="content-inside" class="container no-sidebar"><div id="primary" class="content-area"><main id="main" class="site-main"><article><div class="entry-content">${content}</div></article></main></div></div></div>
<footer class="site-footer"><div class="site-info"><div class="container"><div class="btt"><a class="back-to-top" href="#page" aria-label="Back to top"><i class="fa fa-angle-double-up" aria-hidden="true"></i></a></div>Copyright &copy; ${new Date().getFullYear()} Aburizal Siregar <span class="sep">&ndash;</span> <a href="https://www.famethemes.com/themes/onepress">OnePress</a> theme by FameThemes</div></div></footer></div>
</body></html>`;
}
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
for (const page of pages) {
  const content = await readFile(`content/pages/${page.slug}.html`, 'utf8');
  const dir = path.join('dist', page.path);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), template(page, content));
}
await writeFile('dist/404.html', template({ title: 'Page not found', path: '/404/' }, '<p>This page could not be found. <a href="/">Return to the portfolio</a>.</p>'));
console.log(`Built ${pages.length} pages to dist/.`);


