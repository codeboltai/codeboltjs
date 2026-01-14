/**
 * Read File Utility - Reads and returns the content of a specified file
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Parameters for the ReadFile utility
 */
export interface ReadFileParams {
  /**
   * The absolute path to the file to read
   */
  absolute_path: string;

  /**
   * The line number to start reading from (optional)
   */
  offset?: number;

  /**
   * The number of lines to read (optional)
   */
  limit?: number;
}

/**
 * Executes a file read operation with the provided parameters
 */
export async function executeReadFile(
  params: ReadFileParams
): Promise<{ content?: string; isTruncated?: boolean; linesShown?: [number, number]; originalLineCount?: number; error?: any }> {
  try {
    // Validate absolute path
    if (!path.isAbsolute(params.absolute_path)) {
      return {
        error: {
          message: `File path must be absolute, but was relative: ${params.absolute_path}. You must provide an absolute path.`,
          type: 'INVALID_PATH',
        },
      };
    }

    let content = await fs.promises.readFile(params.absolute_path, 'utf8');

    let isTruncated = false;
    let linesShown: [number, number] | undefined;
    let originalLineCount: number | undefined;

    // Handle offset and limit
    if (params.offset !== undefined || params.limit !== undefined) {
      const lines = content.split('\n');
      originalLineCount = lines.length;

      const startLine = params.offset || 0;
      const endLine = params.limit
        ? Math.min(startLine + params.limit, lines.length)
        : lines.length;

      if (startLine >= lines.length) {
        return {
          error: {
            message: `Offset ${startLine} is beyond file length`,
            type: 'invalid_tool_params',
          },
        };
      }

      const selectedLines = lines.slice(startLine, endLine);
      content = selectedLines.join('\n');
      linesShown = [startLine + 1, endLine]; // 1-based for display
      isTruncated = endLine < lines.length;
    }

    return {
      content: content,
      isTruncated: isTruncated,
      linesShown: linesShown,
      originalLineCount: originalLineCount,
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    let errorType = 'unknown';
    
    if (nodeError) {
      if (nodeError.code === 'ENOENT') {
        errorType = 'file_not_found';
      } else if (nodeError.code === 'EACCES') {
        errorType = 'permission_denied';
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      error: {
        message: errorMessage,
        type: errorType,
      },
    };
  }
}