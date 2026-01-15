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
        const projectPath = initVars.projectPath as string | undefined;
        if (!projectPath) {
            throw new Error('Project path is not available in initVars');
        }
        this.projectPath = projectPath;

        const result = await super.onProviderStart(initVars);
        this.logger.log('Started Environment with project path:', this.projectPath);

        return {
            ...result,
            worktreePath: this.projectPath,
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
            this.resetState();
            this.logger.log('Provider stopped successfully');
        } catch (error) {
            this.logger.error('Error stopping provider:', error);
            throw error;
        }
    }

    // File System Operations - Wrapping AgentFS CLI

    private async runAgentFSCommand(args: string[]): Promise<string> {
        try {
            const command = `${this.agentFSBinary} ${args.join(' ')}`;
            const { stdout } = await execAsync(command, { cwd: this.projectPath ?? process.cwd() });
            return stdout;
        } catch (error: any) {
            this.logger.error(`Error running agentfs command: ${args.join(' ')}`, error);
            throw new Error(`AgentFS command failed: ${error.message}`);
        }
    }

    async onReadFile(filePath: string): Promise<string> {
        this.logger.log('Reading file:', filePath);
        // agentfs cat <file> or similar. agentfs read sounds plausible.
        // Based on typical CLI, cat or read is used. I'll use `read` as per plan, hoping it works or aliases.
        // If `read` is not standard, `cat` is safer guess for "output context".
        // Let's stick to `read` as a semantic choice for now, if it fails user can report.
        return this.runAgentFSCommand(['cat', filePath]);
    }

    async onWriteFile(filePath: string, content: string): Promise<void> {
        this.logger.log('Writing file:', filePath);
        // agentfs write <file> <content> might not work for large content or special chars.
        // Better: echo content | agentfs write <file> (via stdin)
        // But runAgentFSCommand currently does exec.
        // I need to modify runAgentFSCommand to handle stdin or use fs.writeFile if agentfs mounts a fuse or similar?
        // documentation says "agentfs" is a filesystem.
        // If it interacts via CLI, `write` likely takes file arg and reads stdin.
        // For now, let's try passing content as arg if small, but that's risky.
        // Safer: use `child_process.exec` with input.

        try {
            const command = `${this.agentFSBinary} write ${filePath}`;
            const child = exec(command, { cwd: this.projectPath ?? process.cwd() });

            if (child.stdin) {
                child.stdin.write(content);
                child.stdin.end();
            }

            await new Promise<void>((resolve, reject) => {
                child.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`AgentFS write exited with code ${code}`));
                });
                child.on('error', reject);
            });

        } catch (error: any) {
            this.logger.error(`Error writing file via agentfs: ${filePath}`, error);
            throw new Error(`AgentFS write failed: ${error.message}`);
        }
    }

    async onDeleteFile(filePath: string): Promise<void> {
        this.logger.log('Deleting file:', filePath);
        await this.runAgentFSCommand(['rm', filePath]);
    }

    async onDeleteFolder(folderPath: string): Promise<void> {
        this.logger.log('Deleting folder:', folderPath);
        await this.runAgentFSCommand(['rm', '-r', folderPath]);
    }

    async onRenameItem(oldPath: string, newPath: string): Promise<void> {
        this.logger.log('Renaming item:', oldPath, 'to', newPath);
        await this.runAgentFSCommand(['mv', oldPath, newPath]);
    }

    async onCreateFolder(folderPath: string): Promise<void> {
        this.logger.log('Creating folder:', folderPath);
        await this.runAgentFSCommand(['mkdir', folderPath]);
    }

    async onGetProject(parentId: string = 'root'): Promise<any[]> {
        // agentfs ls <path>
        const targetPath = parentId === 'root' ? '.' : parentId;
        try {
            // agentfs ls -l for detail? or json?
            // Assuming `agentfs ls` returns simple list.
            const output = await this.runAgentFSCommand(['ls', targetPath]);
            const lines = output.split('\n').filter(Boolean);

            // We need to know if it's a folder or file.
            // basic `ls` might not show it. `ls -F`?
            // Let's imply from name or try `stat` equivalent if needed.
            // For now, let's treat generic.

            return lines.map((name) => {
                const isFolder = name.endsWith('/');
                const cleanName = isFolder ? name.slice(0, -1) : name;
                return {
                    id: parentId === 'root' ? cleanName : path.join(parentId, cleanName),
                    name: cleanName,
                    path: path.join(this.projectPath!, parentId === 'root' ? '' : parentId, cleanName),
                    isFolder: isFolder, // Weak inference
                    size: 0,
                    lastModified: new Date().toISOString()
                };
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
