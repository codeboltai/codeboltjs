/**
 * Orchestrator Update Tool - Updates an existing orchestrator
 * Wraps the SDK's orchestrator.updateOrchestrator() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

/**
 * Parameters for the OrchestratorUpdate tool
 */
export interface OrchestratorUpdateToolParams {
    /**
     * The ID of the orchestrator to update
     */
    orchestrator_id: string;

    /**
     * The new name of the orchestrator (optional)
     */
    name?: string;

    /**
     * The new description of the orchestrator (optional)
     */
    description?: string;

    /**
     * The new agent ID (optional)
     */
    agent_id?: string;

    /**
     * The new default worker agent ID (optional)
     */
    default_worker_agent_id?: string;

    /**
     * Updated metadata for the orchestrator (optional)
     */
    metadata?: Record<string, any>;
}

class OrchestratorUpdateToolInvocation extends BaseToolInvocation<
    OrchestratorUpdateToolParams,
    ToolResult
> {
    constructor(params: OrchestratorUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateData: {
                name?: string;
                description?: string;
                agentId?: string;
                defaultWorkerAgentId?: string;
                metadata?: Record<string, any>;
            } = {};

            if (this.params.name !== undefined) {
                updateData.name = this.params.name;
            }
            if (this.params.description !== undefined) {
                updateData.description = this.params.description;
            }
            if (this.params.agent_id !== undefined) {
                updateData.agentId = this.params.agent_id;
            }
            if (this.params.default_worker_agent_id !== undefined) {
                updateData.defaultWorkerAgentId = this.params.default_worker_agent_id;
            }
            if (this.params.metadata !== undefined) {
                updateData.metadata = this.params.metadata;
            }

            const response = await orchestrator.updateOrchestrator(
                this.params.orchestrator_id,
                updateData
            );

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error updating orchestrator: ${errorMsg}`,
                    returnDisplay: `Error updating orchestrator: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response.data, null, 2),
                returnDisplay: `Successfully updated orchestrator: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating orchestrator: ${errorMessage}`,
                returnDisplay: `Error updating orchestrator: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the OrchestratorUpdate tool logic
 */
export class OrchestratorUpdateTool extends BaseDeclarativeTool<
    OrchestratorUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'orchestrator_update';

    constructor() {
        super(
            OrchestratorUpdateTool.Name,
            'OrchestratorUpdate',
            `Updates an existing orchestrator. Requires the orchestrator ID. Optionally updates name, description, agent ID, default worker agent ID, and/or metadata.`,
            Kind.Edit,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The unique identifier of the orchestrator to update',
                        type: 'string',
                    },
                    name: {
                        description: 'The new name of the orchestrator (optional)',
                        type: 'string',
                    },
                    description: {
                        description: 'The new description of the orchestrator (optional)',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The new agent ID to associate with this orchestrator (optional)',
                        type: 'string',
                    },
                    default_worker_agent_id: {
                        description: 'The new default worker agent ID (optional)',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Updated metadata for the orchestrator as key-value pairs (optional)',
                        type: 'object',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: OrchestratorUpdateToolParams,
    ): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "The 'orchestrator_id' parameter must be non-empty.";
        }

        // Check that at least one update field is provided
        const hasUpdate = params.name !== undefined ||
            params.description !== undefined ||
            params.agent_id !== undefined ||
            params.default_worker_agent_id !== undefined ||
            params.metadata !== undefined;

        if (!hasUpdate) {
            return "At least one field to update must be provided (name, description, agent_id, default_worker_agent_id, or metadata).";
        }

        return null;
    }

    protected createInvocation(
        params: OrchestratorUpdateToolParams,
    ): ToolInvocation<OrchestratorUpdateToolParams, ToolResult> {
        return new OrchestratorUpdateToolInvocation(params);
    }
}
