/**
 * SearchService Module
 * 
 * This module provides search operations using utilities from @search/
 * - GrepSearch: Search for content within files using regex patterns
 * - GlobSearch: Search for files using glob patterns
 * - SearchFiles: High-level file content search functionality
 */

import { logger } from '@/main/utils/logger';
import { getErrorMessage } from '../utils/errors';

// Import configuration types
import type { WorkspaceContext, FileSystemService } from '../types/serviceTypes';

// Import utility functions from search utils
import { executeGrepSearch, type GrepSearchParams, type GrepMatch } from '../utils/search/GrepSearch';
import { executeGlobSearch, type GlobSearchParams } from '../utils/search/GlobSearch';
import { executeSearchFiles, type SearchFilesParams } from '../utils/search/SearchFiles';

/**
 * Configuration interface for SearchService
 */
export interface SearchServiceConfig {
  /** Target directory for operations */
  targetDir: string;

  /** Workspace context */
  workspaceContext: WorkspaceContext;

  /** File system service */
  fileSystemService: FileSystemService;

  /** File filtering options */
  fileFilteringOptions?: {
    respectGitIgnore?: boolean;
    respectCodeboltIgnore?: boolean;
  };

  /** Debug mode */
  debugMode?: boolean;
}

/**
 * Grep match result interface
 */
export interface GrepMatchResult {
  filePath: string;
  lineNumber: number;
  line: string;
}

/**
 * Search Service class providing search operation functions
 */
export class SearchService {
  private static instances: Map<string, SearchService> = new Map();
  private config: SearchServiceConfig;

  private constructor(config: SearchServiceConfig) {
    this.config = config;
  }

  public static getInstance(config: SearchServiceConfig): SearchService {
    const instanceKey = `${config.targetDir}-${config.workspaceContext.getDirectories().join(',')}`;
    
    if (!SearchService.instances.has(instanceKey)) {
      SearchService.instances.set(instanceKey, new SearchService(config));
    }
    return SearchService.instances.get(instanceKey)!;
  }

  /**
   * Search for content within files using GrepSearch utility
   */
  async searchFileContent(
    pattern: string,
    searchPath?: string,
    options?: {
      include?: string;
    }
  ): Promise<{
    success: boolean;
    matches?: GrepMatchResult[];
    error?: string;
  }> {
    try {
      // Use GrepSearch utility to search file content
      const params: GrepSearchParams = {
        pattern,
        path: searchPath,
        include: options?.include,
      };
      
      // Create an AbortController for the signal
      const controller = new AbortController();
      
      const result = await executeGrepSearch(params, this.config.targetDir, this.config.workspaceContext, controller.signal);
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      // Convert matches to the expected format
      const matches: GrepMatchResult[] = (result.matches || []).map(match => ({
        filePath: match.filePath,
        lineNumber: match.lineNumber,
        line: match.line,
      }));
      
      return {
        success: true,
        matches: matches,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error searching file content: ${errorMessage}`,
      };
    }
  }

  /**
   * Search for files using glob patterns using GlobSearch utility
   */
  async globSearch(
    pattern: string,
    searchPath?: string,
    options?: {
      caseSensitive?: boolean;
      respectGitIgnore?: boolean;
      respectCodeboltIgnore?: boolean;
    }
  ): Promise<{
    success: boolean;
    files?: string[];
    error?: string;
    gitIgnoredCount?: number;
    codeboltIgnoredCount?: number;
  }> {
    try {
      // Use GlobSearch utility to search for files
      const params: GlobSearchParams = {
        pattern,
        path: searchPath,
        case_sensitive: options?.caseSensitive,
        respect_git_ignore: options?.respectGitIgnore,
        respect_codebolt_ignore: options?.respectCodeboltIgnore,
      };
      
      // Create an AbortController for the signal
      const controller = new AbortController();
      
      // Mock the required functions for the utility
      const getFileService = () => ({
        filterFilesWithReport: (paths: string[], options: any) => ({
          filteredPaths: paths,
          gitIgnoredCount: 0,
          codeboltIgnoredCount: 0,
          ignoredCount: 0,
        }),
      });
      const getFileExclusions = () => ({
        getGlobExcludes: () => [],
      });
      const getFileFilteringOptions = () => undefined;
      
      const result = await executeGlobSearch(
        params, 
        this.config.targetDir, 
        this.config.workspaceContext,
        getFileService,
        getFileExclusions,
        getFileFilteringOptions,
        controller.signal
      );
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      return {
        success: true,
        files: result.matches,
        gitIgnoredCount: 0,
        codeboltIgnoredCount: 0
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error in glob search: ${errorMessage}`,
      };
    }
  }

  /**
   * High-level file search using SearchFiles utility
   */
  async searchFiles(
    path: string,
    regex: string,
    filePattern?: string
  ): Promise<{
    success: boolean;
    matches?: GrepMatchResult[];
    error?: string;
  }> {
    try {
      // Use SearchFiles utility for high-level search
      const params: SearchFilesParams = {
        path,
        regex,
        filePattern,
      };
      
      const controller = new AbortController();
      const result = await executeSearchFiles(params, this.config.targetDir, this.config.workspaceContext, controller.signal);
      
      // Parse the result to match expected return format
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }
      
      // Convert matches to the expected format
      const matches: GrepMatchResult[] = (result.matches || []).map(match => ({
        filePath: match.filePath,
        lineNumber: match.lineNumber,
        line: match.line,
      }));
      
      return {
        success: true,
        matches: matches,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error in file search: ${errorMessage}`,
      };
    }
  }

  /**
   * List files recursively using glob patterns
   */
  async listFiles(
    pattern: string = '**/*',
    searchPath?: string,
    options?: {
      respectGitIgnore?: boolean;
      respectCodeboltIgnore?: boolean;
    }
  ): Promise<{
    success: boolean;
    files?: string[];
    error?: string;
  }> {
    try {
      // Use glob search to list files
      const result = await this.globSearch(pattern, searchPath, {
        respectGitIgnore: options?.respectGitIgnore,
        respectCodeboltIgnore: options?.respectCodeboltIgnore,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        files: result.files?.sort(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        error: `Error listing files: ${errorMessage}`,
      };
    }
  }
}

/**
 * Create a default SearchService instance using singleton pattern
 */
export function createSearchService(config: SearchServiceConfig): SearchService {
  return SearchService.getInstance(config);
}

/**
 * Export all the core functions for standalone use
 */
export const searchServiceFunctions = {
  searchFileContent: (config: SearchServiceConfig, pattern: string, searchPath?: string, options?: any) =>
    SearchService.getInstance(config).searchFileContent(pattern, searchPath, options),
  globSearch: (config: SearchServiceConfig, pattern: string, searchPath?: string, options?: any) =>
    SearchService.getInstance(config).globSearch(pattern, searchPath, options),
  searchFiles: (config: SearchServiceConfig, path: string, regex: string, filePattern?: string) =>
    SearchService.getInstance(config).searchFiles(path, regex, filePattern),
  listFiles: (config: SearchServiceConfig, pattern?: string, searchPath?: string, options?: any) =>
    SearchService.getInstance(config).listFiles(pattern, searchPath, options),
};
