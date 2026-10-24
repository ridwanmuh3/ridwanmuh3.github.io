import type { Lang } from '../config';

const LOCALES: Record<Lang, string> = { en: 'en-US', id: 'id-ID' };

/** Medium date, formatted in UTC so a date-only value never shifts a day. */
export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Short month + year for an ISO year-month value, formatted in UTC. */
export function formatMonth(value: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T00:00:00Z`));
}

/** Stored date ranges use a hyphen-minus; render them with an en dash. */
export function enDash(text: string): string {
  return text.replace(/\s+-\s+/g, ' – ');
}

/** Hugo's reading time uses 213 words per minute and never reports 0. */
export function readingTime(body: string): number {
  return Math.max(1, Math.ceil(wordCount(body) / 213));
}

export function wordCount(body: string): number {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

/** Hugo's `truncate` cuts at a word boundary and appends an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).trimEnd()}…`;
}
