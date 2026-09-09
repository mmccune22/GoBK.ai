# Jimmy's experimental GoBK site

Jimmy's independent working branch: `jimmy-experimental` in `mmccune22/GoBK.ai`.
Started from Matt's `main` at `0d3e9355f91944501090b2af63953f10afcad844` on September 8, 2026.

- [Open Jimmy's site in the dashboard](https://gobk-development-workspace.jimmydanol.chatgpt.site/jimmy-experimental)
- [Editable branch](https://github.com/mmccune22/GoBK.ai/tree/jimmy-experimental)
- [Matt's separate published preview](https://mmccune22.github.io/GoBK.ai/)

## Working on this version

Use this branch with Codex. Edit Astro pages in `src/pages`, shared components in
`src/components`, and article Markdown in `src/content/articles`. `docs/index.html`
is Matt's inherited generated preview, not Jimmy's editable site or current preview.

Run Node 22.12+ and `npm ci`, then `npm run dev`. Check `npm run build` before
handing off changes; it creates the Astro output and Pagefind search index in `dist`.
Keep secrets and real consumer information out of this public repository.

The initial branch restores the missing article collection schema using the earlier
source export, adds ignore rules, labels this experiment, disables signup and
analytics, and prevents indexing. The 74 article files remain drafts; these changes
do not represent legal or editorial approval. The contact page and Checkup in this
Astro source still need development. The dashboard Checkup remains a separate prototype.

## Preview publication

The dashboard serves the compiled `dist` output under its member-protected
`/jimmy-site/` route. After a clean committed build, Jimmy runs the dashboard's
`tools/import-jimmy-site.py` against this checkout, validates the resulting pages,
then publishes the dashboard. The dashboard records the exact source commit.
Pushing to this branch alone does not refresh the dashboard preview.

Matt's `main`, GitHub Pages `main:/docs`, and GoBK.ai are separate publication paths.
Do not change those settings or merge this branch into `main` during experiments.
To share a finished improvement, send the preview, exact branch commit, changed
files, and checks to Matt/Jimmy for review. A future production release needs its own
decision. Roll back a preview by rebuilding a known good branch commit and publishing
the resulting dashboard version, or by restoring the prior saved dashboard version.
