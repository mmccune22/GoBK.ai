import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gobk.ai',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/search') })],
  build: { inlineStylesheets: 'never' },
});
