# The GoBK Guide on Jimmy's Cloudflare branch

The newsletter is for people dealing with debt and exploring their options,
including bankruptcy. Jimmy approved this consumer direction and the October 2
content revision. That approval does not replace Matt's attorney review.
Four issue drafts and a welcome preview are available at `/newsletter/`.
All content remains pending Matt's editorial and attorney review.

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

The shared newsletter section on the homepage, Library, articles, and newsletter
pages has an email field, required newsletter consent, and Subscribe button.
It uses Brevo's official HTML/Ajax embed, adapted to the site's design with the
optional first-name field omitted. The provider displays the actual submission
result. No API key, subscriber database, or custom `/api/subscribe` endpoint is used.
The public form destination is stored in `scripts/newsletter-preview-config.mjs`.
The provider form markup is in `src/lib/brevo-form.html`.

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

## Verification

Builds must retain all 100 pages and the 88-page Pagefind library index.
Check email and consent validation, provider acknowledgment, inbox confirmation,
automatic first issue, mobile layout, navigation, an article, and search.
A Git push alone is not deployment proof: verify the matching commit and successful
Cloudflare deployment, then check Jimmy's stable public branch URL without signing
in. Matt's review site and immutable deployment URLs must still require Access.

Provider reference: https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
