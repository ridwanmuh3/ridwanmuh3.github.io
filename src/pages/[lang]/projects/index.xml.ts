import type { APIContext } from 'astro';

import { DEFAULT_LOCALE, locales } from '../../../config';
import { renderFeed } from '../../../lib/feed';

export function getStaticPaths() {
  return locales
    .filter((lang) => lang !== DEFAULT_LOCALE)
    .map((lang) => ({ params: { lang } }));
}

/** `/id/projects/index.xml`. */
export async function GET({ params }: APIContext) {
  const lang = params.lang as 'id';
  return new Response(await renderFeed(lang, 'projects'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
