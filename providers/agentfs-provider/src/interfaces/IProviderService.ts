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
    /**
     * When true (default), materialize a copy-on-write clone of the base
     * project into the environment path on setup using `cp -cR`. On APFS
     * this is near-instant and near-zero disk (clonefile CoW), and it
     * freezes a point-in-time snapshot so the environment is isolated from
     * later edits to the original project. Falls back to live base reads
     * when cloning is unavailable or would cause a copy cycle.
     */
    cloneBaseProject?: boolean;
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
