export function emailExportConfig(env = {}, { trial = false } = {}) {
  const address = (env.GOBK_EMAIL_MAILING_ADDRESS ?? '').trim();
  if (!trial && (!address || /\[|\]|configure|placeholder/i.test(address))) {
    throw new Error('Set GOBK_EMAIL_MAILING_ADDRESS to the verified company mailing address before exporting production emails.');
  }
  return {
    trial,
    address: address || '[Company mailing address — local trial only]',
    baseUrl: 'https://gobk-ai.pages.dev',
    trialNote: trial ? '[TEST] Local delivery trial.' : '',
  };
}
