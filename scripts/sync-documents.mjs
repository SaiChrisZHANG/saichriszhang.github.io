import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/data/documents.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const keys = Object.keys(documents);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const describe = error => error instanceof Error ? error.message : String(error);

async function regularFileBytes(file) {
  const existing = await lstat(file);
  if (!existing.isFile() || existing.isSymbolicLink()) throw new Error('must be a regular file, not a symlink, directory or special file');
  // O_NOFOLLOW also closes the symlink race between inspection and opening.
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile()) throw new Error('must be a regular file, not a directory or special file');
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

function checkPDFBytes(bytes) {
  if (bytes.length === 0) throw new Error('file is empty');
  if (!/^%PDF-(?:1\.[0-9]|2\.0)(?:\r|\n|\s)/.test(bytes.subarray(0, 16).toString('latin1'))) {
    throw new Error('missing or invalid PDF header');
  }
  if (!/%%EOF[\x00\t\n\f\r ]*$/.test(bytes.subarray(-2048).toString('latin1'))) {
    throw new Error('missing terminal %%EOF marker; the PDF may be truncated');
  }
}

function python(code, input) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', code], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('PDF parser exceeded its 30-second time limit'));
    }, 30_000);
    child.stdout.on('data', chunk => { stdout = (stdout + chunk).slice(0, 65_536); });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(0, 65_536); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    // An invalid PDF can make the parser exit before its input pipe finishes.
    child.stdin.on('error', error => { if (error.code !== 'EPIPE') reject(error); });
    child.stdin.end(input);
  });
}

const parserCode = `
import io, sys
from pypdf import PdfReader
try:
    reader = PdfReader(io.BytesIO(sys.stdin.buffer.read()), strict=True)
    if reader.is_encrypted:
        raise ValueError("public PDF is encrypted")
    if len(reader.pages) == 0:
        raise ValueError("PDF contains no pages")
    for page in reader.pages:
        content = page.get_contents()
        if content is not None:
            content.get_data()
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
`;

async function availableParser() {
  try {
    const result = await python('import pypdf; print(pypdf.__version__)');
    return result.code === 0 ? result.stdout.trim() : null;
  } catch {
    return null;
  }
}

async function inspectDirectory(directory) {
  try {
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`${directory}: must be a regular directory, not a symlink`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

/** All validation precedes writes; each changed destination is replaced atomically. */
export async function syncDocuments({
  configPath = path.join(projectRoot, 'docs.sources.local.json'),
  outputRoot = path.join(projectRoot, 'public'),
  log = console.log,
} = {}) {
  let config;
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read source configuration ${configPath}: ${describe(error)}. Copy docs.sources.example.json and set the five absolute source paths.`);
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Source configuration must be a JSON object.');
  const unknownKeys = Object.keys(config).filter(key => !keys.includes(key));
  if (unknownKeys.length) throw new Error(`Unknown document keys in source configuration: ${unknownKeys.join(', ')}`);

  const sources = await Promise.allSettled(keys.map(async key => {
    const source = config[key];
    if (typeof source !== 'string' || !source.trim() || !path.isAbsolute(source)) {
      throw new Error(`${key}: configure an absolute source PDF path in ${configPath}`);
    }
    try {
      const bytes = await regularFileBytes(source);
      checkPDFBytes(bytes);
      return { key, bytes, hash: digest(bytes), destination: path.resolve(outputRoot, `.${documents[key].href}`) };
    } catch (error) {
      throw new Error(`${key}: cannot use ${source}: ${describe(error)}`);
    }
  }));
  const sourceErrors = sources.filter(result => result.status === 'rejected').map(result => describe(result.reason));
  if (sourceErrors.length) throw new Error(`Source validation failed; website PDFs were not changed:\n${sourceErrors.join('\n')}`);
  const records = sources.map(result => result.value);

  const parserVersion = await availableParser();
  if (parserVersion) {
    for (const record of records) {
      try {
        const result = await python(parserCode, record.bytes);
        if (result.code !== 0) throw new Error(result.stderr.trim() || 'parser exited unsuccessfully');
      } catch (error) {
        throw new Error(`${record.key}: pypdf validation failed; website PDFs were not changed: ${describe(error)}`);
      }
    }
    log(`PDF validation: header/EOF checks and pypdf ${parserVersion} strict parsing; no visual/content review.`);
  } else {
    log('PDF validation: limited header/EOF checks only (python3 with pypdf unavailable). These checks do not prove structural completeness.');
  }

  await inspectDirectory(outputRoot);
  const directories = [...new Set(records.map(record => path.dirname(record.destination)))];
  for (const directory of directories) await inspectDirectory(directory);
  // Inspect every destination before staging; never follow a public PDF symlink.
  for (const record of records) {
    try {
      const info = await lstat(record.destination);
      if (!info.isFile() || info.isSymbolicLink()) throw new Error('destination must be a regular file, not a symlink or directory');
      record.unchanged = digest(await regularFileBytes(record.destination)) === record.hash;
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`${record.key}: cannot inspect ${record.destination}: ${describe(error)}; website PDFs were not changed.`);
      record.unchanged = false;
    }
  }

  const pending = records.filter(record => !record.unchanged);
  const staged = [];
  const replaced = [];
  let writing = '';
  try {
    for (const directory of directories) await mkdir(directory, { recursive: true });
    for (const record of pending) {
      writing = `${record.key} (${record.destination})`;
      record.stage = path.join(path.dirname(record.destination), `.${path.basename(record.destination)}.${randomUUID()}.tmp`);
      const handle = await open(record.stage, 'wx', 0o644);
      staged.push(record.stage);
      try {
        await handle.writeFile(record.bytes);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    for (const record of pending) {
      writing = `${record.key} (${record.destination})`;
      await rename(record.stage, record.destination);
      replaced.push(record.key);
    }
  } catch (error) {
    const status = replaced.length
      ? `Already replaced: ${replaced.join(', ')}. Remaining PDFs were not replaced; fix the write error and run sync again.`
      : 'Website PDFs were not changed.';
    throw new Error(`Could not write ${writing || 'website PDFs'}: ${describe(error)}. ${status}`);
  } finally {
    for (const file of staged) {
      try { await unlink(file); } catch (error) { if (error.code !== 'ENOENT') log(`Could not remove temporary file ${file}: ${describe(error)}`); }
    }
  }

  return records.map(record => {
    const result = { key: record.key, status: record.unchanged ? 'unchanged' : 'updated', destination: record.destination };
    log(`${result.key}: ${result.status} → ${result.destination}`);
    return result;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    for (const argument of process.argv.slice(2)) {
      if (argument.startsWith('--config=')) options.configPath = path.resolve(argument.slice('--config='.length));
      else if (argument.startsWith('--output=')) options.outputRoot = path.resolve(argument.slice('--output='.length));
      else throw new Error(`Unknown argument ${argument}; supported options: --config=/absolute/config.json --output=/absolute/public-directory`);
    }
    await syncDocuments(options);
  } catch (error) {
    console.error(`PDF sync failed: ${describe(error)}`);
    process.exitCode = 1;
  }
}
