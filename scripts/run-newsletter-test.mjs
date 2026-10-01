import { spawnSync } from 'node:child_process';
import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';

const result = spawnSync(process.execPath, ['--test', 'scripts/test-newsletter.mjs'], { env: { ...process.env, ...newsletterPreviewEnv }, stdio: 'inherit' });
process.exit(result.status ?? 1);
