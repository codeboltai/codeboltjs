import type { ProviderStartResult } from '@codebolt/provider';
import { AgentStartMessage, RawMessageForAgent, ProviderInitVars } from '@codebolt/types/provider';

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

export interface ProviderConfig {
    agentFSSdkPackage?: string;
    agentFSIdPrefix?: string;
    executionMode?: 'local_thread_pool';
    timeouts?: {
        wsConnection?: number;
        cleanup?: number;
    };
}

export interface IProviderService {
    onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
    onProviderAgentStart(initvars: AgentStartMessage): Promise<void>;
    onProviderStop(initvars: ProviderInitVars): Promise<void>;
    onGetDiffFiles(): Promise<DiffResult>;
    onCloseSignal(): Promise<void>;
    getProspectivePath(request: Record<string, unknown>): Record<string, unknown>;
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
    onRawMessage(message: RawMessageForAgent): Promise<void>;
    isInitialized(): boolean;
}
