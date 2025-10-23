/**
 * Configuration abstraction layer for standalone tools
 */

import type {
  WorkspaceContext,
  FileSystemService,
  FileFilteringOptions
} from './types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Default file system service implementation
 */
export class DefaultFileSystemService implements FileSystemService {
  async readTextFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeTextFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

/**
 * Default workspace context implementation
 */
export class DefaultWorkspaceContext implements WorkspaceContext {
  constructor(private directories: string[]) {
    // Resolve all directories to absolute paths
    this.directories = directories.map(dir => path.resolve(dir));
  }

  getDirectories(): readonly string[] {
    return this.directories;
  }

  isPathWithinWorkspace(targetPath: string): boolean {
    const resolvedPath = path.resolve(targetPath);
    return this.directories.some(dir => {
      const relativePath = path.relative(dir, resolvedPath);
      return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    });
  }
}

/**
 * Simplified configuration interface for standalone tools
 */
export interface ToolsConfig {
  /** Target directory for operations */
  targetDir: string;

  /** Workspace context */
  workspaceContext: WorkspaceContext;

  /** File system service */
  fileSystemService: FileSystemService;

  /** File filtering options */
  fileFilteringOptions?: FileFilteringOptions | undefined;

  /** Debug mode */
  debugMode?: boolean | undefined;

  /** Whether to use approval mode */
  approvalMode?: 'auto' | 'manual' | undefined;

  /** Timeout for operations */
  timeout?: number | undefined;

  /** Proxy configuration */
  proxy?: string | undefined;

  /** Gemini client (optional) */
  geminiClient?: any;

  /** File system interface */
  fileSystem?: {
    readFile: (path: string, encoding: string) => Promise<string>;
    writeFile: (path: string, data: string, encoding: string) => Promise<void>;
  } | undefined;

  /** File service for discovery and filtering */
  getFileService?(): { filterFilesWithReport(filePaths: string[], options: any): { filteredPaths: string[], ignoredCount: number } };

  /** File exclusions for glob operations */
  getFileExclusions?(): { getGlobExcludes(): string[] };

  /** File filtering options getter */
  getFileFilteringOptions?(): FileFilteringOptions;
}

/**
 * Type alias for backward compatibility
 */
export type StandaloneToolConfig = ToolsConfig;

/**
 * Default configuration factory
 */
export function createDefaultConfig(options: {
  targetDir?: string;
  workspaceDirectories?: string[];
  fileFilteringOptions?: FileFilteringOptions;
  debugMode?: boolean;
  approvalMode?: 'auto' | 'manual';
  timeout?: number;
  proxy?: string;
}): ToolsConfig {
  const targetDir = options.targetDir || process.cwd();
  const workspaceDirectories = options.workspaceDirectories || [targetDir];

  const config: ToolsConfig = {
    targetDir,
    workspaceContext: new DefaultWorkspaceContext(workspaceDirectories),
    fileSystemService: new DefaultFileSystemService(),
    fileFilteringOptions: options.fileFilteringOptions || {
      respectGitIgnore: true,
      respectCodeboltIgnore: true,
    },
    debugMode: options.debugMode || false,
    approvalMode: options.approvalMode || 'manual',
    timeout: options.timeout || 30000,
  };
  if (options.proxy) {
    config.proxy = options.proxy;
  }
  return config;
}

/**
/**
 * Configuration manager class
 */
export class ConfigManager implements ToolsConfig {
  private readonly fileFiltering: {
    respectGitIgnore: boolean;
    respectCodeboltIgnore: boolean;
    enableRecursiveFileSearch: boolean;
    disableFuzzySearch: boolean;
  };
  constructor(private config: ToolsConfig) { }

  get targetDir(): string {
    return this.config.targetDir;
  }

  get workspaceContext(): WorkspaceContext {
    return this.config.workspaceContext;
  }

  get fileSystemService(): FileSystemService {
    return this.config.fileSystemService;
  }

  get fileFilteringOptions(): FileFilteringOptions | undefined {
    return this.config.fileFilteringOptions;
  }

  get debugMode(): boolean | undefined {
    return this.config.debugMode;
  }

  get approvalMode(): 'auto' | 'manual' | undefined {
    return this.config.approvalMode;
  }

  get timeout(): number | undefined {
    return this.config.timeout;
  }

  get proxy(): string | undefined {
    return this.config.proxy;
  }

  get geminiClient(): any {
    return this.config.geminiClient;
  }

  get fileSystem(): { readFile: (path: string, encoding: string) => Promise<string>; writeFile: (path: string, data: string, encoding: string) => Promise<void>; } | undefined {
    return this.config.fileSystem;
  }

  getTargetDir(): string {
    return this.config.targetDir;
  }

  getWorkspaceContext(): WorkspaceContext {
    return this.config.workspaceContext;
  }

  getFileSystemService(): FileSystemService {
    return this.config.fileSystemService;
  }

  getFileService(): { filterFilesWithReport(filePaths: string[], options: any): { filteredPaths: string[], ignoredCount: number } } {
    return {
      filterFilesWithReport(filePaths: string[], options: any): { filteredPaths: string[], ignoredCount: number } {
        // Simple implementation - just return all paths for now
        return {
          filteredPaths: filePaths,
          ignoredCount: 0
        };
      }
    };
  }

  getFileExclusions(): { getGlobExcludes(): string[] } {
    return {
      getGlobExcludes(): string[] {
        return [
          '**/node_modules/**',
          '**/.git/**',
          '**/bower_components/**',
          '**/.svn/**',
          '**/.hg/**',
        ];
      }
    };
  }

  getFileFilteringOptions(): FileFilteringOptions {
    return this.config.fileFilteringOptions || { respectGitIgnore: true };
  }

  getDebugMode(): boolean {
    return this.config.debugMode || false;
  }

  getApprovalMode(): 'auto' | 'manual' {
    return this.config.approvalMode || 'manual';
  }

  getTimeout(): number {
    return this.config.timeout || 30000;
  }

  getProxy(): string | undefined {
    return this.config.proxy;
  }

  // Update configuration
  updateConfig(updates: Partial<ToolsConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  getFileFilteringRespectCodeboltIgnore(): boolean {
    return this.fileFiltering.respectCodeboltIgnore;
  }


}