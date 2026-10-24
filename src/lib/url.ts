import { DEFAULT_LOCALE, locales, type Lang } from '../config';

const LOCALE_PREFIX = new RegExp(`^/(?:${locales.join('|')})(?=/|$)`);

/**
 * Resolve an internal path for the current language.
 *
 * Hugo runs with `defaultContentLanguageInSubdir = false`, so English is served
 * from the root (`/projects/`) and every other language keeps its prefix
 * (`/id/projects/`). External URLs, protocol-relative URLs, hash links,
 * mailto: and tel: pass through. A path that already carries a locale prefix is
 * re-localized, never doubled.
 */
export function localizeHref(lang: Lang, href: string): string {
  if (!href) return href;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return href;

  const path = href.startsWith('/') ? href : `/${href}`;
  const stripped = path.replace(LOCALE_PREFIX, '');
  return lang === DEFAULT_LOCALE ? stripped : `/${lang}${stripped}`;
}
