/**
 * Path utilities for tool operations
 */

import * as path from 'path';

/**
 * Shortens a file path for display purposes
 * @param filePath - The full file path
 * @param maxLength - Maximum length of the output (default: 50)
 * @returns Shortened path for display
 */
export function shortenPath(filePath: string, maxLength: number = 50): string {
    if (filePath.length <= maxLength) {
        return filePath;
    }

    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);

    // If just the filename is too long, truncate it
    if (fileName.length >= maxLength - 3) {
        return '...' + fileName.slice(-(maxLength - 3));
    }

    // Split the directory path into parts
    const parts = dirPath.split(path.sep).filter(Boolean);

    // Start with the filename and work backwards
    let result = fileName;
    let currentLength = fileName.length;

    // Add directory parts from the end until we exceed maxLength
    for (let i = parts.length - 1; i >= 0; i--) {
        const partWithSep = path.sep + parts[i];
        if (currentLength + partWithSep.length + 3 <= maxLength) {
            result = parts[i] + path.sep + result;
            currentLength += partWithSep.length;
        } else {
            result = '...' + path.sep + result;
            break;
        }
    }

    return result;
}

/**
 * Makes a path relative to a base directory
 * @param filePath - The absolute file path
 * @param basePath - The base directory path
 * @returns Relative path from base to file
 */
export function makeRelative(filePath: string, basePath: string): string {
    return path.relative(basePath, filePath);
}

/**
 * Ensures a path is absolute
 * @param filePath - The file path (may be relative)
 * @param basePath - The base directory for relative paths
 * @returns Absolute path
 */
export function ensureAbsolute(filePath: string, basePath: string): string {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }
    return path.resolve(basePath, filePath);
}

/**
 * Normalizes a path (resolves . and ..)
 * @param filePath - The file path to normalize
 * @returns Normalized path
 */
export function normalizePath(filePath: string): string {
    return path.normalize(filePath);
}

/**
 * Gets the file extension without the leading dot
 * @param filePath - The file path
 * @returns File extension (e.g., 'ts', 'js', 'json')
 */
export function getExtension(filePath: string): string {
    const ext = path.extname(filePath);
    return ext.startsWith('.') ? ext.slice(1) : ext;
}
