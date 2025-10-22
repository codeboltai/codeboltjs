import { logger } from '@/utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Diff from 'diff';
import { getErrorMessage, isNodeError } from '../utils/errors';
import { DEFAULT_DIFF_OPTIONS, getDiffStat } from '../utils/diff';
import type { FileSystemService } from '../types/serviceTypes';

/**
 * Configuration interface for WriteFile
 */
export interface WriteFileConfig {
  /** File system service */
  fileSystemService: FileSystemService;
}

/**
 * Result interface for file writing operations
 */
export interface WriteFileResult {
  success: boolean;
  error?: string;
  originalContent?: string;
  newContent?: string;
  diff?: string;
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
 * Service for writing files with exact logic from WriteFileTool
 */
export class WriteFile {
  private config: WriteFileConfig;

  constructor(config: WriteFileConfig) {
    this.config = config;
  }

  /**
   * Write content to a file with exact logic from WriteFileTool
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: {
      ai_proposed_content?: string;
      modified_by_user?: boolean;
    }
  ): Promise<WriteFileResult> {
    let originalContent = '';
    let fileExists = false;

    try {
      originalContent = await this.config.fileSystemService.readTextFile(filePath);
      fileExists = true;
    } catch (err) {
      if (isNodeError(err) && err.code === 'ENOENT') {
        fileExists = false;
      } else {
        const errorMsg = `Error checking existing file '${filePath}': ${getErrorMessage(err)}`;
        return {
          success: false,
          error: errorMsg,
        };
      }
    }

    const isNewFile = !fileExists;

    try {
      const dirName = path.dirname(filePath);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      await this.config.fileSystemService.writeTextFile(filePath, content);

      // Generate diff for display result
      const fileName = path.basename(filePath);
      const fileDiff = Diff.createPatch(
        fileName,
        originalContent,
        content,
        'Original',
        'Written',
        DEFAULT_DIFF_OPTIONS,
      );

      const originallyProposedContent = options?.ai_proposed_content || content;
      const diffStat = getDiffStat(
        fileName,
        originalContent,
        originallyProposedContent,
        content,
      );

      return {
        success: true,
        originalContent,
        newContent: content,
        diff: fileDiff,
        isNewFile,
        diffStat,
      };
    } catch (error) {
      let errorMsg: string;
      let errorType = 'file_write_failure';

      if (isNodeError(error)) {
        errorMsg = `Error writing to file '${filePath}': ${error.message} (${error.code})`;

        if (error.code === 'EACCES') {
          errorMsg = `Permission denied writing to file: ${filePath} (${error.code})`;
          errorType = 'permission_denied';
        } else if (error.code === 'ENOSPC') {
          errorMsg = `No space left on device: ${filePath} (${error.code})`;
          errorType = 'no_space_left';
        } else if (error.code === 'EISDIR') {
          errorMsg = `Target is a directory, not a file: ${filePath} (${error.code})`;
          errorType = 'target_is_directory';
        }
      } else if (error instanceof Error) {
        errorMsg = `Error writing to file: ${error.message}`;
      } else {
        errorMsg = `Error writing to file: ${String(error)}`;
      }

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Validate file path parameters with exact logic from WriteFileTool
   */
  validateParams(filePath: string, content: string): string | null {
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
      return `Error accessing path properties for validation: ${filePath}. Reason: ${statError instanceof Error ? statError.message : String(statError)}`;
    }

    return null;
  }
}

/**
 * Create a WriteFile instance
 */
export function createWriteFile(config: WriteFileConfig): WriteFile {
  return new WriteFile(config);
}