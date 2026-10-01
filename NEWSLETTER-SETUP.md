# The GoBK Guide — experimental implementation

Audience: people dealing with debt and considering bankruptcy. Twice a month,
one common question, one preparation checklist, one next step. No pressure to file.

## What is implemented

- `/newsletter`: landing page, sample issues, signup entry point and FAQs.
- `/newsletter/welcome`: post-confirmation welcome-email preview.
- Four issue drafts: where to start, preparing for a consultation, bankruptcy terms,
  and questions for an attorney. All are marked pending editorial/attorney review.
- Shared newsletter section across the home page, Library and articles; navigation,
  privacy and Checkup references updated.
- One public Brevo hosted-form URL and an explicit activation flag. No API key,
  subscriber store, email entry, or custom subscription endpoint in this static site.

## Brevo setup

Use the existing BK FastPass account. Do not import the FastLane firm waitlist into
this consumer newsletter. Keep the GoBK consumer list separate.

### Saved provider setup, October 1, 2026

Created the dedicated `GoBK Guide — Consumers` list and saved
`The GoBK Guide — consumer signup (experimental)`:
https://app.brevo.com/contact/forms/subscription/edit/6abe8aad0accffc5587a0af3
The form has required email, optional first name, and required explicit newsletter
consent. Only the new consumer list is selected; the existing list is preserved.

Jimmy completed verification. Double confirmation is now available and saved.
The form sends default template 4 for double opt-in. After confirmation, it sends
template 5 as the first issue; there is no second welcome automation or campaign.
Only the consumer list is selected. The hosted form is complete and its public
URL is recorded in `.env.example` and `.env.newsletter-test`.

The first issue is saved as the active Brevo template
`GoBK Guide — First issue (test draft)` (template 5):
https://app.brevo.com/templates/email/edit/5
It uses a `[TEST]` subject and visible draft notice, the existing account sender
and reply inbox, the company address already stored in Brevo, and test-site links.
Brevo rewrites the Gmail sender to its `brevosend.com` domain. A company sender
and domain authentication remain launch work.

The controlled test submitted only Jimmy's existing Gmail inbox. Brevo recorded
the confirmation as Sent at 14:47 Denver time on October 1. The confirmation link
was exercised from Brevo's email-log preview and returned successful subscription.
This proves the confirmation action, not inbox receipt. Confirmation automatically
triggered template 5, recorded as Sent at 14:50. Its generated email preview has a
real Brevo unsubscribe link and the complete first-issue content. No extra manual
test, bulk campaign, or duplicate welcome automation was sent in this activation pass.
Brevo showed no paused emails and available sending credits. Both subjects were
absent from a search of all Gmail folders at the latest check, and there was no
Delivered event yet. Inbox delivery is still unconfirmed; do not equate Sent with Delivered.

1. Continue the saved dedicated consumer list and full-page signup-form draft.
2. Ask only for email and optional first name. Explain the twice-monthly cadence,
   link the approved privacy policy, and include explicit newsletter consent.
3. Choose double confirmation. Unconfirmed contacts must not receive campaigns.
4. Customize the confirmation email; configure the welcome as the final confirmation
   email or one automation after confirmation, never both.
5. Verify the actual GoBK sender/reply mailbox, authenticate its domain, complete
   required phone verification, and configure the company mailing address and unsubscribe.
6. Export with `npm run newsletter:export`. HTML and plain text appear in the ignored
   `newsletter-output/` directory. They share the web-preview content. These are
   drafts, not send-ready campaigns: replace address placeholders, verify the Brevo
   unsubscribe token, and point article links at the approved deployed site.
7. Have Matt review content. Test confirmation, welcome receipt, duplicate signup,
   unsubscribe and resubscribe using Jimmy’s controlled inbox before opening signup.

## Connect the site

Copy `.env.example` to `.env.local`. Set `PUBLIC_GOBK_NEWSLETTER_FORM_URL` to the
public Brevo `https://….sibforms.com/serve/…` URL. Keep the activation flag `false`
until the provider checks pass. Set `PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED=true`
only for the intended build. These values are public and baked into the static output;
changing them requires a rebuild. Never use an API endpoint or secret as the URL.

The enabled button opens Brevo in a new tab and does not prefill or transmit an
address from this site. Brevo handles data entry, consent, confirmation, and storage.
Missing configuration leaves signup closed; unsafe destinations fail the build.

For this specifically authorized signup/receipt trial, use
`npm run build:newsletter-test` followed by `npm run test:newsletter-test`.
The explicitly selected `newsletter-test` mode loads the committed public
`.env.newsletter-test`. Its enabled UI says the first issue is a test draft.
The ordinary `npm run build` remains closed by default. No secret is stored in
either public configuration file.

## Verify and review

### Shareable test site

https://gobk-newsletter-test.jimmydanol.chatgpt.site/newsletter/

Published October 1, 2026 as a separate public, noindex test site, initially with
signup closed. The newsletter-test build connects its signup button to the saved
Brevo form for the requested trial. Configuration does not itself prove email receipt.
The isolated publication checkout is `../newsletter-test-site`, with its own
Sites source remote and `.openai/hosting.json`. It began from this branch at
`6a7d22d8a22748ee567d250e749cfa3eaf32ae1f`; its first deployed source is
`f862b59bdae89ba538d182ba85fa4ff61f1d9162`, Sites version 1. Preserve the separate
remote when rebuilding it. This does not refresh the dashboard or publish Matt's main.

Version 2 was successfully published October 1 at 20:52 UTC from
`bad9acc4fb7a3967f39a9c05c8f7cd5bfdd4e482`, which incorporates the newsletter
configuration commit `ef4cd9e` from `jimmy-experimental`. The live signup link uses
the saved hosted form, the privacy copy reflects Brevo, and noindex remains in place.
Both the ordinary closed build and enabled test build passed all three newsletter
checks; the enabled publication also passed its own build and checks.

`npm run build`, then `npm run test:newsletter` and `npm run newsletter:export`.
Review desktop/phone layout, all five reading previews, the signup entry point,
FAQs and privacy wording. The branch retains noindex and experimental markers.
Matt's `main:/docs` Pages publication is a separate release path.

Provider references checked October 1, 2026:
- https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
- https://help.brevo.com/hc/en-us/articles/4402386448530--Manual-Personalize-your-messages-with-dynamic-content-Brevo-Template-Language

The dashboard preview requires importing a clean committed build with its existing
`tools/import-jimmy-site.py` workflow. Pushing this branch alone does not update it.
The dashboard currently has separate uncommitted Checkup work; preserve it.

## Source checks for legal draft

The brief Chapter 7/13 descriptions link to the U.S. Courts introductions, read on
October 1, 2026. They do not determine eligibility, exemptions, property outcomes,
or discharge for a particular reader. Matt remains the legal/editorial reviewer.

- https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics
- https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-13-bankruptcy-basics
