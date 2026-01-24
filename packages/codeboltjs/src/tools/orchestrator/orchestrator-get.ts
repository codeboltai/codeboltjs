/**
 * Orchestrator Get Tool - Gets a specific orchestrator by ID
 * Wraps the SDK's orchestrator.getOrchestrator() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorGetParams {
    /** The orchestrator ID to retrieve */
    orchestrator_id: string;
}

class OrchestratorGetInvocation extends BaseToolInvocation<OrchestratorGetParams, ToolResult> {
    constructor(params: OrchestratorGetParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.getOrchestrator(this.params.orchestrator_id);

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to get orchestrator';
                return {
                    llmContent: `Orchestrator retrieval failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Retrieved orchestrator: ${this.params.orchestrator_id}`;
            if (response.data) {
                const orch = response.data;
                output += `\n\nOrchestrator Details:\n`;
                output += `ID: ${orch.id}\n`;
                output += `Name: ${orch.name || 'N/A'}\n`;
                output += `Description: ${orch.description || 'N/A'}\n`;
                output += `Status: ${orch.status || 'idle'}\n`;
                output += `Agent ID: ${orch.agentId || 'N/A'}\n`;
                if (orch.defaultWorkerAgentId) output += `Default Worker Agent ID: ${orch.defaultWorkerAgentId}\n`;
                if (orch.threadId) output += `Thread ID: ${orch.threadId}\n`;
                if (orch.metadata) output += `Metadata: ${JSON.stringify(orch.metadata)}\n`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved orchestrator: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting orchestrator: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorGetTool extends BaseDeclarativeTool<OrchestratorGetParams, ToolResult> {
    static readonly Name: string = 'orchestrator_get';

    constructor() {
        super(
            OrchestratorGetTool.Name,
            'OrchestratorGet',
            'Retrieves details of a specific orchestrator by ID.',
            Kind.Read,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to retrieve.',
                        type: 'string',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorGetParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator get";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorGetParams): ToolInvocation<OrchestratorGetParams, ToolResult> {
        return new OrchestratorGetInvocation(params);
    }
}
