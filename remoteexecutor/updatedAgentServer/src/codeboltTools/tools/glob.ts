/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob, escape } from 'glob';
import type { ToolInvocation, ToolResult } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import { shortenPath, makeRelative } from '../utils/paths';
import type { ConfigManager } from '../config';
import { ToolErrorType } from '../types';

export interface FileFilteringOptions {
  respectGitIgnore: boolean;
  respectCodeboltIgnore: boolean;
}

interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  geminiIgnoredCount: number;
}

// For memory files
export const DEFAULT_MEMORY_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: false,
  respectCodeboltIgnore: true,
};

// For all other files
export const DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: true,
  respectCodeboltIgnore: true,
};
// Subset of 'Path' interface provided by 'glob' that we can implement for testing
export interface GlobPath {
  fullpath(): string;
  mtimeMs?: number;
}

/**
 * Sorts file entries based on recency and then alphabetically.
 * Recent files (modified within recencyThresholdMs) are listed first, newest to oldest.
 * Older files are listed after recent ones, sorted alphabetically by path.
 */
export function sortFileEntries(
  entries: GlobPath[],
  nowTimestamp: number,
  recencyThresholdMs: number,
): GlobPath[] {
  const sortedEntries = [...entries];
  sortedEntries.sort((a, b) => {
    const mtimeA = a.mtimeMs ?? 0;
    const mtimeB = b.mtimeMs ?? 0;
    const aIsRecent = nowTimestamp - mtimeA < recencyThresholdMs;
    const bIsRecent = nowTimestamp - mtimeB < recencyThresholdMs;

    if (aIsRecent && bIsRecent) {
      return mtimeB - mtimeA;
    } else if (aIsRecent) {
      return -1;
    } else if (bIsRecent) {
      return 1;
    } else {
      return a.fullpath().localeCompare(b.fullpath());
    }
  });
  return sortedEntries;
}

/**
 * Parameters for the GlobTool
 */
export interface GlobToolParams {
  /**
   * The glob pattern to match files against
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory)
   */
  path?: string;

  /**
   * Whether the search should be case-sensitive (optional, defaults to false)
   */
  case_sensitive?: boolean;

  /**
   * Whether to respect .gitignore patterns (optional, defaults to true)
   */
  respect_git_ignore?: boolean;

  /**
   * Whether to respect .geminiignore patterns (optional, defaults to true)
   */
  respect_gemini_ignore?: boolean;
}

class GlobToolInvocation extends BaseToolInvocation<
  GlobToolParams,
  ToolResult
> {
  constructor(
    private readonly config: ConfigManager,
    params: GlobToolParams,
  ) {
    super(params);
  }

  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.path) {
      const searchDir = path.resolve(
        this.config.getTargetDir(),
        this.params.path || '.',
      );
      const relativePath = makeRelative(searchDir, this.config.getTargetDir());
      description += ` within ${shortenPath(relativePath)}`;
    }
    return description;
  }

  getFileFilteringOptions(): FileFilteringOptions {
    return {
      respectGitIgnore: true,
      respectCodeboltIgnore: true,
    };
  }
  
  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      const fileServices = this.config.getFileServices();
      if (!fileServices) {
        return {
          llmContent: 'Error: FileServices not available',
          returnDisplay: 'Error: FileServices not available',
          error: {
            message: 'FileServices not available',
            type: ToolErrorType.GLOB_EXECUTION_ERROR,
          },
        };
      }

      const result = await fileServices.globSearch(this.params.pattern, this.params.path, {
        caseSensitive: this.params.case_sensitive,
        respectGitIgnore: this.params.respect_git_ignore,
        respectGeminiIgnore: this.params.respect_gemini_ignore,
      });

      if (!result.success) {
        return {
          llmContent: `Error during glob search: ${result.error}`,
          returnDisplay: `Error: ${result.error}`,
          error: {
            message: result.error || 'Unknown error',
            type: ToolErrorType.GLOB_EXECUTION_ERROR,
          },
        };
      }

      if (!result.files || result.files.length === 0) {
        let message = `No files found matching pattern "${this.params.pattern}"`;
        if (this.params.path) {
          message += ` within ${this.params.path}`;
        }
        if (result.gitIgnoredCount && result.gitIgnoredCount > 0) {
          message += ` (${result.gitIgnoredCount} files were git-ignored)`;
        }
        if (result.geminiIgnoredCount && result.geminiIgnoredCount > 0) {
          message += ` (${result.geminiIgnoredCount} files were gemini-ignored)`;
        }
        return {
          llmContent: message,
          returnDisplay: `No files found`,
        };
      }

      const fileListDescription = result.files.join('\n');
      const fileCount = result.files.length;

      let resultMessage = `Found ${fileCount} file(s) matching "${this.params.pattern}"`;
      if (this.params.path) {
        resultMessage += ` within ${this.params.path}`;
      }
      if (result.gitIgnoredCount && result.gitIgnoredCount > 0) {
        resultMessage += ` (${result.gitIgnoredCount} additional files were git-ignored)`;
      }
      if (result.geminiIgnoredCount && result.geminiIgnoredCount > 0) {
        resultMessage += ` (${result.geminiIgnoredCount} additional files were gemini-ignored)`;
      }
      resultMessage += `, sorted by modification time (newest first):\n${fileListDescription}`;

      return {
        llmContent: resultMessage,
        returnDisplay: `Found ${fileCount} matching file(s)`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`GlobLogic execute Error: ${errorMessage}`, error);
      const rawError = `Error during glob search operation: ${errorMessage}`;
      return {
        llmContent: rawError,
        returnDisplay: `Error: An unexpected error occurred.`,
        error: {
          message: rawError,
          type: ToolErrorType.GLOB_EXECUTION_ERROR,
        },
      };
    }
  }
}

/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool<GlobToolParams, ToolResult> {
  static readonly Name = 'glob';

  constructor(private readonly config: ConfigManager) {
    super(
      GlobTool.Name,
      'FindFiles',
      'Efficiently finds files matching specific glob patterns (e.g., `src/**/*.ts`, `**/*.md`), returning absolute paths sorted by modification time (newest first). Ideal for quickly locating files based on their name or path structure, especially in large codebases.',
      Kind.Search,
      {
        properties: {
          pattern: {
            description:
              "The glob pattern to match against (e.g., '**/*.py', 'docs/*.md').",
            type: 'string',
          },
          path: {
            description:
              'Optional: The absolute path to the directory to search within. If omitted, searches the root directory.',
            type: 'string',
          },
          case_sensitive: {
            description:
              'Optional: Whether the search should be case-sensitive. Defaults to false.',
            type: 'boolean',
          },
          respect_git_ignore: {
            description:
              'Optional: Whether to respect .gitignore patterns when finding files. Only available in git repositories. Defaults to true.',
            type: 'boolean',
          },
          respect_gemini_ignore: {
            description:
              'Optional: Whether to respect .geminiignore patterns when finding files. Defaults to true.',
            type: 'boolean',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    );
  }

  /**
   * Validates the parameters for the tool.
   */
  protected override validateToolParamValues(
    params: GlobToolParams,
  ): string | null {
    // Validate pattern
    if (
      !params.pattern ||
      typeof params.pattern !== 'string' ||
      params.pattern.trim() === ''
    ) {
      return "The 'pattern' parameter cannot be empty.";
    }

    // Only validate path if one is provided
    if (params.path) {
      try {
        const searchDirAbsolute = path.resolve(
          this.config.getTargetDir(),
          params.path,
        );

        // Security Check: Ensure the resolved path is within workspace boundaries
        const workspaceDirectories =
          this.config.getWorkspaceContext()?.getDirectories() || [
            this.config.getTargetDir(),
          ];
        const isWithinWorkspace = workspaceDirectories.some((dir: string) =>
          searchDirAbsolute.startsWith(path.resolve(dir)),
        );

        if (!isWithinWorkspace) {
          return `Search path ("${params.path}") resolves outside the allowed workspace directories: ${workspaceDirectories.join(', ')}`;
        }

        // Check existence and type after resolving
        if (!fs.existsSync(searchDirAbsolute)) {
          return `Search path does not exist ${searchDirAbsolute}`;
        }

        const stats = fs.statSync(searchDirAbsolute);
        if (!stats.isDirectory()) {
          return `Search path is not a directory: ${searchDirAbsolute}`;
        }
      } catch (e: unknown) {
        return `Error accessing search path: ${e}`;
      }
    }

    return null;
  }

  protected createInvocation(
    params: GlobToolParams,
  ): ToolInvocation<GlobToolParams, ToolResult> {
    return new GlobToolInvocation(this.config, params);
  }
}

/**
 * Checks if a file should be ignored based on git ignore patterns
 */
function shouldGitIgnoreFile(filePath: string): boolean {
  // Basic git ignore patterns
  const gitIgnorePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'Thumbs.db',
  ];

  const fileName = path.basename(filePath);
  const dirPath = path.dirname(filePath);

  return gitIgnorePatterns.some((pattern) => {
    const regex = new RegExp(
      pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'),
    );
    return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
  });
}

/**
 * Checks if a file should be ignored based on gemini ignore patterns
 */
function shouldCodeboltIgnoreFile(filePath: string): boolean {
  // Basic gemini ignore patterns (you may want to expand this)
  const geminiIgnorePatterns = ['.gemini/**', '.geminiignore', '.codebolt/**'];

  const fileName = path.basename(filePath);
  const dirPath = path.dirname(filePath);

  return geminiIgnorePatterns.some((pattern) => {
    const regex = new RegExp(
      pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'),
    );
    return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
  });
}

/**
 * Filters a list of file paths based on git ignore and gemini ignore rules
 * and returns a report with counts of ignored files.
 */
function filterFilesWithReport(
  filePaths: string[],
  opts: FileFilteringOptions = DEFAULT_FILE_FILTERING_OPTIONS,
): FilterReport {
  const filteredPaths: string[] = [];
  let gitIgnoredCount = 0;
  let geminiIgnoredCount = 0;

  for (const filePath of filePaths) {
    if (opts.respectGitIgnore && shouldGitIgnoreFile(filePath)) {
      gitIgnoredCount++;
      continue;
    }

    if (opts.respectCodeboltIgnore && shouldCodeboltIgnoreFile(filePath)) {
      geminiIgnoredCount++;
      continue;
    }

    filteredPaths.push(filePath);
  }

  return {
    filteredPaths,
    gitIgnoredCount,
    geminiIgnoredCount,
  };
}