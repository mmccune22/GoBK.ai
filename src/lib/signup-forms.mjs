import { newsletterConfig } from './newsletter.mjs';

/** Keep subscriptions independent while sharing the public-URL checks. */
export function signupFormConfig(kind, env = {}) {
  if (kind === 'newsletter') return newsletterConfig(env);
  if (kind === 'series') return newsletterConfig({
    PUBLIC_GOBK_NEWSLETTER_FORM_URL: env.PUBLIC_GOBK_SERIES_FORM_URL,
    PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: env.PUBLIC_GOBK_SERIES_SIGNUP_ENABLED,
  });
  throw new Error('Unknown email subscription.');
}

const copy = {
  newsletter: {
    title: 'The GoBK Guide newsletter signup',
    consent: 'Send me The GoBK Guide newsletter. I can unsubscribe anytime.',
    button: 'Get the newsletter',
    success: 'Check your inbox and confirm your email to receive The GoBK Guide.',
  },
  series: {
    title: 'Bankruptcy Getting Started email series signup',
    consent: 'Send me the six-email Bankruptcy Getting Started series. I can unsubscribe anytime.',
    button: 'Start the email series',
    success: 'Check your inbox and confirm your email to start Bankruptcy Getting Started.',
  },
};

/** The provider script uses fixed IDs, so each form gets its own document. */
export function signupEmbedDocument(formHtml, kind, formUrl) {
  const content = copy[kind];
  if (!content) throw new Error('Unknown email subscription.');
  const destination = newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_FORM_URL: formUrl, PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'true' }).formUrl;
  const embed = formHtml
    .replace('__BREVO_FORM_URL__', destination)
    .replace('data-newsletter-signup', `data-email-signup-form="${kind}"`)
    .replace('aria-label="Subscribe to The GoBK Guide"', `aria-label="${content.title}"`)
    .replace('Check your inbox for a confirmation email. Click its link to subscribe to The GoBK Guide and receive your first issue.', content.success)
    .replace(/<p>I agree to receive The GoBK Guide[^<]*<\/p>/, `<p>${content.consent}</p>`)
    .replace(/\n\s+Subscribe\s*\r?\n/, `\n              ${content.button}\n`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${content.title}</title></head><body><div id="gobk-form-body">${embed}
<p class="signup-note">Confirm your email to begin. Unsubscribe anytime. <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p></div>
<style>
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#434343;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.sib-form{padding:0!important;background:transparent!important;text-align:left!important;font-family:inherit!important}
#sib-form-container{margin:0!important}#sib-container{max-width:none!important;margin:0!important;padding:0!important;border:0!important;text-align:left!important}
.sib-form-block{padding:0!important}.sib-form p{margin:0;line-height:1.45;color:#434343}
.entry__label[for="OPT_IN"],.entry__specification{display:none!important}
.entry__field{margin-top:6px}.sib-form .input{font-family:inherit!important}
#sib-form input[type="email"]{width:100%;min-height:48px;background:#fff!important;color:#434343!important;-webkit-text-fill-color:#434343;caret-color:#434343;border:1px solid #aab7ad;border-radius:6px;padding:12px;font-size:16px}
#sib-form input[type="email"]::placeholder{color:#6b6f6b;opacity:1}#sib-form input[type="email"]:focus-visible{outline:3px solid #4f6e55;outline-offset:2px}
#sib-form input[type="email"]:-webkit-autofill{-webkit-text-fill-color:#434343;box-shadow:0 0 0 1000px #fff inset;caret-color:#434343}
.entry__choice{padding:0!important;text-indent:0!important}.entry__choice>label{display:flex!important;align-items:flex-start;gap:8px}.entry__choice p{font-size:13px!important}.entry__choice .checkbox{display:none!important}
#sib-form input[type="checkbox"]{position:static!important;z-index:auto!important;opacity:1!important;appearance:auto!important;flex:0 0 18px;width:18px!important;height:18px!important;margin:2px 0 0!important;accent-color:#3f5a44}
#sib-form input[type="checkbox"]:focus-visible{outline:3px solid #4f6e55;outline-offset:2px}
.entry__choice>label>span:last-child{min-width:0;flex:1}
.sib-form-block__button{display:flex!important;justify-content:center;align-items:center;width:100%;min-height:48px;padding:12px 16px!important;background:#3f5a44!important;color:#fff!important;font-family:inherit!important;font-size:16px!important;font-weight:600!important;border-radius:6px!important;cursor:pointer}
.sib-form-block__button:hover{background:#4f6e55!important}.sib-form-block__button:focus-visible{outline:3px solid #4f6e55;outline-offset:3px}
.input--hidden{display:none!important}.sib-form-message-panel{display:none}.sib-form-message-panel--active{display:block!important;margin-bottom:12px!important;width:100%;max-width:none!important}
.sib-form-message-panel__text{padding:10px!important;font-size:14px!important}.sib-form-message-panel__text--center{justify-content:flex-start!important}
.signup-note{margin:8px 0 0;font-size:12px;line-height:1.5;color:#6b6f6b}.signup-note a{color:#4f6e55;text-underline-offset:2px}
</style>
<script>
(() => {
  const body = document.getElementById('gobk-form-body');
  let previousHeight = 0;
  const reportHeight = (force = false) => {
    const height = Math.ceil(body.getBoundingClientRect().height) + 8;
    if (force || height !== previousHeight) {
      previousHeight = height;
      window.parent.postMessage({type:'gobk-signup-height',height}, '*');
    }
  };
  new ResizeObserver(() => reportHeight()).observe(body);
  window.addEventListener('load', () => reportHeight(true));
  window.addEventListener('message', (event) => {
    if (event.source === window.parent && event.data?.type === 'gobk-signup-measure') reportHeight(true);
  });
  reportHeight();
})();
</script></body></html>`;
}
