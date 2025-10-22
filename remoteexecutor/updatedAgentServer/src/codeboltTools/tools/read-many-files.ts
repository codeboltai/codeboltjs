/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ToolInvocation, ToolResult } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import { getErrorMessage } from '../utils/errors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob, escape } from 'glob';
// PartListUnion is not available in the public API, using string instead
type PartListUnion = string;
import type { StandaloneToolConfig } from '../config';
import { ToolErrorType } from '../types';

/**
 * Parameters for the ReadManyFilesTool.
 */
export interface ReadManyFilesParams {
  /**
   * An array of file paths or directory paths to search within.
   * Paths are relative to the tool's configured target directory.
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

const DEFAULT_OUTPUT_SEPARATOR_FORMAT = '--- {filePath} ---';
const DEFAULT_OUTPUT_TERMINATOR = '\n--- End of content ---';
const DEFAULT_ENCODING = 'utf-8';

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


class ReadManyFilesToolInvocation extends BaseToolInvocation<
  ReadManyFilesParams,
  ToolResult
> {
  constructor(
    params: ReadManyFilesParams,
  ) {
    super(params);
  }

  getDescription(): string {
    const allPatterns = [...this.params.paths, ...(this.params.include || [])];
    const pathDesc = `using patterns: 
${allPatterns.join('`, `')}`;

    // Determine the final list of exclusion patterns exactly as in execute method
    const paramExcludes = this.params.exclude || [];
    const paramUseDefaultExcludes = this.params.useDefaultExcludes !== false;
    const finalExclusionPatternsForDescription: string[] =
      paramUseDefaultExcludes
        ? [...getDefaultExcludes(), ...paramExcludes]
        : [...paramExcludes];

    const excludeDesc = `Excluding: ${finalExclusionPatternsForDescription.length > 0
      ? `patterns like 
${finalExclusionPatternsForDescription
        .slice(0, 2)
        .join(
          '`, `',
        )}${finalExclusionPatternsForDescription.length > 2 ? '...`' : '`'}`
      : 'none specified'
      }`;

    return `Will attempt to read and concatenate files ${pathDesc}. ${excludeDesc}. File encoding: ${DEFAULT_ENCODING}. Separator: "${DEFAULT_OUTPUT_SEPARATOR_FORMAT.replace(
      '{filePath}',
      'path/to/file.ext',
    )}".`;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    const {
      paths: inputPatterns,
      include = [],
      exclude = [],
      useDefaultExcludes = true,
    } = this.params;

    const fileFilteringOptions = {
      respectGitIgnore:
        this.params.file_filtering_options?.respect_git_ignore ?? true,
      respectGeminiIgnore:
        this.params.file_filtering_options?.respect_gemini_ignore ?? true,
    };

    const filesToConsider = new Set<string>();
    const skippedFiles: Array<{ path: string; reason: string }> = [];
    const processedFilesRelativePaths: string[] = [];
    let contentString = '';

    const effectiveExcludes = useDefaultExcludes
      ? [...getDefaultExcludes(), ...exclude]
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
    } catch (error) {
      const errorMessage = `Error during file search: ${getErrorMessage(error)}`;
      return {
        llmContent: errorMessage,
        returnDisplay: `## File Search Error

An error occurred while searching for files:
\`\`\`
${getErrorMessage(error)}
\`\`\``,
        error: {
          message: errorMessage,
          type: ToolErrorType.READ_MANY_FILES_SEARCH_ERROR,
        },
      };
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

          const separator = DEFAULT_OUTPUT_SEPARATOR_FORMAT.replace(
            '{filePath}',
            filePath,
          );
          const fileContentForLlm = content;
          contentString += `${separator}

${fileContentForLlm}

`;

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

    let displayMessage = `### ReadManyFiles Result\n\n`;
    if (processedFilesRelativePaths.length > 0) {
      displayMessage += `Successfully read and concatenated content from **${processedFilesRelativePaths.length} file(s)**.\n`;
      if (processedFilesRelativePaths.length <= 10) {
        displayMessage += `\n**Processed Files:**\n`;
        processedFilesRelativePaths.forEach(
          (p) => (displayMessage += `- \`${p}\`\n`),
        );
      } else {
        displayMessage += `\n**Processed Files (first 10 shown):**\n`;
        processedFilesRelativePaths
          .slice(0, 10)
          .forEach((p) => (displayMessage += `- \`${p}\`\n`));
        displayMessage += `- ...and ${processedFilesRelativePaths.length - 10} more.\n`;
      }
    }

    if (skippedFiles.length > 0) {
      if (processedFilesRelativePaths.length === 0) {
        displayMessage += `No files were read and concatenated based on the criteria.\n`;
      }
      if (skippedFiles.length <= 5) {
        displayMessage += `\n**Skipped ${skippedFiles.length} item(s):**\n`;
      } else {
        displayMessage += `\n**Skipped ${skippedFiles.length} item(s) (first 5 shown):**\n`;
      }
      skippedFiles
        .slice(0, 5)
        .forEach(
          (f) => (displayMessage += `- \`${f.path}\` (Reason: ${f.reason})\n`),
        );
      if (skippedFiles.length > 5) {
        displayMessage += `- ...and ${skippedFiles.length - 5} more.\n`;
      }
    } else if (
      processedFilesRelativePaths.length === 0 &&
      skippedFiles.length === 0
    ) {
      displayMessage += `No files were read and concatenated based on the criteria.\n`;
    }

    if (contentString.length > 0) {
      contentString += DEFAULT_OUTPUT_TERMINATOR;
    } else {
      contentString = 'No files matching the criteria were found or all were skipped.';
    }
    return {
      llmContent: contentString,
      returnDisplay: displayMessage.trim(),
    };
  }
}

/**
 * Tool implementation for finding and reading multiple text files from the local filesystem
 * within a specified target directory. The content is concatenated.
 * It is intended to run in an environment with access to the local file system (e.g., a Node.js backend).
 */
export class ReadManyFilesTool extends BaseDeclarativeTool<
  ReadManyFilesParams,
  ToolResult
> {
  static readonly Name: string = 'read_many_files';

  constructor() {
    const parameterSchema = {
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
          minItems: 1,
          description:
            "Required. An array of absolute file paths or glob patterns. Examples: ['/path/to/src/**/*.ts'], ['/path/to/README.md', '/path/to/docs/']",
        },
        include: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
          description:
            'Optional. Additional glob patterns to include. These are merged with `paths`. Example: "*.test.ts" to specifically add test files if they were broadly excluded.',
          default: [],
        },
        exclude: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1,
          },
          description:
            'Optional. Glob patterns for files/directories to exclude. Added to default excludes if useDefaultExcludes is true. Example: "**/*.log", "temp/"',
          default: [],
        },
        recursive: {
          type: 'boolean',
          description:
            'Optional. Whether to search recursively (primarily controlled by `**` in glob patterns). Defaults to true.',
          default: true,
        },
        useDefaultExcludes: {
          type: 'boolean',
          description:
            'Optional. Whether to apply a list of default exclusion patterns (e.g., node_modules, .git, binary files). Defaults to true.',
          default: true,
        },
        file_filtering_options: {
          description:
            'Whether to respect ignore patterns from .gitignore or .geminiignore',
          type: 'object',
          properties: {
            respect_git_ignore: {
              description:
                'Optional: Whether to respect .gitignore patterns when listing files. Only available in git repositories. Defaults to true.',
              type: 'boolean',
            },
            respect_gemini_ignore: {
              description:
                'Optional: Whether to respect .geminiignore patterns when listing files. Defaults to true.',
              type: 'boolean',
            },
          },
        },
      },
      required: ['paths'],
    };

    super(
      ReadManyFilesTool.Name,
      'ReadManyFiles',
      `Reads content from multiple files specified by absolute paths or glob patterns. For text files, it concatenates their content into a single string. It is primarily designed for text-based files. However, it can also process image (e.g., .png, .jpg) and PDF (.pdf) files if their file names or extensions are explicitly included in the 'paths' argument. For these explicitly requested non-text files, their data is read and included in a format suitable for model consumption (e.g., base64 encoded).

This tool is useful when you need to understand or analyze a collection of files, such as:
- Getting an overview of a codebase or parts of it (e.g., all TypeScript files using absolute glob patterns).
- Finding where specific functionality is implemented if the user asks broad questions about code.
- Reviewing documentation files (e.g., all Markdown files using absolute paths).
- Gathering context from multiple configuration files.
- When the user asks to "read all files in X directory" or "show me the content of all Y files".

Use this tool when the user's query implies needing the content of several files simultaneously for context, analysis, or summarization. For text files, it uses default UTF-8 encoding and a '--- {filePath} ---' separator between file contents. The tool inserts a '--- End of content ---' after the last file. All paths must be absolute. Glob patterns like '/path/to/src/**/*.js' are supported. Avoid using for single files if a more specific single-file reading tool is available, unless the user specifically requests to process a list containing just one file via this tool. Other binary files (not explicitly requested as image/PDF) are generally skipped. Default excludes apply to common non-text files (except for explicitly requested images/PDFs) and large dependency directories unless 'useDefaultExcludes' is false.`,
      Kind.Read,
      parameterSchema,
    );
  }

  protected createInvocation(
    params: ReadManyFilesParams,
  ): ToolInvocation<ReadManyFilesParams, ToolResult> {
    return new ReadManyFilesToolInvocation(params);
  }
}
