import cbws from '../core/websocket';

/**
 * ActionBlock Types
 */
export enum ActionBlockType {
    FILESYSTEM = 'filesystem',
    RUNTIME = 'runtime',
    BUILTIN = 'builtin'
}

export interface ActionBlockMetadata {
    author?: string;
    tags?: string[];
    dependencies?: string[];
    inputs?: ActionBlockInput[];
    outputs?: ActionBlockOutput[];
}

export interface ActionBlockInput {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
}

export interface ActionBlockOutput {
    name: string;
    type: string;
    description?: string;
}

export interface ActionBlock {
    id: string;
    name: string;
    description: string;
    version: string;
    entryPoint: string;
    path: string;
    type: ActionBlockType;
    metadata: ActionBlockMetadata;
}

export interface ActionBlockFilter {
    type?: ActionBlockType;
}

/**
 * Response Types
 */
export interface ListActionBlocksResponse {
    type: 'listActionBlocksResponse';
    success: boolean;
    actionBlocks: ActionBlock[];
    error?: string;
    requestId?: string;
}

export interface GetActionBlockDetailResponse {
    type: 'getActionBlockDetailResponse';
    success: boolean;
    actionBlock?: ActionBlock;
    error?: string;
    requestId?: string;
}

export interface StartActionBlockResponse {
    type: 'startActionBlockResponse';
    success: boolean;
    sideExecutionId?: string;
    result?: any;
    error?: string;
    requestId?: string;
}

export interface StartActionBlockOptions {
    actionBlockId?: string;
    actionBlockPath?: string;
    params?: Record<string, any>;
    timeout?: number;
}

/**
 * ActionBlock Module
 * Provides functionality for managing and executing ActionBlocks
 */
const codeboltActionBlock = {
    /**
     * List all available ActionBlocks
     * @param filter - Optional filter to narrow results by type
     * @returns Promise resolving to list of ActionBlocks
     */
    list: (filter?: ActionBlockFilter): Promise<ListActionBlocksResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'actionBlock',
                action: 'listActionBlocks',
                filterType: filter?.type
            },
            'listActionBlocksResponse'
        );
    },

    /**
     * Get detailed information about a specific ActionBlock
     * @param actionBlockId - ID of the ActionBlock to retrieve
     * @returns Promise resolving to ActionBlock details
     */
    getDetail: (actionBlockId: string): Promise<GetActionBlockDetailResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'actionBlock',
                action: 'getActionBlockDetail',
                actionBlockId
            },
            'getActionBlockDetailResponse'
        );
    },

    /**
     * Start an ActionBlock as a side execution
     * @param options - Start options with actionBlockId or actionBlockPath
     * @returns Promise resolving to execution result
     */
    start: (options: StartActionBlockOptions): Promise<StartActionBlockResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'actionBlock',
                action: 'startActionBlock',
                actionBlockId: options.actionBlockId,
                actionBlockPath: options.actionBlockPath,
                params: options.params,
                timeout: options.timeout
            },
            'startActionBlockResponse'
        );
    },

    /**
     * Start an ActionBlock by ID
     * @param actionBlockId - ID of the ActionBlock to start
     * @param params - Optional parameters to pass to the ActionBlock
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution result
     */
    startById: (
        actionBlockId: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartActionBlockResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'actionBlock',
                action: 'startActionBlock',
                actionBlockId,
                params,
                timeout
            },
            'startActionBlockResponse'
        );
    },

    /**
     * Start an ActionBlock by path
     * @param actionBlockPath - Path to the ActionBlock directory
     * @param params - Optional parameters to pass to the ActionBlock
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution result
     */
    startByPath: (
        actionBlockPath: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartActionBlockResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'actionBlock',
                action: 'startActionBlock',
                actionBlockPath,
                params,
                timeout
            },
            'startActionBlockResponse'
        );
    }
};

export default codeboltActionBlock;
