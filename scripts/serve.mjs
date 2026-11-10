import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
if (process.argv[2] !== 'dist') execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(await readFile(path.join(root, '404.html')));
  }
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`Local: http://localhost:${server.address().port}`));
