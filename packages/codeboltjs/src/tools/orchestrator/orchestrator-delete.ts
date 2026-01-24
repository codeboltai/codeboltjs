/**
 * Orchestrator Delete Tool - Deletes an orchestrator
 * Wraps the SDK's orchestrator.deleteOrchestrator() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorDeleteParams {
    /** The orchestrator ID to delete */
    orchestrator_id: string;
}

class OrchestratorDeleteInvocation extends BaseToolInvocation<OrchestratorDeleteParams, ToolResult> {
    constructor(params: OrchestratorDeleteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.deleteOrchestrator(this.params.orchestrator_id);

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to delete orchestrator';
                return {
                    llmContent: `Orchestrator deletion failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Deleted orchestrator: ${this.params.orchestrator_id}`,
                returnDisplay: `Deleted orchestrator: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting orchestrator: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorDeleteTool extends BaseDeclarativeTool<OrchestratorDeleteParams, ToolResult> {
    static readonly Name: string = 'orchestrator_delete';

    constructor() {
        super(
            OrchestratorDeleteTool.Name,
            'OrchestratorDelete',
            'Deletes an orchestrator.',
            Kind.Edit,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to delete.',
                        type: 'string',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorDeleteParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator delete";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorDeleteParams): ToolInvocation<OrchestratorDeleteParams, ToolResult> {
        return new OrchestratorDeleteInvocation(params);
    }
}
