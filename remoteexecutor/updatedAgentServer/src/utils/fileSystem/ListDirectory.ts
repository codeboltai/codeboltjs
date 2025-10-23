/**
 * List Directory Utility - Lists files and directories in a specified path
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Parameters for the LS utility
 */
export interface LSParams {
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
 * File entry returned by LS utility
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

/**
 * Checks if a filename matches any of the ignore patterns
 */
function shouldIgnore(filename: string, patterns?: string[]): boolean {
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

/**
 * Executes a directory listing with the provided parameters
 */
export function executeListDirectory(
  params: LSParams,
  targetDir: string,
  workspaceContext: any
): { entries?: FileEntry[]; error?: any } {
  try {
    // Validate path is absolute
    if (!path.isAbsolute(params.path)) {
      return {
        error: {
          message: `Path must be absolute: ${params.path}`,
          type: 'INVALID_PATH',
        },
      };
    }

    // Validate path is within workspace
    if (!workspaceContext.isPathWithinWorkspace(params.path)) {
      const directories = workspaceContext.getDirectories();
      return {
        error: {
          message: `Path must be within one of the workspace directories: ${directories.join(', ')}`,
          type: 'PATH_NOT_IN_WORKSPACE',
        },
      };
    }

    const stats = fs.statSync(params.path);
    if (!stats) {
      return {
        error: {
          message: `Error: Directory not found or inaccessible: ${params.path}`,
          type: 'file_not_found',
        },
      };
    }
    if (!stats.isDirectory()) {
      return {
        error: {
          message: `Error: Path is not a directory: ${params.path}`,
          type: 'path_is_not_a_directory',
        },
      };
    }

    const files = fs.readdirSync(params.path);

    const entries: FileEntry[] = [];

    if (files.length === 0) {
      return {
        entries: [],
      };
    }

    for (const file of files) {
      if (shouldIgnore(file, params.ignore)) {
        continue;
      }

      const fullPath = path.join(params.path, file);

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

    return {
      entries: entries,
    };
  } catch (error) {
    const errorMsg = `Error listing directory: ${error instanceof Error ? error.message : String(error)}`;
    return {
      error: {
        message: errorMsg,
        type: 'ls_execution_error',
      },
    };
  }
}