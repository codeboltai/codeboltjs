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

  const statusCommand = 'git status --porcelain --untracked-files=all';
  logger.log('Getting git status:', statusCommand);

  const { stdout: statusOutput } = await execAsync(statusCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 15_000,
  });

  // Get diff for unstaged changes
  const diffUnstagedCommand = 'git diff HEAD';
  logger.log('Getting unstaged diff:', diffUnstagedCommand);

  const { stdout: unstagedDiff } = await execAsync(diffUnstagedCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 15_000,
  });

  // Get diff for staged changes
  const diffStagedCommand = 'git diff --cached';
  logger.log('Getting staged diff:', diffStagedCommand);

  const { stdout: stagedDiff } = await execAsync(diffStagedCommand, {
    cwd: worktreePath,
    timeout: providerConfig.timeouts?.gitOperations ?? 15_000,
  });

  const statusLines = statusOutput.trim().split('\n').filter((line: string) => line.trim());
  
  // Parse unstaged diff into a map
  const unstagedDiffMap = parseDiffToMap(unstagedDiff);
  
  // Parse staged diff into a map
  const stagedDiffMap = parseDiffToMap(stagedDiff);

  const files: DiffFile[] = [];

  for (const line of statusLines) {
    if (!line.trim()) continue;

    const status = line.substring(0, 2);
    const filename = line.substring(3);

    let fileStatus: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
    const indexStatus = status[0]; // First character: staged status
    const workTreeStatus = status[1]; // Second character: unstaged status

    // Determine file status based on git status codes
    if (status === '??') {
      fileStatus = 'added'; // Untracked file
    } else if (indexStatus === 'A' || workTreeStatus === 'A') {
      fileStatus = 'added';
    } else if (indexStatus === 'D' || workTreeStatus === 'D') {
      fileStatus = 'deleted';
    } else if (indexStatus === 'R' || workTreeStatus === 'R') {
      fileStatus = 'renamed';
    }

    // Try to get diff from staged or unstaged maps
    let fileDiff = stagedDiffMap.get(filename) || unstagedDiffMap.get(filename) || '';

    // For untracked files (??), generate diff from file content
    if (status === '??' && !fileDiff) {
      try {
        const path = require('path');
        const fs = require('fs').promises;
        const filePath = path.join(worktreePath, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        fileDiff = `diff --git a/${filename} b/${filename}\nnew file mode 100644\nindex 0000000..0000000\n--- /dev/null\n+++ b/${filename}\n@@ -0,0 +1,${lines.length} @@\n`;
        fileDiff += lines.map((line: string) => '+' + line).join('\n');
      } catch (err) {
        logger.log('Error reading untracked file:', filename, err);
      }
    }

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

  // Combine both diffs for rawDiff
  const rawDiff = stagedDiff + '\n' + unstagedDiff;

  const result: DiffResult = {
    files,
    summary,
    rawDiff: rawDiff.trim(),
  };

  logger.log('Found', files.length, 'changed files');
  logger.log('Total insertions:', summary.totalAdditions);
  logger.log('Total deletions:', summary.totalDeletions);

  return result;
}

// Helper function to parse diff output into a map
function parseDiffToMap(diffOutput: string): Map<string, string> {
  const diffMap = new Map<string, string>();
  const diffSections = diffOutput.split(/^diff --git /gm).filter((section: string) => section.trim());
  
  for (const section of diffSections) {
    const lines = section.split('\n');
    if (lines.length < 2) continue;
    
    const firstLine = lines[0];
    const match = firstLine.match(/^a\/(.+?)\s+b\/(.+)$/);
    if (!match) continue;
    
    const [, oldPath, newPath] = match;
    const keyPath = newPath || oldPath;
    
    const fullSection = 'diff --git ' + section;
    diffMap.set(keyPath, fullSection);
  }
  
  return diffMap;
}
