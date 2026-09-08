# GoBK — gobk.ai

**Bankruptcy answers and options.** A free, ungated consumer bankruptcy library —
71 plain-English articles across 11 chapters, written in the voice of a consumer
bankruptcy attorney with 25 years of practice, with a research-verified 50-state
exemption dataset behind it.

> Brand promise: **"We got you."** Not a law firm. Not lead-gen. Information first.

## Quick look
Open `gobk-preview.html` from the project's share package, or run it locally:

```
npm install
npm run dev      # local preview at localhost:4321
npm run build    # production build → dist/
```

## What's here
- `src/content/articles/` — all 71 articles (markdown; frontmatter controls chapter,
  order, door placement, and review status)
- `src/data/categories.ts` — the 11 chapters
- `src/data/state-exemptions.json` — 51-jurisdiction homestead/vehicle data,
  verified Sept 2026; the data contract for the future Bankruptcy Checkup
- `src/data/site.ts` — analytics/verification IDs (dormant until filled)
- `public/robots.txt`, `public/llms.txt` — SEO/GEO posture (AI crawlers welcomed)
- `netlify.toml` — deploy config (build command + publish dir pre-set)

## Status
- All articles are `status: draft` — **pending attorney review by Matt McCune**;
  bylines flip to "Reviewed by" as Matt clears them
- The **Bankruptcy Checkup** is designed but unbuilt (nav button is a placeholder)
- Newsletter form posts to a placeholder; no email provider connected yet
- Deploys via Netlify from this repo (see the deploy guide); nothing is live yet

## House rules
Every article shows who wrote/reviewed it and when. Pending review is labeled.
State-law variance is disclosed. Primary sources are linked. AI assists with
research, organization, and drafting; legal and editorial judgment stays human.
(These are public promises on the About page — changes must keep them true.)
