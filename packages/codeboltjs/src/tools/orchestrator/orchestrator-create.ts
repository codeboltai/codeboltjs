/**
 * Orchestrator Create Tool - Creates a new orchestrator
 * Wraps the SDK's orchestrator.createOrchestrator() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator, { OrchestratorInstance } from '../../modules/orchestrator';

export interface OrchestratorCreateParams {
    /** Name of the orchestrator */
    name: string;
    /** Description of the orchestrator */
    description: string;
    /** Agent ID for the orchestrator */
    agent_id: string;
    /** Default worker agent ID (optional) */
    default_worker_agent_id?: string;
    /** Additional metadata (optional) */
    metadata?: Record<string, any>;
}

class OrchestratorCreateInvocation extends BaseToolInvocation<OrchestratorCreateParams, ToolResult> {
    constructor(params: OrchestratorCreateParams) {
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

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to create orchestrator';
                return {
                    llmContent: `Orchestrator creation failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Created orchestrator: ${this.params.name}`;
            if (response.data) {
                const orch = response.data as OrchestratorInstance;
                output += `\n\nOrchestrator ID: ${orch.id || 'N/A'}`;
                output += `\nName: ${orch.name || this.params.name}`;
                output += `\nDescription: ${orch.description || this.params.description}`;
                output += `\nAgent ID: ${orch.agentId || this.params.agent_id}`;
                if (orch.status) output += `\nStatus: ${orch.status}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Created orchestrator: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating orchestrator: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorCreateTool extends BaseDeclarativeTool<OrchestratorCreateParams, ToolResult> {
    static readonly Name: string = 'orchestrator_create';

    constructor() {
        super(
            OrchestratorCreateTool.Name,
            'OrchestratorCreate',
            'Creates a new orchestrator.',
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the orchestrator.',
                        type: 'string',
                    },
                    description: {
                        description: 'The description of the orchestrator.',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The agent ID for the orchestrator.',
                        type: 'string',
                    },
                    default_worker_agent_id: {
                        description: 'The default worker agent ID (optional).',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Additional metadata for the orchestrator (optional).',
                        type: 'object',
                    },
                },
                required: ['name', 'description', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorCreateParams): string | null {
        if (!params.name || params.name.trim() === '') {
            return "'name' is required for orchestrator create";
        }
        if (!params.description || params.description.trim() === '') {
            return "'description' is required for orchestrator create";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "'agent_id' is required for orchestrator create";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorCreateParams): ToolInvocation<OrchestratorCreateParams, ToolResult> {
        return new OrchestratorCreateInvocation(params);
    }
}
