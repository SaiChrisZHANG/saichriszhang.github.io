import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { documentPaths, publication, publishDocuments, runCommand } from './publish-documents.mjs';

// These tests use only disposable repositories and a local bare remote.
// Remote identity responses and update:docs are injected; all other Git
// operations (including commits and successful pushes) run against those files.
async function fixture(t, { update, failPushOnce = false, pushURL, fetchURL } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sai-publish-docs-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'site with spaces (文)');
  const remote = path.join(root, 'remote.git');
  await mkdir(cwd);
  async function git(...args) {
    const result = await runCommand('git', args, { cwd });
    assert.equal(result.code, 0, `${args.join(' ')}: ${result.stderr}`);
    return result.stdout;
  }
  await git('init', '--initial-branch=main');
  await git('config', 'user.name', 'Fixture Author');
  await git('config', 'user.email', 'fixture@example.invalid');
  await git('config', 'commit.gpgsign', 'false');
  await git('config', 'core.hooksPath', path.join(root, 'no-hooks'));
  for (const file of documentPaths) {
    await mkdir(path.dirname(path.join(cwd, file)), { recursive: true });
    await writeFile(path.join(cwd, file), `original ${file}\n`);
  }
  await writeFile(path.join(cwd, 'README.md'), 'Original website text\n');
  await git('add', '--', ...documentPaths, 'README.md');
  await git('commit', '-m', 'Initial website fixture');
  await git('init', '--bare', '--initial-branch=main', remote);
  await git('remote', 'add', 'origin', remote);
  await git('push', '-u', 'origin', 'main');
  const initial = (await git('rev-parse', 'HEAD')).trim();
  const calls = { updates: 0, pushes: 0 };
  const logs = [];
  const run = async (command, args, options) => {
    if (command === 'git' && args[0] === 'remote' && args[1] === 'get-url') {
      const value = args.includes('--push')
        ? (pushURL ?? `git@github.com:${publication.repository}.git`)
        : (fetchURL ?? `https://github.com/${publication.repository}.git`);
      return { code: 0, stdout: `${value}\n`, stderr: '' };
    }
    if (command === 'npm') {
      assert.deepEqual(args, ['run', 'update:docs']);
      calls.updates += 1;
      return await update?.({ cwd, git, calls }) ?? { code: 0, stdout: '', stderr: '' };
    }
    if (command === 'git' && args[0] === 'push') {
      calls.pushes += 1;
      assert.deepEqual(args, ['push', '--no-follow-tags', 'origin', 'HEAD:refs/heads/main']);
      if (failPushOnce && calls.pushes === 1) return { code: 128, stdout: '', stderr: 'Simulated network failure' };
    }
    return runCommand(command, args, options);
  };
  return {
    cwd, root, remote, git, initial, calls, logs,
    publish: () => publishDocuments({ cwd, run, log: message => logs.push(message) }),
    remoteHead: async () => (await git('--git-dir', remote, 'rev-parse', 'main')).trim(),
  };
}

test('commits only selected PDFs and preserves unrelated unstaged and untracked files', async t => {
  const f = await fixture(t, { update: async ({ cwd }) => {
    await writeFile(path.join(cwd, documentPaths[0]), 'new CV bytes\n');
    await writeFile(path.join(cwd, documentPaths[2]), 'new research statement bytes\n');
  } });
  await writeFile(path.join(f.cwd, 'README.md'), 'Unfinished unrelated text\n');
  await writeFile(path.join(f.cwd, 'personal notes.txt'), 'Do not publish me\n');
  const result = await f.publish();
  assert.equal(result.status, 'pushed');
  assert.equal(result.committed, true);
  assert.equal(await f.remoteHead(), result.commit);
  const changed = (await f.git('diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD')).trim().split('\n');
  assert.deepEqual(changed.sort(), [documentPaths[0], documentPaths[2]].sort());
  assert.equal(await readFile(path.join(f.cwd, 'README.md'), 'utf8'), 'Unfinished unrelated text\n');
  assert.equal(await readFile(path.join(f.cwd, 'personal notes.txt'), 'utf8'), 'Do not publish me\n');
  assert.equal(await f.git('show', 'HEAD:README.md'), 'Original website text\n');
  assert.equal(await f.git('diff', '--cached', '--name-only'), '');
  assert.ok(f.logs.some(message => message.includes('Deployment has not yet been verified')));
});

test('a failed push retains its PDF commit, retry pushes it without another edit, then unchanged is a no-op', async t => {
  const f = await fixture(t, { failPushOnce: true, update: async ({ cwd }) => {
    await writeFile(path.join(cwd, documentPaths[0]), 'one new public CV\n');
  } });
  await assert.rejects(f.publish(), /Push failed; PDF commit .* remains local/);
  const retained = (await f.git('rev-parse', 'HEAD')).trim();
  assert.notEqual(retained, f.initial);
  assert.equal(await f.remoteHead(), f.initial);
  const retry = await f.publish();
  assert.equal(retry.status, 'pushed');
  assert.equal(retry.committed, false);
  assert.equal(retry.commit, retained);
  assert.equal(await f.remoteHead(), retained);
  const unchanged = await f.publish();
  assert.equal(unchanged.status, 'unchanged');
  assert.equal(unchanged.commit, retained);
  assert.equal(f.calls.pushes, 2);
  assert.equal((await f.git('rev-list', '--count', 'HEAD')).trim(), '2');
});

test('unrelated staged work stops before update and preserves both staged and unstaged versions', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.cwd, 'README.md'), 'Staged version\n');
  await f.git('add', '--', 'README.md');
  await writeFile(path.join(f.cwd, 'README.md'), 'Later unstaged version\n');
  const staged = await f.git('diff', '--cached', '--binary');
  await assert.rejects(f.publish(), /Unrelated staged changes.*README.md/);
  assert.equal(await f.git('diff', '--cached', '--binary'), staged);
  assert.equal(await readFile(path.join(f.cwd, 'README.md'), 'utf8'), 'Later unstaged version\n');
  assert.equal(f.calls.updates, 0);
  assert.equal(f.calls.pushes, 0);
});

test('wrong branch and either wrong remote URL stop before updating or pushing', async t => {
  await t.test('branch', async t => {
    const f = await fixture(t);
    await f.git('switch', '-c', 'work-in-progress');
    await assert.rejects(f.publish(), /requires branch main/);
    assert.deepEqual(f.calls, { updates: 0, pushes: 0 });
  });
  for (const key of ['fetchURL', 'pushURL']) {
    await t.test(key, async t => {
      const f = await fixture(t, { [key]: 'https://github.com/another-owner/another-site.git' });
      await assert.rejects(f.publish(), /URL must identify only SaiChrisZHANG/);
      assert.deepEqual(f.calls, { updates: 0, pushes: 0 });
    });
  }
});

test('an unrelated ahead commit cannot be hidden by a later revert', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.cwd, 'README.md'), 'Unpublished site change\n');
  await f.git('add', '--', 'README.md');
  await f.git('commit', '-m', 'Site edit');
  await f.git('revert', '--no-edit', 'HEAD');
  assert.equal(await f.git('diff', 'origin/main', '--name-only'), '');
  await assert.rejects(f.publish(), /not a simple PDF-only commit/);
  assert.deepEqual(f.calls, { updates: 0, pushes: 0 });
  assert.equal(await f.remoteHead(), f.initial);
});

test('behind and diverged branches are not merged, reset, or pushed', async t => {
  for (const diverged of [false, true]) {
    await t.test(diverged ? 'diverged' : 'behind', async t => {
      const f = await fixture(t);
      if (diverged) {
        await writeFile(path.join(f.cwd, documentPaths[0]), 'local unpushed CV\n');
        await f.git('add', '--', documentPaths[0]);
        await f.git('commit', '-m', 'Local PDF update');
      }
      const before = (await f.git('rev-parse', 'HEAD')).trim();
      // A second local checkout advances the bare remote, with no GitHub access.
      const other = path.join(f.root, 'other checkout');
      await f.git('clone', '--quiet', f.remote, other);
      await f.git('-C', other, 'config', 'user.name', 'Other Fixture');
      await f.git('-C', other, 'config', 'user.email', 'other@example.invalid');
      await f.git('-C', other, 'config', 'commit.gpgsign', 'false');
      await f.git('-C', other, 'config', 'core.hooksPath', path.join(f.root, 'no-hooks'));
      await writeFile(path.join(other, 'README.md'), 'Remote site change\n');
      await f.git('-C', other, 'add', '--', 'README.md');
      await f.git('-C', other, 'commit', '-m', 'Remote site update');
      await f.git('-C', other, 'push', 'origin', 'main');
      await assert.rejects(f.publish(), diverged ? /branch is diverged/ : /branch is behind/);
      assert.equal((await f.git('rev-parse', 'HEAD')).trim(), before);
      assert.deepEqual(f.calls, { updates: 0, pushes: 0 });
    });
  }
});

test('failed update prevents staging, commit, and push', async t => {
  const f = await fixture(t, { update: async ({ cwd }) => {
    await writeFile(path.join(cwd, documentPaths[0]), 'synced but build failed\n');
    return { code: 1, stdout: '', stderr: 'Simulated build failure' };
  } });
  await assert.rejects(f.publish(), /update:docs failed.*Simulated build failure/);
  assert.equal((await f.git('rev-parse', 'HEAD')).trim(), f.initial);
  assert.equal(await f.git('diff', '--cached', '--name-only'), '');
  assert.equal(f.calls.pushes, 0);
});

test('staged work appearing during update is preserved and stops publication', async t => {
  const f = await fixture(t, { update: async ({ cwd, git }) => {
    await writeFile(path.join(cwd, 'README.md'), 'New staged text during update\n');
    await git('add', '--', 'README.md');
  } });
  await assert.rejects(f.publish(), /Unrelated staged changes/);
  assert.equal(await f.git('show', ':README.md'), 'New staged text during update\n');
  assert.equal((await f.git('rev-parse', 'HEAD')).trim(), f.initial);
  assert.equal(f.calls.pushes, 0);
});

test('an in-progress Git operation stops before update', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.cwd, '.git', 'MERGE_HEAD'), `${f.initial}\n`);
  await assert.rejects(f.publish(), /Finish the current Git operation \(MERGE_HEAD\)/);
  assert.deepEqual(f.calls, { updates: 0, pushes: 0 });
});

test('push.followTags cannot publish an unrelated local annotated tag', async t => {
  const f = await fixture(t, { update: async ({ cwd }) => {
    await writeFile(path.join(cwd, documentPaths[0]), 'PDF update with a local tag present\n');
  } });
  await f.git('config', 'push.followTags', 'true');
  await f.git('tag', '-a', 'local-only-tag', '-m', 'Must stay local');
  await f.publish();
  const tag = await runCommand('git', ['--git-dir', f.remote, 'show-ref', '--verify', 'refs/tags/local-only-tag'], { cwd: f.cwd });
  assert.notEqual(tag.code, 0);
  assert.equal((await f.git('tag', '--list', 'local-only-tag')).trim(), 'local-only-tag');
});
