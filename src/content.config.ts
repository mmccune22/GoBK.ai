import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categoryIds } from './data/categories';
import { doors } from './data/categories';

const doorIds = doors.map((d) => d.id) as unknown as [string, ...string[]];

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    shortAnswer: z.string(),
    description: z.string(),
    category: z.enum(categoryIds),
    tags: z.array(z.string()).default([]),
    doors: z.array(z.enum(doorIds)).default([]),
    published: z.date(),
    updated: z.date(),
    status: z.enum(['draft', 'reviewed']).default('draft'),
    weight: z.number().default(50),
    showCheckup: z.boolean().default(false),
    startHere: z.boolean().default(false),
    jurisdictionNote: z.string().optional(),
    author: z.string().default('the GoBK team'),
    reviewer: z.string().default('Matt McCune'),
    sources: z
      .array(z.object({ title: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

export const collections = { articles };
