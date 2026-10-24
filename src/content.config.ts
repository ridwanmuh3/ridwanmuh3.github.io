import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * One collection per content type. The language lives in the entry id:
 * `en/hello-world`, `id/hello-world`. Nothing is added to frontmatter.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    summary: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    photo: z.string().optional(),
    mark: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = { blog, projects };
