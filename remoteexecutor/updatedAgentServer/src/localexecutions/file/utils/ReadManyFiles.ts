/**
 * Read Many Files Utility - Reads content from multiple files
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { getErrorMessage } from '../../../utils/errors';

/**
 * Parameters for the ReadManyFiles utility
 */
export interface ReadManyFilesParams {
  /**
   * An array of file paths or directory paths to search within.
   * Paths are absolute paths.
   * Glob patterns can be used directly in these paths.
   */
  paths: string[];

  /**
   * Optional. Glob patterns for files to include.
   * These are effectively combined with the `paths`.
   * Example: ["*.ts", "src/** /*.md"]
   */
  include?: string[];

  /**
   * Optional. Glob patterns for files/directories to exclude.
   * Applied as ignore patterns.
   * Example: ["*.log", "dist/**"]
   */
  exclude?: string[];

  /**
   * Optional. Search directories recursively.
   * This is generally controlled by glob patterns (e.g., `**`).
   * The glob implementation is recursive by default for `**`.
   * For simplicity, we'll rely on `**` for recursion.
   */
  recursive?: boolean;

  /**
   * Optional. Apply default exclusion patterns. Defaults to true.
   */
  useDefaultExcludes?: boolean;

  /**
   * Whether to respect .gitignore and .geminiignore patterns (optional, defaults to true)
   */
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
 * Return type for the executeReadManyFiles function
 */
export interface ReadManyFilesResult {
  /**
   * Array of successfully processed files with their content
   */
  processedFiles: Array<{
    filePath: string;
    relativePathForDisplay: string;
    content: string;
  }>;
  
  /**
   * Array of skipped files with reasons
   */
  skippedFiles: Array<{
    path: string;
    reason: string;
  }>;
  
  /**
   * Error object if an error occurred
   */
  error?: {
    message: string;
    type: string;
  };
}

/**
 * Creates the default exclusion patterns including dynamic patterns.
 */
function getDefaultExcludes(): string[] {
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
function detectFileType(filePath: string): 'text' | 'image' | 'pdf' | 'binary' {
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

const DEFAULT_OUTPUT_SEPARATOR_FORMAT = '--- {filePath} ---';
const DEFAULT_OUTPUT_TERMINATOR = '\n--- End of content ---';

/**
 * Executes reading multiple files with the provided parameters
 */
export async function executeReadManyFiles(
  params: ReadManyFilesParams,
  signal: AbortSignal,
  inputPatterns: string[] // This is needed to check if files were explicitly requested
): Promise<ReadManyFilesResult> {
  try {
    const {
      paths: inputPaths,
      include = [],
      exclude = [],
      useDefaultExcludes = true,
    } = params;

    const fileFilteringOptions = {
      respectGitIgnore:
        params.file_filtering_options?.respect_git_ignore ?? true,
      respectCodeboltIgnore:
        params.file_filtering_options?.respect_gemini_ignore ?? true,
    };

    const filesToConsider = new Set<string>();
    const skippedFiles: Array<{ path: string; reason: string }> = [];
    const processedFiles: Array<{ filePath: string; relativePathForDisplay: string; content: string }> = [];

    const effectiveExcludes = useDefaultExcludes
      ? [...getDefaultExcludes(), ...exclude]
      : [...exclude];

    const searchPatterns = [...inputPaths, ...include];

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
      // This is a simplified implementation - in a real scenario you'd use a proper git ignore parser
      const gitIgnorePatterns = ['node_modules/**', '.git/**', 'dist/**', 'build/**'];
      const beforeCount = filteredEntries.length;
      filteredEntries = filteredEntries.filter(filePath => {
        // Use the filename and directory structure for pattern matching
        const fileName = path.basename(filePath);
        const dirPath = path.dirname(filePath);
        return !gitIgnorePatterns.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
          return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
        });
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

    const sortedFiles = Array.from(filesToConsider).sort();

    const fileProcessingPromises = sortedFiles.map(
      async (filePath): Promise<FileProcessingResult> => {
        try {
          const relativePathForDisplay = path.basename(filePath);

          const fileType = detectFileType(filePath);

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

          // Read file content using Node.js fs API directly
          const content = await fs.promises.readFile(filePath, 'utf8');

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
          processedFiles.push({ filePath, relativePathForDisplay, content });
        }
      } else {
        // Handle Promise rejection (unexpected errors)
        skippedFiles.push({
          path: 'unknown',
          reason: `Unexpected error: ${result.reason}`,
        });
      }
    }

    return {
      processedFiles,
      skippedFiles
    };
  } catch (error) {
    const errorMessage = `Error during file search: ${getErrorMessage(error)}`;
    return {
      processedFiles: [],
      skippedFiles: [],
      error: {
        message: errorMessage,
        type: 'READ_MANY_FILES_SEARCH_ERROR',
      },
    };
  }
}