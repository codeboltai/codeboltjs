/**
 * Side Execution List Action Blocks Tool - Lists all available ActionBlocks
 * Wraps the SDK's codeboltSideExecution.listActionBlocks() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltSideExecution from '../../modules/sideExecution';

/**
 * Parameters for the SideExecutionListActionBlocks tool
 */
export interface SideExecutionListActionBlocksParams {
    /**
     * Optional project path to search for ActionBlocks
     */
    project_path?: string;
}

class SideExecutionListActionBlocksInvocation extends BaseToolInvocation<
    SideExecutionListActionBlocksParams,
    ToolResult
> {
    constructor(params: SideExecutionListActionBlocksParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltSideExecution.listActionBlocks(
                this.params.project_path
            );

            if ((response as any).error) {
                const errorMsg = (response as any).error || 'Failed to list ActionBlocks';
                return {
                    llmContent: `Failed to list ActionBlocks: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const actionBlocks = (response as any).actionBlocks || (response as any).blocks || [];
            const count = actionBlocks.length;

            let llmContent = `Found ${count} ActionBlock(s)`;
            if (this.params.project_path) {
                llmContent += ` in project: ${this.params.project_path}`;
            }
            llmContent += '\n\n';

            if (count > 0) {
                llmContent += 'ActionBlocks:\n';
                for (const block of actionBlocks) {
                    const name = block.name || block.path || 'Unknown';
                    const description = block.description || '';
                    llmContent += `- ${name}${description ? `: ${description}` : ''}\n`;
                }
            }

            return {
                llmContent,
                returnDisplay: `Found ${count} ActionBlock(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing ActionBlocks: ${errorMessage}`,
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
 * Tool for listing all available ActionBlocks
 */
export class SideExecutionListActionBlocksTool extends BaseDeclarativeTool<
    SideExecutionListActionBlocksParams,
    ToolResult
> {
    static readonly Name: string = 'side_execution_list_action_blocks';

    constructor() {
        super(
            SideExecutionListActionBlocksTool.Name,
            'List ActionBlocks',
            'List all available ActionBlocks that can be used for side execution. Optionally filter by project path.',
            Kind.Read,
            {
                type: 'object',
                properties: {
                    project_path: {
                        type: 'string',
                        description: 'Optional project path to search for ActionBlocks'
                    }
                },
                required: []
            }
        );
    }

    protected createInvocation(
        params: SideExecutionListActionBlocksParams,
    ): ToolInvocation<SideExecutionListActionBlocksParams, ToolResult> {
        return new SideExecutionListActionBlocksInvocation(params);
    }
}
