/**
 * Click-to-enlarge viewer glue for `components/Lightbox.astro`.
 *
 * One `<dialog>` per page; every `[data-lightbox-src]` trigger hands it its own
 * image, so N screenshots cost one dialog and one script. Native dialog carries
 * the focus trap, the top layer and Escape for free — this module only swaps the
 * image and drives the zoom levels.
 */

/** 0 = fit the viewport, 1/2/3 = multiples of the image's own pixels. */
const LEVELS = [0, 1, 2, 3];

/** How long the close fade lasts before the decoded frame is released. */
const RELEASE_DELAY = 250;

interface Connection {
  saveData?: boolean;
}

export function initLightbox(): void {
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-lightbox-src]')];
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  if (!dialog) return;

  const q = <T extends Element>(selector: string) => dialog.querySelector<T>(selector);
  const img = q<HTMLImageElement>('[data-lightbox-img]');
  const stage = q<HTMLElement>('[data-lightbox-stage]');
  const frame = q<HTMLElement>('[data-lightbox-frame]');
  const caption = q<HTMLElement>('[data-lightbox-caption]');
  const level = q<HTMLElement>('[data-lightbox-reset]');
  const closeBtn = q<HTMLElement>('[data-lightbox-close]');
  if (!img || !stage || !frame || !caption || !level || !closeBtn) return;

  const fitLabel = dialog.dataset.lightboxFitLabel ?? '';
  const root = document.documentElement;

  let step = 0;
  let trigger: HTMLElement | null = null;
  let cleanup = 0;

  const apply = () => {
    step = Math.min(Math.max(step, 0), LEVELS.length - 1);
    const zoom = LEVELS[step];
    const zoomed = zoom > 0;
    // Width is left unset while fitting so CSS contain-boxes the image;
    // past that the img is sized from its own pixels and the stage scrolls.
    const width = img.naturalWidth || img.width;
    img.style.width = zoomed ? `${Math.round(width * zoom)}px` : '';
    img.classList.toggle('is-zoomed', zoomed);
    level.textContent = zoomed ? `${zoom * 100}%` : fitLabel;
    // Re-centre after the new box has been laid out.
    requestAnimationFrame(() => {
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
    });
  };

  const setStep = (next: number) => {
    step = next;
    apply();
  };

  // One persistent handler instead of a fresh `once` listener per open: the
  // bitmap may land after the dialog closes, so only re-fit while it is up.
  img.addEventListener('load', () => {
    if (dialog.open && step === 0) apply();
  });

  const show = (from: HTMLElement) => {
    const src = from.dataset.lightboxSrc;
    if (!src) return;

    window.clearTimeout(cleanup);
    trigger = from;
    caption.textContent = from.dataset.lightboxCaption ?? '';
    img.alt = from.dataset.lightboxAlt ?? '';
    step = 0;
    // Drop any zoom left over from a close that is still inside its release
    // window, so reopening always starts from "fit".
    img.classList.remove('is-zoomed');
    img.style.width = '';

    // Reserve the final box from dimensions we already know (the trigger's own
    // `<img>` for diagrams, the uncropped original's for screenshots) so the
    // stage does not reflow when the full-size frame lands.
    const thumb = from.querySelector<HTMLImageElement>('img');
    const width = Number(from.dataset.lightboxW || thumb?.getAttribute('width')) || 0;
    const height = Number(from.dataset.lightboxH || thumb?.getAttribute('height')) || 0;
    if (width && height) {
      img.setAttribute('width', String(width));
      img.setAttribute('height', String(height));
      img.style.aspectRatio = `${width} / ${height}`;
    }

    if (img.getAttribute('src') !== src) img.src = src;
    if (img.complete && img.naturalWidth) apply();
    dialog.showModal();
    root.classList.add('lightbox-open');
    closeBtn.focus();
  };

  const hide = () => {
    if (dialog.open) dialog.close();
  };

  // Warm the full-size bitmap while the pointer or focus is still on the
  // trigger — the first tap then opens instantly. A single reused Image keeps
  // this bounded: a new src aborts the previous request, so at most one
  // original is ever resident, and phones on a metered link opt out.
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const canWarm =
    !matchMedia('(hover: none)').matches &&
    !matchMedia('(prefers-reduced-data: reduce)').matches &&
    !connection?.saveData;
  const warm = canWarm ? new Image() : null;
  let warmedSrc = '';

  const preload = (from: HTMLElement) => {
    if (!warm) return;
    const src = from.dataset.lightboxSrc;
    if (!src || src === warmedSrc || src === img.getAttribute('src')) return;
    warmedSrc = src;
    warm.src = src;
  };

  dialog.addEventListener('close', () => {
    root.classList.remove('lightbox-open');
    trigger?.focus();
    trigger = null;
    // Let the fade-out finish, then release the decoded full-size frame.
    window.clearTimeout(cleanup);
    cleanup = window.setTimeout(() => {
      if (dialog.open) return;
      img.removeAttribute('src');
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.removeAttribute('style');
      img.classList.remove('is-zoomed');
      caption.textContent = '';
      step = 0;
    }, RELEASE_DELAY);
  });

  // One tap-versus-drag discriminator for the whole dialog: a pointer that
  // travels more than a few pixels is a pan, never a tap. Pointer events fire
  // before click, so `dragged` is still accurate when click arrives.
  let start: { x: number; y: number } | null = null;
  let dragged = false;

  stage.addEventListener('pointerdown', (event) => {
    start = { x: event.clientX, y: event.clientY };
    dragged = false;
  });
  stage.addEventListener('pointermove', (event) => {
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) dragged = true;
  });
  const dropPointer = () => {
    start = null;
  };
  stage.addEventListener('pointerup', dropPointer);
  stage.addEventListener('pointercancel', dropPointer);

  // Tapping the image itself toggles fit ↔ 100%.
  stage.addEventListener('click', (event) => {
    if (dragged || !img.naturalWidth || event.target !== img) return;
    setStep(step > 0 ? 0 : 1);
  });

  // Tap the dimmed edges or press Escape to dismiss.
  dialog.addEventListener('click', (event) => {
    if (dragged) return;
    if (event.target === dialog || event.target === frame || event.target === stage) hide();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') {
      setStep(step + 1);
    } else if (event.key === '-') {
      setStep(step - 1);
    } else if (event.key === '0') {
      setStep(0);
    } else {
      return;
    }
    event.preventDefault();
  });

  for (const button of dialog.querySelectorAll<HTMLElement>('[data-lightbox-zoom]')) {
    button.addEventListener('click', () =>
      setStep(step + Number(button.dataset.lightboxZoom)),
    );
  }
  level.addEventListener('click', () => setStep(0));
  closeBtn.addEventListener('click', hide);

  for (const from of triggers) {
    from.addEventListener('click', () => show(from));
    from.addEventListener('pointerenter', () => preload(from), { passive: true });
    from.addEventListener('focus', () => preload(from));
  }
}
