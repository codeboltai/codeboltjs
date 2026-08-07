import {
    BaseProvider,
    ProviderStartResult,
} from '@codebolt/provider';
import type {
    AgentStartMessage,
    ProviderInitVars,
    RawMessageForAgent,
} from '@codebolt/types/provider';
import path from 'path';
import os from 'os';
import {
    DiffResult,
    IProviderService,
    ProviderConfig,
} from '../interfaces/IProviderService';
import { createPrefixedLogger, Logger } from '../utils/logger';

type AgentFSStats = {
    size?: number;
    mode?: number;
    mtime?: number | Date | string;
    ctime?: number | Date | string;
    isFile?: () => boolean;
    isDirectory?: () => boolean;
};

type AgentFSDirEntry = {
    name: string;
    stats: AgentFSStats;
};

type AgentFSFileSystem = {
    writeFile(path: string, data: string | Buffer): Promise<void>;
    readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string>;
    readdir(path: string): Promise<string[]>;
    readdirPlus?: (path: string) => Promise<AgentFSDirEntry[]>;
    stat(path: string): Promise<AgentFSStats>;
    exists?: (path: string) => Promise<boolean>;
    access?: (path: string) => Promise<void>;
    deleteFile?: (path: string) => Promise<void>;
    unlink?: (path: string) => Promise<void>;
    mkdir?: (path: string) => Promise<void>;
    rm?: (path: string, options?: { recursive?: boolean; force?: boolean }) => Promise<void>;
    rmdir?: (path: string) => Promise<void>;
    rename?: (oldPath: string, newPath: string) => Promise<void>;
};

type AgentFSInstance = {
    fs: AgentFSFileSystem;
    close?: () => Promise<void> | void;
};

type AgentFSModule = {
    AgentFS: {
        open(options?: { id?: string }): Promise<AgentFSInstance>;
    };
};

type ProjectChild = {
    id: string;
    name: string;
    path: string;
    isFolder: boolean;
    size: number;
    lastModified: string;
};

type AgentFSPathSource = 'provider_proposed' | 'user_override';

export class AgentFSProviderService extends BaseProvider implements IProviderService {
    private readonly providerConfig: ProviderConfig;
    private readonly logger: Logger;
    private agent: AgentFSInstance | null = null;
    private agentFsId: string | null = null;
    private environmentPath: string | null = null;
    private baseProjectPath: string | null = null;
    private requestedPath: string | undefined;
    private pathSource: AgentFSPathSource = 'provider_proposed';

    constructor(config: ProviderConfig = {}) {
        super({
            agentServerPort: 0,
            agentServerHost: 'localhost',
            wsRegistrationTimeout: config.timeouts?.wsConnection ?? 10_000,
            reconnectAttempts: 10,
            reconnectDelay: 1_000,
            transport: 'custom',
        });

        this.providerConfig = {
            agentFSSdkPackage: config.agentFSSdkPackage ?? 'agentfs-sdk',
            agentFSIdPrefix: config.agentFSIdPrefix ?? 'codebolt',
            timeouts: {
                wsConnection: config.timeouts?.wsConnection ?? 30_000,
                cleanup: config.timeouts?.cleanup ?? 15_000,
            },
        };

        this.logger = createPrefixedLogger('[AgentFS Provider]');
    }

    async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
        this.logger.log('Starting provider with environment:', initVars.environmentName);

        const result = await super.onProviderStart(initVars);
        this.startHeartbeat();

        if (initVars.environmentName) {
            this.registerConnectedEnvironment(initVars.environmentName);
            this.startEnvironmentHeartbeat(initVars.environmentName);
        }

        return {
            ...result,
            worktreePath: this.environmentPath ?? result.workspacePath,
            resolvedPath: this.environmentPath ?? result.workspacePath,
            environmentPath: this.environmentPath ?? result.workspacePath,
            requestedPath: this.requestedPath,
            pathSource: this.pathSource,
            syncMode: 'workspace_sync',
            mergeStrategy: 'workspace_sync',
            executionMode: 'local_thread_pool',
            parentPath: this.baseProjectPath ?? undefined,
            agentFSId: this.agentFsId,
            filesystemProvider: 'agentfs',
            syncPolicy: this.getSyncPolicy(),
            defaultSyncMode: 'workspace_sync',
            supportedSyncModes: ['workspace_sync'],
            supportedMergeStrategies: ['workspace_sync'],
        };
    }

    async onProviderStop(initVars: ProviderInitVars): Promise<void> {
        this.logger.log('Provider stop requested for environment:', initVars.environmentName);

        try {
            this.stopHeartbeat();

            if (initVars.environmentName) {
                this.unregisterConnectedEnvironment(initVars.environmentName);
            }

            await this.teardownEnvironment();
            this.state.initialized = false;
            this.state.workspacePath = null;
            this.state.projectPath = null;
            this.environmentPath = null;
            this.baseProjectPath = null;
            this.agentFsId = null;
            this.requestedPath = undefined;
            this.pathSource = 'provider_proposed';
            this.resetState();

            this.logger.log('Provider stopped successfully for environment:', initVars.environmentName);
        } catch (error) {
            this.logger.error('Error stopping provider:', error);
            throw error;
        }
    }

    async onProviderAgentStart(_agentMessage: AgentStartMessage): Promise<void> {
        this.logger.log('Ignoring provider agent start; application owns message handling for AgentFS environments.');
    }

    async onRawMessage(_message: RawMessageForAgent): Promise<void> {
        this.logger.log('Ignoring raw message; application owns event and message handling for AgentFS environments.');
    }

    getProspectivePath(request: Record<string, unknown>): Record<string, unknown> {
        const environmentName = this.safeEnvironmentName(this.getString(request, 'environmentName') || 'environment');
        const parentPath = this.resolveOptionalPath(
            this.getString(request, 'projectPath') ??
            this.getString(request, 'parentProjectPath') ??
            this.getString(request, 'parentPath') ??
            this.getString(request, 'parentBasePath') ??
            this.baseProjectPath ??
            undefined,
            undefined
        );
        const requestedPath =
            this.getString(request, 'environmentPath') ??
            this.getString(request, 'requestedPath') ??
            this.getString(request, 'resolvedPath') ??
            this.getString(request, 'path');
        const resolvedPath = requestedPath
            ? this.resolvePathInput(requestedPath, parentPath)
            : this.getDefaultEnvironmentPath(parentPath, environmentName);

        return {
            path: resolvedPath,
            projectPath: resolvedPath,
            resolvedPath,
            environmentPath: resolvedPath,
            requestedPath,
            pathSource: requestedPath ? 'user_override' : 'provider_proposed',
            source: requestedPath ? 'user_override' : 'provider_proposed',
            syncMode: 'workspace_sync',
            mergeStrategy: 'workspace_sync',
            parentPath,
            parentProjectPath: parentPath,
            editable: true,
            agentFSId: this.getAgentFSId(environmentName),
            filesystemProvider: 'agentfs',
            syncPolicy: this.getSyncPolicy(),
            defaultSyncMode: 'workspace_sync',
            supportedSyncModes: ['workspace_sync'],
            supportedMergeStrategies: ['workspace_sync'],
        };
    }

    getSyncPolicy(): Record<string, unknown> {
        return {
            defaultSyncMode: 'workspace_sync',
            modes: [
                {
                    value: 'workspace_sync',
                    label: 'AgentFS',
                    description: 'Use Turso AgentFS as the environment filesystem. Messages and events stay in the application.',
                    pathFolder: 'agentfs',
                    createsGitWorktree: false,
                    usesWorkspaceSync: false,
                    cleanup: 'runtime_provider',
                },
            ],
        };
    }

    async onReadFile(filePath: string): Promise<string> {
        this.logger.log('Reading AgentFS file:', filePath);
        const content = await this.getAgentFS().readFile(this.toAgentPath(filePath), 'utf-8');
        return typeof content === 'string' ? content : content.toString('utf-8');
    }

    async onWriteFile(filePath: string, content: string): Promise<void> {
        this.logger.log('Writing AgentFS file:', filePath);
        await this.getAgentFS().writeFile(this.toAgentPath(filePath), content);
    }

    async onDeleteFile(filePath: string): Promise<void> {
        this.logger.log('Deleting AgentFS file:', filePath);
        const fs = this.getAgentFS();
        const agentPath = this.toAgentPath(filePath);

        if (fs.deleteFile) {
            await fs.deleteFile(agentPath);
            return;
        }

        if (fs.unlink) {
            await fs.unlink(agentPath);
            return;
        }

        throw new Error('AgentFS SDK does not expose file deletion.');
    }

    async onDeleteFolder(folderPath: string): Promise<void> {
        this.logger.log('Deleting AgentFS folder:', folderPath);
        const agentPath = this.toAgentPath(folderPath);
        const fs = this.getAgentFS();

        if (fs.rm) {
            await fs.rm(agentPath, { recursive: true, force: true });
            return;
        }

        throw new Error('AgentFS SDK does not expose directory deletion. Install a SDK version with fs.rm support or route folder deletion through the application.');
    }

    async onRenameItem(oldPath: string, newPath: string): Promise<void> {
        this.logger.log('Renaming AgentFS item:', oldPath, 'to', newPath);
        const fs = this.getAgentFS();

        if (fs.rename) {
            await fs.rename(this.toAgentPath(oldPath), this.toAgentPath(newPath));
            return;
        }

        throw new Error('AgentFS SDK does not expose rename. Install a SDK version with fs.rename support or route rename through the application.');
    }

    async onCreateFolder(folderPath: string): Promise<void> {
        this.logger.log('Creating AgentFS folder:', folderPath);
        const fs = this.getAgentFS();

        if (fs.mkdir) {
            await this.ensureDirectory(this.toAgentPath(folderPath));
            return;
        }

        throw new Error('AgentFS SDK does not expose empty directory creation. File writes still create parent directories automatically.');
    }

    async onGetProject(parentId: string = 'root'): Promise<any[]> {
        this.logger.log('Getting AgentFS project structure for parentId:', parentId);
        const parentPath = parentId === 'root' ? '/' : this.toAgentPath(parentId);
        const fs = this.getAgentFS();

        try {
            if (!(await this.pathExists(parentPath))) {
                return [];
            }

            const parentStats = await fs.stat(parentPath);
            if (parentStats.isDirectory && !parentStats.isDirectory()) {
                return [];
            }

            const children = fs.readdirPlus
                ? (await fs.readdirPlus(parentPath)).map((entry) => this.toProjectChild(parentId, entry.name, entry.stats))
                : await Promise.all((await fs.readdir(parentPath)).map(async (entry) => {
                    const entryName = entry.endsWith('/') ? entry.slice(0, -1) : entry;
                    const stats = await fs.stat(path.posix.join(parentPath, entryName));
                    return this.toProjectChild(parentId, entryName, stats);
                }));

            children.sort((a, b) => {
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.name.localeCompare(b.name);
            });

            return children;
        } catch (error: any) {
            this.logger.error('Error listing AgentFS project structure:', error);
            return [];
        }
    }

    async onGetFullProject(): Promise<any[]> {
        return this.onGetProject('root');
    }

    async createWorktree(_projectPath: string, environmentName: string): Promise<any> {
        return {
            path: this.environmentPath,
            branch: this.getAgentFSId(environmentName),
            isCreated: Boolean(this.agent),
            syncMode: 'workspace_sync',
            filesystemProvider: 'agentfs',
        };
    }

    async removeWorktree(_projectPath: string): Promise<boolean> {
        return true;
    }

    getWorktreeInfo(): any {
        return {
            path: this.environmentPath,
            branch: this.agentFsId,
            isCreated: Boolean(this.agent),
            syncMode: 'workspace_sync',
            filesystemProvider: 'agentfs',
        };
    }

    async onGetDiffFiles(): Promise<DiffResult> {
        return {
            files: [],
            summary: {
                totalFiles: 0,
                totalAdditions: 0,
                totalDeletions: 0,
                totalChanges: 0,
            },
            rawDiff: '',
        };
    }

    async onMergeAsPatch(): Promise<string> {
        throw new Error('Merge/push workflow is not supported for AgentFS provider mode.');
    }

    async onSendPR(): Promise<void> {
        throw new Error('PR workflow is not supported for AgentFS provider mode.');
    }

    onCreatePatchRequest(): void {
        throw new Error('Patch workflow is not supported for AgentFS provider mode.');
    }

    onCreatePullRequestRequest(): void {
        throw new Error('Pull request workflow is not supported for AgentFS provider mode.');
    }

    async onUserMessage(userMessage: RawMessageForAgent): Promise<void> {
        await this.onRawMessage(userMessage);
    }

    isInitialized(): boolean {
        return this.state.initialized && Boolean(this.agent);
    }

    protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
        const preview = this.getProspectivePath(initVars as Record<string, unknown>);
        this.environmentPath = String(preview.resolvedPath);
        this.baseProjectPath = typeof initVars.projectPath === 'string' ? path.resolve(initVars.projectPath) : null;
        this.requestedPath = preview.requestedPath as string | undefined;
        this.pathSource = preview.pathSource as AgentFSPathSource;
        this.agentFsId = String(preview.agentFSId);
        this.state.projectPath = this.environmentPath;
    }

    protected async resolveWorkspacePath(_initVars: ProviderInitVars): Promise<string> {
        if (!this.environmentPath) {
            throw new Error('AgentFS environment path is undefined');
        }
        return this.environmentPath;
    }

    protected async setupEnvironment(_initVars: ProviderInitVars): Promise<void> {
        const sdkPackage = this.providerConfig.agentFSSdkPackage ?? 'agentfs-sdk';
        const module = await import(sdkPackage) as AgentFSModule;
        this.agent = await module.AgentFS.open({ id: this.agentFsId ?? undefined });
        this.state.workspacePath = this.environmentPath;
        this.state.projectPath = this.environmentPath;
        this.logger.log('Opened AgentFS store:', this.agentFsId);
    }

    protected async teardownEnvironment(): Promise<void> {
        if (this.agent?.close) {
            await this.agent.close();
        }
        this.agent = null;
    }

    protected async ensureAgentServer(): Promise<void> {
        this.logger.log('AgentFS provider does not manage an agent server.');
    }

    async ensureTransportConnection(_initVars: ProviderInitVars): Promise<void> {
        this.logger.log('AgentFS provider does not manage message/event transport.');
    }

    protected async beforeClose(): Promise<void> {
        this.logger.log('Received close signal for AgentFS provider.');
    }

    async onCloseSignal(): Promise<void> {
        try {
            this.stopHeartbeat();
            await this.teardownEnvironment();
        } catch (error: any) {
            this.logger.error('Error during AgentFS close cleanup:', error);
        }
    }

    private getAgentFS(): AgentFSFileSystem {
        if (!this.agent) {
            throw new Error('AgentFS is not initialized');
        }
        return this.agent.fs;
    }

    private getAgentFSId(environmentName: string): string {
        const prefix = this.providerConfig.agentFSIdPrefix ?? 'codebolt';
        return `${prefix}-${this.safeEnvironmentName(environmentName)}`;
    }

    private getString(source: Record<string, unknown>, key: string): string | undefined {
        const value = source[key];
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    }

    private safeEnvironmentName(environmentName: string): string {
        return (environmentName || 'environment').replace(/[^a-zA-Z0-9_.-]/g, '-');
    }

    private resolveOptionalPath(inputPath: string | undefined, basePath: string | undefined): string | undefined {
        return inputPath ? this.resolvePathInput(inputPath, basePath) : undefined;
    }

    private resolvePathInput(inputPath: string, basePath: string | undefined): string {
        if (inputPath === '~') {
            return os.homedir();
        }

        if (inputPath.startsWith(`~${path.sep}`) || inputPath.startsWith('~/')) {
            return path.resolve(os.homedir(), inputPath.slice(2));
        }

        if (path.isAbsolute(inputPath)) {
            return path.resolve(inputPath);
        }

        return path.resolve(basePath || process.cwd(), inputPath);
    }

    private getDefaultEnvironmentPath(parentPath: string | undefined, environmentName: string): string {
        const basePath = parentPath || this.baseProjectPath || process.cwd();
        return path.join(basePath, '.codebolt', 'agentfs', this.safeEnvironmentName(environmentName));
    }

    private toAgentPath(inputPath: string): string {
        const relativePath = this.toRelativeAgentPath(inputPath);
        return `/${relativePath}`.replace(/\/+/g, '/') || '/';
    }

    private toRelativeAgentPath(inputPath: string): string {
        if (!inputPath || inputPath === 'root' || inputPath === '/') {
            return '';
        }

        const normalizedInput = inputPath.replace(/\\/g, '/');
        const normalizedEnvironment = this.environmentPath?.replace(/\\/g, '/');

        if (normalizedEnvironment && path.isAbsolute(inputPath)) {
            const relativePath = path.relative(this.environmentPath!, inputPath);
            return this.cleanRelativePath(relativePath);
        }

        if (normalizedEnvironment && normalizedInput.startsWith(`${normalizedEnvironment}/`)) {
            return this.cleanRelativePath(normalizedInput.slice(normalizedEnvironment.length + 1));
        }

        return this.cleanRelativePath(normalizedInput);
    }

    private cleanRelativePath(inputPath: string): string {
        const normalized = path.posix.normalize(inputPath.replace(/\\/g, '/'));
        if (normalized === '.' || normalized === '/') {
            return '';
        }
        return normalized.replace(/^\/+/, '');
    }

    private toDisplayPath(relativePath: string): string {
        if (!this.environmentPath) {
            return this.toAgentPath(relativePath);
        }
        return path.join(this.environmentPath, relativePath);
    }

    private async pathExists(agentPath: string): Promise<boolean> {
        const fs = this.getAgentFS();

        if (fs.exists) {
            return fs.exists(agentPath);
        }

        if (fs.access) {
            try {
                await fs.access(agentPath);
                return true;
            } catch {
                return false;
            }
        }

        try {
            await fs.stat(agentPath);
            return true;
        } catch {
            return false;
        }
    }

    private async ensureDirectory(agentPath: string): Promise<void> {
        const fs = this.getAgentFS();
        const parts = this.cleanRelativePath(agentPath).split('/').filter(Boolean);
        let currentPath = '';

        for (const part of parts) {
            currentPath = path.posix.join(currentPath, part);
            const absoluteCurrentPath = `/${currentPath}`;

            if (await this.pathExists(absoluteCurrentPath)) {
                continue;
            }

            await fs.mkdir?.(absoluteCurrentPath);
        }
    }

    private toProjectChild(parentId: string, entryName: string, stats: AgentFSStats): ProjectChild {
        const relativePath = parentId === 'root'
            ? entryName
            : path.posix.join(this.toRelativeAgentPath(parentId), entryName);
        const isFolder = stats.isDirectory ? stats.isDirectory() : false;

        return {
            id: relativePath,
            name: entryName,
            path: this.toDisplayPath(relativePath),
            isFolder,
            size: isFolder ? 0 : stats.size ?? 0,
            lastModified: this.toIsoDate(stats.mtime),
        };
    }

    private toIsoDate(input: number | Date | string | undefined): string {
        if (input instanceof Date) {
            return input.toISOString();
        }

        if (typeof input === 'number') {
            const millis = input > 10_000_000_000 ? input : input * 1000;
            return new Date(millis).toISOString();
        }

        if (typeof input === 'string') {
            const parsed = Date.parse(input);
            if (!Number.isNaN(parsed)) {
                return new Date(parsed).toISOString();
            }
        }

        return new Date(0).toISOString();
    }
}
