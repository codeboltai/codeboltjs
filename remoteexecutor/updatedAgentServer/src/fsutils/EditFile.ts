import { logger } from '@/utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Diff from 'diff';
import { getErrorMessage, isNodeError } from '../utils/errors';
import { DEFAULT_DIFF_OPTIONS, getDiffStat } from '../utils/diff';
import type { FileSystemService } from '../types/serviceTypes';

/**
 * Configuration interface for EditFile
 */
export interface EditFileConfig {
  /** File system service */
  fileSystemService: FileSystemService;
}

/**
 * Result interface for file editing operations
 */
export interface EditFileResult {
  success: boolean;
  content?: string;
  error?: string;
  diff?: string;
  originalContent?: string;
  newContent?: string;
  replacements?: number;
  isNewFile?: boolean;
  diffStat?: {
    model_added_lines: number;
    model_removed_lines: number;
    model_added_chars: number;
    model_removed_chars: number;
    user_added_lines: number;
    user_removed_lines: number;
    user_removed_chars: number;
  };
}

/**
 * Parameters for file editing operations
 */
export interface EditFileParams {
  file_path: string;
  old_string: string;
  new_string: string;
  expected_replacements?: number;
  modified_by_user?: boolean;
  ai_proposed_content?: string;
}

/**
 * Service for editing files with exact logic from EditTool
 */
export class EditFile {
  private config: EditFileConfig;

  constructor(config: EditFileConfig) {
    this.config = config;
  }

  /**
   * Helper function to apply text replacement
   */
  private applyReplacement(
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
    // Use a simple replace approach instead of replaceAll for compatibility
    return currentContent.split(oldString).join(newString);
  }

  /**
   * Edit a file with exact logic from EditTool
   */
  async editFile(params: EditFileParams): Promise<EditFileResult> {
    const expectedReplacements = params.expected_replacements ?? 1;
    let currentContent: string | null = null;
    let fileExists = false;
    let isNewFile = false;
    let occurrences = 0;
    let error:
      | { display: string; raw: string; type: string }
      | undefined = undefined;

    try {
      currentContent = await this.config.fileSystemService.readTextFile(params.file_path);
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
        type: 'file_not_found',
      };
    } else if (currentContent !== null) {
      // Count occurrences
      if (params.old_string === '') {
        error = {
          display: `Failed to edit. Attempted to create a file that already exists.`,
          raw: `File already exists, cannot create: ${params.file_path}`,
          type: 'attempt_to_create_existing_file',
        };
      } else {
        const normalizedSearch = params.old_string.replace(/\r\n/g, '\n');
        occurrences = currentContent.split(normalizedSearch).length - 1;

        if (occurrences === 0) {
          error = {
            display: `Failed to edit, could not find the string to replace.`,
            raw: `Failed to edit, 0 occurrences found for old_string in ${params.file_path}. No edits made. The exact text in old_string was not found.`,
            type: 'edit_no_occurrence_found',
          };
        } else if (occurrences !== expectedReplacements) {
          const occurrenceTerm = expectedReplacements === 1 ? 'occurrence' : 'occurrences';
          error = {
            display: `Failed to edit, expected ${expectedReplacements} ${occurrenceTerm} but found ${occurrences}.`,
            raw: `Failed to edit, Expected ${expectedReplacements} ${occurrenceTerm} but found ${occurrences} for old_string in file: ${params.file_path}`,
            type: 'edit_expected_occurrence_mismatch',
          };
        } else if (params.old_string === params.new_string) {
          error = {
            display: `No changes to apply. The old_string and new_string are identical.`,
            raw: `No changes to apply. The old_string and new_string are identical in file: ${params.file_path}`,
            type: 'edit_no_change',
          };
        }
      }
    } else {
      error = {
        display: `Failed to read content of file.`,
        raw: `Failed to read content of existing file: ${params.file_path}`,
        type: 'read_content_failure',
      };
    }

    const newContent = !error
      ? this.applyReplacement(
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
        type: 'edit_no_change',
      };
    }

    if (error) {
      return {
        success: false,
        error: error.display,
      };
    }

    try {
      const dirName = path.dirname(params.file_path);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      await this.config.fileSystemService.writeTextFile(params.file_path, newContent);

      const fileName = path.basename(params.file_path);
      const originallyProposedContent = params.ai_proposed_content || newContent;
      const diffStat = getDiffStat(
        fileName,
        currentContent ?? '',
        originallyProposedContent,
        newContent,
      );

      const fileDiff = Diff.createPatch(
        fileName,
        currentContent ?? '',
        newContent,
        'Current',
        'Proposed',
        DEFAULT_DIFF_OPTIONS,
      );

      return {
        success: true,
        content: newContent,
        diff: fileDiff,
        originalContent: currentContent ?? '',
        newContent,
        replacements: currentContent ? currentContent.split(params.old_string).length - 1 : 1,
        isNewFile,
        diffStat,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error executing edit: ${errorMsg}`,
      };
    }
  }

  /**
   * Validate file path parameters with exact logic from EditTool
   */
  validateParams(params: EditFileParams): string | null {
    if (!params.file_path) {
      return "The 'file_path' parameter must be non-empty.";
    }

    if (!path.isAbsolute(params.file_path)) {
      return `File path must be absolute: ${params.file_path}`;
    }

    return null;
  }
}

/**
 * Create an EditFile instance
 */
export function createEditFile(config: EditFileConfig): EditFile {
  return new EditFile(config);
}