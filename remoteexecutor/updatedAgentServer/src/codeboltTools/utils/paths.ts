/**
 * Path utility functions
 */

import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Make a path relative to a base directory
 */
export function makeRelative(filePath: string, baseDir: string): string {
  const relativePath = path.relative(baseDir, filePath);
  return relativePath || '.';
}

/**
 * Shorten a path for display purposes
 */
export function shortenPath(filePath: string, maxLength: number = 60): string {
  if (filePath.length <= maxLength) {
    return filePath;
  }
  
  const parts = filePath.split(path.sep);
  if (parts.length <= 2) {
    return filePath;
  }
  
  // Try to keep the filename and parent directory
  const fileName = parts[parts.length - 1];
  const parentDir = parts[parts.length - 2];
  const shortened = `...${path.sep}${parentDir}${path.sep}${fileName}`;
  
  if (shortened.length <= maxLength) {
    return shortened;
  }
  
  // Just show the filename with ellipsis
  return `...${path.sep}${fileName}`;
}

/**
 * Convert absolute path to use tilde for home directory
 */
export function tildeifyPath(filePath: string): string {
  const homeDir = os.homedir();
  if (filePath.startsWith(homeDir)) {
    return filePath.replace(homeDir, '~');
  }
  return filePath;
}