import { getCollection, type CollectionEntry } from 'astro:content';

import type { Lang } from '../config';
import { localizeHref } from './url';

export type CollectionName = 'blog' | 'projects';
export type Entry<C extends CollectionName> = CollectionEntry<C>;

/** Hugo server -D shows drafts; the production build hides them. */
export function isPublished(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.PROD ? !entry.data.draft : true;
}

export async function getLocalizedEntries<C extends CollectionName>(
  collection: C,
  lang: Lang,
): Promise<Entry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter(
    (entry) => entry.id.startsWith(`${lang}/`) && isPublished(entry),
  );
}

export function slugFromId(id: string): string {
  return id.split('/').slice(1).join('/');
}

export function sortByDateDesc<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getTranslation<C extends CollectionName>(
  collection: C,
  id: string,
  target: Lang,
): Promise<Entry<C> | undefined> {
  const entries = await getCollection(collection);
  const targetId = `${target}/${slugFromId(id)}`;
  return entries.find((entry) => entry.id === targetId);
}

export function entryHref(lang: Lang, collection: CollectionName, id: string): string {
  const section = collection === 'blog' ? 'blogs' : 'projects';
  return localizeHref(lang, `/${section}/${slugFromId(id)}/`);
}
