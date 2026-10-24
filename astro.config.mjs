// @ts-check
import { readdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

import { isRedirectPath, siteConfig } from './src/config.ts';
import { mermaidPlugin } from './src/lib/mermaid-plugin.mjs';
import { chromaMonokai } from './src/lib/monokai-theme.mjs';

/**
 * Read frontmatter dates at config time so the sitemap can emit a real
 * `<lastmod>` instead of the build timestamp. The keys are localized paths
 * (`/projects/cinx/`, `/id/projects/cinx/`), matching sitemap URLs.
 */
function readContentDates() {
  const dates = new Map();
  const latestBySection = new Map();
  const contentRoot = new URL('./src/content/', import.meta.url);

  for (const collection of ['blog', 'projects']) {
    const section = collection === 'blog' ? 'blogs' : 'projects';
    for (const lang of ['en', 'id']) {
      const dir = new URL(`${collection}/${lang}/`, contentRoot);
      let files;
      try {
        files = readdirSync(dir);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const source = readFileSync(new URL(file, dir), 'utf8');
        if (/^draft\s*=\s*true\b/m.test(source)) continue;
        const raw = source.match(/^date\s*=\s*['"]?([^'"\n]+)['"]?/m)?.[1]?.trim();
        if (!raw) continue;
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) continue;

        const slug = file.replace(/\.md$/, '');
        const prefix = lang === 'en' ? '' : `/${lang}`;
        const articlePath = `${prefix}/${section}/${slug}/`;
        const sectionPath = `${prefix}/${section}/`;
        dates.set(articlePath, date);

        const previous = latestBySection.get(sectionPath);
        if (!previous || date > previous) latestBySection.set(sectionPath, date);
      }
    }
  }

  const latestOverall = [...dates.values()].reduce(
    (latest, date) => (date > latest ? date : latest),
    new Date(0),
  );
  return { dates, latestBySection, latestOverall };
}

const contentDates = readContentDates();

/**
 * `@astrojs/sitemap` always emits `sitemap-index.xml` plus `sitemap-N.xml`.
 * With a single chunk, collapse it into the conventional `/sitemap.xml` so
 * crawlers and Search Console get one universal URL. If the site ever grows
 * past one chunk, leave the index intact instead of dropping URLs.
 */
function singleSitemap() {
  return {
    name: 'single-sitemap',
    hooks: {
      'astro:build:done': (
        /** @type {{ dir: URL; logger: import('astro').AstroIntegrationLogger }} */
        { dir, logger },
      ) => {
        const out = fileURLToPath(dir);
        const chunks = readdirSync(out).filter((file) => /^sitemap-\d+\.xml$/.test(file));
        if (chunks.length !== 1) return;
        renameSync(join(out, chunks[0]), join(out, 'sitemap.xml'));
        rmSync(join(out, 'sitemap-index.xml'), { force: true });
        logger.info('`sitemap.xml` created (index removed)');
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  trailingSlash: 'ignore',

  // Hugo's `defaultContentLanguageInSubdir = false`: English at the root,
  // Indonesian under `/id/`.
  i18n: {
    defaultLocale: 'en',
    locales: [
      { path: 'en', codes: ['en-US'] },
      { path: 'id', codes: ['id-ID'] },
    ],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  // Only the aliases Hugo itself emits, plus a courtesy redirect for the
  // `/en/` prefix the previous Astro build shipped. Astro's static build
  // writes these as meta-refresh pages.
  redirects: {
    '/en': '/',
    '/projects/page/1': '/projects/',
    '/blogs/page/1': '/blogs/',
    '/id/projects/page/1': '/id/projects/',
    '/id/blogs/page/1': '/id/blogs/',
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/geist-latin-var.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/geist-mono-latin-var.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],

  markdown: {
    // Match Hugo: no smart punctuation (see the V8 correction note in
    // PLANNING.md §6); syntax highlighting stays on, like the baseline.
    processor: satteri({
      features: { smartPunctuation: false },
      hastPlugins: [mermaidPlugin],
    }),
    // Mermaid blocks stay raw in the Markdown pipeline: the hast plugin in
    // `src/lib/mermaid.ts` rewrites them to `<pre class="mermaid">`, exactly
    // what Hugo's render hook emits.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { theme: chromaMonokai },
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.5,
      serialize: (item) => {
        const { pathname } = new URL(item.url);
        const isHome = pathname === '/' || pathname === '/id/';
        const isPaged = /\/page\/\d+\/$/.test(pathname);
        const isArticle = /^\/(?:id\/)?(?:projects|blogs)\/[^/]+\/$/.test(pathname);
        const isSection = /^\/(?:id\/)?(?:projects|blogs|contact)\/$/.test(pathname);
        const priority = isHome ? 1 : isPaged ? 0.3 : isArticle ? 0.7 : isSection ? 0.8 : 0.5;
        const sectionPath = pathname.replace(/page\/\d+\/$/, '');
        const lastmod = isPaged
          ? contentDates.latestBySection.get(sectionPath)
          : (contentDates.dates.get(pathname) ??
            contentDates.latestBySection.get(pathname) ??
            (isHome && contentDates.latestOverall.getTime() > 0
              ? contentDates.latestOverall
              : undefined));
        const links = item.links?.length
          ? [
              ...item.links,
              ...(item.links.some((link) => link.lang === 'x-default')
                ? []
                : [
                    {
                      lang: 'x-default',
                      url: item.links.find((link) => link.lang === 'en-US')?.url ?? item.url,
                    },
                  ]),
            ]
          : item.links;
        return { ...item, priority, lastmod, links };
      },
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', id: 'id-ID' },
      },
      filter: (page) => !isRedirectPath(new URL(page).pathname),
    }),
    singleSitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
