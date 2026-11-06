/**
 * Header menu + timeline dot reveal.
 *
 * Lives outside the layout so Astro can bundle, minify and hash it once per
 * build instead of inlining a copy into every page's HTML. Runs after parse
 * (module scripts are deferred), which is where the old end-of-body inline
 * scripts ran anyway.
 */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  const toggle = nav?.querySelector<HTMLButtonElement>('.site-nav-toggle');

  if (nav && toggle) {
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open: boolean) => toggle.setAttribute('aria-expanded', String(open));

    toggle.addEventListener('click', () => {
      const open = !isOpen();
      setOpen(open);
      if (open) nav.querySelector<HTMLElement>('.site-menu a')?.focus();
    });

    document.addEventListener('click', (event) => {
      if (!isOpen()) return;
      if (event.target instanceof Node && !nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      setOpen(false);
      toggle.focus();
    });
  }

  const dots = document.querySelectorAll<HTMLElement>('.timeline-dot');
  if (!dots.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      }
    },
    { threshold: 0.5 },
  );
  dots.forEach((dot) => io.observe(dot));
}
