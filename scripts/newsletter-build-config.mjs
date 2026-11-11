import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';
import { signupFormConfig } from '../src/lib/signup-forms.mjs';

/** Normal Library builds never enroll visitors in the existing test sequence. */
export function newsletterBuildEnv(input = {}, { trial = false } = {}) {
  const closed = {
    ...input,
    PUBLIC_GOBK_EMAIL_MODE: 'closed',
    PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'false',
    PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'false',
    PUBLIC_GOBK_NEWSLETTER_FORM_URL: '',
    PUBLIC_GOBK_SERIES_FORM_URL: '',
  };
  if (trial) {
    if (input.CF_PAGES || input.CF_PAGES_BRANCH) {
      throw new Error('Trial email forms are for local review only. Do not publish the active test sequence.');
    }
    return { ...closed, ...newsletterPreviewEnv, PUBLIC_GOBK_EMAIL_MODE: 'trial' };
  }
  if (input.GOBK_NEWSLETTER_LAUNCH_APPROVED !== 'true' || input.GOBK_EMAIL_PROVIDER_READY !== 'true') return closed;
  const live = { ...closed, PUBLIC_GOBK_EMAIL_MODE: 'live' };
  for (const prefix of ['NEWSLETTER', 'SERIES']) {
    const enabledKey = `PUBLIC_GOBK_${prefix}_SIGNUP_ENABLED`;
    const urlKey = `PUBLIC_GOBK_${prefix}_FORM_URL`;
    if (input[enabledKey] !== 'true') continue;
    live[enabledKey] = 'true';
    live[urlKey] = input[urlKey] ?? '';
    live[urlKey] = signupFormConfig(prefix === 'NEWSLETTER' ? 'newsletter' : 'series', live).formUrl;
  }
  if (live.PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED === 'true' &&
      live.PUBLIC_GOBK_SERIES_SIGNUP_ENABLED === 'true' &&
      live.PUBLIC_GOBK_NEWSLETTER_FORM_URL.replace(/\/$/, '') === live.PUBLIC_GOBK_SERIES_FORM_URL.replace(/\/$/, '')) {
    throw new Error('Newsletter and series must have separate subscription forms.');
  }
  return live;
}
