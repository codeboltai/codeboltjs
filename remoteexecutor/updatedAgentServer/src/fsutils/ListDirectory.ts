import { logger } from '../utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getErrorMessage } from '../utils/errors';
import type { WorkspaceContext } from '../types/serviceTypes';

/**
 * Configuration interface for ListDirectory
 */
export interface ListDirectoryConfig {
  /** Workspace context */
  workspaceContext: WorkspaceContext;
}

/**
 * File entry interface for directory listings
 */
export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

/**
 * Result interface for directory listing
 */
export interface ListDirectoryResult {
  success: boolean;
  entries?: FileEntry[];
  error?: string;
}

/**
 * Parameters for directory listing
 */
export interface ListDirectoryParams {
  path: string;
  ignore?: string[];
  respect_git_ignore?: boolean;
}

/**
 * Service for listing directories with exact logic from LSTool
 */
export class ListDirectory {
  private config: ListDirectoryConfig;

  constructor(config: ListDirectoryConfig) {
    this.config = config;
  }

  /**
   * Checks if a filename matches any of the ignore patterns
   */
  private shouldIgnore(filename: string, patterns?: string[]): boolean {
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
   * List directory contents with exact logic from LSTool
   */
  async listDirectory(params: ListDirectoryParams): Promise<ListDirectoryResult> {
    try {
      const stats = fs.statSync(params.path);
      if (!stats) {
        return {
          success: false,
          error: `Error: Directory not found or inaccessible: ${params.path}`,
        };
      }
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: `Error: Path is not a directory: ${params.path}`,
        };
      }

      const files = fs.readdirSync(params.path);

      const entries: FileEntry[] = [];

      if (files.length === 0) {
        return {
          success: true,
          entries: [],
        };
      }

      for (const file of files) {
        if (this.shouldIgnore(file, params.ignore)) {
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
        success: true,
        entries,
      };
    } catch (error) {
      const errorMsg = `Error listing directory: ${error instanceof Error ? error.message : String(error)}`;
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Validate parameters for directory listing
   */
  validateParams(params: ListDirectoryParams): string | null {
    if (!path.isAbsolute(params.path)) {
      return `Path must be absolute: ${params.path}`;
    }

    if (!this.config.workspaceContext.isPathWithinWorkspace(params.path)) {
      const directories = this.config.workspaceContext.getDirectories();
      return `Path must be within one of the workspace directories: ${directories.join(', ')}`;
    }

    return null;
  }
}

/**
 * Create a ListDirectory instance
 */
export function createListDirectory(config: ListDirectoryConfig): ListDirectory {
  return new ListDirectory(config);
}