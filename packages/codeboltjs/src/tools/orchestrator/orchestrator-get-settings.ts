/**
 * Orchestrator Get Settings Tool - Gets orchestrator settings by ID
 * Wraps the SDK's orchestrator.getOrchestratorSettings() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorGetSettingsParams {
    /** The orchestrator ID to get settings for */
    orchestrator_id: string;
}

class OrchestratorGetSettingsInvocation extends BaseToolInvocation<OrchestratorGetSettingsParams, ToolResult> {
    constructor(params: OrchestratorGetSettingsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await orchestrator.getOrchestratorSettings(this.params.orchestrator_id);

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to get orchestrator settings';
                return {
                    llmContent: `Orchestrator settings retrieval failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Retrieved settings for orchestrator: ${this.params.orchestrator_id}`;
            if (response.data) {
                output += `\n\nOrchestrator Settings:\n`;
                output += JSON.stringify(response.data, null, 2);
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved orchestrator settings: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting orchestrator settings: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorGetSettingsTool extends BaseDeclarativeTool<OrchestratorGetSettingsParams, ToolResult> {
    static readonly Name: string = 'orchestrator_get_settings';

    constructor() {
        super(
            OrchestratorGetSettingsTool.Name,
            'OrchestratorGetSettings',
            'Retrieves settings for a specific orchestrator by ID.',
            Kind.Read,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to get settings for.',
                        type: 'string',
                    },
                },
                required: ['orchestrator_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: OrchestratorGetSettingsParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator get settings";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorGetSettingsParams): ToolInvocation<OrchestratorGetSettingsParams, ToolResult> {
        return new OrchestratorGetSettingsInvocation(params);
    }
}
