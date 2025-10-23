/**
 * Write File Tool - Writes content to a specified file
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Diff from 'diff';
import type {
  ToolCallConfirmationDetails,
  ToolEditConfirmationDetails,
  ToolInvocation,
  ToolLocation,
  ToolResult,
  ToolErrorType,
  ToolConfirmationOutcome,
} from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import { makeRelative, shortenPath } from '../utils/paths';
import { getErrorMessage, isNodeError } from '../utils/errors';
import { DEFAULT_DIFF_OPTIONS, getDiffStat } from '../utils/diff';
import type { ConfigManager } from '../config';

/**
 * Parameters for the WriteFile tool
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
   * Whether the proposed content was modified by the user.
   */
  modified_by_user?: boolean;

  /**
   * Initially proposed content.
   */
  ai_proposed_content?: string;
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

  override toolLocations(): ToolLocation[] {
    return [{ path: this.params.file_path }];
  }

  getDescription(): string {
    const relativePath = makeRelative(
      this.params.file_path,
      this.config.getTargetDir(),
    );
    return `Writing to ${shortenPath(relativePath)}`;
  }

  override async shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    if (this.config.getApprovalMode() === 'auto') {
      return false;
    }

    // Read current content if file exists
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

    const fileDiff = Diff.createPatch(
      fileName,
      originalContent,
      this.params.content,
      'Current',
      'Proposed',
      DEFAULT_DIFF_OPTIONS,
    );

    const confirmationDetails: ToolEditConfirmationDetails = {
      type: 'edit',
      title: `Confirm Write: ${shortenPath(relativePath)}`,
      fileName,
      filePath: this.params.file_path,
      fileDiff,
      originalContent,
      newContent: this.params.content,
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        if (outcome === 'proceed_always') {
          this.config.updateConfig({ approvalMode: 'auto' });
        }
      },
    };
    return confirmationDetails;
  }

  async execute(_abortSignal: AbortSignal): Promise<ToolResult> {
    const { file_path, content, ai_proposed_content, modified_by_user } =
      this.params;

    let originalContent = '';
    let fileExists = false;

    try {
      originalContent = await this.config
        .getFileSystemService()
        .readTextFile(file_path);
      fileExists = true;
    } catch (err) {
      if (isNodeError(err) && err.code === 'ENOENT') {
        fileExists = false;
      } else {
        const errorMsg = `Error checking existing file '${file_path}': ${getErrorMessage(err)}`;
        return {
          llmContent: errorMsg,
          returnDisplay: errorMsg,
          error: {
            message: errorMsg,
            type: 'file_write_failure' as ToolErrorType,
          },
        };
      }
    }

    const isNewFile = !fileExists;

    try {
      const dirName = path.dirname(file_path);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      await this.config
        .getFileSystemService()
        .writeTextFile(file_path, content);

      // Generate diff for display result
      const fileName = path.basename(file_path);
      const fileDiff = Diff.createPatch(
        fileName,
        originalContent,
        content,
        'Original',
        'Written',
        DEFAULT_DIFF_OPTIONS,
      );

      const originallyProposedContent = ai_proposed_content || content;
      const diffStat = getDiffStat(
        fileName,
        originalContent,
        originallyProposedContent,
        content,
      );

      const llmSuccessMessageParts = [
        isNewFile
          ? `Successfully created and wrote to new file: ${file_path}.`
          : `Successfully overwrote file: ${file_path}.`,
      ];
      if (modified_by_user) {
        llmSuccessMessageParts.push(
          `User modified the \`content\` to be: ${content}`,
        );
      }

      const displayResult = {
        fileDiff,
        fileName,
        originalContent,
        newContent: content,
        diffStat,
      };

      return {
        llmContent: llmSuccessMessageParts.join(' '),
        returnDisplay: displayResult,
      };
    } catch (error) {
      let errorMsg: string;
      let errorType: ToolErrorType = 'file_write_failure' as ToolErrorType;

      if (isNodeError(error)) {
        errorMsg = `Error writing to file '${file_path}': ${error.message} (${error.code})`;

        if (error.code === 'EACCES') {
          errorMsg = `Permission denied writing to file: ${file_path} (${error.code})`;
          errorType = 'permission_denied' as ToolErrorType;
        } else if (error.code === 'ENOSPC') {
          errorMsg = `No space left on device: ${file_path} (${error.code})`;
          errorType = 'no_space_left' as ToolErrorType;
        } else if (error.code === 'EISDIR') {
          errorMsg = `Target is a directory, not a file: ${file_path} (${error.code})`;
          errorType = 'target_is_directory' as ToolErrorType;
        }
      } else if (error instanceof Error) {
        errorMsg = `Error writing to file: ${error.message}`;
      } else {
        errorMsg = `Error writing to file: ${String(error)}`;
      }

      return {
        llmContent: errorMsg,
        returnDisplay: errorMsg,
        error: {
          message: errorMsg,
          type: errorType,
        },
      };
    }
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

    // const workspaceContext = this.config.getWorkspaceContext();
    // if (!workspaceContext.isPathWithinWorkspace(filePath)) {
    //   const directories = workspaceContext.getDirectories();
    //   return `File path must be within one of the workspace directories: ${directories.join(
    //     ', ',
    //   )}`;
    // }

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