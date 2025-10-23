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
import { isNodeError } from '../codeboltTools/utils/errors';
import type { ConfigManager } from '../codeboltTools/config';
import { ToolErrorType } from '../codeboltTools/types';
import * as DiffLib from 'diff';
import * as Diff from '../codeboltTools/utils/diff';
import { executeWriteFile } from '../utils/fileSystem/WriteFile';

const DEFAULT_DIFF_OPTIONS = {
  context: 3,
};

/**
 * Parameters for the WriteFileTool
 */
export interface WriteFileToolParams {
  /**
   * The absolute path to the file to write to
   */
  file_path: string;

  /**
   * The content to write to the file
   */
  content: string;

  /**
   * Whether the content was modified by the user
   */
  modified_by_user?: boolean;
}

class WriteFileToolInvocation extends BaseToolInvocation<
  WriteFileToolParams,
  ToolResult
> {
  constructor(
    private readonly config: ConfigManager,
    params: WriteFileToolParams,
  ) {
    super(params);
  }

  getDescription(): string {
    const fileName = path.basename(this.params.file_path);
    return `Writing to file: ${fileName}`;
  }

  async shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<false> {
    // If auto-approval mode, skip confirmation
    if (this.config.getApprovalMode() === 'auto') {
      return false;
    }

    let originalContent = '';
    try {
      originalContent = await this.config
        .getFileSystemService()
        .readTextFile(this.params.file_path);
    } catch (err) {
      if (!isNodeError(err) || err.code !== 'ENOENT') {
        // If file exists but couldn't be read, we can't show a diff for confirmation.
        return false;
      }
      // File doesn't exist, originalContent remains empty
    }

    const relativePath = makeRelative(
      this.params.file_path,
      this.config.getTargetDir(),
    );
    const fileName = path.basename(this.params.file_path);

    const fileDiff = DiffLib.createPatch(
      fileName,
      originalContent,
      this.params.content,
      'Current',
      'Proposed',
      DEFAULT_DIFF_OPTIONS,
    );

    const confirmationDetails: any = {
      type: 'edit',
      title: `Confirm Write: ${shortenPath(relativePath)}`,
      fileName,
      filePath: this.params.file_path,
      fileDiff,
      originalContent,
      newContent: this.params.content,
      onConfirm: async (outcome: string) => {
        if (outcome === 'proceed_always') {
          this.config.updateConfig({ approvalMode: 'auto' });
        }
      },
    };
    return confirmationDetails;
  }

  async execute(_abortSignal: AbortSignal): Promise<ToolResult> {
    // Delegate to the utility function
    const result = await executeWriteFile(this.params, () => this.config.getFileSystemService());
    
    // Handle errors
    if (result.error) {
      return {
        llmContent: result.error.message,
        returnDisplay: `Error: ${result.error.message}`,
        error: {
          message: result.error.message,
          type: result.error.type,
        },
      };
    }
    
    // Format the success message
    const isNewFile = result.isNewFile || false;
    const llmSuccessMessageParts = [
      isNewFile
        ? `Successfully created and wrote to new file: ${this.params.file_path}.`
        : `Successfully overwrote file: ${this.params.file_path}.`,
    ];
    if (this.params.modified_by_user) {
      llmSuccessMessageParts.push(
        `User modified the \`content\` to be: ${this.params.content}`,
      );
    }
    
    // Create display result
    const fileName = path.basename(this.params.file_path);
    const displayResult = {
      fileDiff: result.diff || '',
      fileName: fileName,
      originalContent: result.originalContent || '',
      newContent: result.newContent || '',
      // Note: We're not calculating diffStat here as it would require additional logic
    };
    
    return {
      llmContent: llmSuccessMessageParts.join(' '),
      returnDisplay: displayResult,
    };
  }
}

/**
 * Implementation of the WriteFile tool logic
 */
export class WriteFileTool extends BaseDeclarativeTool<
  WriteFileToolParams,
  ToolResult
> {
  static readonly Name: string = 'write_file';

  constructor(private readonly config: ConfigManager) {
    super(
      WriteFileTool.Name,
      'WriteFile',
      `Writes content to a specified file in the local filesystem.

      The user has the ability to modify \`content\`. If modified, this will be stated in the response.`,
      Kind.Edit,
      {
        properties: {
          file_path: {
            description:
              "The absolute path to the file to write to (e.g., '/home/user/project/file.txt'). Relative paths are not supported.",
            type: 'string',
          },
          content: {
            description: 'The content to write to the file.',
            type: 'string',
          },
        },
        required: ['file_path', 'content'],
        type: 'object',
      },
    );
  }

  protected override validateToolParamValues(
    params: WriteFileToolParams,
  ): string | null {
    const filePath = params.file_path;

    if (!filePath) {
      return `Missing or empty "file_path"`;
    }

    if (!path.isAbsolute(filePath)) {
      return `File path must be absolute: ${filePath}`;
    }

    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.lstatSync(filePath);
        if (stats.isDirectory()) {
          return `Path is a directory, not a file: ${filePath}`;
        }
      }
    } catch (statError: unknown) {
      return `Error accessing path properties for validation: ${filePath}. Reason: ${statError instanceof Error ? statError.message : String(statError)
        }`;
    }

    return null;
  }

  protected createInvocation(
    params: WriteFileToolParams,
  ): ToolInvocation<WriteFileToolParams, ToolResult> {
    return new WriteFileToolInvocation(this.config, params);
  }
}