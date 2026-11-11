import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';

/** Public form destinations only. No credentials or subscriber data belong here. */
export const newsletterProductionConfig = {
  approved: true,
  approvalDate: '2026-11-11',
  // Verified provider templates, double confirmation, inbox delivery and unsubscribe on 2026-11-11.
  providerReady: true,
  branch: 'development',
  // Reuse the existing, separate consumer lists and double-confirmation forms.
  signupEnv: { ...newsletterPreviewEnv },
};
