import type {
    ProviderStartResult,
    AgentServerConnection as BaseAgentServerConnection,
} from '@codebolt/provider';
import { AgentStartMessage, RawMessageForAgent, ProviderInitVars } from '@codebolt/types/provider';
import type { ChildProcess } from 'child_process';
import type WebSocket from 'ws';

export type {
    ProviderStartResult
} from '@codebolt/provider';

export interface DiffFile {
    path: string;
    status: "added" | "modified" | "deleted" | "renamed";
    changes?: {
        additions: number;
        deletions: number;
        changes: number;
    };
    diff?: string;
}

export interface DiffResult {
    files: DiffFile[];
    summary?: {
        totalFiles: number;
        totalAdditions: number;
        totalDeletions: number;
        totalChanges: number;
    };
    rawDiff?: string;
}

export interface AgentServerConnection extends BaseAgentServerConnection {
    process: ChildProcess | null;
    wsConnection: WebSocket | null;
}

export interface ProviderConfig {
    agentServerPort?: number;
    agentServerHost?: string;
    agentFSBinaryPath?: string;
    timeouts?: {
        agentServerStartup?: number;
        wsConnection?: number;
        gitOperations?: number;
        cleanup?: number;
    };
}

export interface IProviderService {
    onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
    onProviderAgentStart(initvars: AgentStartMessage): Promise<void>;
    onProviderStop(initvars: ProviderInitVars): Promise<void>;
    onGetDiffFiles(): Promise<DiffResult>;
    onCloseSignal(): Promise<void>;
    onReadFile(path: string): Promise<string>;
    onWriteFile(path: string, content: string): Promise<void>;
    onDeleteFile(path: string): Promise<void>;
    onDeleteFolder(path: string): Promise<void>;
    onRenameItem(oldPath: string, newPath: string): Promise<void>;
    onCreateFolder(path: string): Promise<void>;
    onGetProject(): Promise<any>;
    onMergeAsPatch(): Promise<string>;
    onSendPR(): Promise<void>;
    onCreatePatchRequest(): void | Promise<void>;
    onCreatePullRequestRequest(): void | Promise<void>;
    onUserMessage(userMessage: RawMessageForAgent): Promise<void>;
    startAgentServer(): Promise<void>;
    connectToAgentServer(worktreePath: string, environmentName: string): Promise<void>;
    stopAgentServer(): Promise<boolean>;
    sendMessageToAgent(message: RawMessageForAgent | AgentStartMessage): Promise<boolean>;
    getAgentServerConnection(): AgentServerConnection;
    isInitialized(): boolean;
}
