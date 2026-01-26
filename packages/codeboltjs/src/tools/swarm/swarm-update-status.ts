/**
 * Swarm Update Status Tool - Updates an agent's status
 * Wraps the SDK's swarmService.updateAgentStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmUpdateStatus tool
 */
export interface SwarmUpdateStatusToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the agent
     */
    agent_id: string;

    /**
     * The new status of the agent
     */
    status: 'active' | 'idle' | 'busy' | 'offline';

    /**
     * Optional current task the agent is working on
     */
    current_task?: string;

    /**
     * Optional metadata for the status update
     */
    metadata?: Record<string, any>;
}

class SwarmUpdateStatusToolInvocation extends BaseToolInvocation<
    SwarmUpdateStatusToolParams,
    ToolResult
> {
    constructor(params: SwarmUpdateStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.updateAgentStatus(
                this.params.swarm_id,
                this.params.agent_id,
                {
                    status: this.params.status,
                    currentTask: this.params.current_task,
                    metadata: this.params.metadata,
                }
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully updated agent status',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating status: ${errorMessage}`,
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
 * Implementation of the SwarmUpdateStatus tool
 */
export class SwarmUpdateStatusTool extends BaseDeclarativeTool<
    SwarmUpdateStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_update_status';

    constructor() {
        super(
            SwarmUpdateStatusTool.Name,
            'SwarmUpdateStatus',
            'Updates the status of an agent in a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent',
                        type: 'string',
                    },
                    status: {
                        description: 'The new status of the agent',
                        type: 'string',
                        enum: ['active', 'idle', 'busy', 'offline'],
                    },
                    current_task: {
                        description: 'Optional current task the agent is working on',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata for the status update',
                        type: 'object',
                    },
                },
                required: ['swarm_id', 'agent_id', 'status'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmUpdateStatusToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        const validStatuses = ['active', 'idle', 'busy', 'offline'];
        if (!validStatuses.includes(params.status)) {
            return `The 'status' parameter must be one of: ${validStatuses.join(', ')}`;
        }
        return null;
    }

    protected createInvocation(
        params: SwarmUpdateStatusToolParams,
    ): ToolInvocation<SwarmUpdateStatusToolParams, ToolResult> {
        return new SwarmUpdateStatusToolInvocation(params);
    }
}
