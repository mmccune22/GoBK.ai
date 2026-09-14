# Interactive Checkup workflow tab

The separate development sandbox bundles the real LangGraph package, the unchanged existing GoBK calculation/validation stages, and the original baseline graph. `ENGINE_PROVENANCE.json` records the copied source hashes. It does not import the core-preview evaluator or call the hosted consumer API.

`model.ts` creates a fresh, actual StateGraph for each draft. Its bounded configuration moves the legal-limits node among three dependency-safe positions, inserts one optional review checkpoint, and chooses full or before-debt calculation scope. All eight mandatory core stages remain; legal rules stay disabled. Checkpoint IDs are sandbox metadata and cannot escape the existing public-result allowlist. Observers receive a copied projection of invented state, never raw requests or capability internals.

`app.ts` implements editing, cancellation, manual stepping, node inspection, side-by-side original/draft results and file/link sharing. No assessment requests, model calls, automatic storage, tracing or analytics are used. Share links contain configuration and a review note only, not financial answers. A link opens an independent copy; this is not simultaneous collaboration or a public questionnaire editor. Synthetic format markers cannot detect real consumer data, so the UI requires invented examples.

## Build and verify

```powershell
npm ci
npm run test:checkup-lab
npm run check:checkup-lab
$env:TZ='UTC'
npm run build
python -X utf8 scripts/single-file-preview.py docs/index.html
python -X utf8 scripts/verify-checkup-beta.py
git diff --check
```

UTC is a build-process setting that preserves the original article dates. The single-file preview normally strips page scripts; it explicitly embeds `public/checkup-workflow-lab.js`, just as it embeds the existing iframe helper. Both Astro output and the GitHub Pages single-file output therefore execute the real bundled graph.

To change the public questionnaire, turn a reviewed draft into a source change in its separate runtime, run actual graph/server/browser checks, and publish a separate authorized update. This tab cannot mutate the server, enable legal rules or grant LangSmith project access.
