/**
 * Orchestrator Update Status Tool - Updates orchestrator status
 * Wraps the SDK's orchestrator.updateOrchestratorStatus() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorUpdateStatusParams {
    /** The orchestrator ID to update status for */
    orchestrator_id: string;
    /** The new status for the orchestrator */
    status: 'idle' | 'running' | 'paused';
}

class OrchestratorUpdateStatusInvocation extends BaseToolInvocation<OrchestratorUpdateStatusParams, ToolResult> {
    constructor(params: OrchestratorUpdateStatusParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.updateOrchestratorStatus(
                this.params.orchestrator_id,
                this.params.status
            );

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to update orchestrator status';
                return {
                    llmContent: `Orchestrator status update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Updated status for orchestrator: ${this.params.orchestrator_id}`;
            output += `\nNew Status: ${this.params.status}`;
            if (response.data) {
                output += `\n\nOrchestrator Details:\n`;
                output += JSON.stringify(response.data, null, 2);
            }

            return {
                llmContent: output,
                returnDisplay: `Updated orchestrator status to: ${this.params.status}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating orchestrator status: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorUpdateStatusTool extends BaseDeclarativeTool<OrchestratorUpdateStatusParams, ToolResult> {
    static readonly Name: string = 'orchestrator_update_status';

    constructor() {
        super(
            OrchestratorUpdateStatusTool.Name,
            'OrchestratorUpdateStatus',
            'Updates the status of an orchestrator.',
            Kind.Edit,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to update status for.',
                        type: 'string',
                    },
                    status: {
                        description: "The new status for the orchestrator ('idle', 'running', or 'paused').",
                        type: 'string',
                        enum: ['idle', 'running', 'paused'],
                    },
                },
                required: ['orchestrator_id', 'status'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorUpdateStatusParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator update status";
        }
        if (!params.status) {
            return "'status' is required for orchestrator update status";
        }
        const validStatuses = ['idle', 'running', 'paused'];
        if (!validStatuses.includes(params.status)) {
            return `'status' must be one of: ${validStatuses.join(', ')}`;
        }
        return null;
    }

    protected createInvocation(params: OrchestratorUpdateStatusParams): ToolInvocation<OrchestratorUpdateStatusParams, ToolResult> {
        return new OrchestratorUpdateStatusInvocation(params);
    }
}
