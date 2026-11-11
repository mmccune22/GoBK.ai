import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { newsletterBuildEnv } from './newsletter-build-config.mjs';

const env = newsletterBuildEnv(process.env, { trial: process.argv.includes('--newsletter-test') });
console.log(`Newsletter signup: ${env.PUBLIC_GOBK_EMAIL_MODE}`);
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)), 'build'], { env, stdio: 'inherit' });
process.exit(result.status ?? 1);
