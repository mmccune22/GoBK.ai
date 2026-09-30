# Cloudflare Pages migration preflight

This is configuration guidance only. It does not create a Cloudflare project,
deploy the site, change DNS, or replace the current GitHub Pages or Netlify
paths.

## Build settings

| Setting | Value |
| --- | --- |
| Repository root | `/` |
| Production branch | `main` |
| Node.js | `22` (`NODE_VERSION=22`) |
| Environment | `TZ=UTC` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Astro copies `public/_headers` to `dist/_headers`. That file intentionally
ports only the two response headers currently defined in `netlify.toml`.

## Source and publishing workflow

1. Start work from the latest `main` on a feature branch.
2. Open a pull request and require a successful UTC build plus human review.
   A branch or Cloudflare preview is a review artifact, not publication
   approval.
3. Merge only after the release gates below are recorded as approved. If Git
   auto-deploy is later enabled, merging to `main` becomes a production
   publishing action.
4. The company Cloudflare account owner must manually create and connect the
   Pages project, authorize only this repository, approve the first production
   deployment, and separately approve any custom-domain or DNS cutover. This
   repository intentionally contains no deployment workflow.
5. Keep the existing host and its DNS values available for rollback until the
   Pages build and custom domain have been verified.

## Release gates

- **Draft content:** Article frontmatter remains `status: draft` unless Matt
  explicitly marks an article reviewed. The Astro `dist/` build must not be
  assumed to inherit the `noindex` tag added by the separate single-file
  preview generator. Matt must approve the draft-content and indexing posture
  before a public Pages deployment or domain cutover.
- **Newsletter:** The current form is a client-side placeholder and does not
  store subscriptions. Do not represent it as working or connect
  `/api/subscribe` without a separately reviewed provider, consent/privacy,
  unsubscribe, failure-handling, and end-to-end test plan.
- **Bankruptcy Checkup:** A successful site build is not approval to release a
  Checkup. Preserve the current synthetic-data, educational-only boundaries and
  require separate review of its routes, embedded runtime, privacy, security,
  and actual-runtime tests before public release.

This preflight changes no article, newsletter, or Checkup behavior.
