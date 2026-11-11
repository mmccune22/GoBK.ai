# Library newsletter integration

The Library now has a real `/newsletter/` page with two independent choices:
The GoBK Guide and the six-email Bankruptcy Getting Started series. The shared
Library/article banner links to that page instead of the old `/api/subscribe`
placeholder. Reading samples does not enroll anyone.

## Current public behavior

`npm run build` closes both forms by default. Visitors see that subscriptions are
not open yet and see both subscription choices. Draft issue and welcome routes are emitted only by the local trial build. Old environment flags
cannot accidentally activate the existing trial. No provider account, list,
automation, sender, or email was changed by this integration.

## Local trial

`npm run build:newsletter-test` explicitly includes the existing Brevo test forms.
`npm run test:newsletter-trial` checks that artifact. The page labels [TEST]
delivery and pending Matt review. This command refuses Cloudflare builds.
Do not publish a locally built trial artifact or submit a real address without
the owner's instruction. Building and testing do not submit forms or send mail.
Rebuild with `npm run build` before deploying the ordinary site.

The reused October trial has double confirmation and separate consumer lists:
Guide list #3 and Getting Started list #4. Guide confirmation sends the first
test issue; series confirmation starts the existing trial on days 1, 3, 5, 7,
10 and 14. These are previously recorded provider settings, not newly verified
delivery or current provider acceptance. The provider HTML shows actual provider
success/errors. Each form has one email field and separate unchecked consent.

## Launch configuration

Before opening subscriptions, Matt must complete the editorial/attorney review,
and the sender, company-domain authentication, mailing address, unsubscribe,
double confirmation, list separation and actual inbox delivery must be verified.
No recurring newsletter campaign is created by this code.

Verify the existing forms and messages for launch, then set
`GOBK_NEWSLETTER_LAUNCH_APPROVED=true` and `GOBK_EMAIL_PROVIDER_READY=true`, then enable each desired subscription with
`PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED=true` / `PUBLIC_GOBK_SERIES_SIGNUP_ENABLED=true`.
Set its matching `PUBLIC_GOBK_NEWSLETTER_FORM_URL` / `PUBLIC_GOBK_SERIES_FORM_URL`.
Existing form URLs may be reused after their sender, content and confirmation flow are ready. The URLs must be public HTTPS Brevo hosted-form destinations; never use API keys.
Two enabled subscriptions require different destinations. Missing or unsafe
configuration fails the build. Approval is a release decision, not inferred from
this configuration flag.

`npm run test:newsletter` validates the closed production artifact, configuration
gates, destination validation, separate consent and provider error handling.
Privacy text explains Brevo processing only when subscription forms are enabled.
