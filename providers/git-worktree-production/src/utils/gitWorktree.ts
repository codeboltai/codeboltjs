import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

import type { WorktreeInfo, ProviderConfig } from '../interfaces/IProviderService';
import type { Logger } from './logger';

const execAsync = promisify(exec);

type WorktreeOptions = {
  projectPath: string;
  environmentName: string;
  providerConfig: ProviderConfig;
  logger: Logger;
};

type RemoveWorktreeOptions = {
  projectPath: string;
  worktreeInfo: WorktreeInfo;
  providerConfig: ProviderConfig;
  logger: Logger;
};

export async function ensureWorktreeBaseDir(options: WorktreeOptions): Promise<string> {
  const { projectPath, providerConfig, logger } = options;
  const worktreeBaseDir = path.join(projectPath, providerConfig.worktreeBaseDir ?? '.worktree');

  if (!fs.existsSync(worktreeBaseDir)) {
    logger.log('Creating .worktree directory at:', worktreeBaseDir);
    fs.mkdirSync(worktreeBaseDir, { recursive: true });
  }

  return worktreeBaseDir;
}

export async function verifyGitRepository(projectPath: string): Promise<void> {
  await execAsync('git rev-parse --git-dir', { cwd: projectPath, timeout: 10_000 });
}

export async function createWorktree(options: WorktreeOptions): Promise<WorktreeInfo> {
  const { projectPath, environmentName, providerConfig, logger } = options;

  const worktreeBaseDir = await ensureWorktreeBaseDir(options);
  const worktreePath = path.join(worktreeBaseDir, environmentName);

  logger.log('Creating worktree at:', worktreePath);
  await verifyGitRepository(projectPath);
  logger.log('Creating worktree branch:', environmentName);

  const command = `git worktree add -b "${environmentName}" "${worktreePath}"`;
  logger.log('Executing command:', command);

  const { stdout, stderr } = await execAsync(command, {
    cwd: projectPath,
    timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
  });

  if (stdout) logger.log('Command output:', stdout.trim());
  if (stderr) logger.log('Command stderr:', stderr.trim());

  return {
    path: worktreePath,
    branch: environmentName,
    isCreated: true,
  };
}

export async function removeWorktree(options: RemoveWorktreeOptions): Promise<WorktreeInfo> {
  const { projectPath, worktreeInfo, providerConfig, logger } = options;

  if (!worktreeInfo.path || !worktreeInfo.isCreated) {
    logger.log('No worktree to clean up');
    return {
      path: null,
      branch: null,
      isCreated: false,
    };
  }

  logger.log('Removing worktree at:', worktreeInfo.path);

  const performRemoval = async (force: boolean) => {
    const removeCommand = force
      ? `git worktree remove --force "${worktreeInfo.path}"`
      : `git worktree remove "${worktreeInfo.path}"`;

    const { stdout, stderr } = await execAsync(removeCommand, {
      cwd: projectPath,
      timeout: providerConfig.timeouts?.cleanup ?? 15_000,
    });

    if (stdout) logger.log('Remove output:', stdout.trim());
    if (stderr) logger.log('Remove stderr:', stderr.trim());
  };

  try {
    await performRemoval(false);
  } catch (error) {
    logger.warn('Failed to remove worktree, retrying with force:', (error as Error).message);
    await performRemoval(true);
  }

  if (worktreeInfo.branch) {
    try {
      const deleteBranchCommand = `git branch -D "${worktreeInfo.branch}"`;
      const { stdout: branchStdout, stderr: branchStderr } = await execAsync(deleteBranchCommand, {
        cwd: projectPath,
        timeout: 10_000,
      });

      logger.log('Successfully deleted branch:', worktreeInfo.branch);
      if (branchStdout) logger.log('Branch delete output:', branchStdout.trim());
      if (branchStderr) logger.log('Branch delete stderr:', branchStderr.trim());
    } catch (branchError) {
      logger.warn('Failed to delete branch:', worktreeInfo.branch, (branchError as Error).message);
    }
  }

  return {
    path: null,
    branch: null,
    isCreated: false,
  };
}

export async function mergeWorktreeAsPatch(options: WorktreeOptions): Promise<string> {
  const { projectPath, environmentName, providerConfig, logger } = options;
  const worktreeBaseDir = await ensureWorktreeBaseDir(options);
  const worktreePath = path.join(worktreeBaseDir, environmentName);

  logger.log('Merging worktree as patch:', worktreePath);

  // 1. Get the diff from the worktree
  const diffCommand = `git diff HEAD`;
  const { stdout: diffOutput } = await execAsync(diffCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
  });

  if (!diffOutput.trim()) {
    logger.log('No changes to merge');
    return '';
  }

  return diffOutput;
}

export async function pushWorktreeBranch(options: WorktreeOptions): Promise<void> {
  const { projectPath, environmentName, providerConfig, logger } = options;
  const worktreeBaseDir = await ensureWorktreeBaseDir(options);
  const worktreePath = path.join(worktreeBaseDir, environmentName);

  logger.log('Pushing worktree branch:', environmentName);

  const pushCommand = `git push origin "${environmentName}"`;
  logger.log('Executing command:', pushCommand);

  const { stdout, stderr } = await execAsync(pushCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 60_000,
  });

  if (stdout) logger.log('Push output:', stdout.trim());
  if (stderr) logger.log('Push stderr:', stderr.trim());
}