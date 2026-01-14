/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier:Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob, escape } from 'glob';
import type { GlobPath } from './types';
import { sortFileEntries } from './sortUtils';
import { DEFAULT_FILE_FILTERING_OPTIONS } from '../file/utils/search/constants';
import { getErrorMessage } from '../../utils/errors';

export interface FileFilteringOptions {
  respectGitIgnore: boolean;
  respectCodeboltIgnore: boolean;
}

interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  codeboltIgnoredCount: number;
  ignoredCount: number;
}

// For memory files
export const DEFAULT_MEMORY_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: false,
  respectCodeboltIgnore: true,
};

/**
 * Parameters for the Glob Search
 */
export interface GlobSearchParams {
  /**
   * The glob pattern to match files against
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory)
   */
  path?: string;

  /**
   * Whether the search should be case-sensitive (optional, defaults to false)
   */
  case_sensitive?: boolean;

  /**
   * Whether to respect .gitignore patterns (optional, defaults to true)
   */
  respect_git_ignore?: boolean;

  /**
   * Whether to respect .codeboltignore patterns (optional, defaults to true)
   */
  respect_codebolt_ignore?: boolean;
}

/**
 * Return type for the executeGlobSearch function
 */
export interface GlobSearchResult {
  /**
   * Array of matching file paths
   */
  matches: string[];
  
  /**
   * Number of files that were ignored
   */
  ignoredCount: number;
  
  /**
   * Error object if an error occurred
   */
  error?: {
    message: string;
    type: string;
  };
}

/**
 * Executes a glob search with the provided parameters
 */
export async function executeGlobSearch(
  params: GlobSearchParams,
  targetDir: string,
  workspaceContext: any,
  getFileService: () => any,
  getFileExclusions: () => any,
  getFileFilteringOptions: () => FileFilteringOptions | undefined,
  signal: AbortSignal
): Promise<GlobSearchResult> {
  try {
    const workspaceDirectories = workspaceContext.getDirectories();

    // If a specific path is provided, resolve it and check if it's within workspace
    let searchDirectories: readonly string[];
    if (params.path) {
      const searchDirAbsolute = path.resolve(targetDir, params.path);
      if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
        const rawError = `Error: Path "${params.path}" is not within any workspace directory`;
        return {
          matches: [],
          ignoredCount: 0,
          error: {
            message: rawError,
            type: 'PATH_NOT_IN_WORKSPACE',
          },
        };
      }
      searchDirectories = [searchDirAbsolute];
    } else {
      // Search across all workspace directories
      searchDirectories = workspaceDirectories;
    }

    // Get centralized file discovery service
    const fileDiscovery = getFileService();
    if (!fileDiscovery) {
      return {
        matches: [],
        ignoredCount: 0,
        error: {
          message: 'File discovery service not available',
          type: 'GLOB_EXECUTION_ERROR',
        },
      };
    }

    // Collect entries from all search directories
    const allEntries: GlobPath[] = [];
    for (const searchDir of searchDirectories) {
      let pattern = params.pattern;
      const fullPath = path.join(searchDir, pattern);
      if (fs.existsSync(fullPath)) {
        pattern = escape(pattern);
      }

      const entries = (await glob(pattern, {
        cwd: searchDir,
        withFileTypes: true,
        nodir: true,
        stat: true,
        nocase: !params.case_sensitive,
        dot: true,
        ignore: getFileExclusions()?.getGlobExcludes() ?? [],
        follow: false,
        signal,
      })) as GlobPath[];

      // Ensure entries is iterable before spreading
      if (Array.isArray(entries)) {
        allEntries.push(...entries);
      } else if (entries && typeof (entries as any)[Symbol.iterator] === 'function') {
        allEntries.push(...(Array.from(entries as any) as GlobPath[]));
      } else {
        // Handle case where glob returns non-iterable result
        console.warn(`Glob returned non-iterable result for pattern "${pattern}" in directory "${searchDir}":`, entries);
      }
    }

    const relativePaths = allEntries.map((p) =>
      path.relative(targetDir, p.fullpath()),
    );

    const { filteredPaths, ignoredCount } =
      fileDiscovery.filterFilesWithReport(relativePaths, {
        respectGitIgnore:
          params?.respect_git_ignore ??
          getFileFilteringOptions()?.respectGitIgnore ??
          DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
        respectCodeboltIgnore:
          params?.respect_codebolt_ignore ??
          getFileFilteringOptions()?.respectCodeboltIgnore ??
          DEFAULT_FILE_FILTERING_OPTIONS.respectCodeboltIgnore,
      });

    const filteredAbsolutePaths = new Set(
      filteredPaths.map((p: string) => path.resolve(targetDir, p)),
    );

    const filteredEntries = allEntries.filter((entry) =>
      filteredAbsolutePaths.has(entry.fullpath()),
    );

    if (!filteredEntries || filteredEntries.length === 0) {
      return {
        matches: [],
        ignoredCount
      };
    }

    // Set filtering such that we first show the most recent files
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const nowTimestamp = new Date().getTime();

    // Sort the filtered entries using the new helper function
    const sortedEntries = sortFileEntries(
      filteredEntries,
      nowTimestamp,
      oneDayInMs,
    );

    const sortedAbsolutePaths = sortedEntries.map((entry: GlobPath) =>
      entry.fullpath(),
    );

    return {
      matches: sortedAbsolutePaths,
      ignoredCount
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`GlobLogic execute Error: ${errorMessage}`, error);
    return {
      matches: [],
      ignoredCount: 0,
      error: {
        message: `Error during glob search operation: ${errorMessage}`,
        type: 'GLOB_EXECUTION_ERROR',
      },
    };
  }
}