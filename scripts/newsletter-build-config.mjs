import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';
import { newsletterProductionConfig } from './newsletter-production-config.mjs';
import { signupFormConfig } from '../src/lib/signup-forms.mjs';

/** Keep signups closed except for the approved, provider-ready Library branch or explicit local verification. */
export function newsletterBuildEnv(input = {}, { trial = false, live = false, production = newsletterProductionConfig } = {}) {
  const closed = {
    ...input,
    PUBLIC_GOBK_EMAIL_MODE: 'closed',
    PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'false',
    PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'false',
    PUBLIC_GOBK_NEWSLETTER_FORM_URL: '',
    PUBLIC_GOBK_SERIES_FORM_URL: '',
  };
  if (trial && live) throw new Error('Choose either a local trial or a live verification build.');
  const cloudflare = Boolean(input.CF_PAGES || input.CF_PAGES_BRANCH);
  if (trial) {
    if (input.CF_PAGES || input.CF_PAGES_BRANCH) {
      throw new Error('Trial email forms are for local review only. Do not publish the active test sequence.');
    }
    return { ...closed, ...newsletterPreviewEnv, PUBLIC_GOBK_EMAIL_MODE: 'trial' };
  }
  if (live && cloudflare) throw new Error('The explicit live verification command is local only. Cloudflare must use its recorded branch.');
  const ready = production.approved === true && production.providerReady === true;
  if (live && !ready) throw new Error('Live verification requires recorded approval and completed provider checks.');
  if (!ready || (!live && input.CF_PAGES_BRANCH !== production.branch)) return closed;
  // Only the approved Library branch can enable forms; arbitrary environment flags are ignored.
  if (!live && production.branch !== 'development') throw new Error('Newsletter production is restricted to the development Library branch.');
  const result = { ...closed, PUBLIC_GOBK_EMAIL_MODE: 'live' };
  for (const prefix of ['NEWSLETTER', 'SERIES']) {
    const enabledKey = `PUBLIC_GOBK_${prefix}_SIGNUP_ENABLED`;
    const urlKey = `PUBLIC_GOBK_${prefix}_FORM_URL`;
    if (production.signupEnv[enabledKey] !== 'true') continue;
    result[enabledKey] = 'true';
    result[urlKey] = production.signupEnv[urlKey] ?? '';
    result[urlKey] = signupFormConfig(prefix === 'NEWSLETTER' ? 'newsletter' : 'series', result).formUrl;
  }
  if (result.PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED === 'true' &&
      result.PUBLIC_GOBK_SERIES_SIGNUP_ENABLED === 'true' &&
      result.PUBLIC_GOBK_NEWSLETTER_FORM_URL.replace(/\/$/, '') === result.PUBLIC_GOBK_SERIES_FORM_URL.replace(/\/$/, '')) {
    throw new Error('Newsletter and series must have separate subscription forms.');
  }
  return result;
}
