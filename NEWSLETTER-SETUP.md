# The GoBK Guide on Jimmy's Cloudflare branch

The newsletter is for people dealing with debt and considering bankruptcy.
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

## Verification

Builds must retain all 100 pages and the 88-page Pagefind library index.
Check email and consent validation, provider acknowledgment, inbox confirmation,
automatic first issue, mobile layout, navigation, an article, and search.
A Git push alone is not deployment proof: verify the matching commit and successful
Cloudflare deployment, then check Jimmy's stable public branch URL without signing
in. Matt's review site and immutable deployment URLs must still require Access.

Provider reference: https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
