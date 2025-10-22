/**
 * Default file system service implementation
 */

import * as fs from 'node:fs/promises';
import type { FileSystemService } from '../types/serviceTypes';

/**
 * Default implementation of FileSystemService using Node.js fs module
 */
export class DefaultFileSystem implements FileSystemService {
  /**
   * Read text content from a file
   */
  async readTextFile(path: string): Promise<string> {
    return await fs.readFile(path, 'utf-8');
  }

  /**
   * Write text content to a file
   */
  async writeTextFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }
}

/**
 * Create a default file system service instance
 */
export function createDefaultFileSystem(): FileSystemService {
  return new DefaultFileSystem();
}