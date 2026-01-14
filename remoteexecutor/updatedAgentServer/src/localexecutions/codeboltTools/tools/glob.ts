/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier:Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ToolInvocation, ToolResult } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import { shortenPath, makeRelative } from '../utils/paths';
import type { StandaloneToolConfig } from '../config';
import { ToolErrorType } from '../types';
import { executeGlobSearch, type GlobSearchParams, type GlobSearchResult } from '../../../utils/search/GlobSearch';

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

/**
 * Extended ToolResult for glob search that includes matches data
 */
export interface GlobResult extends ToolResult {
  /**
   * Array of file paths found
   */
  results?: Array<{
    path: string;
  }>;

  /**
   * Total number of files found
   */
  totalFiles?: number;

  /**
   * Whether the results were truncated
   */
  isTruncated?: boolean;
}

class GlobToolInvocation extends BaseToolInvocation<
  GlobToolParams,
  GlobResult
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

  async execute(signal: AbortSignal): Promise<GlobResult> {
    try {
      // Convert tool params to utility params
      const utilParams: GlobSearchParams = {
        pattern: this.params.pattern,
        path: this.params.path,
        case_sensitive: this.params.case_sensitive,
        respect_git_ignore: this.params.respect_git_ignore,
        respect_codebolt_ignore: this.params.respect_gemini_ignore
      };

      // Use the utility function
      const result: GlobSearchResult = await executeGlobSearch(
        utilParams,
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

      // Handle errors from utility
      if (result.error) {
        const rawError = `Error during glob search operation: ${result.error.message}`;
        return {
          llmContent: rawError,
          returnDisplay: `Error: An unexpected error occurred.`,
          error: {
            message: rawError,
            type: result.error.type as ToolErrorType,
          },
          results: [],
          totalFiles: 0,
          isTruncated: false
        };
      }

      // Handle successful result from utility
      const matches = result.matches || [];
      const ignoredCount = result.ignoredCount || 0;

      if (matches.length === 0) {
        let message = `No files found matching pattern "${this.params.pattern}"`;
        const searchDirectories = this.params.path 
          ? [path.resolve(this.config.targetDir, this.params.path)]
          : this.config.workspaceContext.getDirectories();
          
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
          results: [],
          totalFiles: 0,
          isTruncated: false
        };
      }

      const fileListDescription = matches.join('\n');
      const fileCount = matches.length;

      let resultMessage = `Found ${fileCount} file(s) matching "${this.params.pattern}"`;
      const searchDirectories = this.params.path 
        ? [path.resolve(this.config.targetDir, this.params.path)]
        : this.config.workspaceContext.getDirectories();
        
      if (searchDirectories.length === 1) {
        resultMessage += ` within ${searchDirectories[0]}`;
      } else {
        resultMessage += ` across ${searchDirectories.length} workspace directories`;
      }
      if (ignoredCount > 0) {
        resultMessage += ` (${ignoredCount} additional files were ignored)`;
      }
      resultMessage += `, sorted by modification time (newest first):\n${fileListDescription}`;

      // Format results for UI
      const formattedResults = matches.map(path => ({ path }));

      return {
        llmContent: resultMessage,
        returnDisplay: `Found ${fileCount} matching file(s)`,
        results: formattedResults,
        totalFiles: fileCount,
        isTruncated: false
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
        results: [],
        totalFiles: 0,
        isTruncated: false
      };
    }
  }
}

/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool<GlobToolParams, GlobResult> {
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
          respect_gemini_ignore: {
            description:
              'Optional: Whether to respect .geminiignore patterns when finding files. Defaults to true.',
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
    if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
      const directories = workspaceContext.getDirectories();
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
  ): ToolInvocation<GlobToolParams, GlobResult> {
    return new GlobToolInvocation(
      this.config,
      params,
    );
  }
}