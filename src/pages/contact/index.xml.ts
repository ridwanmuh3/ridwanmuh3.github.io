import type { APIContext } from 'astro';

import { renderFeed } from '../../lib/feed';

/** `/contact/index.xml` — empty channel, like Hugo's section feed. */
export async function GET(_context: APIContext) {
  return new Response(await renderFeed('en', 'contact'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
