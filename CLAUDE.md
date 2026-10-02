# Working on GoBK with Claude

Orientation for anyone (human or Claude) picking this project up cold.

## What this is

GoBK — a free, ungated consumer bankruptcy library. 74 articles across 11
chapters, built with Astro. Written in the voice of Matt McCune, a consumer
bankruptcy attorney of 25 years. Not a law firm, not lead-gen.

Private design review is hosted by Cloudflare Pages at
https://gobk-ai.pages.dev/ from the `development` branch. This is NOT a public
gobk.ai launch. GitHub Pages and `docs/index.html` are legacy outputs, not the
target for this workflow. See [the short workflow](docs/private-review-workflow.md).

Choose the lane from the human's request before editing. The start/push commands
below are for Matt's `development` lane. In a Jimmy experiment session, stay on
`codex/jimmy-experiments` and use that branch's pull/push commands instead; do
not switch to or modify Matt's lane. Ask if the intended lane is unclear.

## House rules (non-negotiable)

- **Voice:** an experienced bankruptcy attorney explaining things plainly and
  calmly. No scare tactics, no legalese, no hype, no shame. Read two or three
  articles before writing anything.
- **Every article stays `status: draft`** unless Matt explicitly says "mark it
  reviewed." That flag flips the public byline to "Reviewed by Matt McCune,"
  which is a legal and ethical representation. Never flip it unasked.
- **Never alter the About page's promises or the disclaimers.**
- **Legal accuracy is paramount.** If a requested edit might create a
  legal-accuracy problem, say so before applying it.
- **Ask before deleting files or changing site structure.** When in doubt, ask.

## The build loop

Source of truth is the tracked source in this repository (`src/`, `public/`,
and build configuration). Before starting, check `git status --short`; if there
are uncommitted changes, stop and preserve them. Do not reset or overwrite them.
On a clean checkout, fetch and fast-forward Matt's branch:

```sh
git fetch origin
git switch development
git pull --ff-only origin development
```

If `development` is not local yet, use `git switch --track origin/development`
after fetching. If Git reports a conflict or divergent history, stop and ask.

```
npm ci                                       # clean install from lockfile
npm run dev                                  # local design preview
npm run build                                # astro build + pagefind → dist/
```

Commit small changes using explicitly selected source files; inspect
`git diff --cached` before committing. Do not blindly stage the whole folder.
Only when Matt says a version is ready for Jimmy to review, push
`git push origin development`. Cloudflare builds and publishes `dist/` privately.
Do not regenerate or commit `docs/index.html` just to deploy this review site.

Never push directly to `main`, force-push, delete branches, or merge a release
without Jimmy's approval. Never upload a ZIP, `node_modules`, `.env` files,
passwords, API keys, client information, or generated files by themselves.
The GitHub repository is public: private Cloudflare hosting does not make
repository contents or any old GitHub Pages copies private.

## Deploy verification

Record `git rev-parse HEAD`, then check the Cloudflare `gobk-ai` deployment:
correct branch, matching commit SHA, and successful deployment. A push alone
does not prove deployment; a failed build can leave the previous site online.
Share the stable review URL plus the commit SHA. For a pinned review, copy the
successful deployment's immutable URL from Cloudflare instead of guessing it.
Matt's review site and immutable deployment URLs require Cloudflare Access sign-in
with an allowed work email. Only Jimmy's exact branch alias,
`codex-jimmy-experiments.gobk-ai.pages.dev`, is public without Access login.
Check the homepage, navigation, an article, mobile layout, and search in the
appropriate Access state for that URL.

## Traps discovered the hard way

- **`src/content.config.ts` is load-bearing.** Without it,
  `getCollection('articles')` returns empty and the build silently produces a
  site with zero article pages — no error, just 20 shells instead of 94. It
  went missing once because the repo was populated by web upload.
- **Two schema defaults aren't in any article's frontmatter and must not
  drift:** `reviewer` defaults to `"Matt McCune"`, and `weight` defaults to
  `50`. Weight 50 (not 999) is what reproduces the live navigation order for
  the three articles that carry no explicit weight.
- **Frontmatter uses straight apostrophes**, not curly. Markdown bodies get
  curly ones via smartypants; frontmatter does not.
- **Legacy single-file preview:** if deliberately regenerating
  `docs/index.html`, investigate unexpected large differences and preserve its
  noindex tag. That file is not needed to publish the Cloudflare review site.
- **Private review stays private:** preserve Cloudflare Access for Matt's review
  site, immutable deployment URLs, and all other previews. The only authorized
  public exception is the exact Jimmy alias,
  `codex-jimmy-experiments.gobk-ai.pages.dev`; keep the wildcard preview protection
  and the hosting build's `X-Robots-Tag: noindex, nofollow`. A robots tag alone is
  not security.
- **Jimmy's experiments are separate:** `codex/jimmy-experiments` is based on
  Matt's design but does not auto-merge future Matt changes. Preserve existing
  `jimmy-experimental` and `jimmy/checkup-beta` work; never overwrite them.

## Working rhythm with Matt

Matt gives edits; Claude applies them, rebuilds, and commits each change
separately — granular commits are the undo history. **Push only when Matt says
so**, then confirm the matching Cloudflare deploy and hand him the private link
and commit SHA. Remind him when
commits are sitting unpushed.
