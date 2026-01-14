/**
 * Read File Tool - Reads and returns the content of a specified file
 */

import * as path from 'node:path';
import type {
  ToolInvocation,
  ToolLocation,
  ToolResult,
  ToolErrorType
} from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import { shortenPath } from '../utils/paths';
import { getErrorMessage, isNodeError } from '../utils/errors';
import { executeReadFile, type ReadFileParams } from '../../localexecutions/file/utils/ReadFile';

/**
 * Parameters for the ReadFile tool
 */
export interface ReadFileToolParams {
  /**
   * The absolute path to the file to read
   */
  absolute_path: string;

  /**
   * The line number to start reading from (optional)
   */
  offset?: number;

  /**
   * The number of lines to read (optional)
   */
  limit?: number;
}

class ReadFileToolInvocation extends BaseToolInvocation<
  ReadFileToolParams,
  ToolResult
> {
  constructor(
    params: ReadFileToolParams,
  ) {
    super(params);
  }

  getDescription(): string {
    return shortenPath(this.params.absolute_path);
  }

  override toolLocations(): ToolLocation[] {
    const location: ToolLocation = { path: this.params.absolute_path };
    if (this.params.offset !== undefined) {
      location.line = this.params.offset;
    }
    return [location];
  }

  async execute(): Promise<ToolResult> {
    try {
      // Convert tool params to utility params
      const utilParams: ReadFileParams = {
        absolute_path: this.params.absolute_path,
        offset: this.params.offset,
        limit: this.params.limit
      };

      // Use the utility function
      const result = await executeReadFile(utilParams);

      // Handle errors from utility
      if (result.error) {
        return {
          llmContent: `Error reading file: ${result.error.message}`,
          returnDisplay: `Error reading file: ${result.error.message}`,
          error: {
            message: result.error.message,
            type: result.error.type as ToolErrorType,
          },
        };
      }

      // Handle successful result from utility
      let llmContent: string;
      if (result.isTruncated && result.linesShown && result.originalLineCount) {
        const [start, end] = result.linesShown;
        const nextOffset = this.params.offset
          ? this.params.offset + end - start + 1
          : end;
        llmContent = `
IMPORTANT: The file content has been truncated.
Status: Showing lines ${start}-${end} of ${result.originalLineCount} total lines.
Action: To read more of the file, you can use the 'offset' and 'limit' parameters in a subsequent 'read_file' call. For example, to read the next section of the file, use offset: ${nextOffset}.

--- FILE CONTENT (truncated) ---
${result.content}`;
      } else {
        llmContent = result.content || '';
      }

      return {
        llmContent,
        returnDisplay: `Successfully read ${shortenPath(this.params.absolute_path)}`,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      let errorType: ToolErrorType = 'unknown' as ToolErrorType;

      if (isNodeError(error)) {
        if (error.code === 'ENOENT') {
          errorType = 'file_not_found' as ToolErrorType;
        } else if (error.code === 'EACCES') {
          errorType = 'permission_denied' as ToolErrorType;
        }
      }

      return {
        llmContent: `Error reading file: ${errorMessage}`,
        returnDisplay: `Error reading file: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: errorType,
        },
      };
    }
  }
}

/**
 * Implementation of the ReadFile tool logic
 */
export class ReadFileTool extends BaseDeclarativeTool<
  ReadFileToolParams,
  ToolResult
> {
  static readonly Name: string = 'read_file';

  constructor() {
    super(
      ReadFileTool.Name,
      'ReadFile',
      `Reads and returns the content of a specified file. If the file is large, the content will be truncated. The tool's response will clearly indicate if truncation has occurred and will provide details on how to read more of the file using the 'offset' and 'limit' parameters. Handles text files and can read specific line ranges.`,
      Kind.Read,
      {
        properties: {
          absolute_path: {
            description:
              "The absolute path to the file to read (e.g., '/home/user/project/file.txt'). Relative paths are not supported. You must provide an absolute path.",
            type: 'string',
          },
          offset: {
            description:
              "Optional: For text files, the 0-based line number to start reading from. Requires 'limit' to be set. Use for paginating through large files.",
            type: 'number',
          },
          limit: {
            description:
              "Optional: For text files, maximum number of lines to read. Use with 'offset' to paginate through large files. If omitted, reads the entire file (if feasible, up to a default limit).",
            type: 'number',
          },
        },
        required: ['absolute_path'],
        type: 'object',
      },
    );
  }

  protected override validateToolParamValues(
    params: ReadFileToolParams,
  ): string | null {
    const filePath = params.absolute_path;
    if (params.absolute_path.trim() === '') {
      return "The 'absolute_path' parameter must be non-empty.";
    }

    if (!path.isAbsolute(filePath)) {
      return `File path must be absolute, but was relative: ${filePath}. You must provide an absolute path.`;
    }

    if (params.offset !== undefined && params.offset < 0) {
      return 'Offset must be a non-negative number';
    }

    if (params.limit !== undefined && params.limit <= 0) {
      return 'Limit must be a positive number';
    }

    return null;
  }

  protected createInvocation(
    params: ReadFileToolParams,
  ): ToolInvocation<ReadFileToolParams, ToolResult> {
    return new ReadFileToolInvocation(params);
  }
}