/**
 * Pagination helper that reproduces Hugo's URL scheme (V5, dibatalkan jadi
 * tetap memakai `/page/N/`).
 *
 * Astro's own `paginate()` cannot be used here: `[...page]` would collide
 * with `[slug]`, and it emits the first page at `/1/`. Page 1 therefore lives
 * at the list root, exactly like Hugo.
 */
/**
 * Page size, from `hugo.toml` (`[pagination] pagersize = 5`).
 */
export const PAGE_SIZE = 5;

export interface Pager {
  number: number;
  href: string;
}

export interface PageSlice<T> {
  /** Items of the requested page. */
  items: T[];
  current: number;
  totalPages: number;
  pagers: Pager[];
  prevHref?: string;
  nextHref?: string;
}

function pageHref(basePath: string, number: number): string {
  return number === 1 ? basePath : `${basePath}page/${number}/`;
}

/**
 * @param basePath list root with a trailing slash, e.g. `/en/projects/`
 */
export function paginate<T>(
  items: T[],
  pageSize: number,
  basePath: string,
  current = 1,
): PageSlice<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    current,
    totalPages,
    pagers: Array.from({ length: totalPages }, (_, index) => ({
      number: index + 1,
      href: pageHref(basePath, index + 1),
    })),
    prevHref: current > 1 ? pageHref(basePath, current - 1) : undefined,
    nextHref: current < totalPages ? pageHref(basePath, current + 1) : undefined,
  };
}
