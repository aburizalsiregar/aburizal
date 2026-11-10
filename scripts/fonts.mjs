import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
await mkdir('public/assets/fonts', { recursive: true });
await mkdir('.reference', { recursive: true });
execFileSync('curl.exe', ['-fLsS', 'https://fonts.googleapis.com/css?family=Raleway:400,500,600,700,300,100,800,900%7COpen+Sans:400,300,300italic,400italic,600,600italic,700,700italic&subset=latin,latin-ext', '-o', '.reference/fonts.css']);
let css = await readFile('.reference/fonts.css', 'utf8');
for (const url of new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]))) {
 const local = '/assets/fonts/' + path.basename(new URL(url).pathname);
 execFileSync('curl.exe', ['-fLsS', '--retry', '2', url, '-o', 'public' + local]);
 css = css.replaceAll(url, local);
}
await writeFile('public/assets/fonts.css', css);
