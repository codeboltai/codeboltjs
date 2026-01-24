/**
 * Side Execution Start Action Block Tool - Starts a side execution with an ActionBlock path
 * Wraps the SDK's codeboltSideExecution.startWithActionBlock() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltSideExecution from '../../modules/sideExecution';

/**
 * Parameters for the SideExecutionStartActionBlock tool
 */
export interface SideExecutionStartActionBlockParams {
    /**
     * Path to the ActionBlock directory
     */
    action_block_path: string;

    /**
     * Additional parameters to pass to the ActionBlock
     */
    params?: Record<string, any>;

    /**
     * Execution timeout in milliseconds (default: 5 minutes)
     */
    timeout?: number;
}

class SideExecutionStartActionBlockInvocation extends BaseToolInvocation<
    SideExecutionStartActionBlockParams,
    ToolResult
> {
    constructor(params: SideExecutionStartActionBlockParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltSideExecution.startWithActionBlock(
                this.params.action_block_path,
                this.params.params,
                this.params.timeout
            );

            if ((response as any).error) {
                const errorMsg = (response as any).error || 'Failed to start side execution';
                return {
                    llmContent: `Failed to start side execution with ActionBlock: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const executionId = (response as any).sideExecutionId || (response as any).id;

            return {
                llmContent: `Side execution started successfully with ActionBlock.\nExecution ID: ${executionId}\nActionBlock Path: ${this.params.action_block_path}`,
                returnDisplay: `Side execution started: ${executionId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting side execution with ActionBlock: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for starting a side execution with an ActionBlock path
 */
export class SideExecutionStartActionBlockTool extends BaseDeclarativeTool<
    SideExecutionStartActionBlockParams,
    ToolResult
> {
    static readonly Name: string = 'side_execution_start_action_block';

    constructor() {
        super(
            SideExecutionStartActionBlockTool.Name,
            'Start Side Execution (ActionBlock)',
            'Start a side execution with an ActionBlock path. This runs code in an isolated child process using a predefined ActionBlock.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    action_block_path: {
                        type: 'string',
                        description: 'Path to the ActionBlock directory'
                    },
                    params: {
                        type: 'object',
                        description: 'Additional parameters to pass to the ActionBlock',
                        additionalProperties: true
                    },
                    timeout: {
                        type: 'number',
                        description: 'Execution timeout in milliseconds (default: 5 minutes)'
                    }
                },
                required: ['action_block_path']
            }
        );
    }

    protected override validateToolParamValues(
        params: SideExecutionStartActionBlockParams,
    ): string | null {
        if (!params.action_block_path || params.action_block_path.trim() === '') {
            return "The 'action_block_path' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SideExecutionStartActionBlockParams,
    ): ToolInvocation<SideExecutionStartActionBlockParams, ToolResult> {
        return new SideExecutionStartActionBlockInvocation(params);
    }
}
