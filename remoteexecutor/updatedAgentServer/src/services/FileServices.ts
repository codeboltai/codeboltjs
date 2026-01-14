/**
 * FileServices Module
 * 
 * This module provides file system operations using only utilities from @fileSystem/
 * - ReadFile: Read file contents with optional line limits
 * - WriteFile: Write content to files with diff generation
 * - ListDirectory: List directory contents with filtering
 */

import { logger } from '@/main/utils/logger';
import { getErrorMessage } from '../utils/errors';

// Import configuration types
import type { WorkspaceContext, FileSystemService } from '../types/serviceTypes';

// Import utility functions from fileSystem utils only
import { executeReadFile, type ReadFileParams } from '../utils/fileSystem/ReadFile';
import { executeWriteFile, type WriteFileParams } from '../utils/fileSystem/WriteFile';
import { executeListDirectory, type LSParams, type FileEntry as UtilityFileEntry } from '../utils/fileSystem/ListDirectory';

/**
 * Configuration interface for FileServices
 */
export interface FileServicesConfig {
  /** Target directory for operations */
  targetDir: string;

  /** Workspace context */
  workspaceContext: WorkspaceContext;

  /** File system service */
  fileSystemService: FileSystemService;

  /** File filtering options */
  fileFilteringOptions?: {
    respectGitIgnore?: boolean;
    respectGeminiIgnore?: boolean;
  };

  /** Whether to use approval mode */
  approvalMode?: 'auto' | 'manual';

  /** Debug mode */
  debugMode?: boolean;
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
 * File Services class providing standalone file operation functions
 */
export class FileServices {
    private static instances: Map<string, FileServices> = new Map();
    private config: FileServicesConfig;
    
    // No instance references needed as we'll use utility functions directly

    private constructor(config: FileServicesConfig) {
        this.config = config;
    }

    public static getInstance(config: FileServicesConfig): FileServices {
        const instanceKey = `${config.targetDir}-${config.workspaceContext.getDirectories().join(',')}`;
        
        if (!FileServices.instances.has(instanceKey)) {
            FileServices.instances.set(instanceKey, new FileServices(config));
        }
        return FileServices.instances.get(instanceKey)!;
    }

  /**
   * Read the content of a file using ReadFile utility
   */
  async readFile(
    filePath: string,
    options?: {
      offset?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    isTruncated?: boolean;
    linesShown?: [number, number];
    originalLineCount?: number;
  }> {
    try {
      // Use ReadFile utility to read the file
      const params: ReadFileParams = {
        absolute_path: filePath,
        offset: options?.offset,
        limit: options?.limit
      };
      
      const result = await executeReadFile(params);
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      return {
        success: true,
        content: result.content,
        isTruncated: result.isTruncated,
        linesShown: result.linesShown,
        originalLineCount: result.originalLineCount,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error reading file: ${errorMessage}`,
      };
    }
  }

  /**
   * Write content to a file using WriteFile utility
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: {
      createDirectories?: boolean;
    }
  ): Promise<{
    success: boolean;
    error?: string;
    originalContent?: string;
    newContent?: string;
    diff?: string;
    isNewFile?: boolean;
  }> {
    try {
      // Use WriteFile utility to write the file
      const params: WriteFileParams = {
        file_path: filePath,
        content: content,
        ai_proposed_content: content,
        modified_by_user: false
      };
      
      const result = await executeWriteFile(params, () => this.config.fileSystemService);
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      return {
        success: true,
        originalContent: result.originalContent,
        newContent: result.newContent,
        diff: result.diff,
        isNewFile: result.isNewFile,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error writing file: ${errorMessage}`,
      };
    }
  }


  /**
   * Replace text within a file (placeholder implementation)
   */
  async replaceInFile(
    filePath: string,
    oldString: string,
    newString: string,
    expectedReplacements?: number
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    diff?: string;
    originalContent?: string;
    newContent?: string;
    replacements?: number;
    isNewFile?: boolean;
  }> {
    // This is a placeholder implementation
    // In a real implementation, you would use the WriteFile utility with content replacement
    try {
      // Read the file first
      const readResult = await this.readFile(filePath);
      if (!readResult.success) {
        return {
          success: false,
          error: readResult.error,
        };
      }

      const originalContent = readResult.content || '';
      const newContent = originalContent.split(oldString).join(newString);
      
      // Write the modified content back
      const writeResult = await this.writeFile(filePath, newContent);
      if (!writeResult.success) {
        return {
          success: false,
          error: writeResult.error,
        };
      }
      
      return {
        success: true,
        originalContent: originalContent,
        newContent: newContent,
        diff: writeResult.diff,
        replacements: (originalContent.match(new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      };
    } catch (error) {
      return {
        success: false,
        error: `Error replacing in file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Read multiple files using ReadFile utility
   */
  async readManyFiles(
    paths: string[],
    options?: {
      include?: string[];
      exclude?: string[];
      useDefaultExcludes?: boolean;
    }
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    processedFiles?: string[];
    skippedFiles?: Array<{ path: string; reason: string }>;
  }> {
    try {
      const processedFiles: string[] = [];
      const skippedFiles: Array<{ path: string; reason: string }> = [];
      let content = '';
      
      for (const filePath of paths) {
        try {
          const readResult = await this.readFile(filePath);
          if (readResult.success && readResult.content) {
            content += `\n--- ${filePath} ---\n${readResult.content}\n`;
            processedFiles.push(filePath);
          } else {
            skippedFiles.push({
              path: filePath,
              reason: readResult.error || 'Failed to read file'
            });
          }
        } catch (error) {
          skippedFiles.push({
            path: filePath,
            reason: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      return {
        success: true,
        content: content,
        processedFiles: processedFiles,
        skippedFiles: skippedFiles
      };
    } catch (error) {
      return {
        success: false,
        error: `Error reading multiple files: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * List directory contents using ListDirectory utility
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
    try {
      // Use ListDirectory utility to list directory
      const params: LSParams = {
        path: dirPath,
        ignore: options?.ignore,
        respect_git_ignore: options?.respectGitIgnore,
      };
      
      const result = executeListDirectory(params, this.config.targetDir, this.config.workspaceContext);
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      // Convert FileEntry[] to the expected format
      const entries: FileEntry[] = (result.entries || []).map(entry => ({
        name: entry.name,
        path: entry.path,
        isDirectory: entry.isDirectory,
        size: entry.size,
        modifiedTime: entry.modifiedTime,
      }));
      
      return {
        success: true,
        entries: entries,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error listing directory: ${errorMessage}`,
      };
    }
  }

}

/**
 * Create a default FileServices instance using singleton pattern
 */
export function createFileServices(config: FileServicesConfig): FileServices {
  return FileServices.getInstance(config);
}

/**
 * Export all the core functions for standalone use
 */
export const fileServiceFunctions = {
  readFile: (config: FileServicesConfig, filePath: string, options?: any) => 
    FileServices.getInstance(config).readFile(filePath, options),
  writeFile: (config: FileServicesConfig, filePath: string, content: string, options?: any) =>
    FileServices.getInstance(config).writeFile(filePath, content, options),
  replaceInFile: (config: FileServicesConfig, filePath: string, oldString: string, newString: string, expectedReplacements?: number) =>
    FileServices.getInstance(config).replaceInFile(filePath, oldString, newString, expectedReplacements),
  readManyFiles: (config: FileServicesConfig, paths: string[], options?: any) =>
    FileServices.getInstance(config).readManyFiles(paths, options),
  listDirectory: (config: FileServicesConfig, dirPath: string, options?: any) =>
    FileServices.getInstance(config).listDirectory(dirPath, options),
};