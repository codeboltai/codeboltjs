/**
 * Orchestrator Update Tool - Updates an existing orchestrator
 * Wraps the SDK's orchestrator.updateOrchestrator() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorUpdateParams {
    /** The orchestrator ID to update */
    orchestrator_id: string;
    /** New name for the orchestrator (optional) */
    name?: string;
    /** New description for the orchestrator (optional) */
    description?: string;
    /** New agent ID for the orchestrator (optional) */
    agent_id?: string;
    /** New default worker agent ID (optional) */
    default_worker_agent_id?: string;
    /** Updated metadata (optional) */
    metadata?: Record<string, any>;
}

class OrchestratorUpdateInvocation extends BaseToolInvocation<OrchestratorUpdateParams, ToolResult> {
    constructor(params: OrchestratorUpdateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateData: any = {};
            if (this.params.name !== undefined) updateData.name = this.params.name;
            if (this.params.description !== undefined) updateData.description = this.params.description;
            if (this.params.agent_id !== undefined) updateData.agentId = this.params.agent_id;
            if (this.params.default_worker_agent_id !== undefined) updateData.defaultWorkerAgentId = this.params.default_worker_agent_id;
            if (this.params.metadata !== undefined) updateData.metadata = this.params.metadata;

            const response = await orchestrator.updateOrchestrator(this.params.orchestrator_id, updateData);

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to update orchestrator';
                return {
                    llmContent: `Orchestrator update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Updated orchestrator: ${this.params.orchestrator_id}`;
            if (response.data) {
                output += `\n\nUpdated Orchestrator Details:\n`;
                output += JSON.stringify(response.data, null, 2);
            }

            return {
                llmContent: output,
                returnDisplay: `Updated orchestrator: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating orchestrator: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorUpdateTool extends BaseDeclarativeTool<OrchestratorUpdateParams, ToolResult> {
    static readonly Name: string = 'orchestrator_update';

    constructor() {
        super(
            OrchestratorUpdateTool.Name,
            'OrchestratorUpdate',
            'Updates an existing orchestrator.',
            Kind.Edit,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to update.',
                        type: 'string',
                    },
                    name: {
                        description: 'New name for the orchestrator.',
                        type: 'string',
                    },
                    description: {
                        description: 'New description for the orchestrator.',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'New agent ID for the orchestrator.',
                        type: 'string',
                    },
                    default_worker_agent_id: {
                        description: 'New default worker agent ID.',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Updated metadata for the orchestrator.',
                        type: 'object',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorUpdateParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator update";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorUpdateParams): ToolInvocation<OrchestratorUpdateParams, ToolResult> {
        return new OrchestratorUpdateInvocation(params);
    }
}
