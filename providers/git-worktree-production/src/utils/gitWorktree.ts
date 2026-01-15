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

  try {
    if (!fs.existsSync(worktreeBaseDir)) {
      logger.log('Creating .worktree directory at:', worktreeBaseDir);
      fs.mkdirSync(worktreeBaseDir, { recursive: true });
    }

    return worktreeBaseDir;
  } catch (error: any) {
    logger.error('Error ensuring worktree base directory:', error);
    throw new Error(`Failed to ensure worktree base directory: ${error.message}`);
  }
}

export async function verifyGitRepository(projectPath: string): Promise<void> {
  try {
    await execAsync('git rev-parse --git-dir', { cwd: projectPath, timeout: 10_000 });
  } catch (error: any) {
    throw new Error(`Invalid git repository at ${projectPath}: ${error.message}`);
  }
}

export async function createWorktree(options: WorktreeOptions): Promise<WorktreeInfo> {
  const { projectPath, environmentName, providerConfig, logger } = options;

  try {
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
  } catch (error: any) {
    logger.error('Error creating worktree:', error);
    throw new Error(`Failed to create worktree: ${error.message}`);
  }
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

  try {
    // 1. Find the merge base between current HEAD (in projectPath) and the worktree branch
    // We run this in projectPath because that's where HEAD is relevant to the user's current view
    const mergeBaseCommand = `git merge-base HEAD "${environmentName}"`;
    const { stdout: mergeBaseOutput } = await execAsync(mergeBaseCommand, {
      cwd: projectPath,
      timeout: 10_000,
    });

    const mergeBase = mergeBaseOutput.trim();

    if (!mergeBase) {
      logger.warn('Could not find merge base, falling back to git diff HEAD in worktree');
      // Fallback to original behavior if merge-base fails
      const diffCommand = `git diff HEAD`;
      const { stdout: diffOutput } = await execAsync(diffCommand, {
        cwd: worktreePath,
        timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
      });
      return diffOutput;
    }

    logger.log('Found merge base:', mergeBase);

    // 2. Stage all changes to ensure untracked files are included
    // This is important because git diff (even with a commit) ignores untracked files
    logger.log('Staging all changes in worktree to include untracked files...');
    await execAsync('git add -A', {
      cwd: worktreePath,
      timeout: providerConfig.timeouts?.gitOperations ?? 30_000
    });

    // 2.1 Auto-commit changes if requested
    // This ensures we have a clean state and captures everything in the history
    try {
      const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: worktreePath });
      if (statusOutput.trim()) {
        logger.log('Auto-committing changes before merge...');
        await execAsync('git commit -m "Auto-commit: Saving changes before merge"', {
          cwd: worktreePath,
          timeout: providerConfig.timeouts?.gitOperations ?? 30_000
        });
      } else {
        logger.log('No uncommitted changes found to auto-commit.');
      }
    } catch (commitError: any) {
      logger.warn('Auto-commit failed, proceeding with uncommitted changes:', commitError.message);
      // We continue because the changes are staged, so git diff <base> will still pick them up
    }

    // 3. Get the diff from the worktree against the merge base
    // We use --cached or just standard diff against the base.
    // Since we staged everything, diff <base> works perfectly.
    const diffCommand = `git diff "${mergeBase}"`;
    logger.log(`Executing diff command: ${diffCommand} in ${worktreePath}`);

    let { stdout: diffOutput } = await execAsync(diffCommand, {
      cwd: worktreePath,
      timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
    });

    logger.log(`Diff output length: ${diffOutput.length}`);

    // If merge-base diff is empty, try HEAD diff as fallback
    if (!diffOutput.trim()) {
      logger.warn('Merge-base diff is empty, trying git diff HEAD...');
      const headDiffCommand = `git diff HEAD`;
      const { stdout: headDiffOutput } = await execAsync(headDiffCommand, {
        cwd: worktreePath,
        timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
      });
      diffOutput = headDiffOutput;
      logger.log(`HEAD diff output length: ${diffOutput.length}`);
    }

    if (!diffOutput.trim()) {
      logger.log('Diff output is still empty');
      // Capture status to return to user
      const statusCommand = `git status`;
      const { stdout: statusOutput } = await execAsync(statusCommand, { cwd: worktreePath });
      logger.log(`Worktree status: ${statusOutput}`);

      // Return the status as the "diff" so the user sees why it's empty
      return `No changes found to merge.\n\nGit Status:\n${statusOutput}`;
    }

    return diffOutput;
  } catch (error: any) {
    logger.error('Error generating patch:', error);
    // If something goes wrong with the smart diff, try the simple one as a last resort
    try {
      logger.warn('Falling back to git diff HEAD');
      // Try to stage even in fallback
      try {
        await execAsync('git add -A', { cwd: worktreePath });
      } catch (e) {
        logger.warn('Failed to stage changes in fallback:', e);
      }

      const diffCommand = `git diff HEAD`;
      const { stdout: diffOutput } = await execAsync(diffCommand, {
        cwd: worktreePath,
        timeout: providerConfig.timeouts?.gitOperations ?? 30_000,
      });
      return diffOutput;
    } catch (fallbackError) {
      throw error; // Throw original error if fallback also fails
    }
  }
}

export async function pushWorktreeBranch(options: WorktreeOptions): Promise<void> {
  const { projectPath, environmentName, providerConfig, logger } = options;

  try {
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
  } catch (error: any) {
    logger.error('Error pushing worktree branch:', error);
    throw new Error(`Failed to push worktree branch: ${error.message}`);
  }
}