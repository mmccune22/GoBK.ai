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

Created and saved the dedicated `GoBK Guide — Consumers` list (0 contacts), and
the form draft `The GoBK Guide — consumer signup (experimental)`:
https://app.brevo.com/contact/forms/subscription/edit/6abe8aad0accffc5587a0af3
The form has required email, optional first name, and required explicit newsletter
consent. Only the new consumer list is selected; the existing list is preserved.

Brevo disables double confirmation and says an active Transactional account is
required, directing the owner to customer service for activation. Its account home
also requires phone verification before sending. Transactional configuration has
no delivery logs yet. The form remains unfinished at Settings; no public signup URL
has been activated, contacts imported, automation enabled, or emails sent.
Complete activation and phone verification in the existing account, then finish
the steps below. Do not publish the form with its current no-confirmation default.

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
only for the reviewed build. These values are public and baked into the static output;
changing them requires a rebuild. Never use an API endpoint or secret as the URL.

The enabled button opens Brevo in a new tab and does not prefill or transmit an
address from this site. Brevo handles data entry, consent, confirmation, and storage.
Missing configuration leaves signup closed; unsafe destinations fail the build.

## Verify and review

`npm run build`, then `npm run test:newsletter` and `npm run newsletter:export`.
Review desktop/phone layout, all five reading previews, the signup entry point,
FAQs and privacy wording. The branch retains noindex and experimental markers.
Matt's `main:/docs` Pages publication is a separate release path.

The dashboard preview requires importing a clean committed build with its existing
`tools/import-jimmy-site.py` workflow. Pushing this branch alone does not update it.
The dashboard currently has separate uncommitted Checkup work; preserve it.

## Source checks for legal draft

The brief Chapter 7/13 descriptions link to the U.S. Courts introductions, read on
October 1, 2026. They do not determine eligibility, exemptions, property outcomes,
or discharge for a particular reader. Matt remains the legal/editorial reviewer.

- https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics
- https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-13-bankruptcy-basics
