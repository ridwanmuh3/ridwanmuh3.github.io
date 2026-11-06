/**
 * Build-time icon registry.
 *
 * Kept out of `Icon.astro`'s frontmatter so the glob and the name map are built
 * once per build instead of once per rendered icon.
 */
const modules = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => [
    path.split('/').pop()!.replace(/\.svg$/, ''),
    raw,
  ]),
);
