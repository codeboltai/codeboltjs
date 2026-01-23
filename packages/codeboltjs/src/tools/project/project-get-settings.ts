/**
 * Project Get Settings Tool - Retrieves project settings
 * Wraps the SDK's cbproject.getProjectSettings() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbproject from '../../modules/project';

/**
 * Parameters for the ProjectGetSettings tool
 */
export interface ProjectGetSettingsToolParams {
    // No parameters required
}

class ProjectGetSettingsToolInvocation extends BaseToolInvocation<
    ProjectGetSettingsToolParams,
    ToolResult
> {
    constructor(params: ProjectGetSettingsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbproject.getProjectSettings();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved project settings',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting project settings: ${errorMessage}`,
                returnDisplay: `Error getting project settings: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ProjectGetSettings tool logic
 */
export class ProjectGetSettingsTool extends BaseDeclarativeTool<
    ProjectGetSettingsToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_get_settings';

    constructor() {
        super(
            ProjectGetSettingsTool.Name,
            'ProjectGetSettings',
            'Retrieves the project settings from the server. Returns configuration and settings information for the current project.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ProjectGetSettingsToolParams,
    ): ToolInvocation<ProjectGetSettingsToolParams, ToolResult> {
        return new ProjectGetSettingsToolInvocation(params);
    }
}
