/**
 * Episodic Memory Create Tool - Creates a new episodic memory
 * Wraps the SDK's cbepisodicMemory.createMemory() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryCreate tool
 */
export interface EpisodicMemoryCreateToolParams {
    /**
     * The title of the episodic memory to create
     */
    title: string;
}

class EpisodicMemoryCreateToolInvocation extends BaseToolInvocation<
    EpisodicMemoryCreateToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.createMemory({
                title: this.params.title,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error creating episodic memory: ${errorMsg}`,
                    returnDisplay: `Error creating episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const memory = response.data;
            return {
                llmContent: `Successfully created episodic memory.\n\nMemory Details:\n${JSON.stringify(memory, null, 2)}`,
                returnDisplay: `Successfully created episodic memory (ID: ${memory?.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating episodic memory: ${errorMessage}`,
                returnDisplay: `Error creating episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryCreate tool logic
 */
export class EpisodicMemoryCreateTool extends BaseDeclarativeTool<
    EpisodicMemoryCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_create';

    constructor() {
        super(
            EpisodicMemoryCreateTool.Name,
            'EpisodicMemoryCreate',
            'Creates a new episodic memory with the specified title. Episodic memories are containers that store events and can be used to track activities, conversations, or workflows over time.',
            Kind.Edit,
            {
                properties: {
                    title: {
                        description: 'The title for the new episodic memory. Should be descriptive of the purpose or context of the memory.',
                        type: 'string',
                    },
                },
                required: ['title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryCreateToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryCreateToolParams,
    ): ToolInvocation<EpisodicMemoryCreateToolParams, ToolResult> {
        return new EpisodicMemoryCreateToolInvocation(params);
    }
}
