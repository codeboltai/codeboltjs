/**
 * Orchestrator List Tool - Lists all orchestrators
 * Wraps the SDK's orchestrator.listOrchestrators() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorListParams {
    // No required parameters
}

class OrchestratorListInvocation extends BaseToolInvocation<OrchestratorListParams, ToolResult> {
    constructor(params: OrchestratorListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.listOrchestrators();

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to list orchestrators';
                return {
                    llmContent: `Orchestrator list retrieval failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = 'Retrieved orchestrator list';
            if (response.data && Array.isArray(response.data)) {
                output += `\n\nOrchestrators (${response.data.length}):\n`;
                for (const orch of response.data) {
                    output += `- [${orch.status || 'idle'}] ${orch.name} (ID: ${orch.id}): ${orch.description || ''}\n`;
                }
            } else {
                output += '\n\n' + JSON.stringify(response.data, null, 2);
            }

            return {
                llmContent: output,
                returnDisplay: 'Retrieved orchestrator list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing orchestrators: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorListTool extends BaseDeclarativeTool<OrchestratorListParams, ToolResult> {
    static readonly Name: string = 'orchestrator_list';

    constructor() {
        super(
            OrchestratorListTool.Name,
            'OrchestratorList',
            'Lists all orchestrators.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: OrchestratorListParams): ToolInvocation<OrchestratorListParams, ToolResult> {
        return new OrchestratorListInvocation(params);
    }
}
