/**
 * List Files Utility - Lists files in a directory
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getErrorMessage } from '../../../utils/errors';

/**
 * Parameters for the ListFiles utility
 */
export interface ListFilesParams {
    /**
     * The directory path to list files from
     */
    path: string;

    /**
     * Whether to list files recursively
     */
    recursive?: boolean;
}

/**
 * Executes a file listing with the provided parameters
 */
export async function executeListFiles(
    params: ListFilesParams
): Promise<{ files?: string[]; error?: any }> {
    try {
        const files: string[] = [];
        const recursive = params.recursive || false;

        const processDirectory = async (currentPath: string) => {
            const entries = fs.readdirSync(currentPath);

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry);
                const stats = fs.statSync(fullPath);

                if (stats.isFile()) {
                    files.push(fullPath);
                } else if (stats.isDirectory() && recursive) {
                    await processDirectory(fullPath);
                }
            }
        };

        await processDirectory(params.path);

        const sortedFiles = files.sort();
        
        return {
            files: sortedFiles
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return {
            error: {
                type: 'LIST_FILES_ERROR',
                message: `Error listing files: ${errorMessage}`
            }
        };
    }
}