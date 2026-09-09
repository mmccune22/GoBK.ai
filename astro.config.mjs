import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://gobk-development-workspace.jimmydanol.chatgpt.site',
  integrations: [mdx()],
  build: { inlineStylesheets: 'never' },
});
