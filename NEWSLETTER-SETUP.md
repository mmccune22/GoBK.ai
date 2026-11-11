# Library newsletter integration

The Library now has a real `/newsletter/` page with two independent choices:
The GoBK Guide and the six-email Bankruptcy Getting Started series. The shared
Library/article banner links to that page instead of the old `/api/subscribe`
placeholder. Reading samples does not enroll anyone. Jimmy approved the newsletter
and series on November 11, 2026. Provider verification is recorded below;
the source-controlled readiness gate separately controls public activation.

## Current public behavior

`npm run build` closes both forms on local builds and Cloudflare preview branches.
The `development` Library branch opens both approved forms using the
source-controlled production manifest. Issue and welcome
routes are emitted by local trial or enabled live builds. Legacy environment
flags cannot activate either subscription.

## Local trial

`npm run build:newsletter-test` explicitly includes the existing Brevo forms.
`npm run test:newsletter-trial` checks that artifact. The local page displays a
`[TEST]` notice, but the forms use the same provider destinations as production:
submitting and confirming an address sends the current approved provider emails,
not a separate sandbox or emails with test subjects. Use only an authorized
test address. This command refuses Cloudflare builds.
Do not publish a locally built trial artifact or submit a real address without
the owner's instruction. Building and testing do not submit forms or send mail.
Rebuild with `npm run build` before deploying the ordinary site.

The forms retain separate consumer lists: Guide list #3 and Getting Started
list #4, with double-confirmation template #4. The provider HTML shows actual
provider success/errors. Each form has one email field and separate unchecked
consent; choosing one does not subscribe the visitor to the other.

## Provider verification — November 11, 2026

Both hosted form descriptions now reflect the approved offerings and current
privacy wording. The Guide double-confirmation flow was tested with a controlled
alias: confirming delivered the first issue, with no `[TEST]` subject or banner
(Gmail message `1a1cc02794bd46ae`). Unsubscribing that controlled alias also
succeeded.

The Guide uses display name `The GoBK Guide`, Brevo's free authenticated sender
`jimmydanol@12168189.brevosend.com`, and Reply-To `matt@mccunelegal.com`.
The received first issue passed SPF, DKIM and DMARC. This does not claim a custom
`gobk.ai` sending domain.

The active six-email Getting Started automation retains its schedule on days
1, 3, 5, 7, 10 and 14. Its message templates #8, #10, #13, #15, #16 and #17 now
contain the approved subjects and bodies without test labels. They use display
name `GoBK Getting Started`, the same Brevo sender address and Matt Reply-To.
The first automatic email after series confirmation was delivered with a clean
subject and body (Gmail message `1a1cc0631ce6b259`), correct Reply-To, and passing
SPF, DKIM and DMARC. Unsubscribing the controlled test alias also succeeded.
Each workflow send action must be saved after a template change; changing the
template alone can leave an old subject in the active automation. Later timed
deliveries were not repeated during this launch check. No recurring Guide
newsletter campaign was created.

## Launch configuration

The newsletter content is approved and both confirmation/delivery checks passed.
No recurring newsletter campaign is created by this code.

`scripts/newsletter-production-config.mjs` records Jimmy's November 11 approval,
the exact `development` branch, and the existing distinct public Brevo form URLs.
Its `providerReady` flag is **true** following the recorded provider checks. Other
Cloudflare branches stay closed even when the manifest is ready. No new lists,
forms, credentials, paid service or recurring campaign are required by this code.

Once provider readiness is recorded, run `npm run build:newsletter-live` and
`npm run test:newsletter-live` for a local live-artifact verification. The build
command requires the same manifest approval/readiness as Cloudflare and refuses
to run there explicitly; normal Cloudflare builds select the exact branch.
It builds the forms but never submits them or sends email. Live artifact tests
check separate destinations, unchecked required consent, provider status/error
panels, approved issue links, and absence of trial labels. Run `npm run build`
afterward to return the local artifact to its closed default.

Two enabled subscriptions require different normalized public HTTPS Brevo
hosted-form destinations. Missing or unsafe configuration fails the build.
Never put an API key, subscriber address or other credential in the manifest.

`npm run test:newsletter` validates the closed local artifact, configuration
gates, destination validation, separate consent and provider error handling.
Privacy text explains Brevo processing only when subscription forms are enabled.

## Approved email exports

Set `GOBK_EMAIL_MAILING_ADDRESS` to the verified provider mailing address and run
`npm run newsletter:export`. Both HTML and plain-text exports use the current
Library URL, preserve unsubscribe tokens and disclaimers, and omit trial labels.
Exports require a real configured address; they do not send anything.
For a local fixture only, either exporter accepts `--trial`, retains a visible
`[TEST]` notice, and permits a marked address placeholder.
Generated files remain ignored under `newsletter-output/`.
