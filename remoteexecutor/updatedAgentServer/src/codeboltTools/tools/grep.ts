/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier:Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ToolInvocation, ToolResult } from '../types';
import { executeGrepSearch, type GrepSearchParams, type GrepSearchResult as UtilGrepSearchResult, type GrepMatch } from '../../utils/search/GrepSearch';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import { makeRelative, shortenPath } from '../utils/paths';
import { getErrorMessage, isNodeError } from '../utils/errors';
import type { StandaloneToolConfig } from '../config';
import { ToolErrorType } from '../types';

/**
 * Parameters for the GrepTool
 */
export interface GrepToolParams {
  /**
   * The regular expression pattern to search for in file contents
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory relative to root)
   */
  path?: string;

  /**
   * File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")
   */
  include?: string;
}

/**
 * Extended ToolResult for grep search that includes matches data
 */
export interface ExtendedGrepSearchResult extends ToolResult {
  /**
   * Array of search result objects
   */
  results?: Array<{
    path: string;
    file?: string;
    line?: number;
    content?: string;
    lineNumber?: number;
    lineText?: string;
  }>;

  /**
   * Total number of matches found
   */
  totalMatches?: number;

  /**
   * Number of files with matches
   */
  filesWithMatches?: number;

  /**
   * Whether the results were truncated
   */
  isTruncated?: boolean;
}

class GrepToolInvocation extends BaseToolInvocation<
  GrepToolParams,
  ExtendedGrepSearchResult
> {
  constructor(
    private readonly config: StandaloneToolConfig,
    params: GrepToolParams,
  ) {
    super(params);
  }

  /**
   * Gets a description of the grep operation
   * @returns A string describing the grep
   */
  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.include) {
      description += ` in ${this.params.include}`;
    }
    if (this.params.path) {
      const resolvedPath = path.resolve(
        this.config.targetDir,
        this.params.path,
      );
      if (
        resolvedPath === this.config.targetDir ||
        this.params.path === '.'
      ) {
        description += ` within ./`;
      } else {
        const relativePath = makeRelative(
          resolvedPath,
          this.config.targetDir,
        );
        description += ` within ${shortenPath(relativePath)}`;
      }
    } else {
      // When no path is specified, indicate searching all workspace directories
      const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.targetDir];
      if (workspaceDirectories.length > 1) {
        description += ` across all workspace directories`;
      }
    }
    return description;
  }

  async execute(signal: AbortSignal): Promise<ExtendedGrepSearchResult> {
    try {
      // Convert tool params to utility params
      const utilParams: GrepSearchParams = {
        pattern: this.params.pattern,
        path: this.params.path,
        include: this.params.include
      };

      // Use the utility function
      const result: UtilGrepSearchResult = await executeGrepSearch(
        utilParams,
        this.config.targetDir,
        this.config.workspaceContext,
        signal
      );

      // Handle errors from utility
      if (result.error) {
        return {
          llmContent: `Error during grep search operation: ${result.error.message}`,
          returnDisplay: `Error: ${result.error.message}`,
          error: {
            message: result.error.message,
            type: result.error.type as ToolErrorType,
          },
          results: [],
          totalMatches: 0,
          filesWithMatches: 0,
          isTruncated: false
        };
      }

      // Handle successful result from utility
      const allMatches = result.matches || [];

      const workspaceDirectories = this.config.workspaceContext?.getDirectories() || [this.config.targetDir];
      const searchDirAbs = this.params.path ? path.resolve(this.config.targetDir, this.params.path) : null;
      const searchDirDisplay = this.params.path || '.';

      let searchLocationDescription: string;
      if (searchDirAbs === null) {
        const numDirs = workspaceDirectories.length;
        searchLocationDescription =
          numDirs > 1
            ? `across ${numDirs} workspace directories`
            : `in the workspace directory`;
      } else {
        searchLocationDescription = `in path "${searchDirDisplay}"`;
      }

      // Format results for UI
      const formattedResults = allMatches.map(match => ({
        path: match.filePath,
        file: match.filePath,
        line: match.lineNumber,
        lineNumber: match.lineNumber,
        content: match.line,
        lineText: match.line
      }));

      // Group by file to count unique files
      const uniqueFiles = new Set(allMatches.map(m => m.filePath));

      if (allMatches.length === 0) {
        const noMatchMsg = `No matches found for pattern "${this.params.pattern}" ${searchLocationDescription}${this.params.include ? ` (filter: "${this.params.include}")` : ''}.`;
        return {
          llmContent: noMatchMsg,
          returnDisplay: `No matches found`,
          results: [],
          totalMatches: 0,
          filesWithMatches: 0,
          isTruncated: false
        };
      }

      // Group matches by file
      const matchesByFile = allMatches.reduce(
        (acc, match) => {
          const fileKey = match.filePath;
          if (!acc[fileKey]) {
            acc[fileKey] = [];
          }
          acc[fileKey].push(match);
          acc[fileKey].sort((a, b) => a.lineNumber - b.lineNumber);
          return acc;
        },
        {} as Record<string, GrepMatch[]>,
      );

      const matchCount = allMatches.length;
      const matchTerm = matchCount === 1 ? 'match' : 'matches';

      let llmContent = `Found ${matchCount} ${matchTerm} for pattern "${this.params.pattern}" ${searchLocationDescription}${this.params.include ? ` (filter: "${this.params.include}")` : ''}:
---
`;

      for (const filePath in matchesByFile) {
        llmContent += `File: ${filePath}\n`;
        matchesByFile[filePath]?.forEach((match) => {
          const trimmedLine = match.line.trim();
          llmContent += `L${match.lineNumber}: ${trimmedLine}\n`;
        });
        llmContent += '---\n';
      }

      return {
        llmContent: llmContent.trim(),
        returnDisplay: `Found ${matchCount} ${matchTerm}`,
        results: formattedResults,
        totalMatches: matchCount,
        filesWithMatches: uniqueFiles.size,
        isTruncated: false
      };
    } catch (error) {
      console.error(`Error during GrepLogic execution: ${error}`);
      const errorMessage = getErrorMessage(error);
      return {
        llmContent: `Error during grep search operation: ${errorMessage}`,
        returnDisplay: `Error: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: ToolErrorType.GREP_EXECUTION_ERROR,
        },
        results: [],
        totalMatches: 0,
        filesWithMatches: 0,
        isTruncated: false
      };
    }
  }
}

/**
 * Implementation of the Grep tool logic (moved from CLI)
 */
export class GrepTool extends BaseDeclarativeTool<GrepToolParams, ExtendedGrepSearchResult> {
  static readonly Name = 'search_file_content'; // Keep static name

  constructor(private readonly config: StandaloneToolConfig) {
    super(
      GrepTool.Name,
      'SearchText',
      'Searches for a regular expression pattern within the content of files in a specified directory (or current working directory). Can filter files by a glob pattern. Returns the lines containing matches, along with their file paths and line numbers.',
      Kind.Search,
      {
        properties: {
          pattern: {
            description:
              "The regular expression (regex) pattern to search for within file contents (e.g., 'function\\s+myFunction', 'import\\s+\\{.*\\}\\s+from\\s+.*').",
            type: 'string',
          },
          path: {
            description:
              'Optional: The absolute path to the directory to search within. If omitted, searches the current working directory.',
            type: 'string',
          },
          include: {
            description:
              "Optional: A glob pattern to filter which files are searched (e.g., '*.js', '*.{ts,tsx}', 'src/**'). If omitted, searches all files (respecting potential global ignores).",
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    );
  }

  /**
   * Validates the parameters for the tool
   * @param params Parameters to validate
   * @returns An error message string if invalid, null otherwise
   */
  protected override validateToolParamValues(
    params: GrepToolParams,
  ): string | null {
    try {
      new RegExp(params.pattern);
    } catch (error) {
      return `Invalid regular expression pattern provided: ${params.pattern}. Error: ${getErrorMessage(error)}`;
    }

    // Only validate path if one is provided
    if (params.path) {
      try {
        // We'll let the utility handle path validation
      } catch (error) {
        return getErrorMessage(error);
      }
    }

    return null; // Parameters are valid
  }

  protected createInvocation(
    params: GrepToolParams,
  ): ToolInvocation<GrepToolParams, ExtendedGrepSearchResult> {
    return new GrepToolInvocation(this.config, params);
  }
}
