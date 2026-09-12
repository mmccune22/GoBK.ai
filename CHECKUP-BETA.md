# Bankruptcy Checkup (Beta)

The primary navigation adds `/bankruptcy-checkup-beta`; GitHub Pages' existing
single-file preview exposes `#bankruptcy-checkup-beta`. The original `/checkup`
page, all articles, About promises, footer disclaimers and noindex controls stay
in place. This is a synthetic-data review beta, not a consumer launch.

The iframe runs at https://gobk-checkup-beta.jimmydanol.chatgpt.site and uses the
existing GoBK TypeScript LangGraph in a separate managed Worker. It accepts no
signup, identity or document fields and saves no answers. Core calculations,
disabled legal rules, graph node order and draft output labels are unchanged.
The original standalone development server stays local; it is not exposed.

Source for the managed graph runtime is the sibling local
`gobk-checkup-beta-runtime` project and its Sites source repository. Its locked
packages, build and actual-runtime checks are maintained there. Environment
values are managed in Sites; no provider credentials are needed.

Build using the existing installed Astro dependencies. On Windows use UTC for
the build so date-only article frontmatter keeps the published calendar day:

```powershell
$env:TZ='UTC'
npm run build
python -X utf8 scripts/single-file-preview.py docs/index.html
python -X utf8 scripts/verify-checkup-beta.py
```

The preview generator now normalizes Windows path separators and SVG line
endings. Without the Beta source changes, its output matches the current
published baseline after normalizing Git checkout line endings. All 94 original
page bodies are checked against that baseline with only the changed navigation
header excluded. The new tab produces the 95th page.

The long tab label wraps on phone widths. The iframe is lazy-loaded, uses no
consumer-specific URL and permits only the scripts/forms needed by the isolated
questionnaire and its educational links. The beta includes an explicit
synthetic-data confirmation before any evaluation.

Deployment is GitHub Pages from `main:/docs`, as specified by `CLAUDE.md`.
Verify the matching Pages deployment workflow and then the actual public tab
and its questionnaire POST. Roll back this change by reverting its commit;
the previous marketing-site baseline is `7deb7bc3bf0d87496fc123297663eecfc15eafaa`.
