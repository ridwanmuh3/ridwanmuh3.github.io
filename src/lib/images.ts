import type { ImageMetadata } from 'astro';

import avatar from '../assets/images/ridwan-avatar.webp';

const projectImages = import.meta.glob('../assets/images/projects/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

export { avatar };

/** Content keeps `photo = 'name.webp'`; the asset map resolves it at build time. */
export function getProjectImage(photo: string): ImageMetadata {
  const key = Object.keys(projectImages).find((path) => path.endsWith(`/${photo}`));
  if (!key) {
    throw new Error(`Project image "${photo}" not found in src/assets/images/projects`);
  }
  return projectImages[key];
}
