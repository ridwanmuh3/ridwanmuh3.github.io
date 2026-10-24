import type { Lang } from '../config';
import type { SiteContent } from './types';

import { en } from './en';
import { id } from './id';

/**
 * Language → typed data module. Hugo did this with `index hugo.Data
 * site.Language.Lang`; keeping one resolver avoids importing both modules
 * at every call site.
 */
const data: Record<Lang, SiteContent> = { en, id };

export function getContent(lang: Lang): SiteContent {
  return data[lang];
}
