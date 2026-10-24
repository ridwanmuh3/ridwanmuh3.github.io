import type { APIContext } from 'astro';

import { renderFeed } from '../lib/feed';

/** `/index.xml` — home feed (projects + blogs, newest first). */
export async function GET(_context: APIContext) {
  return new Response(await renderFeed('en', 'home'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
