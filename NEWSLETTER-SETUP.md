# The GoBK Guide on Jimmy's Cloudflare branch

The newsletter is for people dealing with debt and exploring their options,
including bankruptcy. Jimmy approved this consumer direction and the October 2
content revision. That approval does not replace Matt's attorney review.
The `/newsletter/` page contains only two concise signup choices: The GoBK Guide
newsletter and Bankruptcy Getting Started, a six-email consumer series.
Earlier issue and welcome reading routes are preserved. All content remains
pending Matt's editorial and attorney review.

## Source and deployment

- Repository: `mmccune22/GoBK.ai`.
- Branch: `codex/jimmy-experiments`.
- Review URL: https://codex-jimmy-experiments.gobk-ai.pages.dev/newsletter/
- Cloudflare project: `gobk-ai`, Git-connected preview build.
- Only the exact Jimmy branch alias, `codex-jimmy-experiments.gobk-ai.pages.dev`,
  is public without Access login through a hostname-specific Bypass exception.
- Existing noindex build headers remain in place. Matt's review site, immutable
  deployment URLs, and all other previews remain protected by Cloudflare Access.
- Matt's `development`, `main`, and public gobk.ai are separate release paths.
- The older `jimmy-experimental` branch and ChatGPT test site are preserved.

Exact-host Access exception: app `190ca190-5548-47e7-bc64-bc550e59f1e0`,
policy `5efba227-0fb6-4409-b102-4565b684017b` (`Bypass`, `Include: Everyone`).

`npm run build` enables signup only when Cloudflare supplies
`CF_PAGES_BRANCH=codex/jimmy-experiments`. Other builds are closed by default.
`npm run build:newsletter-test` enables a local trial explicitly.
Run `npm run test:newsletter-test` after an enabled build, or
`npm run test:newsletter` after a default closed build.

## Signup and delivery

The Newsletter page has one email field for each subscription, with its own
required, unchecked consent and submission button. Each uses Brevo's official
HTML/Ajax form in a separate document because the provider embed has singleton
IDs and script state. The provider displays the actual submission result. The
optional first-name field is omitted. The existing shared newsletter widget on
other pages retains its newsletter destination. No API key, subscriber database,
or custom `/api/subscribe` endpoint is used. Public destinations are stored in
`scripts/newsletter-preview-config.mjs`; `src/lib/signup-forms.mjs` applies
independent activation and validates each URL. The base provider markup is in
`src/lib/brevo-form.html`.

The existing BK FastPass Brevo account uses the dedicated `GoBK Guide — Consumers`
list. It is separate from the existing firm list. Double confirmation sends
template 4; confirming the email automatically sends template 5,
`GoBK Guide — First issue (test draft)`, with a `[TEST]` subject.
There is no duplicate welcome automation or bulk campaign.

Provider form: https://app.brevo.com/contact/forms/subscription/edit/6abe8aad0accffc5587a0af3

First issue: https://app.brevo.com/templates/email/edit/5

The October 1 test to Jimmy's controlled Gmail inbox was delivered. Gmail contains
`[TEST] The GoBK Guide: where to start`; Brevo recorded delivery and opening.
Company sender/domain authentication and Matt's content review remain launch work.
Jimmy's exact branch alias is publicly accessible without Cloudflare Access login.

## October 2 content revision

The first issue now provides a private five-part snapshot: debts, income,
essential expenses, property concerns, and dated notices. Later issues cover
consultation preparation, Chapter 7 and Chapter 13, and leaving a consultation
with a clear next action. The welcome preview and signup-page copy match this
consumer focus. Existing slugs, signup placement, and readable email input remain.

Brevo template 5 has the revised first issue, with subject
`[TEST] GoBK Guide: your debt snapshot` and preview text
`Five parts. One clearer next step.` The existing confirmation flow, mailing
address, unsubscribe link, consumer list, and sender settings are preserved.
A single-recipient Brevo test reached Jimmy's controlled Gmail inbox on October 2
at 08:18:37 Denver time (message `1a0fcfb395e88e6c`). Its received body contains
all five snapshot items and the pending-review notice. This verifies the updated
template's delivery; the full signup flow was last verified on October 1.

Chapter descriptions were checked against the current U.S. Courts Chapter 7 and
Chapter 13 introductions. No Library article has been marked reviewed, and no
bulk newsletter campaign or recurring send schedule has been created.

## Bankruptcy Getting Started series — October 2

Jimmy requested a timed consumer series with a separate signup. The new Brevo
form adds confirmed contacts only to `GoBK — Bankruptcy Getting Started` (list
`#4`, provider row `6abfdb7f2a018b8e9ad59b42`). It does not add them to the
newsletter list (`#3`). Double confirmation uses template 4; the form's optional
final confirmation email is off, so it does not send newsletter template 5.

Form: https://app.brevo.com/contact/forms/subscription/edit/6abfda89ff39c60902b35459

Automation: https://app.brevo.com/automation/edit/1

`GoBK Getting Started — 6-email trial` is Active. Its trigger is contact added
to list #4 after activation; double confirmation precedes that list addition.
Contact re-entry is off, no existing contacts were enrolled, and unsubscribing
from emails is an active exit condition. It sends Day 1 immediately, waits two
days, sends Day 3, waits two, sends Day 5, waits two, sends Day 7, waits three,
sends Day 10, waits four, and sends Day 14. Email days are not court deadlines
or a case timetable.

| Day | Topic | Active template | Workflow message | Send step |
| --- | --- | --- | --- | --- |
| 1 | Understand your options | 6 | 8 | 3 |
| 3 | Make a private financial snapshot | 7 | 10 | 5 |
| 5 | Prepare for an attorney consultation | 9 | 13 | 7 |
| 7 | Compare Chapter 7 and Chapter 13 | 11 | 15 | 9 |
| 10 | Prepare if you decide to file | 12 | 16 | 11 |
| 14 | Understand what follows filing | 14 | 17 | 13 |

Editable source: `src/lib/bankruptcy-series.mjs`. `npm run series:export` produces
HTML/text drafts in ignored `newsletter-output/series/`. Set
`GOBK_EMAIL_MAILING_ADDRESS` to the approved company address before using exports.
Provider messages retain the existing Jimmy sender, approved company mailing
address, unsubscribe link, `[TEST]` subject, and Matt-review-pending banner.
No firm contacts or other existing contacts were enrolled.

Brevo's six-message test showed every send step Processed. All six arrived in
Jimmy's controlled Gmail inbox on October 2 at 10:50:47–10:50:51 Denver time;
received bodies have their correct day, review notice, company address, and
resolved unsubscribe link. This tests message delivery without waiting for the
real two-week delays. The saved workflow chain separately verifies delays of
2, 2, 2, 3, and 4 days. Future timed deliveries have not yet been observed.

Both enabled forms passed local desktop and 390px mobile checks: readable typed
email, native invalid-email handling, required unchecked consent, separate
destinations, responsive sizing, and no horizontal/vertical iframe overflow.
Build: 100 pages and 88 indexed pages; all five newsletter tests passed.

## Verification

Builds must retain all 100 pages and the 88-page Pagefind library index.
Check email and consent validation, provider acknowledgment, inbox confirmation,
automatic first issue, mobile layout, navigation, an article, and search.
A Git push alone is not deployment proof: verify the matching commit and successful
Cloudflare deployment, then check Jimmy's stable public branch URL without signing
in. Matt's review site and immutable deployment URLs must still require Access.

Provider reference: https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo

Automation testing: https://help.brevo.com/hc/en-us/articles/25318176966290-Test-messages-sent-from-an-automation
