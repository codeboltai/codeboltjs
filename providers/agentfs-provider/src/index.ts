import codebolt from '@codebolt/codeboltjs';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
let base = '';
let overlay = '';

codebolt.onProviderStart(async (vars) => {
  base = path.resolve(String(vars.projectPath || ''));
  const name = vars.environmentName.replace(/[^a-zA-Z0-9_.-]/g, '-');
  const syncMode = vars.syncMode === 'git' ? 'git' : 'workspace_sync';
  overlay = path.resolve(String(vars.environmentPath || path.join(os.tmpdir(), 'codebolt-agentfs', name)));
  if (!vars.projectPath || base === overlay || base.startsWith(`${overlay}${path.sep}`) || overlay.startsWith(`${base}${path.sep}`))
    throw new Error('AgentFS requires separate projectPath and environmentPath directories');
  await fs.rm(overlay, { recursive: true, force: true });
  await fs.mkdir(path.dirname(overlay), { recursive: true });
  await exec('cp', ['-cR', `${base}/`, `${overlay}/`]);
  return { success: true, environmentName: vars.environmentName, agentServerUrl: '', transport: 'custom',
    workspacePath: overlay, worktreePath: overlay, environmentPath: overlay, resolvedPath: overlay,
    parentPath: base, parentProjectPath: base, requestedPath: vars.requestedPath || vars.environmentPath,
    pathSource: vars.pathSource || (vars.environmentPath ? 'user_override' : 'provider_proposed'),
    executionMode: 'local_thread_pool', syncMode, mergeStrategy: syncMode,
    supportedSyncModes: ['git', 'workspace_sync'], supportedMergeStrategies: ['git', 'workspace_sync'] };
});

codebolt.onProviderStop(async (vars) => {
  if (overlay) await fs.rm(overlay, { recursive: true, force: true });
  base = '';
  overlay = '';
  return { success: true, environmentName: vars.environmentName };
});

codebolt.onGetDiffFiles(async () => {
  if (!base || !overlay) throw new Error('AgentFS provider is not started');
  let rawDiff = '';
  try {
    rawDiff = (await exec('diff', ['-rq', base, overlay])).stdout;
  } catch (error) {
    const result = error as { code?: number; stdout?: string };
    if (result.code !== 1) throw error;
    rawDiff = result.stdout || '';
  }
  const files = rawDiff.trim().split('\n').filter((line) => line.startsWith('Files ') || line.startsWith('Only in ')).map((line) => {
    const changed = line.startsWith(`Files ${base}/`) && line.endsWith(' differ');
    const only = line.match(/^Only in (.*): (.*)$/);
    const absolute = changed ? line.slice(6, line.indexOf(` and ${overlay}/`)) : path.join(only?.[1] || '', only?.[2] || '');
    const status = changed ? 'modified' : absolute === base || absolute.startsWith(`${base}${path.sep}`) ? 'deleted' : 'added';
    const file = path.relative(status === 'added' ? overlay : base, absolute);
    return { file, path: file, status, changes: 0, insertions: 0, deletions: 0, binary: false };
  });
  return { files, insertions: 0, deletions: 0, changed: files.length, rawDiff,
    summary: { totalFiles: files.length, totalAdditions: 0, totalDeletions: 0, totalChanges: files.length } };
});
