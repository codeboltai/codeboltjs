/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { EOL } from 'node:os';
import type { ToolInvocation, ToolResult } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import { makeRelative, shortenPath } from '../utils/paths';
import { getErrorMessage, isNodeError } from '../utils/errors';
import type { ConfigManager } from '../config';
import { ToolErrorType } from '../types';

// --- Interfaces ---

/**
 * Parameters for the GrepTool
 */
export interface GrepToolParams {
  /**
   * The regular expression pattern to search for in file contents
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory relative to root)
   */
  path?: string;

  /**
   * File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")
   */
  include?: string;
}

/**
 * Result object for a single grep match
 */
interface GrepMatch {
  filePath: string;
  lineNumber: number;
  line: string;
}

/**
 * Simple git repository detection
 */
function isGitRepository(dirPath: string): boolean {
  try {
    const gitDir = path.join(dirPath, '.git');
    return fs.existsSync(gitDir);
  } catch {
    return false;
  }
}

/**
 * Get basic file exclusion patterns
 */
function getGlobExcludes(): string[] {
  return [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'Thumbs.db'
  ];
}

class GrepToolInvocation extends BaseToolInvocation<
  GrepToolParams,
  ToolResult
> {
  constructor(
    private readonly config: ConfigManager,
    params: GrepToolParams,
  ) {
    super(params);
  }

  /**
   * Checks if a path is within the root directory and resolves it.
   * @param relativePath Path relative to the root directory (or undefined for root).
   * @returns The absolute path if valid and exists, or null if no path specified (to search all directories).
   * @throws {Error} If path is outside root, doesn't exist, or isn't a directory.
   */
  private resolveAndValidatePath(relativePath?: string): string | null {
    // If no path specified, return null to indicate searching all workspace directories
    if (!relativePath) {
      return null;
    }

    const targetPath = path.resolve(this.config.getTargetDir(), relativePath);

    // Security Check: Ensure the resolved path is within workspace boundaries
    const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.getTargetDir()];
    const isWithinWorkspace = workspaceDirectories.some((dir: string) =>
      targetPath.startsWith(path.resolve(dir))
    );

    if (!isWithinWorkspace) {
      throw new Error(
        `Path validation failed: Attempted path "${relativePath}" resolves outside the allowed workspace directories: ${workspaceDirectories.join(', ')}`,
      );
    }

    // Check existence and type after resolving
    try {
      const stats = fs.statSync(targetPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${targetPath}`);
      }
    } catch (error: unknown) {
      if (isNodeError(error) && error.code !== 'ENOENT') {
        throw new Error(`Path does not exist: ${targetPath}`);
      }
      throw new Error(
        `Failed to access path stats for ${targetPath}: ${error}`,
      );
    }

    return targetPath;
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
            type: 'grep_execution_error' as ToolErrorType,
          },
        };
      }

      const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.getTargetDir()];
      const searchDirAbs = this.resolveAndValidatePath(this.params.path);
      const searchDirDisplay = this.params.path || '.';

      // Determine search path and options
      let searchPath: string;
      if (searchDirAbs === null) {
        // No path specified - search from target directory
        searchPath = this.config.getTargetDir();
      } else {
        // Specific path provided
        searchPath = searchDirAbs;
      }

      // Use FileServices to perform the search
      const result = await fileServices.searchFileContent(
        this.params.pattern,
        searchPath,
        {
          include: this.params.include
        }
      );

      if (!result.success) {
        return {
          llmContent: `Error during grep search: ${result.error}`,
          returnDisplay: `Error: ${result.error}`,
          error: {
            message: result.error || 'Unknown error',
            type: 'grep_execution_error' as ToolErrorType,
          },
        };
      }

      let searchLocationDescription: string;
      if (searchDirAbs === null) {
        const numDirs = workspaceDirectories.length;
        searchLocationDescription =
          numDirs > 1
            ? `across ${numDirs} workspace directories`
            : `in the workspace directory`;
      } else {
        searchLocationDescription = `in path "${searchDirDisplay}"`;
      }

      if (!result.matches || result.matches.length === 0) {
        const noMatchMsg = `No matches found for pattern "${this.params.pattern}" ${searchLocationDescription}${this.params.include ? ` (filter: "${this.params.include}")` : ''}.`;
        return { llmContent: noMatchMsg, returnDisplay: `No matches found` };
      }

      // Group matches by file
      const matchesByFile = result.matches.reduce(
        (acc, match) => {
          const fileKey = match.filePath;
          if (!acc[fileKey]) {
            acc[fileKey] = [];
          }
          acc[fileKey].push(match);
          acc[fileKey].sort((a, b) => a.lineNumber - b.lineNumber);
          return acc;
        },
        {} as Record<string, GrepMatch[]>,
      );

      const matchCount = result.matches.length;
      const matchTerm = matchCount === 1 ? 'match' : 'matches';

      let llmContent = `Found ${matchCount} ${matchTerm} for pattern "${this.params.pattern}" ${searchLocationDescription}${this.params.include ? ` (filter: "${this.params.include}")` : ''}:
---
`;

      for (const filePath in matchesByFile) {
        llmContent += `File: ${filePath}\n`;
        matchesByFile[filePath]?.forEach((match) => {
          const trimmedLine = match.line.trim();
          llmContent += `L${match.lineNumber}: ${trimmedLine}\n`;
        });
        llmContent += '---\n';
      }

      return {
        llmContent: llmContent.trim(),
        returnDisplay: `Found ${matchCount} ${matchTerm}`,
      };
    } catch (error) {
      console.error(`Error during GrepLogic execution: ${error}`);
      const errorMessage = getErrorMessage(error);
      return {
        llmContent: `Error during grep search operation: ${errorMessage}`,
        returnDisplay: `Error: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: ToolErrorType.GREP_EXECUTION_ERROR,
        },
      };
    }
  }

  /**
   * Gets a description of the grep operation
   * @returns A string describing the grep
   */
  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.include) {
      description += ` in ${this.params.include}`;
    }
    if (this.params.path) {
      const resolvedPath = path.resolve(
        this.config.getTargetDir(),
        this.params.path,
      );
      if (
        resolvedPath === this.config.getTargetDir() ||
        this.params.path === '.'
      ) {
        description += ` within ./`;
      } else {
        const relativePath = makeRelative(
          resolvedPath,
          this.config.getTargetDir(),
        );
        description += ` within ${shortenPath(relativePath)}`;
      }
    } else {
      // When no path is specified, indicate searching all workspace directories
      const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.getTargetDir()];
      if (workspaceDirectories.length > 1) {
        description += ` across all workspace directories`;
      }
    }
    return description;
  }
}

// --- GrepLogic Class ---

/**
 * Implementation of the Grep tool logic (moved from CLI)
 */
export class GrepTool extends BaseDeclarativeTool<GrepToolParams, ToolResult> {
  static readonly Name = 'search_file_content'; // Keep static name

  constructor(private readonly config: ConfigManager) {
    super(
      GrepTool.Name,
      'SearchText',
      'Searches for a regular expression pattern within the content of files in a specified directory (or current working directory). Can filter files by a glob pattern. Returns the lines containing matches, along with their file paths and line numbers.',
      Kind.Search,
      {
        properties: {
          pattern: {
            description:
              "The regular expression (regex) pattern to search for within file contents (e.g., 'function\\s+myFunction', 'import\\s+\\{.*\\}\\s+from\\s+.*').",
            type: 'string',
          },
          path: {
            description:
              'Optional: The absolute path to the directory to search within. If omitted, searches the current working directory.',
            type: 'string',
          },
          include: {
            description:
              "Optional: A glob pattern to filter which files are searched (e.g., '*.js', '*.{ts,tsx}', 'src/**'). If omitted, searches all files (respecting potential global ignores).",
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    );
  }

  /**
   * Checks if a path is within the root directory and resolves it.
   * @param relativePath Path relative to the root directory (or undefined for root).
   * @returns The absolute path if valid and exists, or null if no path specified (to search all directories).
   * @throws {Error} If path is outside root, doesn't exist, or isn't a directory.
   */
  private resolveAndValidatePath(relativePath?: string): string | null {
    // If no path specified, return null to indicate searching all workspace directories
    if (!relativePath) {
      return null;
    }

    const targetPath = path.resolve(this.config.getTargetDir(), relativePath);

    // Security Check: Ensure the resolved path is within workspace boundaries
    const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.getTargetDir()];
    const isWithinWorkspace = workspaceDirectories.some((dir: string) =>
      targetPath.startsWith(path.resolve(dir))
    );

    if (!isWithinWorkspace) {
      throw new Error(
        `Path validation failed: Attempted path "${relativePath}" resolves outside the allowed workspace directories: ${workspaceDirectories.join(', ')}`,
      );
    }

    // Check existence and type after resolving
    try {
      const stats = fs.statSync(targetPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${targetPath}`);
      }
    } catch (error: unknown) {
      if (isNodeError(error) && error.code !== 'ENOENT') {
        throw new Error(`Path does not exist: ${targetPath}`);
      }
      throw new Error(
        `Failed to access path stats for ${targetPath}: ${error}`,
      );
    }

    return targetPath;
  }

  /**
   * Validates the parameters for the tool
   * @param params Parameters to validate
   * @returns An error message string if invalid, null otherwise
   */
  protected override validateToolParamValues(
    params: GrepToolParams,
  ): string | null {
    try {
      new RegExp(params.pattern);
    } catch (error) {
      return `Invalid regular expression pattern provided: ${params.pattern}. Error: ${getErrorMessage(error)}`;
    }

    // Only validate path if one is provided
    if (params.path) {
      try {
        this.resolveAndValidatePath(params.path);
      } catch (error) {
        return getErrorMessage(error);
      }
    }

    return null; // Parameters are valid
  }

  protected createInvocation(
    params: GrepToolParams,
  ): ToolInvocation<GrepToolParams, ToolResult> {
    return new GrepToolInvocation(this.config, params);
  }
}