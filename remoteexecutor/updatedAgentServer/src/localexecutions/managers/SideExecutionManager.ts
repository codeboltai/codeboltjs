import { EventEmitter } from 'events';
import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../main/utils/logger';
import { actionBlockRegistry } from '../services/ActionBlockRegistry';
import { getServerConfig } from '../../main/config/config';

import {
    SideExecutionMetadata,
    SideExecutionStatus,
    StartSideExecutionOptions,
    RuntimeExecutionOptions,
    SideExecutionEnv,
    SideExecutionError,
    SideExecutionErrorCode,
    SideExecutionResult
} from '../../types/sideExecution';
/**
 * SideExecutionManager - Manages ActionBlock lifecycle and process tracking
 */
export class SideExecutionManager extends EventEmitter {
    private static instance: SideExecutionManager;
    private executions: Map<string, SideExecutionMetadata> = new Map();
    private pendingConnections: Map<string, { resolve: (value: string) => void; reject: (error: Error) => void }> = new Map();
    private pendingCompletions: Map<string, { resolve: (value: SideExecutionResult) => void; reject: (error: Error) => void }> = new Map();

    private readonly SHUTDOWN_TIMEOUT = 5000;
    private readonly FORCE_KILL_TIMEOUT = 3000;
    private readonly CONNECTION_TIMEOUT = 30000;
    private tempDir: string;

    private constructor() {
        super();
        this.tempDir = path.join(os.tmpdir(), 'codebolt-side-executions');
        this.ensureTempDir();
        this.setupEventHandlers();
    }

    public static getInstance(): SideExecutionManager {
        if (!SideExecutionManager.instance) {
            SideExecutionManager.instance = new SideExecutionManager();
        }
        return SideExecutionManager.instance;
    }

    private ensureTempDir(): void {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    private setupEventHandlers(): void {
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('SIGINT', () => this.gracefulShutdown());

        this.on('sideExecutionConnected', (data: { sideExecutionId: string; threadId: string; connectionId: string }) => {
            this.handleSideExecutionConnected(data);
        });
    }

    private handleSideExecutionConnected(data: { sideExecutionId: string; threadId: string; connectionId: string }): void {
        const { sideExecutionId, connectionId } = data;

        logger.info(`[SideExecutionManager] Side execution connected: ${sideExecutionId}`);

        const metadata = this.executions.get(sideExecutionId);
        if (metadata) {
            if ((metadata as any).connectionTimer) {
                clearTimeout((metadata as any).connectionTimer);
                delete (metadata as any).connectionTimer;
            }

            metadata.status = SideExecutionStatus.RUNNING;
            (metadata as any).connectionId = connectionId;
            this.executions.set(sideExecutionId, metadata);
        }

        const pending = this.pendingConnections.get(sideExecutionId);
        if (pending) {
            pending.resolve(sideExecutionId);
            this.pendingConnections.delete(sideExecutionId);
            logger.info(`[SideExecutionManager] Resolved pending connection for: ${sideExecutionId}`);
        }
    }

    /**
     * Start a side execution with ActionBlock path
     */
    async startSideExecution(options: StartSideExecutionOptions): Promise<string> {
        const {
            actionBlockPath,
            threadId,
            parentAgentId,
            parentAgentInstanceId,
            threadContext,
            params
        } = options;

        // Validate ActionBlock exists
        const validation = actionBlockRegistry.validateActionBlock(actionBlockPath);
        if (!validation.valid) {
            throw this.createError(
                SideExecutionErrorCode.ACTION_BLOCK_NOT_FOUND,
                `ActionBlock not found or invalid at: ${actionBlockPath}`,
                { path: actionBlockPath, errors: validation.errors }
            );
        }

        // Get ActionBlock info
        let actionBlock = actionBlockRegistry.getActionBlockByPath(actionBlockPath);
        if (!actionBlock) {
            await actionBlockRegistry.discoverActionBlocks(path.dirname(path.dirname(actionBlockPath)));
            actionBlock = actionBlockRegistry.getActionBlockByPath(actionBlockPath);
        }

        const sideExecutionId = this.generateSideExecutionId();
        const entryPoint = actionBlock?.entryPoint || 'dist/index.js';
        const indexPath = path.resolve(actionBlockPath, entryPoint);

        logger.info(`[SideExecutionManager] Starting side execution ${sideExecutionId} from ${actionBlockPath}`);

        const metadata: SideExecutionMetadata = {
            id: sideExecutionId,
            type: 'actionblock',
            name: actionBlock?.name || path.basename(actionBlockPath),
            actionBlockId: actionBlock?.id,
            threadId,
            parentAgentId,
            parentAgentInstanceId,
            startTime: Date.now(),
            status: SideExecutionStatus.STARTING,
            isRuntimeCode: false,
            params,
            threadContext
        };

        this.executions.set(sideExecutionId, metadata);

        try {
            const config = getServerConfig();
            const processEnv: SideExecutionEnv & NodeJS.ProcessEnv = {
                ...process.env,
                SOCKET_PORT: config.port.toString(),
                IS_SIDE_EXECUTION: 'true',
                SIDE_EXECUTION_ID: sideExecutionId,
                THREAD_ID: threadId,
                PARENT_AGENT_ID: parentAgentId,
                PARENT_AGENT_INSTANCE_ID: parentAgentInstanceId,
                ACTION_BLOCK_ID: actionBlock?.id,
                ACTION_BLOCK_PATH: actionBlockPath
            };

            const childProcess = fork(indexPath, [], {
                cwd: actionBlockPath,
                stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
                env: processEnv
            });

            metadata.process = childProcess;
            metadata.status = SideExecutionStatus.RUNNING;
            this.executions.set(sideExecutionId, metadata);

            this.setupProcessHandlers(sideExecutionId, metadata);

            logger.info(`[SideExecutionManager] Side execution ${sideExecutionId} process forked`);
            this.emit('sideExecutionStarted', { sideExecutionId, metadata });

            return await this.waitForConnection(sideExecutionId);

        } catch (error: any) {
            logger.error(`[SideExecutionManager] Failed to start side execution: ${error.message}`);
            this.pendingConnections.delete(sideExecutionId);
            this.executions.delete(sideExecutionId);
            throw error;
        }
    }

    private waitForConnection(sideExecutionId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.pendingConnections.set(sideExecutionId, { resolve, reject });

            const connectionTimer = setTimeout(() => {
                const pending = this.pendingConnections.get(sideExecutionId);
                if (pending) {
                    this.pendingConnections.delete(sideExecutionId);

                    const error = this.createError(
                        SideExecutionErrorCode.EXECUTION_TIMEOUT,
                        `Side execution ${sideExecutionId} failed to connect within ${this.CONNECTION_TIMEOUT}ms`,
                        { sideExecutionId, timeout: this.CONNECTION_TIMEOUT }
                    );

                    logger.error(`[SideExecutionManager] Connection timeout for: ${sideExecutionId}`);
                    this.stopSideExecution(sideExecutionId);
                    reject(new Error(error.message));
                }
            }, this.CONNECTION_TIMEOUT);

            const metadata = this.executions.get(sideExecutionId);
            if (metadata) {
                (metadata as any).connectionTimer = connectionTimer;
                this.executions.set(sideExecutionId, metadata);
            }
        });
    }

    /**
     * Wait for side execution to complete
     */
    waitForCompletion(sideExecutionId: string): Promise<SideExecutionResult> {
        return new Promise((resolve, reject) => {
            const metadata = this.executions.get(sideExecutionId);
            if (!metadata) {
                reject(new Error(`Side execution not found: ${sideExecutionId}`));
                return;
            }

            this.pendingCompletions.set(sideExecutionId, { resolve, reject });
            logger.info(`[SideExecutionManager] Waiting for completion of: ${sideExecutionId}`);
        });
    }

    /**
     * Handle actionBlockComplete message
     */
    handleActionBlockComplete(data: { sideExecutionId: string; result?: any; error?: string }): void {
        const { sideExecutionId, result, error } = data;

        logger.info(`[SideExecutionManager] ActionBlock complete received: ${sideExecutionId}, success: ${!error}`);

        const metadata = this.executions.get(sideExecutionId);
        if (metadata) {
            if ((metadata as any).completionTimer) {
                clearTimeout((metadata as any).completionTimer);
                delete (metadata as any).completionTimer;
            }

            metadata.status = error ? SideExecutionStatus.FAILED : SideExecutionStatus.COMPLETED;
            this.executions.set(sideExecutionId, metadata);
        }

        const pending = this.pendingCompletions.get(sideExecutionId);
        if (pending) {
            const completionResult: SideExecutionResult = {
                success: !error,
                sideExecutionId,
                result: error ? undefined : result,
                error: error
            };

            pending.resolve(completionResult);
            this.pendingCompletions.delete(sideExecutionId);
            logger.info(`[SideExecutionManager] Resolved pending completion for: ${sideExecutionId}`);
        }

        setTimeout(() => this.cleanup(sideExecutionId), 1000);
    }

    private setupProcessHandlers(sideExecutionId: string, metadata: SideExecutionMetadata): void {
        const childProcess = metadata.process;
        if (!childProcess) return;

        childProcess.stdout?.on('data', (data: Buffer) => {
            logger.debug(`[SideExecution ${sideExecutionId}] stdout: ${data.toString().trim()}`);
        });

        childProcess.stderr?.on('data', (data: Buffer) => {
            logger.warn(`[SideExecution ${sideExecutionId}] stderr: ${data.toString().trim()}`);
        });

        childProcess.on('exit', (code: number | null, signal: string | null) => {
            logger.info(`[SideExecution ${sideExecutionId}] Process exited with code ${code}, signal ${signal}`);

            if (code === 0) {
                this.handleCompletion(sideExecutionId, { exitCode: code });
            } else {
                this.handleError(sideExecutionId, new Error(`Process exited with code ${code}`));
            }
        });

        childProcess.on('error', (error: Error) => {
            logger.error(`[SideExecution ${sideExecutionId}] Process error: ${error.message}`);
            this.handleError(sideExecutionId, error);
        });

        childProcess.on('message', (message: any) => {
            logger.debug(`[SideExecution ${sideExecutionId}] IPC message: ${JSON.stringify(message)}`);

            if (message.type === 'sideExecutionComplete') {
                this.handleCompletion(sideExecutionId, message.result);
            } else if (message.type === 'sideExecutionError') {
                this.handleError(sideExecutionId, new Error(message.error));
            }
        });
    }

    async stopSideExecution(sideExecutionId: string): Promise<boolean> {
        const metadata = this.executions.get(sideExecutionId);
        if (!metadata) {
            logger.debug(`[SideExecutionManager] No side execution found: ${sideExecutionId}`);
            return true;
        }

        logger.info(`[SideExecutionManager] Stopping side execution: ${sideExecutionId}`);
        metadata.status = SideExecutionStatus.STOPPING;
        this.executions.set(sideExecutionId, metadata);

        return new Promise((resolve) => {
            const childProcess = metadata.process;

            if (!childProcess) {
                this.cleanup(sideExecutionId);
                resolve(true);
                return;
            }

            let resolved = false;

            const stopTimeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    logger.warn(`[SideExecution ${sideExecutionId}] Stop timeout, forcing kill`);
                    try {
                        childProcess.kill('SIGKILL');
                    } catch (e) {
                        // Ignore
                    }
                    this.cleanup(sideExecutionId);
                    resolve(true);
                }
            }, this.SHUTDOWN_TIMEOUT);

            childProcess.on('close', () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(stopTimeout);
                    this.cleanup(sideExecutionId);
                    resolve(true);
                }
            });

            try {
                childProcess.kill('SIGTERM');
            } catch (error: any) {
                logger.error(`[SideExecution ${sideExecutionId}] Error sending SIGTERM: ${error.message}`);
                if (!resolved) {
                    resolved = true;
                    clearTimeout(stopTimeout);
                    this.cleanup(sideExecutionId);
                    resolve(true);
                }
            }
        });
    }

    private handleCompletion(sideExecutionId: string, result: any): void {
        const metadata = this.executions.get(sideExecutionId);
        if (!metadata) return;

        if (metadata.timeoutTimer) {
            clearTimeout(metadata.timeoutTimer);
        }

        metadata.status = SideExecutionStatus.COMPLETED;
        this.executions.set(sideExecutionId, metadata);

        logger.info(`[SideExecution ${sideExecutionId}] Completed successfully`);
        this.emit('sideExecutionCompleted', {
            type: 'sideExecutionResult',
            sideExecutionId,
            threadId: metadata.threadId,
            success: true,
            result,
            timestamp: new Date().toISOString()
        });

        setTimeout(() => this.cleanup(sideExecutionId), 1000);
    }

    private handleError(sideExecutionId: string, error: Error): void {
        const metadata = this.executions.get(sideExecutionId);
        if (!metadata) return;

        if (metadata.timeoutTimer) {
            clearTimeout(metadata.timeoutTimer);
        }

        metadata.status = SideExecutionStatus.FAILED;
        this.executions.set(sideExecutionId, metadata);

        logger.error(`[SideExecution ${sideExecutionId}] Failed: ${error.message}`);
        this.emit('sideExecutionFailed', {
            type: 'sideExecutionResult',
            sideExecutionId,
            threadId: metadata.threadId,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });

        setTimeout(() => this.cleanup(sideExecutionId), 1000);
    }

    private async cleanup(sideExecutionId: string): Promise<void> {
        const metadata = this.executions.get(sideExecutionId);
        if (!metadata) return;

        logger.debug(`[SideExecution ${sideExecutionId}] Cleaning up resources`);

        if (metadata.timeoutTimer) {
            clearTimeout(metadata.timeoutTimer);
        }

        if (metadata.isRuntimeCode && metadata.tempFilePath) {
            try {
                if (fs.existsSync(metadata.tempFilePath)) {
                    fs.unlinkSync(metadata.tempFilePath);
                    logger.debug(`[SideExecution ${sideExecutionId}] Removed temp file: ${metadata.tempFilePath}`);
                }
            } catch (error: any) {
                logger.warn(`[SideExecution ${sideExecutionId}] Failed to remove temp file: ${error.message}`);
            }
        }

        this.executions.delete(sideExecutionId);
        this.emit('sideExecutionCleaned', { sideExecutionId });
    }

    getSideExecution(sideExecutionId: string): SideExecutionMetadata | undefined {
        return this.executions.get(sideExecutionId);
    }

    listActiveSideExecutions(): SideExecutionMetadata[] {
        return Array.from(this.executions.values()).filter(
            m => m.status === SideExecutionStatus.RUNNING || m.status === SideExecutionStatus.STARTING
        );
    }

    private generateSideExecutionId(): string {
        return `side_${Date.now()}_${uuidv4().substring(0, 8)}`;
    }

    private createError(
        code: SideExecutionErrorCode,
        message: string,
        details?: Record<string, any>
    ): SideExecutionError {
        return {
            code,
            message,
            details,
            timestamp: new Date().toISOString()
        };
    }

    private async gracefulShutdown(): Promise<void> {
        logger.info('[SideExecutionManager] Graceful shutdown initiated');

        const allIds = Array.from(this.executions.keys());
        await Promise.all(allIds.map(id => this.stopSideExecution(id)));

        logger.info('[SideExecutionManager] All side executions stopped');
    }
}

export const sideExecutionManager = SideExecutionManager.getInstance();
export default sideExecutionManager;
