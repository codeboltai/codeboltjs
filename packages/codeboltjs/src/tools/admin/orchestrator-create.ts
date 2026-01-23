/**
 * Orchestrator Create Tool - Creates a new orchestrator
 * Wraps the SDK's orchestrator.createOrchestrator() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

/**
 * Parameters for the OrchestratorCreate tool
 */
export interface OrchestratorCreateToolParams {
    /**
     * The name of the orchestrator
     */
    name: string;

    /**
     * A description of the orchestrator
     */
    description: string;

    /**
     * The ID of the agent to associate with this orchestrator
     */
    agent_id: string;

    /**
     * The ID of the default worker agent (optional)
     */
    default_worker_agent_id?: string;

    /**
     * Additional metadata for the orchestrator (optional)
     */
    metadata?: Record<string, any>;
}

class OrchestratorCreateToolInvocation extends BaseToolInvocation<
    OrchestratorCreateToolParams,
    ToolResult
> {
    constructor(params: OrchestratorCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.createOrchestrator({
                name: this.params.name,
                description: this.params.description,
                agentId: this.params.agent_id,
                defaultWorkerAgentId: this.params.default_worker_agent_id,
                metadata: this.params.metadata,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error creating orchestrator: ${errorMsg}`,
                    returnDisplay: `Error creating orchestrator: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response.data, null, 2),
                returnDisplay: `Successfully created orchestrator: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating orchestrator: ${errorMessage}`,
                returnDisplay: `Error creating orchestrator: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the OrchestratorCreate tool logic
 */
export class OrchestratorCreateTool extends BaseDeclarativeTool<
    OrchestratorCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'orchestrator_create';

    constructor() {
        super(
            OrchestratorCreateTool.Name,
            'OrchestratorCreate',
            `Creates a new orchestrator instance. Requires a name, description, and agent ID. Optionally accepts a default worker agent ID and metadata.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the orchestrator',
                        type: 'string',
                    },
                    description: {
                        description: 'A description of what the orchestrator does',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to associate with this orchestrator',
                        type: 'string',
                    },
                    default_worker_agent_id: {
                        description: 'The ID of the default worker agent (optional)',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Additional metadata for the orchestrator as key-value pairs (optional)',
                        type: 'object',
                    },
                },
                required: ['name', 'description', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: OrchestratorCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        if (!params.description || params.description.trim() === '') {
            return "The 'description' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: OrchestratorCreateToolParams,
    ): ToolInvocation<OrchestratorCreateToolParams, ToolResult> {
        return new OrchestratorCreateToolInvocation(params);
    }
}
