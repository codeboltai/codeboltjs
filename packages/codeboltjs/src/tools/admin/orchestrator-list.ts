/**
 * Orchestrator List Tool - Lists all orchestrators
 * Wraps the SDK's orchestrator.listOrchestrators() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

/**
 * Parameters for the OrchestratorList tool
 */
export interface OrchestratorListToolParams {
    // No parameters required for listing
}

class OrchestratorListToolInvocation extends BaseToolInvocation<
    OrchestratorListToolParams,
    ToolResult
> {
    constructor(params: OrchestratorListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.listOrchestrators();

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error listing orchestrators: ${errorMsg}`,
                    returnDisplay: `Error listing orchestrators: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const orchestrators = response.data || [];
            const count = Array.isArray(orchestrators) ? orchestrators.length : 0;

            return {
                llmContent: JSON.stringify(orchestrators, null, 2),
                returnDisplay: `Successfully listed ${count} orchestrator(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing orchestrators: ${errorMessage}`,
                returnDisplay: `Error listing orchestrators: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the OrchestratorList tool logic
 */
export class OrchestratorListTool extends BaseDeclarativeTool<
    OrchestratorListToolParams,
    ToolResult
> {
    static readonly Name: string = 'orchestrator_list';

    constructor() {
        super(
            OrchestratorListTool.Name,
            'OrchestratorList',
            `Lists all orchestrators. Returns an array of orchestrator instances with their IDs, names, descriptions, agent IDs, statuses, and metadata.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: OrchestratorListToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: OrchestratorListToolParams,
    ): ToolInvocation<OrchestratorListToolParams, ToolResult> {
        return new OrchestratorListToolInvocation(params);
    }
}
