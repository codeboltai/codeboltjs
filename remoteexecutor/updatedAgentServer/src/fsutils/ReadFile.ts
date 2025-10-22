import { logger } from '@/utils/logger';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getErrorMessage, isNodeError } from '../utils/errors';
import type { FileSystemService } from '../types/serviceTypes';

/**
 * Configuration interface for ReadFile
 */
export interface ReadFileConfig {
  /** File system service */
  fileSystemService: FileSystemService;
}

/**
 * Result interface for file reading operations
 */
export interface ReadFileResult {
  success: boolean;
  content?: string;
  error?: string;
  isTruncated?: boolean;
  linesShown?: [number, number];
  originalLineCount?: number;
}

/**
 * Service for reading files with exact logic from ReadFileTool
 */
export class ReadFile {
  private config: ReadFileConfig;

  constructor(config: ReadFileConfig) {
    this.config = config;
  }

  /**
   * Read the content of a file with exact logic from ReadFileTool
   */
  async readFile(
    absolutePath: string,
    options?: {
      offset?: number;
      limit?: number;
    }
  ): Promise<ReadFileResult> {
    try {
      let content = await this.config.fileSystemService.readTextFile(absolutePath);

      let isTruncated = false;
      let linesShown: [number, number] | undefined;
      let originalLineCount: number | undefined;

      // Handle offset and limit
      if (options?.offset !== undefined || options?.limit !== undefined) {
        const lines = content.split('\n');
        originalLineCount = lines.length;

        const startLine = options.offset || 0;
        const endLine = options.limit
          ? Math.min(startLine + options.limit, lines.length)
          : lines.length;

        if (startLine >= lines.length) {
          return {
            success: false,
            error: `Offset ${startLine} is beyond the file length (${lines.length} lines)`,
          };
        }

        const selectedLines = lines.slice(startLine, endLine);
        content = selectedLines.join('\n');
        linesShown = [startLine + 1, endLine]; // 1-based for display
        isTruncated = endLine < lines.length;
      }

      return {
        success: true,
        content,
        isTruncated,
        linesShown,
        originalLineCount,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      let errorType = 'unknown';

      if (isNodeError(error)) {
        if (error.code === 'ENOENT') {
          errorType = 'file_not_found';
        } else if (error.code === 'EACCES') {
          errorType = 'permission_denied';
        }
      }

      return {
        success: false,
        error: `Error reading file: ${errorMessage}`,
      };
    }
  }

  /**
   * Validate file path parameters with exact logic from ReadFileTool
   */
  validateParams(absolutePath: string, offset?: number, limit?: number): string | null {
    if (absolutePath.trim() === '') {
      return "The 'absolute_path' parameter must be non-empty.";
    }

    if (!path.isAbsolute(absolutePath)) {
      return `File path must be absolute, but was relative: ${absolutePath}. You must provide an absolute path.`;
    }

    if (offset !== undefined && offset < 0) {
      return 'Offset must be a non-negative number';
    }

    if (limit !== undefined && limit <= 0) {
      return 'Limit must be a positive number';
    }

    return null;
  }
}

/**
 * Create a ReadFile instance
 */
export function createReadFile(config: ReadFileConfig): ReadFile {
  return new ReadFile(config);
}