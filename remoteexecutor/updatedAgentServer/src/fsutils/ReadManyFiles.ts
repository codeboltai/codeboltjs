import { logger } from '@/utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob, escape } from 'glob';
import { getErrorMessage } from '../utils/errors';
import type { FileSystemService } from '../types/serviceTypes';

/**
 * Configuration interface for ReadManyFiles
 */
export interface ReadManyFilesConfig {
  /** File system service */
  fileSystemService: FileSystemService;
}

/**
 * Result interface for reading multiple files
 */
export interface ReadManyFilesResult {
  success: boolean;
  content?: string;
  error?: string;
  processedFiles?: string[];
  skippedFiles?: Array<{ path: string; reason: string }>;
}

/**
 * Parameters for reading multiple files
 */
export interface ReadManyFilesParams {
  paths: string[];
  include?: string[];
  exclude?: string[];
  recursive?: boolean;
  useDefaultExcludes?: boolean;
  file_filtering_options?: {
    respect_git_ignore?: boolean;
    respect_gemini_ignore?: boolean;
  };
}

/**
 * Result type for file processing operations
 */
type FileProcessingResult =
  | {
    success: true;
    filePath: string;
    relativePathForDisplay: string;
    content: string;
    reason?: undefined;
  }
  | {
    success: false;
    filePath: string;
    relativePathForDisplay: string;
    content?: undefined;
    reason: string;
  };

/**
 * Service for reading multiple files with exact logic from ReadManyFilesTool
 */
export class ReadManyFiles {
  private config: ReadManyFilesConfig;

  constructor(config: ReadManyFilesConfig) {
    this.config = config;
  }

  /**
   * Creates the default exclusion patterns
   */
  private getDefaultExcludes(): string[] {
    return [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.log',
      '*.tmp',
      '.DS_Store',
      'Thumbs.db',
      '*.exe',
      '*.bin',
      '*.dll',
      '*.so',
      '*.dylib',
      '*.zip',
      '*.tar.gz',
      '*.tar.bz2',
      '*.rar',
      '*.7z'
    ];
  }

  /**
   * Detects the file type based on file extension
   */
  private detectFileType(filePath: string): 'text' | 'image' | 'pdf' | 'binary' {
    const ext = path.extname(filePath).toLowerCase();

    if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'].includes(ext)) {
      return 'image';
    }

    if (ext === '.pdf') {
      return 'pdf';
    }

    if (['.exe', '.bin', '.dll', '.so', '.dylib', '.zip', '.tar', '.gz', '.rar', '.7z'].includes(ext)) {
      return 'binary';
    }

    return 'text';
  }

  /**
   * Checks if a file should be ignored based on git ignore patterns
   */
  private shouldGitIgnoreFile(filePath: string): boolean {
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
   * Checks if a file should be ignored based on gemini ignore patterns
   */
  private shouldGeminiIgnoreFile(filePath: string): boolean {
    const geminiIgnorePatterns = ['.gemini/**', '.geminiignore', '.codebolt/**'];

    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);

    return geminiIgnorePatterns.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
    });
  }

  /**
   * Read multiple files with exact logic from ReadManyFilesTool
   */
  async readManyFiles(params: ReadManyFilesParams, signal?: AbortSignal): Promise<ReadManyFilesResult> {
    const {
      paths: inputPatterns,
      include = [],
      exclude = [],
      useDefaultExcludes = true,
    } = params;

    const fileFilteringOptions = {
      respectGitIgnore:
        params.file_filtering_options?.respect_git_ignore ?? true,
      respectGeminiIgnore:
        params.file_filtering_options?.respect_gemini_ignore ?? true,
    };

    const filesToConsider = new Set<string>();
    const skippedFiles: Array<{ path: string; reason: string }> = [];
    const processedFilesRelativePaths: string[] = [];
    let contentString = '';

    const DEFAULT_OUTPUT_SEPARATOR_FORMAT = '--- {filePath} ---';
    const DEFAULT_OUTPUT_TERMINATOR = '\n--- End of content ---';
    const DEFAULT_ENCODING = 'utf-8';

    const effectiveExcludes = useDefaultExcludes
      ? [...this.getDefaultExcludes(), ...exclude]
      : [...exclude];

    const searchPatterns = [...inputPatterns, ...include];

    try {
      const allEntries = new Set<string>();

      // Process all search patterns
      for (const p of searchPatterns) {
        const normalizedP = p.replace(/\\/g, '/');

        // Check if the pattern is an absolute path
        if (path.isAbsolute(normalizedP)) {
          // For absolute paths, check if they exist directly
          if (fs.existsSync(normalizedP)) {
            allEntries.add(normalizedP);
          } else {
            // If absolute path doesn't exist, treat as glob pattern
            const entriesFromAbsolutePattern = await glob([normalizedP], {
              ignore: effectiveExcludes,
              nodir: true,
              dot: true,
              absolute: true,
              nocase: true,
              signal,
            });
            for (const entry of entriesFromAbsolutePattern) {
              allEntries.add(entry);
            }
          }
        } else {
          // For relative patterns, we can't process them without a base directory
          skippedFiles.push({
            path: normalizedP,
            reason: 'Relative paths are not supported. Please provide absolute paths.',
          });
        }
      }

      const entries = Array.from(allEntries);

      // Apply filtering if enabled
      let filteredEntries = entries;
      let gitIgnoredCount = 0;
      const geminiIgnoredCount = 0;

      // Simple git ignore filtering (basic implementation)
      if (fileFilteringOptions.respectGitIgnore) {
        const beforeCount = filteredEntries.length;
        filteredEntries = filteredEntries.filter(filePath => {
          const fileName = path.basename(filePath);
          const dirPath = path.dirname(filePath);
          return !this.shouldGitIgnoreFile(filePath);
        });
        gitIgnoredCount = beforeCount - filteredEntries.length;
      }

      for (const absoluteFilePath of entries) {
        // Check if this file was filtered out by git ignore
        if (!filteredEntries.includes(absoluteFilePath)) {
          continue;
        }

        filesToConsider.add(absoluteFilePath);
      }

      // Add info about git-ignored files if any were filtered
      if (gitIgnoredCount > 0) {
        skippedFiles.push({
          path: `${gitIgnoredCount} file(s)`,
          reason: 'git ignored',
        });
      }

      // Add info about gemini-ignored files if any were filtered
      if (geminiIgnoredCount > 0) {
        skippedFiles.push({
          path: `${geminiIgnoredCount} file(s)`,
          reason: 'gemini ignored',
        });
      }
    } catch (error) {
      const errorMessage = `Error during file search: ${getErrorMessage(error)}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const sortedFiles = Array.from(filesToConsider).sort();

    const fileProcessingPromises = sortedFiles.map(
      async (filePath): Promise<FileProcessingResult> => {
        try {
          const relativePathForDisplay = path.basename(filePath);

          const fileType = this.detectFileType(filePath);

          if (fileType === 'image' || fileType === 'pdf' || fileType === 'binary') {
            const fileExtension = path.extname(filePath).toLowerCase();
            const fileNameWithoutExtension = path.basename(
              filePath,
              fileExtension,
            );
            const requestedExplicitly = inputPatterns.some(
              (pattern: string) =>
                pattern.toLowerCase().includes(fileExtension) ||
                pattern.includes(fileNameWithoutExtension),
            );

            if (!requestedExplicitly) {
              return {
                success: false,
                filePath,
                relativePathForDisplay,
                reason:
                  `${fileType} file was not explicitly requested by name or extension`,
              };
            }
          }

          // Read file content using the file system service
          const content = await this.config.fileSystemService.readTextFile(filePath);

          return {
            success: true,
            filePath,
            relativePathForDisplay,
            content,
          };
        } catch (error) {
          const relativePathForDisplay = path.basename(filePath);

          return {
            success: false,
            filePath,
            relativePathForDisplay,
            reason: `Read error: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      },
    );

    const results = await Promise.allSettled(fileProcessingPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const fileResult = result.value;

        if (!fileResult.success) {
          // Handle skipped files (images/PDFs not requested or read errors)
          skippedFiles.push({
            path: fileResult.relativePathForDisplay,
            reason: fileResult.reason,
          });
        } else {
          // Handle successfully processed files
          const { filePath, relativePathForDisplay, content } = fileResult;

          const separator = DEFAULT_OUTPUT_SEPARATOR_FORMAT.replace(
            '{filePath}',
            filePath,
          );
          const fileContentForLlm = content;
          contentString += `${separator}\n\n${fileContentForLlm}\n\n`;

          processedFilesRelativePaths.push(relativePathForDisplay);
        }
      } else {
        // Handle Promise rejection (unexpected errors)
        skippedFiles.push({
          path: 'unknown',
          reason: `Unexpected error: ${result.reason}`,
        });
      }
    }

    if (contentString.length > 0) {
      contentString += DEFAULT_OUTPUT_TERMINATOR;
    } else {
      contentString = 'No files matching the criteria were found or all were skipped.';
    }

    return {
      success: true,
      content: contentString,
      processedFiles: processedFilesRelativePaths,
      skippedFiles,
    };
  }

  /**
   * Validate parameters for reading multiple files
   */
  validateParams(params: ReadManyFilesParams): string | null {
    if (!params.paths || params.paths.length === 0) {
      return "The 'paths' parameter must be a non-empty array.";
    }

    for (const path of params.paths) {
      if (!path || typeof path !== 'string' || path.trim() === '') {
        return "All paths in the 'paths' array must be non-empty strings.";
      }
    }

    return null;
  }
}

/**
 * Create a ReadManyFiles instance
 */
export function createReadManyFiles(config: ReadManyFilesConfig): ReadManyFiles {
  return new ReadManyFiles(config);
}