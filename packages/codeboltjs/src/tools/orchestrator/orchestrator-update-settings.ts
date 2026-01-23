/**
 * Orchestrator Update Settings Tool - Updates orchestrator settings
 * Wraps the SDK's orchestrator.updateOrchestratorSettings() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import orchestrator from '../../modules/orchestrator';

export interface OrchestratorUpdateSettingsParams {
    /** The orchestrator ID to update settings for */
    orchestrator_id: string;
    /** New name (optional) */
    name?: string;
    /** New description (optional) */
    description?: string;
    /** New default worker agent ID (optional) */
    default_worker_agent_id?: string;
    /** Updated metadata (optional) */
    metadata?: Record<string, any>;
}

class OrchestratorUpdateSettingsInvocation extends BaseToolInvocation<OrchestratorUpdateSettingsParams, ToolResult> {
    constructor(params: OrchestratorUpdateSettingsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const settingsData: any = {};
            if (this.params.name !== undefined) settingsData.name = this.params.name;
            if (this.params.description !== undefined) settingsData.description = this.params.description;
            if (this.params.default_worker_agent_id !== undefined) settingsData.defaultWorkerAgentId = this.params.default_worker_agent_id;
            if (this.params.metadata !== undefined) settingsData.metadata = this.params.metadata;

            const response = await orchestrator.updateOrchestratorSettings(this.params.orchestrator_id, settingsData);

            if (response && response.success === false) {
                const errorMsg = response.error?.message || 'Failed to update orchestrator settings';
                return {
                    llmContent: `Orchestrator settings update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Updated settings for orchestrator: ${this.params.orchestrator_id}`;
            if (response.data) {
                output += `\n\nUpdated Settings:\n`;
                output += JSON.stringify(response.data, null, 2);
            }

            return {
                llmContent: output,
                returnDisplay: `Updated orchestrator settings: ${this.params.orchestrator_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating orchestrator settings: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class OrchestratorUpdateSettingsTool extends BaseDeclarativeTool<OrchestratorUpdateSettingsParams, ToolResult> {
    static readonly Name: string = 'orchestrator_update_settings';

    constructor() {
        super(
            OrchestratorUpdateSettingsTool.Name,
            'OrchestratorUpdateSettings',
            'Updates settings for an existing orchestrator.',
            Kind.Edit,
            {
                properties: {
                    orchestrator_id: {
                        description: 'The ID of the orchestrator to update settings for.',
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

    protected override validateToolParamValues(params: OrchestratorUpdateSettingsParams): string | null {
        if (!params.orchestrator_id || params.orchestrator_id.trim() === '') {
            return "'orchestrator_id' is required for orchestrator update settings";
        }
        return null;
    }

    protected createInvocation(params: OrchestratorUpdateSettingsParams): ToolInvocation<OrchestratorUpdateSettingsParams, ToolResult> {
        return new OrchestratorUpdateSettingsInvocation(params);
    }
}
