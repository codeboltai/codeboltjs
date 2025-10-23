/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier:Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ToolInvocation, ToolResult } from '../codeboltTools/types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../codeboltTools/base-tool';
import { makeRelative, shortenPath } from '../codeboltTools/utils/paths';
import { getErrorMessage, isNodeError } from '../codeboltTools/utils/errors';
import type { StandaloneToolConfig } from '../codeboltTools/config';
import { ToolErrorType } from '../codeboltTools/types';
import { executeGlobSearch } from '../utils/search/GlobSearch';
import type { GlobPath } from '../utils/search/types';


interface FileFilteringOptions {
  respectGitIgnore: boolean;
  respectCodeboltIgnore: boolean;
}

interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  codeboltIgnoredCount: number;
  ignoredCount: number;
}

// For memory files
export const DEFAULT_MEMORY_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: false,
  respectCodeboltIgnore: true,
};

// For all other files
export const DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: true,
  respectCodeboltIgnore: true
};

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
   * Whether to respect .codeboltignore patterns (optional, defaults to true)
   */
  respect_codebolt_ignore?: boolean;
}

class GlobToolInvocation extends BaseToolInvocation<
  GlobToolParams,
  ToolResult
> {
  constructor(
    private config: StandaloneToolConfig,
    params: GlobToolParams,
  ) {
    super(params);
  }

  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.path) {
      const searchDir = path.resolve(
        this.config.targetDir,
        this.params.path || '.',
      );
      const relativePath = makeRelative(searchDir, this.config.targetDir);
      description += ` within ${shortenPath(relativePath)}`;
    }
    return description;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    // Delegate to the utility function
    const result = await executeGlobSearch(
      this.params,
      this.config.targetDir,
      this.config.workspaceContext,
      () => this.config.getFileService ? this.config.getFileService() : undefined,
      () => this.config.getFileExclusions ? this.config.getFileExclusions() : undefined,
      () => {
        const options = this.config.getFileFilteringOptions ? this.config.getFileFilteringOptions() : undefined;
        if (options) {
          return {
            respectGitIgnore: options.respectGitIgnore ?? true,
            respectCodeboltIgnore: options.respectCodeboltIgnore ?? true
          };
        }
        return undefined;
      },
      signal
    );

    // Handle error case
    if (result.error) {
      return {
        llmContent: result.error.message,
        returnDisplay: `Error: ${result.error.type}`,
        error: {
          message: result.error.message,
          type: ToolErrorType.GLOB_EXECUTION_ERROR,
        }
      };
    }

    // Format the result for LLM and display
    const { matches, ignoredCount } = result;
    
    const workspaceDirectories = this.config.workspaceContext.getDirectories();
    
    // If a specific path is provided, resolve it and check if it's within workspace
    let searchDirectories: readonly string[];
    if (this.params.path) {
      const searchDirAbsolute = path.resolve(this.config.targetDir, this.params.path);
      searchDirectories = [searchDirAbsolute];
    } else {
      // Search across all workspace directories
      searchDirectories = workspaceDirectories;
    }

    if (matches.length === 0) {
      let message = `No files found matching pattern "${this.params.pattern}"`;
      if (searchDirectories.length === 1) {
        message += ` within ${searchDirectories[0]}`;
      } else {
        message += ` within ${searchDirectories.length} workspace directories`;
      }
      if (ignoredCount > 0) {
        message += ` (${ignoredCount} files were ignored)`;
      }
      return {
        llmContent: message,
        returnDisplay: `No files found`,
      };
    }

    const fileListDescription = matches.join('\n');
    const fileCount = matches.length;

    let resultMessage = `Found ${fileCount} file(s) matching "${this.params.pattern}"`;
    if (searchDirectories.length === 1) {
      resultMessage += ` within ${searchDirectories[0]}`;
    } else {
      resultMessage += ` across ${searchDirectories.length} workspace directories`;
    }
    if (ignoredCount > 0) {
      resultMessage += ` (${ignoredCount} additional files were ignored)`;
    }
    resultMessage += `, sorted by modification time (newest first):\n${fileListDescription}`;

    return {
      llmContent: resultMessage,
      returnDisplay: `Found ${fileCount} matching file(s)`,
    };
  }
}

/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool<GlobToolParams, ToolResult> {
  static readonly Name = 'glob';
  constructor(
    private config: StandaloneToolConfig,
  ) {
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
          respect_codebolt_ignore: {
            description:
              'Optional: Whether to respect .codeboltignore patterns when finding files. Defaults to true.',
            type: 'boolean',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
      true,
      false
    );
  }

  /**
   * Validates the parameters for the tool.
   */
  protected override validateToolParamValues(
    params: GlobToolParams,
  ): string | null {
    const searchDirAbsolute = path.resolve(
      this.config.targetDir,
      params.path || '.',
    );

    const workspaceContext = this.config.workspaceContext;
    if (!workspaceContext?.isPathWithinWorkspace(searchDirAbsolute)) {
      const directories = workspaceContext?.getDirectories() || [];
      return `Search path ("${searchDirAbsolute}") resolves outside the allowed workspace directories: ${directories.join(', ')}`;
    }

    const targetDir = searchDirAbsolute || this.config.targetDir;
    try {
      if (!fs.existsSync(targetDir)) {
        return `Search path does not exist ${targetDir}`;
      }
      if (!fs.statSync(targetDir).isDirectory()) {
        return `Search path is not a directory: ${targetDir}`;
      }
    } catch (e: unknown) {
      return `Error accessing search path: ${e}`;
    }

    if (
      !params.pattern ||
      typeof params.pattern !== 'string' ||
      params.pattern.trim() === ''
    ) {
      return "The 'pattern' parameter cannot be empty.";
    }

    return null;
  }

  protected createInvocation(
    params: GlobToolParams,
  ): ToolInvocation<GlobToolParams, ToolResult> {
    return new GlobToolInvocation(
      this.config,
      params,
    );
  }
}