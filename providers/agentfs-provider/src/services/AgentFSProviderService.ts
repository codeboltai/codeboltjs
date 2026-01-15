import {
    BaseProvider,
    ProviderStartResult,
} from '@codebolt/provider';
import {
    AgentStartMessage,
    ProviderInitVars,
    RawMessageForAgent,
} from '@codebolt/types/provider';
import {
    IProviderService,
    ProviderConfig,
    DiffResult
} from '../interfaces/IProviderService';
import { createPrefixedLogger, Logger } from '../utils/logger';
import {
    startAgentServer as startAgentServerUtil,
    stopAgentServer as stopAgentServerUtil,
    isAgentServerRunning as isAgentServerRunningUtil,
} from '../utils/agentServer';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class AgentFSProviderService extends BaseProvider implements IProviderService {
    private readonly providerConfig: ProviderConfig;
    private readonly logger: Logger;
    private projectPath: string | null = null;
    private agentFSBinary: string;

    constructor(config: ProviderConfig = {}) {
        super({
            agentServerPort: config.agentServerPort ?? 3001,
            agentServerHost: config.agentServerHost ?? 'localhost',
            wsRegistrationTimeout: config.timeouts?.wsConnection ?? 10_000,
            reconnectAttempts: 10,
            reconnectDelay: 1_000,
            transport: 'websocket',
        });

        this.providerConfig = {
            agentServerPort: config.agentServerPort ?? 3001,
            agentServerHost: config.agentServerHost ?? 'localhost',
            agentFSBinaryPath: config.agentFSBinaryPath ?? 'agentfs',
            timeouts: {
                agentServerStartup: config.timeouts?.agentServerStartup ?? 60_000,
                wsConnection: config.timeouts?.wsConnection ?? 30_000,
                gitOperations: config.timeouts?.gitOperations ?? 30_000,
                cleanup: config.timeouts?.cleanup ?? 15_000,
            }
        };

        this.agentFSBinary = this.providerConfig.agentFSBinaryPath!;
        this.logger = createPrefixedLogger('[AgentFS Provider]');
    }

    async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
        this.logger.log('Starting provider with environment:', initVars.environmentName);
        let projectPath = initVars.projectPath as string | undefined;
        if (!projectPath) {
            throw new Error('Project path is not available in initVars');
        }

        // Mount Logic
        const mountPoint = path.join(projectPath, `.agentfs_mnt_${initVars.environmentName}`);

        try {
            const { mkdir } = await import('fs/promises');
            await mkdir(mountPoint, { recursive: true });

            this.logger.log(`Mounting agentfs ${initVars.environmentName} to ${mountPoint}`);

            // agentfs mount [ID] [MOUNT_POINT]
            await this.runAgentFSCommand(['mount', initVars.environmentName, mountPoint]);

            // Wait for mount to stabilize
            await new Promise(r => setTimeout(r, 1000));

            this.projectPath = mountPoint;
        } catch (error: any) {
            this.logger.warn('Failed to mount agentfs, using raw project path (TEST MODE only):', error);
            // Fallback for tests or if mount fails but we want to inspect
            this.projectPath = projectPath;
        }

        const result = await super.onProviderStart(initVars);
        this.logger.log('Started Environment with mounted path:', this.projectPath);

        return {
            ...result,
            worktreePath: this.projectPath!,
        };
    }

    async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
        this.logger.log('Agent start requested, forwarding to agent server:', agentMessage);
        await this.ensureAgentServer();

        // Ensure transport is connected if we have environment state
        if (!this.agentServer.isConnected && this.state.environmentName) {
            this.logger.log('Agent server not connected, attempting to reconnect transport...');
            await this.ensureTransportConnection({
                environmentName: this.state.environmentName,
                projectPath: this.state.projectPath ?? undefined
            } as any);
        }

        this.logger.log('Agent server connected, forwarding agent start to agent server...', agentMessage);
        await super.onProviderAgentStart(agentMessage);
    }

    async onProviderStop(initVars: ProviderInitVars): Promise<void> {
        this.logger.log('Provider stop requested for environment:', initVars.environmentName);
        try {
            await this.stopAgentServer();

            if (this.projectPath && this.projectPath.includes('.agentfs_mnt')) {
                this.logger.log(`Unmounting ${this.projectPath}...`);
                try {
                    const { exec } = await import('child_process');
                    const execP = promisify(exec);
                    try {
                        // MacOS
                        await execP(`umount "${this.projectPath}"`);
                    } catch (e) {
                        // Linux fallback
                        try {
                            await execP(`fusermount -u "${this.projectPath}"`);
                        } catch (e2) {
                            this.logger.warn('Unmount failed with both umount and fusermount via shell, trying force...');
                        }
                    }

                    // Clean dir
                    const { rm } = await import('fs/promises');
                    await rm(this.projectPath, { recursive: true, force: true });
                } catch (e) {
                    this.logger.error('Error during unmount/cleanup:', e);
                }
            }

            this.resetState();
            this.logger.log('Provider stopped successfully');
        } catch (error) {
            this.logger.error('Error stopping provider:', error);
            throw error;
        }
    }

    // File System Operations - Using Standard FS on Mount Point

    // AgentFS specific helper - strictly for CLI commands like mount
    private async runAgentFSCommand(args: string[]): Promise<string> {
        try {
            const command = `${this.agentFSBinary} ${args.join(' ')}`;
            // We run from where? Maybe doesn't matter for specific commands.
            const { stdout } = await execAsync(command);
            return stdout;
        } catch (error: any) {
            this.logger.error(`Error running agentfs command: ${args.join(' ')}`, error);
            throw new Error(`AgentFS command failed: ${error.message}`);
        }
    }

    async onReadFile(filePath: string): Promise<string> {
        this.logger.log('Reading file:', filePath);
        const { readFile } = await import('fs/promises');
        return readFile(path.join(this.projectPath!, filePath), 'utf-8');
    }

    async onWriteFile(filePath: string, content: string): Promise<void> {
        this.logger.log('Writing file:', filePath);
        const { writeFile, mkdir } = await import('fs/promises');
        const fullPath = path.join(this.projectPath!, filePath);
        await mkdir(path.dirname(fullPath), { recursive: true });
        await writeFile(fullPath, content, 'utf-8');
    }

    async onDeleteFile(filePath: string): Promise<void> {
        this.logger.log('Deleting file:', filePath);
        const { unlink } = await import('fs/promises');
        await unlink(path.join(this.projectPath!, filePath));
    }

    async onDeleteFolder(folderPath: string): Promise<void> {
        this.logger.log('Deleting folder:', folderPath);
        const { rm } = await import('fs/promises');
        await rm(path.join(this.projectPath!, folderPath), { recursive: true, force: true });
    }

    async onRenameItem(oldPath: string, newPath: string): Promise<void> {
        this.logger.log('Renaming item:', oldPath, 'to', newPath);
        const { rename } = await import('fs/promises');
        await rename(path.join(this.projectPath!, oldPath), path.join(this.projectPath!, newPath));
    }

    async onCreateFolder(folderPath: string): Promise<void> {
        this.logger.log('Creating folder:', folderPath);
        const { mkdir } = await import('fs/promises');
        await mkdir(path.join(this.projectPath!, folderPath), { recursive: true });
    }

    async onGetProject(parentId: string = 'root'): Promise<any[]> {
        const { readdir, stat } = await import('fs/promises');
        const parentPath = parentId === 'root' ? this.projectPath! : path.join(this.projectPath!, parentId);

        try {
            const items = await readdir(parentPath, { withFileTypes: true });

            const children = await Promise.all(items.map(async (item) => {
                if (item.name.startsWith('.') && item.name !== '.codebolt') return null;

                const itemPath = path.join(parentPath, item.name);
                const relativePath = parentId === 'root' ? item.name : path.join(parentId, item.name);
                const stats = await stat(itemPath);

                return {
                    id: relativePath,
                    name: item.name,
                    path: itemPath,
                    isFolder: item.isDirectory(),
                    size: item.isDirectory() ? 0 : stats.size,
                    lastModified: stats.mtime.toISOString()
                };
            }));

            return children.filter(Boolean).sort((a: any, b: any) => {
                if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
                return a.isFolder ? -1 : 1;
            });
        } catch (e) {
            this.logger.error('Error listing project:', e);
            return [];
        }
    }

    // Worktree / Environment Management
    async createWorktree(projectPath: string, environmentName: string): Promise<any> {
        // AgentFS treats the project path as the environment
        return {
            path: projectPath,
            branch: environmentName,
            isCreated: true
        };
    }

    async removeWorktree(projectPath: string): Promise<boolean> {
        // No-op for AgentFS as we don't manage separate worktrees usually
        return true;
    }

    getWorktreeInfo(): any {
        return {
            path: this.projectPath,
            branch: this.state.environmentName,
            isCreated: !!this.projectPath
        };
    }

    // Git specific operations - might not apply or need connection to agentfs versioning
    async onGetDiffFiles(): Promise<DiffResult> {
        return { files: [] };
    }

    async onMergeAsPatch(): Promise<string> {
        return 'Not implemented';
    }

    async onSendPR(): Promise<void> {
        // Not implemented
    }

    onCreatePatchRequest(): void {
        // Not implemented
    }

    onCreatePullRequestRequest(): void {
        // Not implemented
    }

    async onUserMessage(userMessage: RawMessageForAgent): Promise<void> {
        this.logger.log('onUserMessage received:', userMessage?.messageId);
        await super.onRawMessage(userMessage);
    }

    // Agent Server Management
    async startAgentServer(): Promise<void> {
        this.logger.log('Starting agent server...');
        if (this.agentServer.process && !this.agentServer.process.killed) {
            return;
        }

        this.agentServer.process = await startAgentServerUtil({
            logger: this.logger,
            port: this.providerConfig.agentServerPort,
            projectPath: this.projectPath ?? undefined
        });

        this.agentServer.process.on('exit', (code, signal) => {
            this.logger.warn(`Agent Server exited: ${code} ${signal}`);
            this.agentServer.process = null;
            this.agentServer.isConnected = false;
        });
    }

    async connectToAgentServer(worktreePath: string, environmentName: string): Promise<void> {
        if (this.agentServer.isConnected) return;
        await this.ensureTransportConnection({ environmentName, type: 'agentfs' });
    }

    async stopAgentServer(): Promise<boolean> {
        const result = await stopAgentServerUtil({
            logger: this.logger,
            processRef: this.agentServer.process,
        });
        this.agentServer.process = null;
        return result;
    }

    async sendMessageToAgent(message: RawMessageForAgent): Promise<boolean> {
        return await this.sendToAgentServer(message);
    }

    getAgentServerConnection() {
        return {
            process: this.agentServer.process,
            wsConnection: this.agentServer.wsConnection,
            serverUrl: this.agentServer.serverUrl,
            isConnected: this.agentServer.isConnected,
            metadata: this.agentServer.metadata
        };
    }

    isInitialized(): boolean {
        return this.agentServer.isConnected;
    }

    protected async ensureAgentServer(): Promise<void> {
        const isRunning = await isAgentServerRunningUtil(
            this.providerConfig as any,
            this.logger,
            this.agentServer.serverUrl
        );
        if (!isRunning) {
            await this.startAgentServer();
        }
    }

    // Internal helpers
    protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
        this.state.projectPath = initVars.projectPath as string;
    }

    protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
        return this.state.projectPath!;
    }

    protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
        // Any AgentFS specific setup?
    }

    protected async teardownEnvironment(): Promise<void> {
        // Any AgentFS specific teardown?
    }

    protected buildWebSocketUrl(initVars: ProviderInitVars): string {
        const query = new URLSearchParams({
            clientType: 'app',
            appId: `agentfs-${initVars.environmentName}`,
            projectName: initVars.environmentName,
        });

        if (this.state.projectPath) {
            query.set('currentProject', this.state.projectPath);
        }
        // Note: agentServer.serverUrl is from base class, initialized in constructor? 
        // Actually BaseProvider sets initialized default, we override if needed.
        return `${this.agentServer.serverUrl}?${query.toString()}`;
    }

    async onCloseSignal(): Promise<void> {
        this.logger.log('Close signal received');
        await this.stopAgentServer();
    }
}
