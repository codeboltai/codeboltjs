import { logger } from '@/utils/logger';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import * as Diff from 'diff';
import { glob, escape } from 'glob';
import { EOL } from 'node:os';
import { spawn } from 'node:child_process';

// Import utility functions from local utils
import { makeRelative, shortenPath } from '../utils/paths';
import { getErrorMessage, isNodeError } from '../utils/errors';
import { DEFAULT_DIFF_OPTIONS, getDiffStat } from '../utils/diff';
import { ToolErrorType } from '../types/serviceTypes';

// Import configuration types
import type { WorkspaceContext, FileSystemService } from '../types/serviceTypes';

// Import new service classes
import {
  ReadFile,
  createReadFile,
  type ReadFileConfig,
  type ReadFileResult,
} from '../fsutils/ReadFile';
import {
  WriteFile,
  createWriteFile,
  type WriteFileConfig,
  type WriteFileResult,
} from '../fsutils/WriteFile';
import {
  EditFile,
  createEditFile,
  type EditFileConfig,
  type EditFileResult,
  type EditFileParams,
} from '../fsutils/EditFile';
import {
  ReadManyFiles,
  createReadManyFiles,
  type ReadManyFilesConfig,
  type ReadManyFilesResult,
  type ReadManyFilesParams,
} from '../fsutils/ReadManyFiles';
import {
  ListDirectory,
  createListDirectory,
  type ListDirectoryConfig,
  type ListDirectoryResult,
  type ListDirectoryParams,
} from '../fsutils/ListDirectory';
import {
  SearchFileContent,
  createSearchFileContent,
  type SearchFileContentConfig,
  type SearchFileContentResult,
  type SearchFileContentParams,
} from '../fsutils/SearchFileContent';
import {
  GlobSearch,
  createGlobSearch,
  type GlobSearchConfig,
  type GlobSearchResult,
  type GlobSearchParams,
} from '../fsutils/GlobSearch';

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
 * Grep match result interface
 */
export interface GrepMatch {
  filePath: string;
  lineNumber: number;
  line: string;
}

// Import FileFilteringOptions from serviceTypes
import type { FileFilteringOptions } from '../types/serviceTypes';

/**
 * Default file filtering options
 */
export const DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: true,
  respectGeminiIgnore: true,
};

/**
 * File Services class providing standalone file operation functions
 */
export class FileServices {
    private static instances: Map<string, FileServices> = new Map();
    private config: FileServicesConfig;
    
    // Instance references
    private readFileService: ReadFile;
    private writeFileService: WriteFile;
    private editFileService: EditFile;
    private readManyFilesService: ReadManyFiles;
    private listDirectoryService: ListDirectory;
    private searchFileContentService: SearchFileContent;
    private globSearchService: GlobSearch;

    private constructor(config: FileServicesConfig) {
        this.config = config;
        
        // Initialize instances
        this.readFileService = createReadFile({
            fileSystemService: config.fileSystemService
        });
        
        this.writeFileService = createWriteFile({
            fileSystemService: config.fileSystemService
        });
        
        this.editFileService = createEditFile({
            fileSystemService: config.fileSystemService
        });
        
        this.readManyFilesService = createReadManyFiles({
            fileSystemService: config.fileSystemService
        });
        
        this.listDirectoryService = createListDirectory({
            workspaceContext: config.workspaceContext
        });
        
        this.searchFileContentService = createSearchFileContent({
            workspaceContext: config.workspaceContext
        });
        
        this.globSearchService = createGlobSearch({
            workspaceContext: config.workspaceContext
        });
    }

    public static getInstance(config: FileServicesConfig): FileServices {
        const instanceKey = `${config.targetDir}-${config.workspaceContext.getDirectories().join(',')}`;
        
        if (!FileServices.instances.has(instanceKey)) {
            FileServices.instances.set(instanceKey, new FileServices(config));
        }
        return FileServices.instances.get(instanceKey)!;
    }

  /**
   * Read the content of a file using ReadFile
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
    // Validate parameters using ReadFile
    const validationError = this.readFileService.validateParams(filePath, options?.offset, options?.limit);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use ReadFile to read the file
    const result: ReadFileResult = await this.readFileService.readFile(filePath, options);
    
    return {
      success: result.success,
      content: result.content,
      error: result.error,
      isTruncated: result.isTruncated,
      linesShown: result.linesShown,
      originalLineCount: result.originalLineCount,
    };
  }

  /**
   * Write content to a file using WriteFile
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
    // Validate parameters using WriteFile
    const validationError = this.writeFileService.validateParams(filePath, content);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use WriteFile to write the file
    const result: WriteFileResult = await this.writeFileService.writeFile(filePath, content, {
      ai_proposed_content: content,
      modified_by_user: false,
    });

    return {
      success: result.success,
      error: result.error,
      originalContent: result.originalContent,
      newContent: result.newContent,
      diff: result.diff,
      isNewFile: result.isNewFile,
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await fs.promises.unlink(filePath);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error deleting file: ${errorMessage}`,
      };
    }
  }

  /**
   * Replace text within a file using EditFile
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
    const params: EditFileParams = {
      file_path: filePath,
      old_string: oldString,
      new_string: newString,
      expected_replacements: expectedReplacements,
      modified_by_user: false,
      ai_proposed_content: newString,
    };

    // Validate parameters using EditFile
    const validationError = this.editFileService.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use EditFile to edit the file
    const result: EditFileResult = await this.editFileService.editFile(params);

    return {
      success: result.success,
      content: result.content,
      error: result.error,
      diff: result.diff,
      originalContent: result.originalContent,
      newContent: result.newContent,
      replacements: result.replacements,
      isNewFile: result.isNewFile,
    };
  }

  /**
   * Read multiple files using ReadManyFiles
   */
  async readManyFiles(
    paths: string[],
    options?: {
      include?: string[];
      exclude?: string[];
      useDefaultExcludes?: boolean;
      fileFilteringOptions?: FileFilteringOptions;
    }
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    processedFiles?: string[];
    skippedFiles?: Array<{ path: string; reason: string }>;
  }> {
    const params: ReadManyFilesParams = {
      paths,
      include: options?.include,
      exclude: options?.exclude,
      recursive: true,
      useDefaultExcludes: options?.useDefaultExcludes,
      file_filtering_options: options?.fileFilteringOptions ? {
        respect_git_ignore: options.fileFilteringOptions.respectGitIgnore,
        respect_gemini_ignore: options.fileFilteringOptions.respectGeminiIgnore,
      } : undefined,
    };

    // Validate parameters using ReadManyFiles
    const validationError = this.readManyFilesService.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use ReadManyFiles to read multiple files
    const result: ReadManyFilesResult = await this.readManyFilesService.readManyFiles(params);

    return {
      success: result.success,
      content: result.content,
      error: result.error,
      processedFiles: result.processedFiles,
      skippedFiles: result.skippedFiles,
    };
  }

  /**
   * List directory contents using ListDirectory
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
    const validationError = this.listDirectoryService.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use ListDirectory to list directory
    const result: ListDirectoryResult = await this.listDirectoryService.listDirectory(params);

    return {
      success: result.success,
      entries: result.entries,
      error: result.error,
    };
  }

  /**
   * Search for content within files using SearchFileContent
   */
  async searchFileContent(
    pattern: string,
    searchPath?: string,
    options?: {
      include?: string;
    }
  ): Promise<{
    success: boolean;
    matches?: GrepMatch[];
    error?: string;
  }> {
    const params: SearchFileContentParams = {
      pattern,
      path: searchPath,
      include: options?.include,
    };

    // Validate parameters using SearchFileContent
    const validationError = this.searchFileContentService.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use SearchFileContent to search file content
    const result: SearchFileContentResult = await this.searchFileContentService.searchFileContent(params);

    return {
      success: result.success,
      matches: result.matches,
      error: result.error,
    };
  }

  /**
   * Search for files using glob patterns using GlobSearch
   */
  async globSearch(
    pattern: string,
    searchPath?: string,
    options?: {
      caseSensitive?: boolean;
      respectGitIgnore?: boolean;
      respectGeminiIgnore?: boolean;
    }
  ): Promise<{
    success: boolean;
    files?: string[];
    error?: string;
    gitIgnoredCount?: number;
    geminiIgnoredCount?: number;
  }> {
    const params: GlobSearchParams = {
      pattern,
      path: searchPath,
      case_sensitive: options?.caseSensitive,
      respect_git_ignore: options?.respectGitIgnore,
      respect_gemini_ignore: options?.respectGeminiIgnore,
    };

    // Validate parameters using GlobSearch
    const validationError = this.globSearchService.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use GlobSearch to search for files
    const result: GlobSearchResult = await this.globSearchService.globSearch(params);

    return {
      success: result.success,
      files: result.files,
      error: result.error,
      gitIgnoredCount: result.gitIgnoredCount,
      geminiIgnoredCount: result.geminiIgnoredCount,
    };
  }

  /**
   * List files recursively
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
      const files: string[] = [];

      const processDirectory = async (currentPath: string) => {
        const entries = fs.readdirSync(currentPath);

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const stats = fs.statSync(fullPath);

          if (stats.isFile()) {
            files.push(fullPath);
          } else if (stats.isDirectory() && recursive) {
            await processDirectory(fullPath);
          }
        }
      };

      await processDirectory(dirPath);

      return {
        success: true,
        files: files.sort(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error listing files: ${errorMessage}`,
      };
    }
  }

  /**
   * Helper method to perform grep search
   */
  private async performGrepSearch(options: {
    pattern: string;
    path: string;
    include?: string;
    signal: AbortSignal;
  }): Promise<GrepMatch[]> {
    const { pattern, path: absolutePath, include } = options;

    try {
      // Try git grep first
      const isGit = isGitRepository(absolutePath);
      const gitAvailable = isGit && (await this.isCommandAvailable('git'));

      if (gitAvailable) {
        try {
          const gitArgs = [
            'grep',
            '--untracked',
            '-n',
            '-E',
            '--ignore-case',
            pattern,
          ];
          if (include) {
            gitArgs.push('--', include);
          }

          const output = await new Promise<string>((resolve, reject) => {
            const child = spawn('git', gitArgs, {
              cwd: absolutePath,
              windowsHide: true,
            });
            const stdoutChunks: Buffer[] = [];
            const stderrChunks: Buffer[] = [];

            child.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
            child.stderr.on('data', (chunk) => stderrChunks.push(chunk));
            child.on('error', (err) =>
              reject(new Error(`Failed to start git grep: ${err.message}`)),
            );
            child.on('close', (code) => {
              const stdoutData = Buffer.concat(stdoutChunks).toString('utf8');
              const stderrData = Buffer.concat(stderrChunks).toString('utf8');
              if (code === 0) resolve(stdoutData);
              else if (code === 1) resolve('');
              else reject(new Error(`git grep exited with code ${code}: ${stderrData}`));
            });
          });
          return this.parseGrepOutput(output, absolutePath);
        } catch (gitError) {
          console.debug(`Git grep failed: ${getErrorMessage(gitError)}. Falling back...`);
        }
      }

      // Try system grep
      const grepAvailable = await this.isCommandAvailable('grep');
      if (grepAvailable) {
        try {
          const grepArgs = ['-r', '-n', '-H', '-E'];
          
          // Add exclude directories
          const commonExcludes = ['node_modules', '.git', 'dist', 'build', 'coverage'];
          commonExcludes.forEach((dir) => grepArgs.push(`--exclude-dir=${dir}`));
          
          if (include) {
            grepArgs.push(`--include=${include}`);
          }
          grepArgs.push(pattern, '.');

          const output = await new Promise<string>((resolve, reject) => {
            const child = spawn('grep', grepArgs, {
              cwd: absolutePath,
              windowsHide: true,
            });
            const stdoutChunks: Buffer[] = [];
            const stderrChunks: Buffer[] = [];

            child.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
            child.stderr.on('data', (chunk) => {
              const stderrStr = chunk.toString();
              if (!stderrStr.includes('Permission denied') && !/grep:.*: Is a directory/i.test(stderrStr)) {
                stderrChunks.push(chunk);
              }
            });
            child.on('error', (err) =>
              reject(new Error(`Failed to start system grep: ${err.message}`)),
            );
            child.on('close', (code) => {
              const stdoutData = Buffer.concat(stdoutChunks).toString('utf8');
              const stderrData = Buffer.concat(stderrChunks).toString('utf8').trim();
              if (code === 0) resolve(stdoutData);
              else if (code === 1) resolve('');
              else {
                if (stderrData)
                  reject(new Error(`System grep exited with code ${code}: ${stderrData}`));
                else resolve('');
              }
            });
          });
          return this.parseGrepOutput(output, absolutePath);
        } catch (grepError) {
          console.debug(`System grep failed: ${getErrorMessage(grepError)}. Falling back...`);
        }
      }

      // JavaScript fallback
      const globPattern = include || '**/*';
      const ignorePatterns = ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'coverage/**'];

      const globResult = await glob(globPattern, {
        cwd: absolutePath,
        dot: true,
        ignore: ignorePatterns,
        absolute: true,
        nodir: true,
        signal: options.signal,
      });

      const regex = new RegExp(pattern, 'i');
      const allMatches: GrepMatch[] = [];

      // Convert glob result to array if it's not already
      const filesArray = Array.isArray(globResult) ? globResult : [globResult];

      for (const filePath of filesArray) {
        const fileAbsolutePath = filePath as string;
        try {
          const content = await fsPromises.readFile(fileAbsolutePath, 'utf8');
          const lines = content.split(/\r?\n/);
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              allMatches.push({
                filePath: path.relative(absolutePath, fileAbsolutePath) || path.basename(fileAbsolutePath),
                lineNumber: index + 1,
                line,
              });
            }
          });
        } catch (readError) {
          if (!isNodeError(readError) || readError.code !== 'ENOENT') {
            console.debug(`Could not read ${fileAbsolutePath}: ${getErrorMessage(readError)}`);
          }
        }
      }

      return allMatches;
    } catch (error) {
      console.error(`Error in performGrepSearch: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Check if a command is available in the system's PATH
   */
  private isCommandAvailable(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const checkCommand = process.platform === 'win32' ? 'where' : 'command';
      const checkArgs = process.platform === 'win32' ? [command] : ['-v', command];
      try {
        const child = spawn(checkCommand, checkArgs, {
          stdio: 'ignore',
          shell: process.platform === 'win32',
        });
        child.on('close', (code) => resolve(code === 0));
        child.on('error', () => resolve(false));
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Parse grep output
   */
  private parseGrepOutput(output: string, basePath: string): GrepMatch[] {
    const results: GrepMatch[] = [];
    if (!output) return results;

    const lines = output.split(EOL);

    for (const line of lines) {
      if (!line.trim()) continue;

      const firstColonIndex = line.indexOf(':');
      if (firstColonIndex === -1) continue;

      const secondColonIndex = line.indexOf(':', firstColonIndex + 1);
      if (secondColonIndex === -1) continue;

      const filePathRaw = line.substring(0, firstColonIndex);
      const lineNumberStr = line.substring(firstColonIndex + 1, secondColonIndex);
      const lineContent = line.substring(secondColonIndex + 1);

      const lineNumber = parseInt(lineNumberStr, 10);

      if (!isNaN(lineNumber)) {
        const absoluteFilePath = path.resolve(basePath, filePathRaw);
        const relativeFilePath = path.relative(basePath, absoluteFilePath);

        results.push({
          filePath: relativeFilePath || path.basename(absoluteFilePath),
          lineNumber,
          line: lineContent,
        });
      }
    }
    return results;
  }
}

/**
 * Helper function to apply text replacement
 */
function applyReplacement(
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
 * Check if a path is a git repository
 */
function isGitRepository(dirPath: string): boolean {
  try {
    const gitDir = path.join(dirPath, '.git');
    return fs.existsSync(gitDir);
  } catch {
    return false;
  }
}

/**
 * Check if a file should be ignored based on git ignore patterns
 */
function shouldGitIgnoreFile(filePath: string): boolean {
  const gitIgnorePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'Thumbs.db',
  ];

  const fileName = path.basename(filePath);
  const dirPath = path.dirname(filePath);

  return gitIgnorePatterns.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
  });
}

/**
 * Check if a file should be ignored based on gemini ignore patterns
 */
function shouldGeminiIgnoreFile(filePath: string): boolean {
  const geminiIgnorePatterns = ['.gemini/**', '.geminiignore', '.codebolt/**'];

  const fileName = path.basename(filePath);
  const dirPath = path.dirname(filePath);

  return geminiIgnorePatterns.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
  });
}

// Import globStream for the JavaScript fallback
async function globStream(pattern: string, options: any) {
  const result = await glob(pattern, options);
  // Convert array to async iterable if needed
  if (Array.isArray(result)) {
    return (async function*() {
      for (const item of result) {
        yield item;
      }
    })();
  }
  return result;
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
  deleteFile: (config: FileServicesConfig, filePath: string) =>
    FileServices.getInstance(config).deleteFile(filePath),
  replaceInFile: (config: FileServicesConfig, filePath: string, oldString: string, newString: string, expectedReplacements?: number) =>
    FileServices.getInstance(config).replaceInFile(filePath, oldString, newString, expectedReplacements),
  readManyFiles: (config: FileServicesConfig, paths: string[], options?: any) =>
    FileServices.getInstance(config).readManyFiles(paths, options),
  listDirectory: (config: FileServicesConfig, dirPath: string, options?: any) =>
    FileServices.getInstance(config).listDirectory(dirPath, options),
  searchFileContent: (config: FileServicesConfig, pattern: string, searchPath?: string, options?: any) =>
    FileServices.getInstance(config).searchFileContent(pattern, searchPath, options),
  globSearch: (config: FileServicesConfig, pattern: string, searchPath?: string, options?: any) =>
    FileServices.getInstance(config).globSearch(pattern, searchPath, options),
  listFiles: (config: FileServicesConfig, dirPath: string, recursive?: boolean) =>
    FileServices.getInstance(config).listFiles(dirPath, recursive),
};