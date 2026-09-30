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

1. Matt starts each task from the latest `main` on a branch named
   `matt/<short-task>`. He opens a pull request; Jimmy reviews it before merge.
   A successful build or preview is evidence for review, not publication
   approval.
2. Reviewed maintenance and preflight changes may merge before the production
   release gates below are complete. Accepting source into `main` and approving
   a public production release are separate decisions. A merge can still
   redeploy the existing GitHub Pages preview from `main:/docs`; the manual
   Cloudflare controls below do not disable that separate host.
3. The company Cloudflare account owner must manually create and connect the
   Pages project, authorize only this repository, and approve the initial setup
   deployment. Immediately afterward, disable both automatic production
   deployments and automatic preview deployments. Keep publishing manual.
4. Jimmy separately reviews and approves each public production deployment and
   any custom-domain or DNS cutover after the applicable release gates pass.
   This repository intentionally contains no deployment workflow.
5. Never force-push or delete branches. Do not upload ZIP archives,
   `node_modules`, `.env` files, secrets, client data, or generated output
   without its source changes.
6. Keep the existing host and its DNS values available for rollback until the
   Pages build and custom domain have been verified.

## Release gates

- **Draft content:** Article frontmatter remains `status: draft` unless Matt
  explicitly marks an article reviewed. The Astro `dist/` build must not be
  assumed to inherit the `noindex` tag added by the separate single-file
  preview generator. Matt must approve the draft-content and indexing posture
  before a public Pages deployment or domain cutover.
- **Newsletter:** The form markup declares `POST /api/subscribe`, but the
  current client script prevents that request and displays a not-connected
  message. This repository implements no subscription backend and stores no
  signup. Do not represent the form as working or enable the endpoint without
  a separately reviewed provider, consent/privacy, unsubscribe,
  failure-handling, and end-to-end test plan.
- **Bankruptcy Checkup:** A successful site build is not approval to release a
  Checkup. Preserve the current synthetic-data, educational-only boundaries and
  require separate review of its routes, embedded runtime, privacy, security,
  and actual-runtime tests before public release.

This preflight changes no article, newsletter, or Checkup behavior.
