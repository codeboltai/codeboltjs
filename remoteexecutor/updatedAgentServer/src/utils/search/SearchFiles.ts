/**
 * Search Files Utility - Searches for content within files
 */

import { executeGrepSearch, type GrepMatch } from './GrepSearch';

/**
 * Parameters for the SearchFiles utility
 */
export interface SearchFilesParams {
    /**
     * The directory path to search in
     */
    path: string;

    /**
     * The regex pattern to search for
     */
    regex: string;

    /**
     * Optional file pattern to filter files
     */
    filePattern?: string;
}

/**
 * Return type for the executeSearchFiles function
 */
export interface SearchFilesResult {
    /**
     * Array of matches found
     */
    matches: GrepMatch[];
    
    /**
     * Error object if an error occurred
     */
    error?: {
        message: string;
        type: string;
    };
}

/**
 * Executes a file search with the provided parameters
 */
export async function executeSearchFiles(
    params: SearchFilesParams,
    targetDir: string,
    workspaceContext: any,
    signal: AbortSignal
): Promise<SearchFilesResult> {
    try {
        // Map SearchFiles parameters to GrepSearchParams
        const grepParams = {
            pattern: params.regex,
            path: params.path,
            include: params.filePattern
        };

        // Use the existing executeGrepSearch function
        const result = await executeGrepSearch(grepParams, targetDir, workspaceContext, signal);
        
        // Return the matches directly
        return {
            matches: result.matches,
            error: result.error
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            matches: [],
            error: {
                message: `Failed to search files: ${errorMessage}`,
                type: 'SEARCH_FILES_ERROR'
            }
        };
    }
}