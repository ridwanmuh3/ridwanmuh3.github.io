import type { APIContext } from 'astro';

import { renderFeed } from '../../lib/feed';

/** `/blogs/index.xml`. */
export async function GET(_context: APIContext) {
  return new Response(await renderFeed('en', 'blogs'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
