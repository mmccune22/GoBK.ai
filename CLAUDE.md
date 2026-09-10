# Working on GoBK with Claude

Orientation for anyone (human or Claude) picking this project up cold.

## What this is

GoBK — a free, ungated consumer bankruptcy library. 74 articles across 11
chapters, built with Astro. Written in the voice of Matt McCune, a consumer
bankruptcy attorney of 25 years. Not a law firm, not lead-gen.

Live at https://mmccune22.github.io/GoBK.ai/ — served by GitHub Pages
directly from `docs/index.html` on `main`.

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

Source of truth is this folder. Node modules live outside it to keep the
project clean.

```
npm install                                  # once
npm run build                                # astro build + pagefind → dist/
python3 scripts/single-file-preview.py docs/index.html
```

`docs/index.html` IS the live site — a single self-contained file bundling all
94 pages with hash navigation. Regenerate it after every content change.

Then: `git add -A`, commit, `git push origin main`. Pages redeploys in about
two minutes.

## Deploy verification

`github.io` is blocked from the sandbox, so don't try to curl the live site.
Check the deploy through the API instead:

```
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/mmccune22/GoBK.ai/actions/runs?per_page=3"
```

Look for the "pages build and deployment" run whose `head_sha` matches the
commit, with `conclusion: success`. Do **not** use `/pages/builds/latest` —
it lags and can report an older commit long after the newer one deployed,
which looks exactly like a failed deploy. Hand Matt a
cache-busted link (`?v=<sha>`) so his browser can't show him a stale copy.

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
- **A correct rebuild is byte-identical** to the committed `docs/index.html`
  when no source changed. If a rebuild produces a large diff you didn't cause,
  something is wrong — investigate rather than committing it.
- **The noindex tag** (`<meta name="robots" content="noindex, nofollow">`) is
  emitted by `single-file-preview.py`. It must survive every regeneration.
  Removing it would let the site be indexed before Matt has reviewed it.

## Working rhythm with Matt

Matt gives edits; Claude applies them, rebuilds, and commits each change
separately — granular commits are the undo history. **Push only when Matt says
so**, then confirm the deploy and hand him a cache-busted link. Remind him when
commits are sitting unpushed.
