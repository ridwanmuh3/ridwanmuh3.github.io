import { siteConfig, type Lang } from '../config';
import { getContent } from '../data/index';
import { entryHref, getLocalizedEntries, sortByDateDesc } from './content';
import { localizeHref } from './url';

/**
 * RSS 2.0 feeds, matching the shape Hugo's embedded template emits:
 * `title, link, description, generator, language, lastBuildDate, atom:link`
 * then one `<item>` per entry (`title, link, pubDate, guid, description`).
 *
 * Built by hand instead of `@astrojs/rss` so the element order and the
 * `atom:link rel="self"` channel entry stay identical to the baseline.
 */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** RFC 822 date in UTC, e.g. `Tue, 01 Sep 2026 00:00:00 +0000`. */
function rfc822(date: Date): string {
  return (
    `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ` +
    `${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:` +
    `${pad(date.getUTCSeconds())} +0000`
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type FeedSection = 'home' | 'projects' | 'blogs' | 'contact';

interface FeedEntry {
  title: string;
  href: string;
  date: Date;
  description: string;
}

const SECTION_PATH: Record<FeedSection, string> = {
  home: '/',
  projects: '/projects/',
  blogs: '/blogs/',
  contact: '/contact/',
};

async function entriesFor(lang: Lang, section: FeedSection): Promise<FeedEntry[]> {
  const absolute = (href: string) => new URL(href, siteConfig.url).href;

  if (section === 'contact') return [];

  const projects =
    section === 'home' || section === 'projects'
      ? sortByDateDesc(await getLocalizedEntries('projects', lang)).map((entry) => ({
          title: entry.data.title,
          href: absolute(entryHref(lang, 'projects', entry.id)),
          date: entry.data.date,
          description: entry.data.description ?? '',
        }))
      : [];

  const blogs =
    section === 'home' || section === 'blogs'
      ? sortByDateDesc(await getLocalizedEntries('blog', lang)).map((entry) => ({
          title: entry.data.title,
          href: absolute(entryHref(lang, 'blog', entry.id)),
          date: entry.data.date,
          description: entry.data.summary ?? '',
        }))
      : [];

  return [...projects, ...blogs].sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Build the feed document for one language and section. */
export async function renderFeed(lang: Lang, section: FeedSection): Promise<string> {
  const content = getContent(lang);
  const locale = siteConfig.locales[lang];
  const path = localizeHref(lang, SECTION_PATH[section]);
  const link = new URL(path, siteConfig.url).href;
  const self = `${link}index.xml`;

  const title =
    section === 'home'
      ? siteConfig.title
      : `${content.pages[section].title} on ${siteConfig.title}`;
  const description =
    section === 'home'
      ? `Recent content on ${siteConfig.title}`
      : `Recent content in ${content.pages[section].title} on ${siteConfig.title}`;

  const entries = await entriesFor(lang, section);
  const lastBuild = entries.length > 0 ? entries[0].date : undefined;

  const items = entries
    .map(
      (entry) =>
        `<item><title>${escapeXml(entry.title)}</title>` +
        `<link>${escapeXml(entry.href)}</link>` +
        `<pubDate>${rfc822(entry.date)}</pubDate>` +
        `<guid>${escapeXml(entry.href)}</guid>` +
        `<description>${escapeXml(entry.description)}</description></item>`,
    )
    .join('');

  return (
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    `<title>${escapeXml(title)}</title>` +
    `<link>${escapeXml(link)}</link>` +
    `<description>${escapeXml(description)}</description>` +
    `<generator>Astro</generator>` +
    `<language>${escapeXml(locale.htmlLang)}</language>` +
    (lastBuild ? `<lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>` : '') +
    `<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>` +
    items +
    '</channel></rss>'
  );
}
