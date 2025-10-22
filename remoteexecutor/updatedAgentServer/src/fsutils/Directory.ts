import { logger } from '@/utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Import service classes
import {
  ListDirectory,
  createListDirectory,
  type ListDirectoryConfig,
  type ListDirectoryResult,
  type ListDirectoryParams,
} from './ListDirectory';

// Import configuration types
import type { WorkspaceContext } from '../types/serviceTypes';

/**
 * Configuration interface for Directory
 */
export interface DirectoryConfig {
  /** Target directory for operations */
  targetDir: string;
  
  /** Workspace context */
  workspaceContext: WorkspaceContext;
  
  /** File filtering options */
  fileFilteringOptions?: {
    respectGitIgnore?: boolean;
    respectGeminiIgnore?: boolean;
  };
  
  /** Debug mode */
  debugMode?: boolean;
}

/**
 * File entry interface for directory listings (alias from serviceTypes)
 */
export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

/**
 * Directory class providing standalone directory operation functions
 */
export class Directory {
  private static instances: Map<string, Directory> = new Map();
  private config: DirectoryConfig;
  
  // Service instances
  private listDirectory: ListDirectory;
  
  private constructor(config: DirectoryConfig) {
    this.config = config;
    
    // Initialize service instances
    this.listDirectory = createListDirectory({
      workspaceContext: config.workspaceContext
    });
  }

  public static getInstance(config: DirectoryConfig): Directory {
    const instanceKey = `${config.targetDir}-${config.workspaceContext.getDirectories().join(',')}`;
    
    if (!Directory.instances.has(instanceKey)) {
      Directory.instances.set(instanceKey, new Directory(config));
    }
    return Directory.instances.get(instanceKey)!;
  }

  /**
   * List files and directories within the specified directory
   */
  async listFiles(
    dirPath: string,
    recursive: boolean = false
  ): Promise<{
    success: boolean;
    files?: string[];
    error?: string;
  }> {
    try {
      const resolvedPath = path.resolve(this.config.targetDir, dirPath);
      
      // Validate that the path is within the target directory
      if (!resolvedPath.startsWith(path.resolve(this.config.targetDir))) {
        return {
          success: false,
          error: `Path "${dirPath}" is outside the allowed directory`,
        };
      }

      // Check if the directory exists
      if (!fs.existsSync(resolvedPath)) {
        return {
          success: false,
          error: `Directory does not exist: ${dirPath}`,
        };
      }

      // Check if it's actually a directory
      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: `Path is not a directory: ${dirPath}`,
        };
      }

      const files: string[] = [];

      const processDirectory = async (currentPath: string) => {
        const entries = fs.readdirSync(currentPath);

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const relativePath = path.relative(this.config.targetDir, fullPath);
          
          try {
            const entryStats = fs.statSync(fullPath);

            if (entryStats.isFile()) {
              files.push(relativePath);
            } else if (entryStats.isDirectory() && recursive) {
              await processDirectory(fullPath);
            }
          } catch (error) {
            // Skip files we can't access
            if (this.config.debugMode) {
              logger.warn(`Cannot access ${fullPath}: ${error}`);
            }
          }
        }
      };

      await processDirectory(resolvedPath);

      return {
        success: true,
        files: files.sort(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error listing files: ${errorMessage}`,
      };
    }
  }

  /**
   * Get detailed directory entries with metadata using ListDirectory
   */
  async listDirectory(
    dirPath: string,
    options?: {
      ignore?: string[];
      respectGitIgnore?: boolean;
    }
  ): Promise<{
    success: boolean;
    entries?: FileEntry[];
    error?: string;
  }> {
    const params: ListDirectoryParams = {
      path: dirPath,
      ignore: options?.ignore,
      respect_git_ignore: options?.respectGitIgnore,
    };

    // Validate parameters using ListDirectory
    const validationError = this.listDirectory.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use ListDirectory to list directory
    const result: ListDirectoryResult = await this.listDirectory.listDirectory(params);

    return {
      success: result.success,
      entries: result.entries,
      error: result.error,
    };
  }

  /**
   * Check if a path exists and is a directory
   */
  isDirectory(dirPath: string): boolean {
    try {
      const resolvedPath = path.resolve(this.config.targetDir, dirPath);
      const stats = fs.statSync(resolvedPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Create a directory if it doesn't exist
   */
  async ensureDirectory(dirPath: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const resolvedPath = path.resolve(this.config.targetDir, dirPath);
      
      // Validate that the path is within the target directory
      if (!resolvedPath.startsWith(path.resolve(this.config.targetDir))) {
        return {
          success: false,
          error: `Path "${dirPath}" is outside the allowed directory`,
        };
      }

      await fs.promises.mkdir(resolvedPath, { recursive: true });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error creating directory: ${errorMessage}`,
      };
    }
  }
}

/**
 * Create a default Directory instance using singleton pattern
 */
export function createDirectory(config: DirectoryConfig): Directory {
  return Directory.getInstance(config);
}

/**
 * Export all the core functions for standalone use
 */
export const directoryFunctions = {
  listFiles: (config: DirectoryConfig, dirPath: string, recursive?: boolean) =>
    Directory.getInstance(config).listFiles(dirPath, recursive),
  listDirectory: (config: DirectoryConfig, dirPath: string, options?: any) =>
    Directory.getInstance(config).listDirectory(dirPath, options),
  isDirectory: (config: DirectoryConfig, dirPath: string) =>
    Directory.getInstance(config).isDirectory(dirPath),
  ensureDirectory: (config: DirectoryConfig, dirPath: string) =>
    Directory.getInstance(config).ensureDirectory(dirPath),
};