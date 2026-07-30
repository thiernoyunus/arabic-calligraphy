import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const root = new URL('..', import.meta.url).pathname;

const textFiles = [
  'index.html',
  'styles.css',
  'app.js', 'brush.js', 'forms.js',
  'glyph.js', 'keyboard.js', 'letters.js', 'styles.js',
  'manifest.webmanifest',
];

const mimeMap = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const fileEntries = [];

for (const f of textFiles) {
  const content = readFileSync(join(root, f), 'utf-8');
  const escaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  fileEntries.push(`  '/${f}': \`${escaped}\`,`);
}

// Binary assets
let assetDir;
try { assetDir = readdirSync(join(root, 'assets')); } catch { assetDir = []; }
for (const f of assetDir) {
  if (!f.match(/\.(png|svg|ico|jpg|jpeg|gif)$/i)) continue;
  const content = readFileSync(join(root, 'assets', f));
  const b64 = content.toString('base64');
  const ext = extname(f).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.ico' ? 'image/x-icon' : 'image/png';
  fileEntries.push(`  '/assets/${f}': 'data:${mime};base64,${b64}',`);
}

const serverCode = `// Arabic Calligraphy - Cloudflare Worker (auto-generated)
const FILES = {
${fileEntries.join('\n')}
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';

    const content = FILES[pathname];
    if (content) {
      const ext = pathname.match(/\\.(\\w+)$/)?.[0] || '';
      const contentType = MIME[ext] || 'application/octet-stream';
      if (content.startsWith('data:')) {
        return new Response(atob(content.split(',')[1]), {
          headers: { 'Content-Type': contentType }
        });
      }
      return new Response(content, {
        headers: { 'Content-Type': contentType }
      });
    }

    // SPA fallback: serve index.html for unknown paths
    if (FILES['/index.html']) {
      return new Response(FILES['/index.html'], {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    return new Response('Not Found', { status: 404 });
  },
};
`;

mkdirSync(join(root, 'dist', 'server'), { recursive: true });
writeFileSync(join(root, 'dist', 'server', 'index.js'), serverCode, 'utf-8');
console.log(`Worker generated with ${fileEntries.length} files`);
