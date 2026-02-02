import { logger } from '../main/utils/logger';
import { ConnectionManager } from '../main/core/connectionManagers/connectionManager';
import { actionBlockRegistry } from './services/ActionBlockRegistry';
import { sideExecutionManager } from './managers/SideExecutionManager';
import type { ClientConnection } from '../types';
import {
    ActionBlock,
    ActionBlockType,
    ActionBlockActions,
    ActionBlockRequest,
    ListActionBlocksResponse,
    GetActionBlockDetailResponse,
    StartActionBlockResponse,
    ThreadContext
} from '../types/sideExecution';

/**
 * ActionBlockHandler - Handles ActionBlock CLI operations
 */
export class ActionBlockHandler {
    private connectionManager = ConnectionManager.getInstance();

    constructor() {
        logger.info('[ActionBlockHandler] Initialized');
    }

    /**
     * Ensure the ActionBlock registry is initialized
     */
    async ensureRegistryInitialized(projectPath?: string): Promise<void> {
        // Always re-initialize to ensure fresh state
        logger.info(`[ActionBlockHandler] Re-initializing ActionBlock registry`);
        actionBlockRegistry.clear();

        if (projectPath) {
            logger.info(`[ActionBlockHandler] Initializing ActionBlock registry with passed path: ${projectPath}`);
            await actionBlockRegistry.init(projectPath);
        } else {
            logger.info(`[ActionBlockHandler] Initializing ActionBlock registry with server config (or default)`);
            await actionBlockRegistry.init();
        }
    }

    /**
     * Main handler for ActionBlock events
     */
    async handleActionBlockEvent(agent: ClientConnection, event: ActionBlockRequest): Promise<void> {
        try {
            logger.info(`[ActionBlockHandler] Handling action: ${event.action}`);

            switch (event.action) {
                case ActionBlockActions.ListActionBlocks:
                case 'listActionBlocks':
                    await this.handleListActionBlocks(agent, event);
                    break;

                case ActionBlockActions.GetActionBlockDetail:
                case 'getActionBlockDetail':
                    await this.handleGetActionBlockDetail(agent, event);
                    break;

                case ActionBlockActions.StartActionBlock:
                case 'startActionBlock':
                    await this.handleStartActionBlock(agent, event);
                    break;

                default:
                    logger.warn(`[ActionBlockHandler] Unknown action: ${(event as any).action}`);
                    this.sendErrorResponse(agent, (event as any).requestId, `Unknown action: ${(event as any).action}`);
            }
        } catch (error: any) {
            logger.error(`[ActionBlockHandler] Error handling action ${event.action}: ${error.message}`);
            this.sendErrorResponse(agent, (event as any).requestId, error.message);
        }
    }

    /**
     * Handle list ActionBlocks
     */
    private async handleListActionBlocks(agent: ClientConnection, event: ActionBlockRequest): Promise<void> {
        const projectPath = (event as any).projectPath || process.cwd();
        const filterType = (event as any).filterType as ActionBlockType | undefined;

        try {
            await this.ensureRegistryInitialized(projectPath);

            // Always refresh to pick up any new ActionBlocks
            if (projectPath) {
                await actionBlockRegistry.discoverActionBlocks(projectPath);
            }

            let actionBlocks = actionBlockRegistry.listActionBlocks();

            // Apply type filter if provided
            if (filterType) {
                actionBlocks = actionBlocks.filter(block => block.type === filterType);
            }

            logger.info(
                `[ActionBlockHandler] Listed ${actionBlocks.length} ActionBlocks${filterType ? ` (filtered by type: ${filterType})` : ''}`
            );

            const response: ListActionBlocksResponse = {
                type: 'listActionBlocksResponse',
                success: true,
                actionBlocks,
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        } catch (error: any) {
            logger.error(`[ActionBlockHandler] Failed to list ActionBlocks: ${error.message}`);

            const response: ListActionBlocksResponse = {
                type: 'listActionBlocksResponse',
                success: false,
                actionBlocks: [],
                error: error.message || 'Failed to list ActionBlocks',
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        }
    }

    /**
     * Handle get ActionBlock detail
     */
    private async handleGetActionBlockDetail(agent: ClientConnection, event: ActionBlockRequest): Promise<void> {
        const actionBlockName = (event as any).actionBlockName as string;

        if (!actionBlockName) {
            const response: GetActionBlockDetailResponse = {
                type: 'getActionBlockDetailResponse',
                success: false,
                error: 'actionBlockName is required',
                requestId: event.requestId
            };
            this.connectionManager.sendToConnection(agent.id, response);
            return;
        }

        try {
            await this.ensureRegistryInitialized();

            const actionBlock = actionBlockRegistry.getActionBlock(actionBlockName);

            if (!actionBlock) {
                logger.warn(`[ActionBlockHandler] ActionBlock not found: ${actionBlockName}`);
                const response: GetActionBlockDetailResponse = {
                    type: 'getActionBlockDetailResponse',
                    success: false,
                    error: `ActionBlock not found: ${actionBlockName} ${actionBlockRegistry.getSearchPath()}`,
                    path: actionBlockRegistry.getSearchPath(),
                    requestId: event.requestId
                };
                this.connectionManager.sendToConnection(agent.id, response);
                return;
            }

            logger.info(`[ActionBlockHandler] Retrieved ActionBlock detail: ${actionBlockName}`);

            const response: GetActionBlockDetailResponse = {
                type: 'getActionBlockDetailResponse',
                success: true,
                actionBlock,
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        } catch (error: any) {
            logger.error(`[ActionBlockHandler] Failed to get ActionBlock detail: ${error.message}`);

            const response: GetActionBlockDetailResponse = {
                type: 'getActionBlockDetailResponse',
                success: false,
                error: error.message || 'Failed to get ActionBlock detail',
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        }
    }

    /**
     * Handle start ActionBlock
     */
    private async handleStartActionBlock(agent: ClientConnection, event: ActionBlockRequest): Promise<void> {
        const actionBlockName = (event as any).actionBlockName as string;
        const params = (event as any).params as Record<string, any> | undefined;
        const threadId = (event as any).threadId || agent.threadId || '';
        const agentId = (event as any).agentId || agent.id;
        const agentInstanceId = (event as any).agentInstanceId || agent.instanceId || '';

        logger.info(`[ActionBlockHandler] handleStartActionBlock request: name=${actionBlockName}, agentId=${agentId}, threadId=${threadId}`);

        if (!actionBlockName) {
            const response: StartActionBlockResponse = {
                type: 'startActionBlockResponse',
                success: false,
                error: 'actionBlockName is required',
                requestId: event.requestId
            };
            this.connectionManager.sendToConnection(agent.id, response);
            return;
        }

        try {
            await this.ensureRegistryInitialized();

            // Resolve ActionBlock by name
            const actionBlock = actionBlockRegistry.getActionBlock(actionBlockName);
            if (!actionBlock) {
                const response: StartActionBlockResponse = {
                    type: 'startActionBlockResponse',
                    success: false,
                    error: `ActionBlock not found: ${actionBlockName}`,
                    path: actionBlockRegistry.getSearchPath(),
                    requestId: event.requestId
                };
                this.connectionManager.sendToConnection(agent.id, response);
                return;
            }

            // Build thread context
            const threadContext = this.buildThreadContext(threadId, agentId, agentInstanceId);

            // Start the side execution
            const sideExecutionId = await sideExecutionManager.startSideExecution({
                actionBlockPath: actionBlock.path,
                threadId,
                parentAgentId: agentId,
                parentAgentInstanceId: agentInstanceId,
                threadContext,
                params
            });

            logger.info(
                `[ActionBlockHandler] Started ActionBlock: ${actionBlockName}, sideExecutionId: ${sideExecutionId}`
            );

            // Send actionBlockInvocation message to trigger the action block handler
            const invocationMessage = {
                type: 'actionBlockInvocation',
                sideExecutionId,
                actionBlockName,
                params: params || {},
                threadContext,
                timestamp: new Date().toISOString()
            };

            logger.info(`[ActionBlockHandler] Sending actionBlockInvocation to: ${sideExecutionId}`);
            this.connectionManager.sendToConnection(sideExecutionId, invocationMessage);

            // Wait for completion
            const completionResult = await sideExecutionManager.waitForCompletion(sideExecutionId);

            logger.info(`[ActionBlockHandler] ActionBlock completed: ${sideExecutionId}, success: ${completionResult.success}`);

            const response: StartActionBlockResponse = {
                type: 'startActionBlockResponse',
                success: completionResult.success,
                sideExecutionId,
                result: completionResult.result,
                error: completionResult.error,
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        } catch (error: any) {
            logger.error(`[ActionBlockHandler] Failed to start ActionBlock: ${error.message}`);

            const response: StartActionBlockResponse = {
                type: 'startActionBlockResponse',
                success: false,
                error: error.message || 'Failed to start ActionBlock',
                requestId: event.requestId
            };

            this.connectionManager.sendToConnection(agent.id, response);
        }
    }

    /**
     * Build ThreadContext from agent context
     */
    private buildThreadContext(threadId: string, agentId: string, agentInstanceId: string): ThreadContext {
        const threadContext: ThreadContext = {
            threadId,
            messages: [],
            projectPath: process.cwd(),
            agentId,
            agentInstanceId,
            metadata: {}
        };

        return threadContext;
    }

    /**
     * Send error response
     */
    private sendErrorResponse(agent: ClientConnection, requestId: string | undefined, error: string): void {
        this.connectionManager.sendToConnection(agent.id, {
            type: 'actionBlockResponse',
            success: false,
            error,
            requestId
        });
    }
}

export default ActionBlockHandler;
