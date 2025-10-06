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

  const statusLines = statusOutput.trim().split('\n').filter(line => line.trim());
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
      file: filename,
      changes: insertions + deletions,
      insertions,
      deletions,
      binary: false,
      status: fileStatus,
      diff: fileDiff,
    });
  }

  const result: DiffResult = {
    files,
    insertions: files.reduce((sum, file) => sum + file.insertions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0),
    changed: files.length,
    rawDiff,
  };

  logger.log('Found', result.changed, 'changed files');
  logger.log('Total insertions:', result.insertions);
  logger.log('Total deletions:', result.deletions);

  return result;
}

