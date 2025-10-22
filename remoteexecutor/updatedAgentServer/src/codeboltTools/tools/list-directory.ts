/**
 * List Directory Tool - Lists files and directories in a specified path
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ToolInvocation, ToolResult, ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import { makeRelative, shortenPath } from '../utils/paths';
import type { ConfigManager } from '../config';

/**
 * Parameters for the LS tool
 */
export interface LSToolParams {
  /**
   * The absolute path to the directory to list
   */
  path: string;

  /**
   * Array of glob patterns to ignore (optional)
   */
  ignore?: string[];

  /**
   * Whether to respect .gitignore patterns (optional, defaults to true)
   */
  respect_git_ignore?: boolean;
}

/**
 * File entry returned by LS tool
 */
export interface FileEntry {
  /**
   * Name of the file or directory
   */
  name: string;

  /**
   * Absolute path to the file or directory
   */
  path: string;

  /**
   * Whether this entry is a directory
   */
  isDirectory: boolean;

  /**
   * Size of the file in bytes (0 for directories)
   */
  size: number;

  /**
   * Last modified timestamp
   */
  modifiedTime: Date;
}

class LSToolInvocation extends BaseToolInvocation<LSToolParams, ToolResult> {
  constructor(
    private readonly config: ConfigManager,
    params: LSToolParams,
  ) {
    super(params);
  }

  /**
   * Checks if a filename matches any of the ignore patterns
   */
  private shouldIgnore(filename: string, patterns?: string[]): boolean {
    if (!patterns || patterns.length === 0) {
      return false;
    }
    for (const pattern of patterns) {
      // Convert glob pattern to RegExp
      const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(filename)) {
        return true;
      }
    }
    return false;
  }

  getDescription(): string {
    const relativePath = makeRelative(
      this.params.path,
      this.config.getTargetDir(),
    );
    return shortenPath(relativePath);
  }

  private errorResult(
    llmContent: string,
    returnDisplay: string,
    type: ToolErrorType,
  ): ToolResult {
    return {
      llmContent,
      returnDisplay: `Error: ${returnDisplay}`,
      error: {
        message: llmContent,
        type,
      },
    };
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    try {
      const stats = fs.statSync(this.params.path);
      if (!stats) {
        return this.errorResult(
          `Error: Directory not found or inaccessible: ${this.params.path}`,
          `Directory not found or inaccessible.`,
          'file_not_found' as ToolErrorType,
        );
      }
      if (!stats.isDirectory()) {
        return this.errorResult(
          `Error: Path is not a directory: ${this.params.path}`,
          `Path is not a directory.`,
          'path_is_not_a_directory' as ToolErrorType,
        );
      }

      const files = fs.readdirSync(this.params.path);

      const entries: FileEntry[] = [];

      if (files.length === 0) {
        return {
          llmContent: `Directory ${this.params.path} is empty.`,
          returnDisplay: `Directory is empty.`,
        };
      }

      for (const file of files) {
        if (this.shouldIgnore(file, this.params.ignore)) {
          continue;
        }

        const fullPath = path.join(this.params.path, file);

        try {
          const stats = fs.statSync(fullPath);
          const isDir = stats.isDirectory();
          entries.push({
            name: file,
            path: fullPath,
            isDirectory: isDir,
            size: isDir ? 0 : stats.size,
            modifiedTime: stats.mtime,
          });
        } catch (error) {
          console.error(`Error accessing ${fullPath}: ${error}`);
        }
      }

      // Sort entries (directories first, then alphabetically)
      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      // Create formatted content for LLM
      const directoryContent = entries
        .map((entry) => `${entry.isDirectory ? '[DIR] ' : ''}${entry.name}`)
        .join('\n');

      const resultMessage = `Directory listing for ${this.params.path}:\n${directoryContent}`;
      const displayMessage = `Listed ${entries.length} item(s).`;

      return {
        llmContent: resultMessage,
        returnDisplay: displayMessage,
      };
    } catch (error) {
      const errorMsg = `Error listing directory: ${error instanceof Error ? error.message : String(error)}`;
      return this.errorResult(
        errorMsg,
        'Failed to list directory.',
        'ls_execution_error' as ToolErrorType,
      );
    }
  }
}

/**
 * Implementation of the LS tool logic
 */
export class LSTool extends BaseDeclarativeTool<LSToolParams, ToolResult> {
  static readonly Name = 'list_directory';

  constructor(private config: ConfigManager) {
    super(
      LSTool.Name,
      'ReadFolder',
      'Lists the names of files and subdirectories directly within a specified directory path. Can optionally ignore entries matching provided glob patterns.',
      Kind.Search,
      {
        properties: {
          path: {
            description:
              'The absolute path to the directory to list (must be absolute, not relative)',
            type: 'string',
          },
          ignore: {
            description: 'List of glob patterns to ignore',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          respect_git_ignore: {
            description:
              'Optional: Whether to respect .gitignore patterns when listing files. Defaults to true.',
            type: 'boolean',
          },
        },
        required: ['path'],
        type: 'object',
      },
    );
  }

  protected override validateToolParamValues(
    params: LSToolParams,
  ): string | null {
    if (!path.isAbsolute(params.path)) {
      return `Path must be absolute: ${params.path}`;
    }

    const workspaceContext = this.config.getWorkspaceContext();
    if (!workspaceContext.isPathWithinWorkspace(params.path)) {
      const directories = workspaceContext.getDirectories();
      return `Path must be within one of the workspace directories: ${directories.join(
        ', ',
      )}`;
    }
    return null;
  }

  protected createInvocation(
    params: LSToolParams,
  ): ToolInvocation<LSToolParams, ToolResult> {
    return new LSToolInvocation(this.config, params);
  }
}