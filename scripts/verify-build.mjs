import { createHash } from 'node:crypto';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/data/documents.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, process.argv.find((arg) => arg.startsWith('--out-dir='))?.slice(10) ?? 'dist');
const configuredBase = process.argv.find((arg) => arg.startsWith('--base='))?.slice(7) ?? '/';
const base = `/${configuredBase.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '');
const failures = [];
const origin = 'https://local-build.invalid';
const exists = async (file) => access(file).then(() => true, () => false);
const digest = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }));
  return nested.flat();
}

if (!(await exists(output))) {
  console.error('No dist/ directory. Run npm run build first.');
  process.exit(1);
}

const files = await walk(output);
const html = new Map();
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const text = await readFile(file, 'utf8');
  const ids = [...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) failures.push(`${path.relative(output, file)}: duplicate HTML IDs`);
  html.set(file, { text, ids: new Set(ids) });
}

const sourceNames = new Set([
  'docs.sources.local.json',
  'CV_SaiZhang.txt',
  'ResearchStatement_SaiZhang-2.pdf',
  'ResearchStatement_SaiZhang-2.txt',
  'ResearchStatement_SaiZhang.pdf',
  'ResearchStatement_SaiZhang.txt',
  'TeachingStatement_SaiZhang-1.pdf',
  'TeachingStatement_SaiZhang-1.txt',
  'TeachingStatement_SaiZhang.pdf',
  'TeachingStatement_SaiZhang.txt',
]);
for (const file of files) {
  const relative = path.relative(output, file);
  if (relative.split(path.sep).includes('source-documents') || sourceNames.has(path.basename(file))) {
    failures.push(`Private authoring reference in public output: ${relative}`);
  }
}

function pageURL(file) {
  let relative = path.relative(output, file).split(path.sep).join('/');
  if (relative.endsWith('index.html')) relative = relative.slice(0, -'index.html'.length);
  return `${origin}${base}/${relative}`;
}

let linkCount = 0;
async function verifyReference(reference, source) {
  const label = `${path.relative(output, source)} → ${reference}`;
  let url;
  try {
    url = new URL(reference.replace(/&amp;/g, '&'), pageURL(source));
  } catch {
    failures.push(`${label}: malformed URL`);
    return;
  }
  if (url.origin !== origin) return;
  linkCount += 1;
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    failures.push(`${label}: malformed URL encoding`);
    return;
  }
  if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
    failures.push(`${label}: link escapes configured base ${base}/`);
    return;
  }
  const relative = pathname.slice(base.length).replace(/^\/+/, '');
  let target = path.join(output, relative);
  if (await exists(target)) {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
  } else if (await exists(`${target}.html`)) {
    target = `${target}.html`;
  }
  if (!(await exists(target))) {
    failures.push(`${label}: target does not exist`);
    return;
  }
  if (url.hash && html.has(target)) {
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { id = url.hash.slice(1); }
    if (!html.get(target).ids.has(id)) failures.push(`${label}: fragment ID does not exist`);
  }
}

function srcsetReferences(srcset) {
  const references = [];
  let remaining = srcset;
  while (remaining.trim()) {
    remaining = remaining.replace(/^[\s,]+/, '');
    const match = remaining.match(/^\S+/);
    if (!match) break;
    const candidate = match[0];
    // URLs can contain commas (notably data: URLs); whitespace ends the URL.
    references.push(candidate.replace(/,+$/, ''));
    remaining = remaining.slice(candidate.length);
    if (!candidate.endsWith(',')) {
      const separator = remaining.indexOf(',');
      remaining = separator === -1 ? '' : remaining.slice(separator + 1);
    }
  }
  return references;
}

for (const [file, { text }] of html) {
  if (text.includes('source-documents/')) failures.push(`${path.relative(output, file)}: private source reference`);
  const references = [...text.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]);
  for (const match of text.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/g)) {
    references.push(...srcsetReferences(match[1]));
  }
  await Promise.all(references.map((reference) => verifyReference(reference, file)));
}
for (const file of files.filter((file) => file.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  const references = [...css.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)].map((match) => match[1]);
  await Promise.all(references.map((reference) => verifyReference(reference, file)));
}

for (const route of ['index.html', 'research/index.html', 'teaching/index.html']) {
  if (!html.has(path.join(output, route))) failures.push(`Required page missing: ${route}`);
}

// CI checks the selected website copies, never private authoring snapshots or Mac paths.
// sync:docs validates the configured originals before replacing these public PDFs.
for (const document of Object.values(documents)) {
  const relative = document.href.replace(/^\//, '');
  const selected = path.join(root, 'public', relative);
  const built = path.join(output, relative);
  if (!(await exists(selected)) || !(await exists(built))) {
    failures.push(`${document.label} missing at stable public URL: ${document.href}`);
    continue;
  }
  if (await digest(selected) !== await digest(built)) failures.push(`Built ${document.label} differs from selected public PDF.`);
  const bytes = await readFile(built);
  if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') failures.push(`${document.label}: missing PDF header.`);
}

if (failures.length) {
  console.error(`Build verification failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${html.size} HTML pages and ${linkCount} local references; ${Object.keys(documents).length} PDFs match selected files; private authoring documents are absent.`);
}
