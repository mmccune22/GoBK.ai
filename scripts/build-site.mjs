import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';

const enablePreview = process.env.CF_PAGES_BRANCH === 'codex/jimmy-experiments' || process.argv.includes('--newsletter-test');
const env = { ...process.env, ...(enablePreview ? newsletterPreviewEnv : {}) };
console.log(`Newsletter signup: ${enablePreview ? 'enabled for Jimmy preview' : 'default configuration'}`);
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)), 'build'], { env, stdio: 'inherit' });
process.exit(result.status ?? 1);
