/**
 * Write File Utility - Writes content to a specified file
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Diff from 'diff';

/**
 * Parameters for the WriteFile utility
 */
export interface WriteFileParams {
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

/**
 * Executes a file write operation with the provided parameters
 */
export async function executeWriteFile(
  params: WriteFileParams,
  getFileSystemService: () => any
): Promise<{ success: boolean; originalContent?: string; newContent?: string; diff?: string; isNewFile?: boolean; error?: any }> {
  const { file_path, content, ai_proposed_content, modified_by_user } = params;

  let originalContent = '';
  let fileExists = false;

  try {
    originalContent = await getFileSystemService().readTextFile(file_path);
    fileExists = true;
  } catch (err) {
    const nodeError = err as NodeJS.ErrnoException;
    if (nodeError && nodeError.code === 'ENOENT') {
      fileExists = false;
    } else {
      const errorMsg = `Error checking existing file '${file_path}': ${err instanceof Error ? err.message : String(err)}`;
      return {
        success: false,
        error: {
          message: errorMsg,
          type: 'file_write_failure',
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

    await getFileSystemService().writeTextFile(file_path, content);

    // Generate diff for display result
    const fileName = path.basename(file_path);
    const fileDiff = Diff.createPatch(
      fileName,
      originalContent,
      content,
      'Original',
      'Written',
      { context: 3 }
    );

    const originallyProposedContent = ai_proposed_content || content;
    
    // Create a simple diff stat (in a real implementation, this would be more detailed)
    const diffStat = {
      linesAdded: content.split('\n').length - originalContent.split('\n').length,
      linesRemoved: originalContent.split('\n').length - content.split('\n').length
    };

    return {
      success: true,
      originalContent: originalContent,
      newContent: content,
      diff: fileDiff,
      isNewFile: isNewFile,
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    let errorMsg: string;
    let errorType = 'file_write_failure';

    if (nodeError) {
      errorMsg = `Error writing to file '${file_path}': ${nodeError.message} (${nodeError.code})`;

      if (nodeError.code === 'EACCES') {
        errorMsg = `Permission denied writing to file: ${file_path} (${nodeError.code})`;
        errorType = 'permission_denied';
      } else if (nodeError.code === 'ENOSPC') {
        errorMsg = `No space left on device: ${file_path} (${nodeError.code})`;
        errorType = 'no_space_left';
      } else if (nodeError.code === 'EISDIR') {
        errorMsg = `Target is a directory, not a file: ${file_path} (${nodeError.code})`;
        errorType = 'target_is_directory';
      }
    } else if (error instanceof Error) {
      errorMsg = `Error writing to file: ${error.message}`;
    } else {
      errorMsg = `Error writing to file: ${String(error)}`;
    }

    return {
      success: false,
      error: {
        message: errorMsg,
        type: errorType,
      },
    };
  }
}