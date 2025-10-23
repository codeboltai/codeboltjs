/**
 * Edit Tool - Replaces text within a file
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
import { isNodeError } from '../utils/errors';
import { DEFAULT_DIFF_OPTIONS, getDiffStat } from '../utils/diff';
import type { ConfigManager } from '../config';

export function applyReplacement(
  currentContent: string | null,
  oldString: string,
  newString: string,
  isNewFile: boolean,
): string {
  if (isNewFile) {
    return newString;
  }
  if (currentContent === null) {
    return oldString === '' ? newString : '';
  }
  if (oldString === '' && !isNewFile) {
    return currentContent;
  }
  return currentContent.replaceAll(oldString, newString);
}

/**
 * Parameters for the Edit tool
 */
export interface EditToolParams {
  /**
   * The absolute path to the file to modify
   */
  file_path: string;

  /**
   * The text to replace
   */
  old_string: string;

  /**
   * The text to replace it with
   */
  new_string: string;

  /**
   * Number of replacements expected. Defaults to 1 if not specified.
   */
  expected_replacements?: number;

  /**
   * Whether the edit was modified manually by the user.
   */
  modified_by_user?: boolean;

  /**
   * Initially proposed content.
   */
  ai_proposed_content?: string;
}

interface CalculatedEdit {
  currentContent: string | null;
  newContent: string;
  occurrences: number;
  error?: { display: string; raw: string; type: ToolErrorType };
  isNewFile: boolean;
}

class EditToolInvocation extends BaseToolInvocation<EditToolParams, ToolResult> {
  constructor(
    private readonly config: ConfigManager,
    public params: EditToolParams,
  ) {
    super(params);
  }

  toolLocations(): ToolLocation[] {
    return [{ path: this.params.file_path }];
  }

  private async calculateEdit(
    params: EditToolParams,
    _abortSignal: AbortSignal,
  ): Promise<CalculatedEdit> {
    const expectedReplacements = params.expected_replacements ?? 1;
    let currentContent: string | null = null;
    let fileExists = false;
    let isNewFile = false;
    let occurrences = 0;
    let error:
      | { display: string; raw: string; type: ToolErrorType }
      | undefined = undefined;

    try {
      currentContent = await this.config
        .getFileSystemService()
        .readTextFile(params.file_path);
      currentContent = currentContent.replace(/\r\n/g, '\n');
      fileExists = true;
    } catch (err: unknown) {
      if (!isNodeError(err) || err.code !== 'ENOENT') {
        throw err;
      }
      fileExists = false;
    }

    if (params.old_string === '' && !fileExists) {
      isNewFile = true;
      occurrences = 1;
    } else if (!fileExists) {
      error = {
        display: `File not found. Cannot apply edit. Use an empty old_string to create a new file.`,
        raw: `File not found: ${params.file_path}`,
        type: 'file_not_found' as ToolErrorType,
      };
    } else if (currentContent !== null) {
      // Count occurrences
      if (params.old_string === '') {
        error = {
          display: `Failed to edit. Attempted to create a file that already exists.`,
          raw: `File already exists, cannot create: ${params.file_path}`,
          type: 'attempt_to_create_existing_file' as ToolErrorType,
        };
      } else {
        const normalizedSearch = params.old_string.replace(/\r\n/g, '\n');
        occurrences = currentContent.split(normalizedSearch).length - 1;

        if (occurrences === 0) {
          error = {
            display: `Failed to edit, could not find the string to replace.`,
            raw: `Failed to edit, 0 occurrences found for old_string in ${params.file_path}. No edits made. The exact text in old_string was not found.`,
            type: 'edit_no_occurrence_found' as ToolErrorType,
          };
        } else if (occurrences !== expectedReplacements) {
          const occurrenceTerm = expectedReplacements === 1 ? 'occurrence' : 'occurrences';
          error = {
            display: `Failed to edit, expected ${expectedReplacements} ${occurrenceTerm} but found ${occurrences}.`,
            raw: `Failed to edit, Expected ${expectedReplacements} ${occurrenceTerm} but found ${occurrences} for old_string in file: ${params.file_path}`,
            type: 'edit_expected_occurrence_mismatch' as ToolErrorType,
          };
        } else if (params.old_string === params.new_string) {
          error = {
            display: `No changes to apply. The old_string and new_string are identical.`,
            raw: `No changes to apply. The old_string and new_string are identical in file: ${params.file_path}`,
            type: 'edit_no_change' as ToolErrorType,
          };
        }
      }
    } else {
      error = {
        display: `Failed to read content of file.`,
        raw: `Failed to read content of existing file: ${params.file_path}`,
        type: 'read_content_failure' as ToolErrorType,
      };
    }

    const newContent = !error
      ? applyReplacement(
        currentContent,
        params.old_string,
        params.new_string,
        isNewFile,
      )
      : (currentContent ?? '');

    if (!error && fileExists && currentContent === newContent) {
      error = {
        display: 'No changes to apply. The new content is identical to the current content.',
        raw: `No changes to apply. The new content is identical to the current content in file: ${params.file_path}`,
        type: 'edit_no_change' as ToolErrorType,
      };
    }

    const result: CalculatedEdit = {
      currentContent,
      newContent,
      occurrences,
      isNewFile,
    };
    if (error) {
      result.error = error;
    }
    return result;
  }

  async shouldConfirmExecute(
    abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    if (this.config.getApprovalMode() === 'auto') {
      return false;
    }

    let editData: CalculatedEdit;
    try {
      editData = await this.calculateEdit(this.params, abortSignal);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`Error preparing edit: ${errorMsg}`);
      return false;
    }

    if (editData.error) {
      console.log(`Error: ${editData.error.display}`);
      return false;
    }

    const fileName = path.basename(this.params.file_path);
    const fileDiff = Diff.createPatch(
      fileName,
      editData.currentContent ?? '',
      editData.newContent,
      'Current',
      'Proposed',
      DEFAULT_DIFF_OPTIONS,
    );

    const confirmationDetails: ToolEditConfirmationDetails = {
      type: 'edit',
      title: `Confirm Edit: ${shortenPath(makeRelative(this.params.file_path, this.config.getTargetDir()))}`,
      fileName,
      filePath: this.params.file_path,
      fileDiff,
      originalContent: editData.currentContent,
      newContent: editData.newContent,
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        if (outcome === 'proceed_always') {
          this.config.updateConfig({ approvalMode: 'auto' });
        }
      },
    };
    return confirmationDetails;
  }

  getDescription(): string {
    const relativePath = makeRelative(
      this.params.file_path,
      this.config.getTargetDir(),
    );
    if (this.params.old_string === '') {
      return `Create ${shortenPath(relativePath)}`;
    }

    const oldStringSnippet =
      (this.params.old_string.split('\n')[0] || '').substring(0, 30) +
      (this.params.old_string.length > 30 ? '...' : '');
    const newStringSnippet =
      (this.params.new_string.split('\n')[0] || '').substring(0, 30) +
      (this.params.new_string.length > 30 ? '...' : '');

    if (this.params.old_string === this.params.new_string) {
      return `No file changes to ${shortenPath(relativePath)}`;
    }
    return `${shortenPath(relativePath)}: ${oldStringSnippet} => ${newStringSnippet}`;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    let editData: CalculatedEdit;
    try {
      editData = await this.calculateEdit(this.params, signal);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Error preparing edit: ${errorMsg}`,
        returnDisplay: `Error preparing edit: ${errorMsg}`,
        error: {
          message: errorMsg,
          type: 'edit_preparation_failure' as ToolErrorType,
        },
      };
    }

    if (editData.error) {
      return {
        llmContent: editData.error.raw,
        returnDisplay: `Error: ${editData.error.display}`,
        error: {
          message: editData.error.raw,
          type: editData.error.type,
        },
      };
    }

    try {
      const dirName = path.dirname(this.params.file_path);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      await this.config
        .getFileSystemService()
        .writeTextFile(this.params.file_path, editData.newContent);

      const fileName = path.basename(this.params.file_path);
      const originallyProposedContent =
        this.params.ai_proposed_content || editData.newContent;
      const diffStat = getDiffStat(
        fileName,
        editData.currentContent ?? '',
        originallyProposedContent,
        editData.newContent,
      );

      const fileDiff = Diff.createPatch(
        fileName,
        editData.currentContent ?? '',
        editData.newContent,
        'Current',
        'Proposed',
        DEFAULT_DIFF_OPTIONS,
      );

      const displayResult = {
        fileDiff,
        fileName,
        originalContent: editData.currentContent,
        newContent: editData.newContent,
        diffStat,
      };

      const llmSuccessMessageParts = [
        editData.isNewFile
          ? `Created new file: ${this.params.file_path} with provided content.`
          : `Successfully modified file: ${this.params.file_path} (${editData.occurrences} replacements).`,
      ];
      if (this.params.modified_by_user) {
        llmSuccessMessageParts.push(
          `User modified the \`new_string\` content to be: ${this.params.new_string}.`,
        );
      }

      return {
        llmContent: llmSuccessMessageParts.join(' '),
        returnDisplay: displayResult,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Error executing edit: ${errorMsg}`,
        returnDisplay: `Error writing file: ${errorMsg}`,
        error: {
          message: errorMsg,
          type: 'file_write_failure' as ToolErrorType,
        },
      };
    }
  }
}

/**
 * Implementation of the Edit tool logic
 */
export class EditTool extends BaseDeclarativeTool<EditToolParams, ToolResult> {
  static readonly Name = 'replace';

  constructor(private readonly config: ConfigManager) {
    super(
      EditTool.Name,
      'Edit',
      `Replaces text within a file. By default, replaces a single occurrence, but can replace multiple occurrences when \`expected_replacements\` is specified. This tool requires providing significant context around the change to ensure precise targeting.

      The user has the ability to modify the \`new_string\` content. If modified, this will be stated in the response.

Expectation for required parameters:
1. \`file_path\` MUST be an absolute path; otherwise an error will be thrown.
2. \`old_string\` MUST be the exact literal text to replace (including all whitespace, indentation, newlines, and surrounding code etc.).
3. \`new_string\` MUST be the exact literal text to replace \`old_string\` with (also including all whitespace, indentation, newlines, and surrounding code etc.). Ensure the resulting code is correct and idiomatic.
4. NEVER escape \`old_string\` or \`new_string\`, that would break the exact literal text requirement.
**Important:** If ANY of the above are not satisfied, the tool will fail. CRITICAL for \`old_string\`: Must uniquely identify the single instance to change. Include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely.
**Multiple replacements:** Set \`expected_replacements\` to the number of occurrences you want to replace.`,
      Kind.Edit,
      {
        properties: {
          file_path: {
            description:
              "The absolute path to the file to modify. Must start with '/'.",
            type: 'string',
          },
          old_string: {
            description:
              'The exact literal text to replace, preferably unescaped. For single replacements (default), include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. For multiple replacements, specify expected_replacements parameter.',
            type: 'string',
          },
          new_string: {
            description:
              'The exact literal text to replace `old_string` with, preferably unescaped. Provide the EXACT text. Ensure the resulting code is correct and idiomatic.',
            type: 'string',
          },
          expected_replacements: {
            type: 'number',
            description:
              'Number of replacements expected. Defaults to 1 if not specified. Use when you want to replace multiple occurrences.',
            minimum: 1,
          },
        },
        required: ['file_path', 'old_string', 'new_string'],
        type: 'object',
      },
    );
  }

  protected override validateToolParamValues(
    params: EditToolParams,
  ): string | null {
    if (!params.file_path) {
      return "The 'file_path' parameter must be non-empty.";
    }

    if (!path.isAbsolute(params.file_path)) {
      return `File path must be absolute: ${params.file_path}`;
    }

    // const workspaceContext = this.config.getWorkspaceContext();
    // if (!workspaceContext.isPathWithinWorkspace(params.file_path)) {
    //   const directories = workspaceContext.getDirectories();
    //   return `File path must be within one of the workspace directories: ${directories.join(', ')}`;
    // }

    return null;
  }

  protected createInvocation(
    params: EditToolParams,
  ): ToolInvocation<EditToolParams, ToolResult> {
    return new EditToolInvocation(this.config, params);
  }
}