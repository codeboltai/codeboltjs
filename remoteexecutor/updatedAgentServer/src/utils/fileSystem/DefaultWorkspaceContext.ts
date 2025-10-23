/**
 * Default workspace context implementation
 */

import * as path from 'node:path';
import type { WorkspaceContext } from '../../types/serviceTypes';

/**
 * Default implementation of WorkspaceContext
 */
export class DefaultWorkspaceContext implements WorkspaceContext {
  private directories: string[];

  constructor(directories?: string[]) {
    // Default to current working directory if no directories provided
    this.directories = directories || [process.cwd()];
  }

  /**
   * Get all workspace directories
   */
  getDirectories(): readonly string[] {
    return this.directories;
  }

  /**
   * Check if a path is within any workspace directory
   */
  isPathWithinWorkspace(filePath: string): boolean {
    const absolutePath = path.resolve(filePath);
    return this.directories.some(dir => 
      absolutePath.startsWith(path.resolve(dir))
    );
  }

  /**
   * Add a directory to the workspace
   */
  addDirectory(directory: string): void {
    const absoluteDir = path.resolve(directory);
    if (!this.directories.includes(absoluteDir)) {
      this.directories.push(absoluteDir);
    }
  }

  /**
   * Remove a directory from the workspace
   */
  removeDirectory(directory: string): void {
    const absoluteDir = path.resolve(directory);
    this.directories = this.directories.filter(dir => dir !== absoluteDir);
  }
}

/**
 * Create a default workspace context instance
 */
export function createDefaultWorkspaceContext(directories?: string[]): WorkspaceContext {
  return new DefaultWorkspaceContext(directories);
}