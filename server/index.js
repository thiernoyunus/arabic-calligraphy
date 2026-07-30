// Cloudflare Workers static file server
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';

    // Try to serve from Cloudflare Workers KV or static assets
    // Fallback: proxy to the Pages/Assets handler
    const ext = pathname.match(/\.\w+$/)?.[0] || '';
    const contentType = MIME[ext] || 'application/octet-stream';

    try {
      // For Cloudflare Pages, proxy to built-in asset handling
      const response = await env.ASSETS.fetch(request);
      return response;
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  },
};
