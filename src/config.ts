/**
 * Site-wide constants extracted from `../portfolio/hugo.toml`.
 *
 * `bio` is the site-level description used for the home meta description and
 * Person JSON-LD. It is intentionally separate from `data[lang].hero.tagline`.
 */
/**
 * Main menu, from `hugo.toml` (`[languages.*.menus.main]`). `href` is the
 * language-independent path; components localize it with `localizeHref`.
 */
export interface NavItem {
  name: string;
  href: string;
}

export const siteConfig = {
  url: 'https://ridwanmuh3.github.io',
  title: 'Ridwan - Backend Developer',
  author: 'ridwanmuh3',
  fullname: 'Ridwan M. Raihan',
  role: 'Backend Developer',
  contact: {
    // Both values are public; secrets live in the contact Worker.
    endpoint: 'https://portfolio-contact.ridwanmuh3.workers.dev',
    turnstileSiteKey: '0x4AAAAAAEK5YpgnLFRwX4pR',
  },
  locales: {
    en: {
      label: 'English',
      htmlLang: 'en-US',
      ogLocale: 'en-US',
      bio: 'Informatics graduate building REST APIs and full-stack applications, with research experience in applied cryptography.',
      nav: [
        { name: 'Projects', href: '/projects/' },
        { name: 'Blogs', href: '/blogs/' },
        { name: 'Contact', href: '/contact/' },
      ] as NavItem[],
    },
    id: {
      label: 'Bahasa Indonesia',
      htmlLang: 'id-ID',
      ogLocale: 'id-ID',
      bio: 'Lulusan Informatika yang membangun REST API dan aplikasi full-stack, dengan pengalaman riset kriptografi terapan.',
      nav: [
        { name: 'Proyek', href: '/projects/' },
        { name: 'Blog', href: '/blogs/' },
        { name: 'Kontak', href: '/contact/' },
      ] as NavItem[],
    },
  },
} as const;

export type Lang = keyof typeof siteConfig.locales;

export const locales = Object.keys(siteConfig.locales) as Lang[];

/**
 * Hugo's `defaultContentLanguageInSubdir = false`: English lives at the root,
 * every other language keeps its prefix. `localizeHref` is the single place
 * that applies this rule.
 */
export const DEFAULT_LOCALE: Lang = 'en';

/**
 * Paths Astro writes as meta-refresh redirects. Kept here so the sitemap
 * integration can exclude them without duplicating the redirect map.
 */
export const REDIRECT_PATHS = new Set([
  '/en',
  '/en/',
  '/projects/page/1/',
  '/blogs/page/1/',
  '/id/projects/page/1/',
  '/id/blogs/page/1/',
]);

export function isRedirectPath(pathname: string): boolean {
  return REDIRECT_PATHS.has(pathname) || pathname === '/404.html';
}
