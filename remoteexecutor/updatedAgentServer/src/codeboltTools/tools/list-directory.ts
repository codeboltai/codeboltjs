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
import { executeListDirectory, type LSParams, type FileEntry } from '../../utils/fileSystem/ListDirectory';

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

class LSToolInvocation extends BaseToolInvocation<LSToolParams, ToolResult> {
  constructor(
    private readonly config: ConfigManager,
    params: LSToolParams,
  ) {
    super(params);
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
      // Convert tool params to utility params
      const utilParams: LSParams = {
        path: this.params.path,
        ignore: this.params.ignore,
        respect_git_ignore: this.params.respect_git_ignore,
      };

      // Use the utility function
      const result = executeListDirectory(
        utilParams,
        this.config.getTargetDir(),
        this.config.getWorkspaceContext()
      );

      // Handle errors from utility
      if (result.error) {
        return this.errorResult(
          result.error.message,
          'Failed to list directory.',
          result.error.type as ToolErrorType,
        );
      }

      // Handle successful result from utility
      const entries = result.entries || [];

      if (entries.length === 0) {
        return {
          llmContent: `Directory ${this.params.path} is empty.`,
          returnDisplay: `Directory is empty.`,
        };
      }

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