import { logger } from '@/utils/logger';
import * as path from 'node:path';

// Import service classes
import {
  SearchFileContent,
  createSearchFileContent,
  type SearchFileContentConfig,
  type SearchFileContentResult,
  type SearchFileContentParams,
} from './SearchFileContent';
import {
  GlobSearch,
  createGlobSearch,
  type GlobSearchConfig,
  type GlobSearchResult,
  type GlobSearchParams,
} from './GlobSearch';

// Import configuration types
import type { WorkspaceContext } from '../types/serviceTypes';

/**
 * Configuration interface for Search
 */
export interface SearchConfig {
  /** Target directory for operations */
  targetDir: string;
  
  /** Workspace context */
  workspaceContext: WorkspaceContext;
  
  /** File filtering options */
  fileFilteringOptions?: {
    respectGitIgnore?: boolean;
    respectGeminiIgnore?: boolean;
  };
  
  /** Debug mode */
  debugMode?: boolean;
}

/**
 * Search match result interface (alias for GrepMatch from serviceTypes)
 */
export interface SearchMatch {
  filePath: string;
  lineNumber: number;
  line: string;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  /** File pattern to filter results */
  filePattern?: string;
  
  /** Whether to search recursively */
  recursive?: boolean;
  
  /** Whether to ignore case */
  ignoreCase?: boolean;
  
  /** Maximum number of results to return */
  maxResults?: number;
}

/**
 * Search Service class providing standalone search functions
 */
export class Search {
  private static instances: Map<string, Search> = new Map();
  private config: SearchConfig;
  
  // Service instances
  private searchFileContent: SearchFileContent;
  private globSearch: GlobSearch;
  
  private constructor(config: SearchConfig) {
    this.config = config;
    
    // Initialize service instances
    this.searchFileContent = createSearchFileContent({
      workspaceContext: config.workspaceContext
    });
    
    this.globSearch = createGlobSearch({
      workspaceContext: config.workspaceContext
    });
  }

  public static getInstance(config: SearchConfig): Search {
    const instanceKey = `${config.targetDir}-${config.workspaceContext.getDirectories().join(',')}`;
    
    if (!Search.instances.has(instanceKey)) {
      Search.instances.set(instanceKey, new Search(config));
    }
    return Search.instances.get(instanceKey)!;
  }

  /**
   * Search for content within files using SearchFileContent
   */
  async searchFiles(
    searchPath: string,
    regex: string,
    options?: SearchOptions
  ): Promise<{
    success: boolean;
    matches?: SearchMatch[];
    error?: string;
  }> {
    const params: SearchFileContentParams = {
      pattern: regex,
      path: searchPath,
      include: options?.filePattern,
    };

    // Validate parameters using SearchFileContent
    const validationError = this.searchFileContent.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use SearchFileContent to search file content
    const result: SearchFileContentResult = await this.searchFileContent.searchFileContent(params);

    // Apply max results limit if specified
    let matches = result.matches || [];
    if (options?.maxResults && matches.length > options.maxResults) {
      matches = matches.slice(0, options.maxResults);
    }

    return {
      success: result.success,
      matches,
      error: result.error,
    };
  }

  /**
   * Search for files using glob patterns using GlobSearch
   */
  async searchFilesByGlob(
    pattern: string,
    searchPath?: string,
    options?: {
      caseSensitive?: boolean;
      respectGitIgnore?: boolean;
      respectGeminiIgnore?: boolean;
    }
  ): Promise<{
    success: boolean;
    files?: string[];
    error?: string;
    gitIgnoredCount?: number;
    geminiIgnoredCount?: number;
  }> {
    const params: GlobSearchParams = {
      pattern,
      path: searchPath,
      case_sensitive: options?.caseSensitive,
      respect_git_ignore: options?.respectGitIgnore,
      respect_gemini_ignore: options?.respectGeminiIgnore,
    };

    // Validate parameters using GlobSearch
    const validationError = this.globSearch.validateParams(params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Use GlobSearch to search for files
    const result: GlobSearchResult = await this.globSearch.globSearch(params);

    return {
      success: result.success,
      files: result.files,
      error: result.error,
      gitIgnoredCount: result.gitIgnoredCount,
      geminiIgnoredCount: result.geminiIgnoredCount,
    };
  }
}

/**
 * Create a default Search instance using singleton pattern
 */
export function createSearch(config: SearchConfig): Search {
  return Search.getInstance(config);
}

/**
 * Export all the core functions for standalone use
 */
export const searchFunctions = {
  searchFiles: (config: SearchConfig, searchPath: string, regex: string, options?: SearchOptions) =>
    Search.getInstance(config).searchFiles(searchPath, regex, options),
  searchFilesByGlob: (config: SearchConfig, pattern: string, searchPath?: string, options?: any) =>
    Search.getInstance(config).searchFilesByGlob(pattern, searchPath, options),
};