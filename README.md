# Sai Zhang — academic website

Astro website for the 2026–2027 economics job market: Home, Research, Teaching,
Resources, More, and a dedicated JMP summary. The existing design, two SoundCloud
players, eleven-photo square gallery, and selected public PDFs are maintained here.

- Website: https://saichriszhang.github.io/
- Repository: https://github.com/SaiChrisZHANG/saichriszhang.github.io
- Publishing branch: `main`
- Deployment logs: [GitHub Actions](https://github.com/SaiChrisZHANG/saichriszhang.github.io/actions/workflows/deploy.yml)
- Teaching portfolio: https://saichriszhang.github.io/labor_teaching/ (a separate project)

## Local setup and preview

Verified versions: Node **24.21.0**, npm **11.19.0**, Astro **7.3.5**. Keep Node 24
and the committed package lockfile. In this project folder on Sai's Mac:

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run dev
```

Open the address printed by Astro, normally http://127.0.0.1:4321/. Stop with
Control-C. The session PATH does not change global Node or shell configuration;
`.nvmrc` alone does not select Node. If the existing background production preview
occupies the port, run `npm run preview:stop` before starting the dev server.

For a production review:

```sh
npm run check
npm run build
npm run verify
npm run preview
```

Build output is `dist/`. Rebuild after changes before reviewing production
preview. `verify` checks routes, anchors, image references, all five document
hashes against the selected public copies, and exclusion of private references.
Project commands disable Astro telemetry for that command only.

## PDF-only updates

Finish editing and export/compile the public PDF in its normal source project.
Keep authoring projects unchanged by website maintenance. The ignored
`docs.sources.local.json` maps exact absolute source paths to these five keys:

| Key | Document | Stable website URL |
| --- | --- | --- |
| `cv` | CV | `/files/CV_SaiZhang.pdf` |
| `jmp` | Job market paper | `/files/JMP_SaiZhang.pdf` |
| `researchStatement` | Research statement | `/files/research-statement.pdf` |
| `teachingStatement` | Teaching statement | `/files/teaching-statement.pdf` |
| `judgeLearning` | Asylum working paper with Daniel L. Chen | `/files/Judge_Learning_Zhang_Chen.pdf` |

Use only the designated exports; do not search for a file by newest timestamp.
Change the ignored config if an export location changes, while preserving the
public URL in `src/data/documents.mjs`. The AI paper retains its SSRN link.
Research statement appears only on Research; teaching statement appears on
Home and Teaching. All PDFs, including the CV, open normally in the browser.

To synchronize, validate, commit only the five PDF destinations, and push:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run publish:docs
```

The publisher requires `main` and this repository's origin. It stops for staged
unrelated work, conflicts, behind/diverged history, or unpublished non-PDF
commits; it never force-pushes, stashes, or includes unrelated paths. Unrelated
unstaged edits remain untouched. Review and handle any reported work separately.

If a push fails after the PDF commit was created, fix the connection/access
problem and run the **same command again**. It validates and pushes the pending
PDF-only commit even when synchronization reports all files unchanged. No new
PDF edit is needed. With no document changes and no pending PDF commits, it
makes no empty commit. A successful push is not a deployment confirmation.

For a local-only update, without commit or push:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run update:docs
```

This runs `sync:docs`, `check`, `build`, and `verify`, stopping at the first error.
`npm run sync:docs` runs only copying/validation. Synchronization reads every
source before changing any destination, compares bytes, and preserves identical
files' modification times. Originals are not modified and symlinks are rejected.
Header/EOF checks always run; strict `pypdf` checks run when Python with that
parser is already available. Without it, the script explicitly reports limited
validation, which cannot establish structural completeness.

All changed PDFs are staged before per-file atomic replacement. Validation or
staging failure preserves all existing copies. An exceptional final rename
failure can leave some updated documents; the error identifies them and exits
nonzero. Fix the write issue and rerun. Only deliberate public copies belong in
`public/files/`; no dated backups or private authoring folders belong there.

Saving a file in Dropbox does not publish it. After pushing, confirm the matching
Actions run succeeds and inspect the live PDF. Refresh the PDF tab, use a private
window or a temporary cache-busting query, and check its version/date. For an
exact check, download it and compare SHA-256 with the selected public copy.

## Content, layout, and gallery updates

Ask Codex to implement the requested change in this project, then review the
local development or production preview as appropriate. This workflow applies
to pages, metadata, styles, music, and gallery updates; `publish:docs` is only
for the five PDF destinations.

With Node 24 selected, validate and publish explicitly reviewed paths:

```sh
npm run check
npm run build
npm run verify
git status --short
git diff
# Replace these example paths with the exact files in the reviewed change.
git add -- src/data/research.ts src/components/PaperEntry.astro
git diff --cached
git commit -m "Describe the website update"
git push origin main
```

Inspect existing staged work before `git add`; do not accidentally include it
in a new commit. Do not use `git add .`, force-push, or discard unrelated changes.
When `main` is behind, preserve local work and resolve it before publishing.

Every push to `main` triggers `.github/workflows/deploy.yml`. CI installs from
the lockfile, checks, builds, verifies, uploads `dist/`, then deploys with scoped
Pages permissions. It uses checked-in PDFs; it never runs Dropbox synchronization
or requires the local source config. Manual deployment is also available through
Actions. Production origin is set in `astro.config.mjs`; this account-level site
uses `/`. `SITE_URL`/`SITE_BASE` overrides support isolated destination checks.
Shared metadata emits the live canonical and Open Graph URL for content pages.
There is no sitemap/robots configuration or site-wide `noindex` exclusion.

Inspect the matching deployment (replace `RUN_ID` with its listed ID):

```sh
gh run list --repo SaiChrisZHANG/saichriszhang.github.io --workflow deploy.yml --branch main --limit 5
gh run watch RUN_ID --repo SaiChrisZHANG/saichriszhang.github.io --exit-status
```

Open the affected HTTPS pages after the workflow succeeds. Check the deployment
commit against the intended release, not just the latest run title. A manual
rerun does not create a new Git commit.

## Where to edit

| Content | File |
| --- | --- |
| Biography, navigation, email, portfolio, job-market banner, SoundCloud tracks | `src/data/site.ts` |
| Papers, statuses, coauthors, abstracts, links | `src/data/research.ts` |
| Coauthor website destinations | `src/data/coauthors.ts` |
| Teaching experience and designed curriculum links | `src/data/teaching.ts` |
| Resource datasets, software, links, and credits | `src/data/resources.ts` |
| Detailed JMP narrative, figures, and captions | `src/data/jmp.ts` |
| Stable public PDF URLs | `src/data/documents.mjs` |
| Local source paths (never committed) | `docs.sources.local.json` |
| Food image order, alt text, optional captions | `src/data/food.ts` |
| Food working copies | `src/assets/food/` |
| Page composition and shared components | `src/pages/`, `src/components/` |
| Typography, colors, spacing, responsive layout | `src/styles/global.css` |
| Canonical metadata | `src/layouts/Layout.astro` |
| Public origin and base | `astro.config.mjs` |

Keep repeated information in the shared data files. Add papers with stable IDs
and only genuine links; separate completed teaching from designed curriculum.
The food component supports previous/next, keyboard operation and an accessible
no-JavaScript fallback. Images are selected square working copies with personal
metadata removed, then optimized by Astro. SoundCloud uses its native paused
players and fallback links; recordings are not downloaded or rehosted.

## Another machine

Install/select Node 24 and use the lockfile:

```sh
git clone https://github.com/SaiChrisZHANG/saichriszhang.github.io.git
cd saichriszhang.github.io
npm ci
npm run build
npm run verify
```

An ordinary build needs only the cloned website. To synchronize PDFs, copy
`docs.sources.example.json` to `docs.sources.local.json` **if that local file does
not already exist**, then enter the five exact source paths on that machine.
Keep it ignored and restore source access through the normal document workflow.
Authenticate `gh` as the intended owner for publication; never place credentials
in project files. Original photos, manuscripts, local briefs and source audits
remain outside Git. The private first-publication notes record Sai's existing
project directory and source configuration for local maintenance.

## Reverting a release

Identify the problematic commit in Actions and Git history. Preserve unrelated
work first, and use a clean branch/worktree based on up-to-date `main` for the
revert if the current worktree has unfinished edits. Do not reset or force-push.

```sh
git log --oneline -n 10
git revert BAD_COMMIT
npm run check
npm run build
npm run verify
git push origin main
```

Replace `BAD_COMMIT` with the specific release commit. Resolve any revert
conflicts deliberately. The new revert commit triggers deployment; watch that
run and verify the restored live pages/PDFs. For a PDF rollback, also correct the
designated authoring export before the next sync, or it will reintroduce the
newer source bytes. No command above discards local work or rewrites history.

## Sources and verification records

The original academic source documents, revision briefs, PDF identities,
figure provenance, screenshots, and detailed local verification reports remain
in the ignored `source-documents/` tree. Exact PDF copies are deliberate public
assets; the build does not include private source archives or local settings.
The original job-talk and authoring projects are read-only to website work.

The previous local reviews checked responsive layouts, focus, navigation,
abstracts, source-matching PDF responses, isolated failure fixtures, and gallery
controls. Local SoundCloud playback state, progress, pause/resume, and switching
were tested; no audible listening test was performed. First publication also
requires checks on the live origin, recorded in the private publication report.

Workflow references: [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/),
[GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
and [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
