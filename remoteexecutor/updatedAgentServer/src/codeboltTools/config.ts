/**
 * Configuration abstraction layer for standalone tools
 */

import type {
  WorkspaceContext,
  FileSystemService,
  FileFilteringOptions
} from './types';
import type { FileServices } from '../services/FileServices';
import { DefaultFileSystem } from '../fsutils/DefaultFileSystem';
import { DefaultWorkspaceContext } from '../fsutils/DefaultWorkspaceContext';

export { DefaultFileSystem, DefaultWorkspaceContext };

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

  /** File services instance */
  fileServices?: FileServices;
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
  fileServices?: FileServices;
}): ToolsConfig {
  const targetDir = options.targetDir || process.cwd();
  const workspaceDirectories = options.workspaceDirectories || [targetDir];

  const config: ToolsConfig = {
    targetDir,
    workspaceContext: new DefaultWorkspaceContext(workspaceDirectories),
    fileSystemService: new DefaultFileSystem(),
    fileFilteringOptions: options.fileFilteringOptions || {
      respectGitIgnore: true,
      respectGeminiIgnore: true,
    },
    debugMode: options.debugMode || false,
    approvalMode: options.approvalMode || 'manual',
    timeout: options.timeout || 30000,
  };
  if (options.proxy) {
    config.proxy = options.proxy;
  }
  if (options.fileServices) {
    config.fileServices = options.fileServices;
  }
  return config;
}

/**
/**
 * Configuration manager class
 */
export class ConfigManager implements ToolsConfig {
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

  getFileServices(): FileServices | undefined {
    return this.config.fileServices;
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

  // Helper methods to create service instances
  createFileServices() {
    if (!this.config.fileServices) {
      const { createFileServices } = require('../services');
      this.config.fileServices = createFileServices({
        targetDir: this.config.targetDir,
        workspaceContext: this.config.workspaceContext,
        fileSystemService: this.config.fileSystemService,
        fileFilteringOptions: this.config.fileFilteringOptions,
        approvalMode: this.config.approvalMode,
        debugMode: this.config.debugMode,
      });
    }
    return this.config.fileServices;
  }

  createTerminalService() {
    const { createTerminalService } = require('../services');
    return createTerminalService({
      targetDir: this.config.targetDir,
      debugMode: this.config.debugMode,
      timeout: this.config.timeout,
    });
  }

  createDirectoryService() {
    const { createDirectoryService } = require('../services');
    return createDirectoryService({
      targetDir: this.config.targetDir,
      debugMode: this.config.debugMode,
      fileFilteringOptions: this.config.fileFilteringOptions,
    });
  }

  createSearchService() {
    const { createSearchService } = require('../services');
    return createSearchService({
      targetDir: this.config.targetDir,
      debugMode: this.config.debugMode,
      fileFilteringOptions: this.config.fileFilteringOptions,
    });
  }
}