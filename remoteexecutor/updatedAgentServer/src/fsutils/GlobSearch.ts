import { logger } from '../utils/logger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob, escape } from 'glob';
import { getErrorMessage } from '../utils/errors';
import type { WorkspaceContext } from '../types/serviceTypes';

/**
 * Configuration interface for GlobSearch
 */
export interface GlobSearchConfig {
  /** Workspace context */
  workspaceContext: WorkspaceContext;
}

/**
 * File filtering options
 */
export interface FileFilteringOptions {
  respectGitIgnore: boolean;
  respectCodeboltIgnore: boolean;
}

/**
 * Subset of 'Path' interface provided by 'glob' that we can implement for testing
 */
export interface GlobPath {
  fullpath(): string;
  mtimeMs?: number;
}

/**
 * Result interface for glob search
 */
export interface GlobSearchResult {
  success: boolean;
  files?: string[];
  error?: string;
  gitIgnoredCount?: number;
  geminiIgnoredCount?: number;
}

/**
 * Parameters for glob search
 */
export interface GlobSearchParams {
  pattern: string;
  path?: string;
  case_sensitive?: boolean;
  respect_git_ignore?: boolean;
  respect_gemini_ignore?: boolean;
}

/**
 * Filter report for file filtering
 */
interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  geminiIgnoredCount: number;
}

/**
 * Service for glob search with exact logic from GlobTool
 */
export class GlobSearch {
  private config: GlobSearchConfig;

  constructor(config: GlobSearchConfig) {
    this.config = config;
  }

  /**
   * Default file filtering options for memory files
   */
  private readonly DEFAULT_MEMORY_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
    respectGitIgnore: false,
    respectCodeboltIgnore: true,
  };

  /**
   * Default file filtering options for all other files
   */
  private readonly DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
    respectGitIgnore: true,
    respectCodeboltIgnore: true,
  };

  /**
   * Sorts file entries based on recency and then alphabetically.
   */
  private sortFileEntries(
    entries: GlobPath[],
    nowTimestamp: number,
    recencyThresholdMs: number,
  ): GlobPath[] {
    const sortedEntries = [...entries];
    sortedEntries.sort((a, b) => {
      const mtimeA = a.mtimeMs ?? 0;
      const mtimeB = b.mtimeMs ?? 0;
      const aIsRecent = nowTimestamp - mtimeA < recencyThresholdMs;
      const bIsRecent = nowTimestamp - mtimeB < recencyThresholdMs;

      if (aIsRecent && bIsRecent) {
        return mtimeB - mtimeA;
      } else if (aIsRecent) {
        return -1;
      } else if (bIsRecent) {
        return 1;
      } else {
        return a.fullpath().localeCompare(b.fullpath());
      }
    });
    return sortedEntries;
  }

  /**
   * Checks if a file should be ignored based on git ignore patterns
   */
  private shouldGitIgnoreFile(filePath: string): boolean {
    // Basic git ignore patterns
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
      const regex = new RegExp(
        pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'),
      );
      return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
    });
  }

  /**
   * Checks if a file should be ignored based on gemini ignore patterns
   */
  private shouldCodeboltIgnoreFile(filePath: string): boolean {
    // Basic gemini ignore patterns (you may want to expand this)
    const geminiIgnorePatterns = ['.gemini/**', '.geminiignore', '.codebolt/**'];

    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);

    return geminiIgnorePatterns.some((pattern) => {
      const regex = new RegExp(
        pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'),
      );
      return regex.test(filePath) || regex.test(fileName) || regex.test(dirPath);
    });
  }

  /**
   * Filters a list of file paths based on git ignore and gemini ignore rules
   * and returns a report with counts of ignored files.
   */
  private filterFilesWithReport(
    filePaths: string[],
    opts: FileFilteringOptions = this.DEFAULT_FILE_FILTERING_OPTIONS,
  ): FilterReport {
    const filteredPaths: string[] = [];
    let gitIgnoredCount = 0;
    let geminiIgnoredCount = 0;

    for (const filePath of filePaths) {
      if (opts.respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
        gitIgnoredCount++;
        continue;
      }

      if (opts.respectCodeboltIgnore && this.shouldCodeboltIgnoreFile(filePath)) {
        geminiIgnoredCount++;
        continue;
      }

      filteredPaths.push(filePath);
    }

    return {
      filteredPaths,
      gitIgnoredCount,
      geminiIgnoredCount,
    };
  }

  /**
   * Perform glob search with exact logic from GlobTool
   */
  async globSearch(params: GlobSearchParams, signal?: AbortSignal): Promise<GlobSearchResult> {
    try {
      const workspaceContext = this.config.workspaceContext;
      const workspaceDirectories = workspaceContext.getDirectories();

      // If a specific path is provided, resolve it and check if it's within workspace
      let searchDirectories: readonly string[];
      if (params.path) {
        const searchDirAbsolute = path.resolve(
          process.cwd(),
          params.path,
        );
        if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
          const rawError = `Error: Path "${params.path}" is not within any workspace directory`;
          return {
            success: false,
            error: rawError,
          };
        }
        searchDirectories = [searchDirAbsolute];
      } else {
        // Search across all workspace directories
        searchDirectories = workspaceDirectories;
      }

      const defaultIgnorePatterns = [
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

      // Collect entries from all search directories
      const allEntries: GlobPath[] = [];
      for (const searchDir of searchDirectories) {
        let pattern = params.pattern;

        // Debug logging
        console.log(`Searching in directory: ${searchDir}`);
        console.log(`Pattern: ${pattern}`);

        // Check if the pattern is a direct file path
        const fullPath = path.join(searchDir, pattern);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          pattern = escape(pattern);
          console.log(`Pattern escaped to: ${pattern}`);
        }

        const entries = await glob(pattern, {
          cwd: searchDir,
          withFileTypes: true,
          nodir: true,
          stat: true,
          nocase: !params.case_sensitive,
          dot: true,
          ignore: defaultIgnorePatterns,
          follow: false,
          signal,
        });

        console.log(
          `Glob result type: ${typeof entries}, isArray: ${Array.isArray(entries)}`,
        );

        // The glob function should return an array when awaited
        const entriesArray = Array.isArray(entries) ? entries : [];

        console.log(
          `Found ${entriesArray.length} entries for pattern "${pattern}"`,
        );

        allEntries.push(...entriesArray);
      }

      const relativePaths = allEntries.map((p) =>
        path.relative(process.cwd(), p.fullpath()),
      );

      const { filteredPaths, gitIgnoredCount, geminiIgnoredCount } =
        this.filterFilesWithReport(relativePaths, {
          respectGitIgnore:
            params?.respect_git_ignore ??
            this.DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
          respectCodeboltIgnore:
            params?.respect_gemini_ignore ??
            this.DEFAULT_FILE_FILTERING_OPTIONS.respectCodeboltIgnore,
        });

      const filteredAbsolutePaths = new Set(
        filteredPaths.map((p) => path.resolve(process.cwd(), p)),
      );

      const filteredEntries = allEntries.filter((entry) =>
        filteredAbsolutePaths.has(entry.fullpath()),
      );

      if (!filteredEntries || filteredEntries.length === 0) {
        let message = `No files found matching pattern "${params.pattern}"`;
        if (searchDirectories.length === 1) {
          message += ` within ${searchDirectories[0]}`;
        } else {
          message += ` within ${searchDirectories.length} workspace directories`;
        }
        if (gitIgnoredCount > 0) {
          message += ` (${gitIgnoredCount} files were git-ignored)`;
        }
        if (geminiIgnoredCount > 0) {
          message += ` (${geminiIgnoredCount} files were gemini-ignored)`;
        }
        return {
          success: true,
          files: [],
          gitIgnoredCount,
          geminiIgnoredCount,
        };
      }

      // Set filtering such that we first show the most recent files
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const nowTimestamp = new Date().getTime();

      // Sort the filtered entries using the new helper function
      const sortedEntries = this.sortFileEntries(
        filteredEntries,
        nowTimestamp,
        oneDayInMs,
      );

      const sortedAbsolutePaths = sortedEntries.map((entry) =>
        entry.fullpath(),
      );

      return {
        success: true,
        files: sortedAbsolutePaths,
        gitIgnoredCount,
        geminiIgnoredCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`GlobSearch execute Error: ${errorMessage}`, error);
      const rawError = `Error during glob search operation: ${errorMessage}`;
      return {
        success: false,
        error: rawError,
      };
    }
  }

  /**
   * Validate parameters for glob search
   */
  validateParams(params: GlobSearchParams): string | null {
    // Validate pattern
    if (
      !params.pattern ||
      typeof params.pattern !== 'string' ||
      params.pattern.trim() === ''
    ) {
      return "The 'pattern' parameter cannot be empty.";
    }

    // Only validate path if one is provided
    if (params.path) {
      try {
        const searchDirAbsolute = path.resolve(
          process.cwd(),
          params.path,
        );

        // Security Check: Ensure the resolved path is within workspace boundaries
        const workspaceDirectories =
          this.config.workspaceContext?.getDirectories() || [
            process.cwd(),
          ];
        const isWithinWorkspace = workspaceDirectories.some((dir: string) =>
          searchDirAbsolute.startsWith(path.resolve(dir)),
        );

        if (!isWithinWorkspace) {
          return `Search path ("${params.path}") resolves outside the allowed workspace directories: ${workspaceDirectories.join(', ')}`;
        }

        // Check existence and type after resolving
        if (!fs.existsSync(searchDirAbsolute)) {
          return `Search path does not exist ${searchDirAbsolute}`;
        }

        const stats = fs.statSync(searchDirAbsolute);
        if (!stats.isDirectory()) {
          return `Search path is not a directory: ${searchDirAbsolute}`;
        }
      } catch (e: unknown) {
        return `Error accessing search path: ${e}`;
      }
    }

    return null;
  }
}

/**
 * Create a GlobSearch instance
 */
export function createGlobSearch(config: GlobSearchConfig): GlobSearch {
  return new GlobSearch(config);
}