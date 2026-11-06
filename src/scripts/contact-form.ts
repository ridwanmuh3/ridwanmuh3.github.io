/**
 * Contact form validation + submit glue for `components/ContactForm.astro`.
 *
 * The Worker owns the real checks (rate limit, time-on-form, Turnstile token);
 * this module only mirrors them well enough to fail fast in the browser.
 */

type Field = 'name' | 'email' | 'message';

const FIELDS: readonly Field[] = ['name', 'email', 'message'];

interface Turnstile {
  reset?: () => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

interface ErrorPayload {
  ok?: boolean;
  field?: unknown;
}

const isField = (value: unknown): value is Field =>
  value === 'name' || value === 'email' || value === 'message';

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('.contact-form');
  if (!form) return;

  const name = form.querySelector<HTMLInputElement>('#cf-name');
  const email = form.querySelector<HTMLInputElement>('#cf-email');
  const message = form.querySelector<HTMLTextAreaElement>('#cf-message');
  const company = form.querySelector<HTMLInputElement>('#cf-company');
  const startedAt = form.querySelector<HTMLInputElement>('input[name="t"]');
  const submit = form.querySelector<HTMLButtonElement>('.contact-submit');
  const status = form.parentElement?.querySelector<HTMLElement>('.contact-status');
  if (!name || !email || !message || !company || !startedAt || !submit || !status) return;

  const fields: Record<Field, HTMLInputElement | HTMLTextAreaElement> = { name, email, message };
  const d = form.dataset;
  const sendLabel = submit.textContent ?? '';

  // Written at load so the Worker's time-on-form check stays meaningful.
  startedAt.value = String(Date.now());

  const errFor = (field: Field) => d[`err${field[0].toUpperCase()}${field.slice(1)}`];
  const errorOf = (field: Field) => form.querySelector<HTMLElement>(`#cf-${field}-error`);

  const showError = (field: Field) => {
    const input = fields[field];
    input.setAttribute('aria-invalid', 'true');
    const el = errorOf(field);
    if (el) {
      el.textContent = errFor(field) ?? '';
      el.hidden = false;
    }
    input.focus();
  };

  const clearErrors = () => {
    for (const field of FIELDS) {
      fields[field].removeAttribute('aria-invalid');
      const el = errorOf(field);
      if (el) {
        el.textContent = '';
        el.hidden = true;
      }
    }
  };

  const setStatus = (text: string, isError: boolean) => {
    status.textContent = text;
    status.classList.toggle('text-danger', isError);
  };

  const firstInvalid = (): Field | null => {
    const trimmedName = name.value.trim();
    const trimmedEmail = email.value.trim();
    const trimmedMessage = message.value.trim();
    if (trimmedName.length < 1 || trimmedName.length > 100) return 'name';
    if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      return 'email';
    }
    if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) return 'message';
    return null;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    setStatus('', false);

    const bad = firstInvalid();
    if (bad) {
      showError(bad);
      return;
    }

    const token =
      form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? '';
    const reset = () => window.turnstile?.reset?.();

    submit.disabled = true;
    submit.textContent = d.msgSending ?? '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
          company: company.value,
          t: Number(startedAt.value),
          token,
        }),
      });

      let payload: ErrorPayload | null = null;
      try {
        payload = (await res.json()) as ErrorPayload;
      } catch {
        /* leave null */
      }

      if (res.ok && payload?.ok) {
        form.hidden = true;
        setStatus(d.msgSent ?? '', false);
        return;
      }

      if (res.status === 422 && isField(payload?.field)) {
        showError(payload.field);
      } else {
        setStatus(res.status === 429 ? (d.msgRateLimited ?? '') : (d.msgError ?? ''), true);
      }
      reset();
    } catch {
      setStatus(d.msgError ?? '', true);
      reset();
    } finally {
      if (!form.hidden) {
        submit.disabled = false;
        submit.textContent = sendLabel;
      }
    }
  });
}
