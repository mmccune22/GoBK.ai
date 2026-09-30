# Matt's isolated website test copies

Prepared September 30, 2026 for Jimmy's requested Cloudflare review previews.
These are **public, unauthenticated, fake-data-only demos**, not production
Intake or CRM deployments. No real client information, credentials or documents
may be entered. Original repositories and the GoBK `main`/`docs` website remain
unchanged. This directory exists only on `matt/site-test-copies`.

## Provenance

| Test folder | Original repository | Source branch / path | Pinned source commit |
| --- | --- | --- | --- |
| `crm-lite` | `mmccune22/bkfl-crm-lite` | `main`, `index.html` | `6cd084e9a67e60fcc3c2cd526e9fd7fbdfdacce1` |
| `dashboard` | `mmccune22/bkfl-dashboard` | `gh-pages`, `docs/` | `0ac6c94167525bcfed7e936012a5948d1b5b8e63` |
| `intake-mockup` | `mmccune22/mccune-legal-intake-mockups` | `main`, root redirect plus web files from `Intake Pages/` | `ca05966c4504f6b757a09ec493546a4a0603562c` |

`SOURCE-MANIFEST.json` records each original Git blob, original SHA-256, and
review-copy SHA-256, plus the additional safety files. Its `publishDirectory`
values refer to the local staging layout; the Cloudflare roots below are the
equivalent paths in this repository. The original files remain separately
preserved in the local staging directory. Do not publish that source archive,
this README, the manifest, or the repository root.

The scoped `.gitattributes` disables line-ending conversion only within
`test-demos`, preserving the recorded artifact bytes on Windows and Cloudflare.

## Cloudflare test configuration

Use **three separate Pages projects/origins** so browser storage does not mix
between demos. Every project uses the following common settings:

- Git repository: `mmccune22/GoBK.ai`.
- Production branch: `matt/site-test-copies` (Cloudflare's label only; these are
  test hostnames, with no real domain attached).
- Framework: None.
- Build command: `exit 0`.
- Build output directory: `/`, relative to the chosen root below.
- No environment secrets, Functions, Workers, KV bindings or paid add-ons.
- Disable automatic production and preview deployments after creation.

| Project | Root directory |
| --- | --- |
| CRM Lite test | `test-demos/crm-lite` |
| Dashboard test | `test-demos/dashboard` |
| Intake mockup test | `test-demos/intake-mockup` |

Each root contains its own `_headers`. Do not combine roots without moving the
header rules to the actual published root and reviewing browser-storage keys.

## Deliberate test-only changes

- Every HTML entry loads a prominent fixed test warning: fake data only, no real
  authentication or secure client storage, and external links leave the test.
  Outbound anchor clicks also ask for confirmation.
- HTML robots metadata and Cloudflare response headers request `noindex,
  nofollow`; this is not access control. `nosniff` and `no-referrer` are set.
- Header and HTML CSP block all fetch/XHR-style connections (`connect-src
  'none'`) and form submission (`form-action 'none'`), plus objects and foreign
  base URLs. CDN script/font loads and embedded videos are not fully offline.
- Intake's three shared-review API URLs are empty. Their application modules
  exit before reads, writes, polling or queued-message flushing. The existing
  shared Cloudflare review service, permissions and data are untouched.
- Intake's two live address-lookup endpoints are removed; guarded functions
  return empty suggestions before any request. Manual address entry remains.
- No `review-api` backend, workflows, dependencies, credentials, non-web specs,
  or test harness are included in any published root.

CRM and Dashboard retain their original application code and demo content;
only safety metadata and the separate warning script were added. The Dashboard
uses its actual published `gh-pages/docs` artifact, not its default `main`.
Its React/Babel application is inline; no same-origin JSX fetch is required.

## Validation and release boundary

Local validation matched all 23 original files to their pinned GitHub blobs,
checked 16 HTML pages and 51 plain-JavaScript blocks, found no missing static
references, and executed all three shared-review early-return guards plus four
address-guard cases with zero network attempts. React JSX was not rebuilt and
no GitHub workflow or dependency installation was run.

Browser rendering and actual Cloudflare response headers must be checked after
deployment. All login, upload, email, data-storage and integration behavior
remains simulated or disabled; no live client workflow is represented as
working. CDN scripts/fonts, embedded media and outbound links remain external
dependencies. Use fake data only even after visual checks pass.

This test branch does not authorize merging, production publication, DNS or
email changes, modifying the separate Intake runtime, or closing Netlify.
These three demos already lived on GitHub Pages and are not Netlify shutdown
dependencies. Keep the existing sites and rollback paths intact.
