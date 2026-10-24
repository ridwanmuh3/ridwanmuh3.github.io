// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

import { isRedirectPath, siteConfig } from './src/config.ts';
import { mermaidPlugin } from './src/lib/mermaid-plugin.mjs';
import { chromaMonokai } from './src/lib/monokai-theme.mjs';

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
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', id: 'id-ID' },
      },
      filter: (page) => !isRedirectPath(new URL(page).pathname),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
