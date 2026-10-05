import { spawn } from 'node:child_process';
import { access, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documents } from '../src/data/documents.mjs';

export const publication = {
  repository: 'SaiChrisZHANG/saichriszhang.github.io',
  branch: 'main',
  remote: 'origin',
};
export const documentPaths = Object.values(documents).map(({ href }) => {
  if (!/^\/files\/[^/]+\.pdf$/.test(href)) throw new Error(`Invalid public PDF destination: ${href}`);
  return `public${href}`;
});
const allowedPaths = new Set(documentPaths);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const entries = output => output.split('\0').filter(Boolean);

export function runCommand(command, args, { cwd, inherit = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false, stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', data => { stdout += data; });
    child.stderr?.on('data', data => { stderr += data; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

function isExpectedRemote(value) {
  let repository;
  const scp = /^git@github\.com:([^\s]+)$/i.exec(value);
  if (scp) repository = scp[1];
  else {
    let url;
    try { url = new URL(value); } catch { return false; }
    if (url.hostname.toLowerCase() !== 'github.com' || url.search || url.hash || url.password) return false;
    if (url.protocol === 'https:') {
      if (url.username || (url.port && url.port !== '443')) return false;
    } else if (url.protocol === 'ssh:') {
      if (url.username !== 'git' || (url.port && url.port !== '22')) return false;
    } else return false;
    repository = url.pathname.replace(/^\//, '');
  }
  return repository.replace(/\.git$/i, '').toLowerCase() === publication.repository.toLowerCase();
}

/**
 * Update, validate, and publish only the five manifest PDFs.
 *
 * Safety checks run before update and again before staging. Unrelated staged
 * changes stop the command; unrelated unstaged/untracked work is left alone.
 * Pending commits must each change only these PDFs and must not be merges.
 * A failed push leaves its commit intact. Rerunning validates the same history,
 * skips an empty commit, and pushes the pending PDF-only commits normally.
 * This command never resets, stashes, rebases, force-pushes, or deploys directly.
 * The injectable runner/cwd support isolated local-repository tests.
 */
export async function publishDocuments({ cwd = projectRoot, run = runCommand, log = console.log } = {}) {
  async function command(executable, args, options = {}) {
    const result = await run(executable, args, { cwd, ...options });
    if (result.code !== 0) {
      throw new Error(`${executable} ${args.join(' ')} failed${result.code === null ? '' : ` (${result.code})`}: ${(result.stderr || result.stdout || 'see command output').trim()}`);
    }
    return result.stdout;
  }
  const git = (...args) => command('git', args);
  const remoteBranch = `refs/remotes/${publication.remote}/${publication.branch}`;

  async function checkRepository() {
    const top = (await git('rev-parse', '--show-toplevel')).trim();
    if (await realpath(top) !== await realpath(cwd)) throw new Error('Run document publication from this website repository root.');
    const branch = (await git('symbolic-ref', '--quiet', '--short', 'HEAD')).trim();
    if (branch !== publication.branch) throw new Error(`Document publication requires branch ${publication.branch}; current branch is ${branch}.`);
    for (const marker of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply', 'sequencer']) {
      const location = (await git('rev-parse', '--git-path', marker)).trim();
      if (await access(path.resolve(cwd, location)).then(() => true, () => false)) {
        throw new Error(`Finish the current Git operation (${marker}) before publishing documents.`);
      }
    }
    if ((await git('ls-files', '--unmerged', '-z')).length) throw new Error('Resolve unmerged files before publishing documents.');
    for (const mode of [[], ['--push']]) {
      const urls = (await git('remote', 'get-url', ...mode, '--all', publication.remote)).trim().split('\n');
      if (urls.length !== 1 || !isExpectedRemote(urls[0])) {
        throw new Error(`The ${publication.remote} ${mode.length ? 'push' : 'fetch'} URL must identify only ${publication.repository} on GitHub. No publication was attempted.`);
      }
    }
    const staged = entries(await git('diff', '--cached', '--name-only', '--no-renames', '-z'));
    const unrelated = staged.filter(file => !allowedPaths.has(file));
    if (unrelated.length) {
      throw new Error(`Unrelated staged changes prevent a PDF-only commit: ${unrelated.join(', ')}. Commit them separately or unstage them deliberately, then rerun. Nothing was unstaged.`);
    }
    await git('ls-files', '--error-unmatch', '--', ...documentPaths);
  }

  async function checkHistory({ fetch = false } = {}) {
    if (fetch) {
      await git('fetch', '--no-tags', publication.remote, `refs/heads/${publication.branch}:${remoteBranch}`);
    }
    const [behind, ahead] = (await git('rev-list', '--left-right', '--count', `${remoteBranch}...HEAD`)).trim().split(/\s+/).map(Number);
    if (behind) {
      throw new Error(`The local ${publication.branch} branch is ${ahead ? 'diverged from' : 'behind'} ${publication.remote}/${publication.branch}. Reconcile it deliberately before publishing; no merge or reset was performed.`);
    }
    const commits = (await git('rev-list', `${remoteBranch}..HEAD`)).trim().split('\n').filter(Boolean);
    for (const commit of commits) {
      const parents = (await git('rev-list', '--parents', '-n', '1', commit)).trim().split(/\s+/).slice(1);
      const changed = entries(await git('diff-tree', '--no-commit-id', '--name-only', '--no-renames', '-r', '-z', commit));
      if (parents.length !== 1 || changed.length === 0 || changed.some(file => !allowedPaths.has(file))) {
        throw new Error(`Unpushed commit ${commit.slice(0, 12)} is not a simple PDF-only commit. Publish or reconcile that site change separately; this command will not push it.`);
      }
    }
    return ahead;
  }

  await checkRepository();
  await checkHistory({ fetch: true });
  log('Updating and validating the five public PDFs…');
  await command('npm', ['run', 'update:docs'], { inherit: true });
  // Builds take time: recheck staged work, branch, and remote history afterward.
  await checkRepository();
  await checkHistory({ fetch: true });
  await git('add', '--', ...documentPaths);
  const changed = entries(await git('diff', '--cached', '--name-only', '--no-renames', '-z', '--', ...documentPaths));
  let committed = false;
  if (changed.length) {
    // --only is a second safeguard against unrelated index entries being included.
    await git('commit', '--only', '-m', 'Update website PDFs', '--', ...documentPaths);
    committed = true;
    log(`Committed ${changed.length} changed PDF${changed.length === 1 ? '' : 's'}.`);
  } else log('No new PDF changes to commit.');

  await checkRepository();
  const ahead = await checkHistory();
  const commit = (await git('rev-parse', 'HEAD')).trim();
  if (!ahead) {
    log('The publishing branch already has these PDF versions; no empty commit or push was made.');
    return { status: 'unchanged', commit, committed: false };
  }
  try {
    await git('push', '--no-follow-tags', publication.remote, `HEAD:refs/heads/${publication.branch}`);
  } catch (error) {
    throw new Error(`Push failed; PDF commit ${commit} remains local. Fix the reported network/authentication or remote-history issue, then rerun npm run publish:docs. No new PDF edit is needed; pending PDF-only commits will be retried.\n${error.message}`);
  }
  log(`Pushed PDF updates through ${commit}. Deployment has not yet been verified.`);
  log(`Confirm the Pages workflow succeeds: https://github.com/${publication.repository}/actions?query=branch%3A${publication.branch}`);
  return { status: 'pushed', commit, committed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 2) throw new Error('publish:docs takes no arguments; its repository and branch are fixed in the script.');
    await publishDocuments();
  } catch (error) {
    console.error(`Document publication stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
