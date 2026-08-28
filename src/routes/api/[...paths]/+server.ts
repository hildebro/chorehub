import type { RequestHandler } from '@sveltejs/kit';
import app from '$lib/backend/api';

const handleRequest: RequestHandler = ({ request }) => {
  const url = new URL(request.url);
  
  // Strip SvelteKit's dynamic base path so Hono correctly matches its .basePath('/api')
  const apiIndex = url.pathname.indexOf('/api');
  if (apiIndex !== -1) {
    url.pathname = url.pathname.substring(apiIndex);
  }

  return app.fetch(new Request(url, request));
};

// Forward all requests to Hono
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
export const OPTIONS = handleRequest;
export const fallback = handleRequest;
