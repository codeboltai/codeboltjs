/**
 * Orchestrator Get Tool - Gets an orchestrator by ID
 * Wraps the SDK's orchestrator.getOrchestrator() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

/**
 * Parameters for the OrchestratorGet tool
 */
export interface OrchestratorGetToolParams {
    /**
     * The ID of the orchestrator to retrieve
     */
    orchestrator_id: string;
}

class OrchestratorGetToolInvocation extends BaseToolInvocation<
    OrchestratorGetToolParams,
    ToolResult
> {
    constructor(params: OrchestratorGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.getOrchestrator(this.params.orchestrator_id);

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error getting orchestrator: ${errorMsg}`,
                    returnDisplay: `Error getting orchestrator: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response.data, null, 2),
                returnDisplay: `Successfully retrieved orchestrator: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting orchestrator: ${errorMessage}`,
                returnDisplay: `Error getting orchestrator: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the OrchestratorGet tool logic
 */
export class OrchestratorGetTool extends BaseDeclarativeTool<
    OrchestratorGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'orchestrator_get';

    constructor() {
        super(
            OrchestratorGetTool.Name,
            'OrchestratorGet',
            `Gets a specific orchestrator by its ID. Returns the orchestrator instance details including ID, name, description, agent ID, status, and metadata.`,
            Kind.Read,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The unique identifier of the orchestrator to retrieve',
                        type: 'string',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: OrchestratorGetToolParams,
    ): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "The 'orchestrator_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: OrchestratorGetToolParams,
    ): ToolInvocation<OrchestratorGetToolParams, ToolResult> {
        return new OrchestratorGetToolInvocation(params);
    }
}
