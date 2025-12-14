import cbws from '../core/websocket';
import type {
    ActionBlock,
    StartSideExecutionResponse,
    StopSideExecutionResponse,
    ListActionBlocksResponse,
    GetSideExecutionStatusResponse
} from '@codebolt/types/sdk';

// Re-export types for convenience
export type {
    ActionBlock,
    StartSideExecutionResponse,
    StopSideExecutionResponse,
    ListActionBlocksResponse,
    GetSideExecutionStatusResponse
} from '@codebolt/types/sdk';

/**
 * Side Execution Module
 * Provides functionality for running code in isolated child processes
 */

const codeboltSideExecution = {
    /**
     * Start a side execution with an ActionBlock path
     * @param actionBlockPath - Path to the ActionBlock directory
     * @param params - Additional parameters to pass to the ActionBlock
     * @param timeout - Execution timeout in milliseconds (default: 5 minutes)
     * @returns Promise resolving to the side execution ID
     */
    startWithActionBlock: (
        actionBlockPath: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartSideExecutionResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'sideExecution',
                action: 'startSideExecution',
                actionBlockPath,
                params,
                timeout
            },
            'startSideExecutionResponse'
        );
    },

    /**
     * Start a side execution with inline JavaScript code
     * @param inlineCode - JavaScript code to execute
     * @param params - Additional parameters available in the execution context
     * @param timeout - Execution timeout in milliseconds (default: 5 minutes)
     * @returns Promise resolving to the side execution ID
     */
    startWithCode: (
        inlineCode: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartSideExecutionResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'sideExecution',
                action: 'startSideExecution',
                inlineCode,
                params,
                timeout
            },
            'startSideExecutionResponse'
        );
    },

    /**
     * Stop a running side execution
     * @param sideExecutionId - ID of the side execution to stop
     * @returns Promise resolving to success status
     */
    stop: (sideExecutionId: string): Promise<StopSideExecutionResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'sideExecution',
                action: 'stopSideExecution',
                sideExecutionId
            },
            'stopSideExecutionResponse'
        );
    },

    /**
     * List all available ActionBlocks
     * @param projectPath - Optional project path to search for ActionBlocks
     * @returns Promise resolving to list of ActionBlocks
     */
    listActionBlocks: (projectPath?: string): Promise<ListActionBlocksResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'sideExecution',
                action: 'listActionBlocks',
                projectPath
            },
            'listActionBlocksResponse'
        );
    },

    /**
     * Get the status of a side execution
     * @param sideExecutionId - ID of the side execution
     * @returns Promise resolving to execution status
     */
    getStatus: (sideExecutionId: string): Promise<GetSideExecutionStatusResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'sideExecution',
                action: 'getSideExecutionStatus',
                sideExecutionId
            },
            'getSideExecutionStatusResponse'
        );
    }
};

export default codeboltSideExecution;
