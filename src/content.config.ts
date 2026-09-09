import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categoryIds } from './data/categories';

// Restored from the September 4 source export; category IDs follow this branch.
// The byline component adds the professional title, so the default is a name.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), shortAnswer: z.string(), description: z.string(),
    category: z.enum(categoryIds),
    tags: z.array(z.string()).default([]),
    doors: z.array(z.enum(['help-now', 'way-out', 'understanding-bankruptcy'])).default([]),
    author: z.string().default('Matt McCune'),
    reviewer: z.string().default('Matt McCune'),
    published: z.date(), updated: z.date(),
    status: z.enum(['draft', 'reviewed']).default('draft'),
    jurisdictionNote: z.string().optional(),
    showCheckup: z.boolean().default(false),
    startHere: z.boolean().default(false),
    weight: z.number().default(50),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  }),
});
export const collections = { articles };
