import { promisify } from 'util';
import { exec } from 'child_process';

import type { DiffFile, DiffResult, ProviderConfig } from '../interfaces/IProviderService';
import type { Logger } from './logger';

const execAsync = promisify(exec);

type GetDiffOptions = {
  worktreePath: string;
  providerConfig: ProviderConfig;
  logger: Logger;
};

export async function getDiff(options: GetDiffOptions): Promise<DiffResult> {
  const { worktreePath, providerConfig, logger } = options;

  const statusCommand = 'git status --porcelain';
  logger.log('Getting git status:', statusCommand);

  const { stdout: statusOutput } = await execAsync(statusCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 15_000,
  });

  const diffCommand = 'git diff HEAD';
  logger.log('Getting git diff:', diffCommand);

  const { stdout: rawDiff } = await execAsync(diffCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 15_000,
  });

  const statusLines = statusOutput.trim().split('\n').filter((line: string) => line.trim());
  const files: DiffFile[] = [];

  for (const line of statusLines) {
    if (!line.trim()) continue;

    const status = line.substring(0, 2);
    const filename = line.substring(3);

    let fileStatus: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
    if (status.includes('A')) fileStatus = 'added';
    else if (status.includes('D')) fileStatus = 'deleted';
    else if (status.includes('R')) fileStatus = 'renamed';

    const filePattern = new RegExp(
      `diff --git a/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} b/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=(?:diff --git)|$)`,
      'g'
    );
    const fileDiffMatch = rawDiff.match(filePattern);
    const fileDiff = fileDiffMatch ? fileDiffMatch[0] : '';

    const insertions = (fileDiff.match(/^[+](?![+][+])/gm) ?? []).length;
    const deletions = (fileDiff.match(/^-(?!--)/gm) ?? []).length;

    files.push({
      path: filename,
      status: fileStatus,
      changes: {
        additions: insertions,
        deletions: deletions,
        changes: insertions + deletions,
      },
      diff: fileDiff,
    });
  }

  const summary = {
    totalFiles: files.length,
    totalAdditions: files.reduce((sum, file) => sum + (file.changes?.additions ?? 0), 0),
    totalDeletions: files.reduce((sum, file) => sum + (file.changes?.deletions ?? 0), 0),
    totalChanges: files.reduce((sum, file) => sum + (file.changes?.changes ?? 0), 0),
  };

  const result: DiffResult = {
    files,
    summary,
    rawDiff,
  };

  logger.log('Found', files.length, 'changed files');
  logger.log('Total insertions:', summary.totalAdditions);
  logger.log('Total deletions:', summary.totalDeletions);

  return result;
}