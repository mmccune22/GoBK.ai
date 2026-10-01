# GoBK: Matt builds, Jimmy reviews

Matt keeps working with Claude on his MacBook. When he is ready, he pushes
source code to GitHub. Cloudflare turns that version into a private review site.
Jimmy has a separate branch for experiments; those changes do not alter Matt's
branch or the public domain.

## The two lanes

| Person | GitHub branch | Purpose |
| --- | --- | --- |
| Matt | `development` | Ready-to-review design at https://gobk-ai.pages.dev/ |
| Jimmy | `codex/jimmy-experiments` | Independent experiments; use its branch URL from Cloudflare |

Cloudflare calls the stable review branch “Production.” Here that only means
the private `pages.dev` review site. Public gobk.ai is a separate release.
Automatic preview builds are limited to Jimmy's exact experiment branch.
Existing `jimmy-experimental` and `jimmy/checkup-beta` are preserved separately.

## Tell Claude on Matt's MacBook

> Work on `development`, not `main`. First check for uncommitted work and
> preserve it. On a clean checkout, fetch and fast-forward from GitHub before
> editing. Build and test locally, make small commits, and stage only the files
> you meant to change. Push to `development` only when I say it is ready for
> Jimmy to review. Never force-push, delete branches, merge main, or publish
> gobk.ai. Never commit secrets, .env files, client data, node_modules, ZIPs,
> or generated files by themselves. Follow CLAUDE.md and keep the legal and
> editorial promises unchanged.

Cloudflare automatically builds a ready push. Once the matching deployment
succeeds, send Jimmy the stable link and the commit SHA. If a build fails,
the link may still show the older version: do not call that a successful update.
For a fixed review version, copy the immutable deployment URL from Cloudflare.

Both private lanes require Cloudflare Access login using
`jimmy.stein@bkfastpass.com` or `matt.mccune@bkfastpass.com`.
Keep all testing free of real client information. The GitHub repo is public,
and this Access gate does not protect code or legacy GitHub Pages output.

## Jimmy's experiments

Use `codex/jimmy-experiments`, build locally, commit selected files, then push
that branch. Its private branch link updates after a successful build.
It starts from Matt's design plus workflow documentation, not old Checkup work.

When Jimmy wants newer Matt work, first commit or otherwise safely preserve
his own changes. On a clean checkout:

```sh
git fetch origin
git switch codex/jimmy-experiments
git merge origin/development
npm ci
npm run build
```

Review the merge before pushing. If there are conflicts, stop and resolve them
carefully; never use a hard reset or force-push to make them disappear.
This update is manual so Matt cannot silently overwrite Jimmy's experiments.

## Review and release

Jimmy checks the design, mobile layout, article navigation, search, and any
forms. Note which commit was reviewed. Unconnected forms or placeholders
must not be mistaken for working services.

Keep design feedback and changes on branches. A pull request into `main`
requires Jimmy's review before merge; public hosting/domain changes require
separate approval. Do not merge the existing Development pull request merely
to make the private review link update.
