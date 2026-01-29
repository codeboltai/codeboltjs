import { BaseProvider } from '@codebolt/provider';
import codebolt from '@codebolt/codeboltjs';
import type { ProviderInitVars, ProviderStartResult, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Custom Provider Implementation
 *
 * This template provides a starting point for building Codebolt providers.
 * A provider connects the Codebolt application to an external environment
 * (Docker, VM, SSH server, WSL, AWS EC2, etc.) running a remote executor.
 *
 * Customize the methods below based on your environment type.
 */
class MyProvider extends BaseProvider {
  // Store environment-specific state here
  private environmentPath: string | null = null;

  constructor() {
    super({
      agentServerPort: 3001,
      agentServerHost: 'localhost',
      transport: 'websocket',
      reconnectAttempts: 10,
      reconnectDelay: 1000,
      wsRegistrationTimeout: 10000,
      timeouts: {
        agentServerStartup: 60000,
        connection: 30000,
        cleanup: 15000,
      },
    });
  }

  /**
   * REQUIRED: Set up the external environment
   *
   * This is where you create/initialize your isolated environment:
   * - Docker: Create and start a container
   * - Git worktree: Create a worktree branch
   * - SSH: Establish connection to remote server
   * - AWS EC2: Launch or connect to an instance
   * - WSL: Start WSL distribution
   */
  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    console.log(`Setting up environment: ${initVars.environmentName}`);

    // TODO: Implement your environment creation logic
    // Example for a simple local directory:
    this.environmentPath = `/tmp/codebolt-env-${initVars.environmentName}`;
    await fs.mkdir(this.environmentPath, { recursive: true });

    // Store the workspace path for file operations
    this.state.workspacePath = this.environmentPath;
  }

  /**
   * REQUIRED: Set the project context
   *
   * Set `this.state.projectPath` to the base project directory.
   * This is used by the base class for WebSocket URL construction.
   */
  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    // TODO: Set the project path based on your environment
    this.state.projectPath = initVars.projectPath as string || process.cwd();
  }

  /**
   * REQUIRED: Return diff information for changed files
   *
   * Return information about files that have changed in the environment.
   * This is used by the application to show pending changes.
   */
  async onGetDiffFiles(): Promise<any> {
    // TODO: Implement diff detection for your environment
    // For git-based environments, use git diff
    // For other environments, track file modifications
    return { files: [], hasChanges: false };
  }

  /**
   * OPTIONAL: Clean up the environment
   *
   * Called when the provider stops. Clean up all resources:
   * - Docker: Stop and remove container
   * - Git worktree: Remove worktree
   * - SSH: Close connection
   * - AWS EC2: Stop or terminate instance
   */
  protected async teardownEnvironment(): Promise<void> {
    console.log('Tearing down environment');

    // TODO: Implement your cleanup logic
    if (this.environmentPath) {
      try {
        await fs.rm(this.environmentPath, { recursive: true, force: true });
      } catch (error) {
        console.error('Error cleaning up environment:', error);
      }
    }
  }

  /**
   * OPTIONAL: Hook called after WebSocket connection is established
   */
  protected async afterConnected(startResult: ProviderStartResult): Promise<void> {
    console.log('Provider connected to agent server');
    // Start heartbeat monitoring
    this.startHeartbeat();
    this.registerConnectedEnvironment(startResult.environmentName);
    this.startEnvironmentHeartbeat(startResult.environmentName);
  }

  /**
   * OPTIONAL: Hook called before cleanup begins
   */
  protected async beforeClose(): Promise<void> {
    console.log('Provider preparing to close');
    this.stopHeartbeat();
  }

  /**
   * OPTIONAL: Ensure agent server is running
   *
   * Override if you need custom agent server startup logic.
   * The default implementation assumes the agent server is already running.
   */
  protected async ensureAgentServer(): Promise<void> {
    // TODO: Start your agent server if needed
    // For Docker/SSH providers, the agent server typically runs in the remote environment
    console.log('Ensuring agent server is available');
  }

  /**
   * OPTIONAL: Customize workspace path resolution
   */
  protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
    return this.environmentPath || this.state.projectPath || process.cwd();
  }
}

// =============================================================================
// Provider Initialization
// =============================================================================

const provider = new MyProvider();
const handlers = provider.getEventHandlers();

// Register lifecycle handlers
codebolt.onProviderStart((vars) => handlers.onProviderStart(vars));
codebolt.onProviderAgentStart((msg) => handlers.onProviderAgentStart(msg));
codebolt.onProviderStop((vars) => handlers.onProviderStop(vars));
codebolt.onCloseSignal(() => handlers.onCloseSignal());
codebolt.onRawMessage((msg) => handlers.onRawMessage(msg));
codebolt.onGetDiffFiles(() => provider.onGetDiffFiles());

// =============================================================================
// File Operation Handlers
// =============================================================================

// Get the workspace path for file operations
const getWorkspacePath = (): string => {
  return (provider as any).environmentPath || process.cwd();
};

codebolt.onReadFile(async (filePath: string) => {
  const fullPath = path.join(getWorkspacePath(), filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return { success: true, content };
});

codebolt.onWriteFile(async (filePath: string, content: string) => {
  const fullPath = path.join(getWorkspacePath(), filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
  return { success: true };
});

codebolt.onDeleteFile(async (filePath: string) => {
  const fullPath = path.join(getWorkspacePath(), filePath);
  await fs.unlink(fullPath);
  return { success: true };
});

codebolt.onDeleteFolder(async (folderPath: string) => {
  const fullPath = path.join(getWorkspacePath(), folderPath);
  await fs.rm(fullPath, { recursive: true });
  return { success: true };
});

codebolt.onRenameItem(async (oldPath: string, newPath: string) => {
  const oldFullPath = path.join(getWorkspacePath(), oldPath);
  const newFullPath = path.join(getWorkspacePath(), newPath);
  await fs.rename(oldFullPath, newFullPath);
  return { success: true };
});

codebolt.onCreateFolder(async (folderPath: string) => {
  const fullPath = path.join(getWorkspacePath(), folderPath);
  await fs.mkdir(fullPath, { recursive: true });
  return { success: true };
});

codebolt.onCopyFile(async (sourcePath: string, destPath: string) => {
  const sourceFullPath = path.join(getWorkspacePath(), sourcePath);
  const destFullPath = path.join(getWorkspacePath(), destPath);
  await fs.mkdir(path.dirname(destFullPath), { recursive: true });
  await fs.copyFile(sourceFullPath, destFullPath);
  return { success: true };
});

codebolt.onCopyFolder(async (sourcePath: string, destPath: string) => {
  const sourceFullPath = path.join(getWorkspacePath(), sourcePath);
  const destFullPath = path.join(getWorkspacePath(), destPath);
  await fs.cp(sourceFullPath, destFullPath, { recursive: true });
  return { success: true };
});

// =============================================================================
// Project Structure Handlers
// =============================================================================

codebolt.onGetTreeChildren(async (dirPath: string) => {
  const fullPath = dirPath === 'root'
    ? getWorkspacePath()
    : path.join(getWorkspacePath(), dirPath);

  const items = await fs.readdir(fullPath, { withFileTypes: true });
  const result = await Promise.all(
    items.map(async (item) => {
      const itemPath = path.join(fullPath, item.name);
      const stats = await fs.stat(itemPath);
      const relativePath = path.relative(getWorkspacePath(), itemPath);
      return {
        id: relativePath,
        name: item.name,
        path: itemPath,
        isFolder: item.isDirectory(),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
      };
    })
  );
  return result;
});

codebolt.onGetFullProject(async () => {
  // TODO: Implement full project structure return
  return { root: getWorkspacePath(), structure: [] };
});

// =============================================================================
// VCS Handlers (Optional - implement if your environment supports version control)
// =============================================================================

codebolt.onMergeAsPatch(async () => {
  // TODO: Implement patch generation
  return { success: false, message: 'Not implemented' };
});

codebolt.onSendPR(async () => {
  // TODO: Implement PR creation
  return { success: false, message: 'Not implemented' };
});

codebolt.onCreatePatchRequest(async () => {
  // TODO: Implement patch request creation
  return { success: false, message: 'Not implemented' };
});

codebolt.onCreatePullRequestRequest(async () => {
  // TODO: Implement PR request creation
  return { success: false, message: 'Not implemented' };
});

// =============================================================================
// Heartbeat Handlers
// =============================================================================

codebolt.onProviderHeartbeatRequest((request) => {
  return {
    status: 'healthy' as const,
    connectedEnvironments: [(provider as any).state?.environmentName].filter(Boolean),
  };
});

codebolt.onEnvironmentHeartbeatRequest((request) => {
  return {
    status: 'active' as const,
    remoteExecutorStatus: 'running' as const,
  };
});

codebolt.onEnvironmentRestartRequest(async (request) => {
  console.log(`Restart requested for environment: ${request.environmentId}`);
  // TODO: Implement environment restart logic
  return { success: true, message: 'Environment restarted' };
});

console.log('Provider initialized and ready');
