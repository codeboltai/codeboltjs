/**
 * Read Many Files Tool - Reads content from multiple files
 */

import type { ToolInvocation, ToolResult } from '../codeboltTools/types';
import { ToolErrorType } from '../codeboltTools/types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../codeboltTools/base-tool';
import { executeReadManyFiles } from '../utils/fileSystem/ReadManyFiles';

const DEFAULT_OUTPUT_SEPARATOR_FORMAT = '--- {filePath} ---';
const DEFAULT_OUTPUT_TERMINATOR = '\n--- End of content ---';
const DEFAULT_ENCODING = 'utf-8';

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
   * These are effectively combined with `paths`.
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
    try {
      // Use executeReadManyFiles utility function
      const result = await executeReadManyFiles(this.params, signal, this.params.paths);

      if (result.error) {
        return {
          llmContent: '',
          returnDisplay: '',
          error: {
            type: ToolErrorType.READ_MANY_FILES_SEARCH_ERROR,
            message: result.error.message
          }
        };
      }

      // Format the result for LLM and display
      const { processedFiles, skippedFiles } = result;
      
      let contentString = '';
      const processedFilesRelativePaths: string[] = [];

      for (const file of processedFiles) {
        const separator = DEFAULT_OUTPUT_SEPARATOR_FORMAT.replace(
          '{filePath}',
          file.filePath,
        );
        const fileContentForLlm = file.content;
        contentString += `${separator}

${fileContentForLlm}

`;
        processedFilesRelativePaths.push(file.relativePathForDisplay);
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
        returnDisplay: displayMessage.trim()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        llmContent: '',
        returnDisplay: '',
        error: {
          type: ToolErrorType.READ_MANY_FILES_SEARCH_ERROR,
          message: `Failed to read many files: ${errorMessage}`
        }
      };
    }
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