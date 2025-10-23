/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier:Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ToolInvocation, ToolResult } from '../codeboltTools/types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../codeboltTools/base-tool';
import { makeRelative, shortenPath } from '../codeboltTools/utils/paths';
import type { ConfigManager } from '../codeboltTools/config';
import { ToolErrorType } from '../codeboltTools/types';
import { executeReadFile } from '../utils/fileSystem/ReadFile';

/**
 * Parameters for the ReadFileTool
 */
export interface ReadFileToolParams {
  /**
   * The absolute path to the file to read
   */
  absolute_path: string;

  /**
   * Optional: For text files, the 0-based line number to start reading from.
   * Requires 'limit' to be set. Use for paginating through large files.
   */
  offset?: number;

  /**
   * Optional: For text files, maximum number of lines to read.
   * Use with 'offset' to paginate through large files.
   * If omitted, reads the entire file (if feasible, up to a default limit).
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
    const fileName = path.basename(this.params.absolute_path);
    return `Reading file: ${fileName}`;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    // Use executeReadFile utility function
    const result = await executeReadFile(this.params);

    if (result.error) {
      return {
        llmContent: result.error.message,
        returnDisplay: `Error: ${result.error.message}`,
        error: {
          message: result.error.message,
          type: result.error.type,
        },
      };
    }
    
    // Format the content for display
    let llmContent: string = result.content || '';
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
    }
    
    // Shorten path for display
    const fileName = path.basename(this.params.absolute_path);
    
    return {
      llmContent,
      returnDisplay: `Successfully read ${fileName}`,
    };
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