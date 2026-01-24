/**
 * Project Get Editor Status Tool - Retrieves the editor file status
 * Wraps the SDK's cbproject.getEditorFileStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbproject from '../../modules/project';

/**
 * Parameters for the ProjectGetEditorStatus tool
 */
export interface ProjectGetEditorStatusToolParams {
    // No parameters required
}

class ProjectGetEditorStatusToolInvocation extends BaseToolInvocation<
    ProjectGetEditorStatusToolParams,
    ToolResult
> {
    constructor(params: ProjectGetEditorStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbproject.getEditorFileStatus();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved editor file status',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting editor file status: ${errorMessage}`,
                returnDisplay: `Error getting editor file status: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ProjectGetEditorStatus tool logic
 */
export class ProjectGetEditorStatusTool extends BaseDeclarativeTool<
    ProjectGetEditorStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_get_editor_status';

    constructor() {
        super(
            ProjectGetEditorStatusTool.Name,
            'ProjectGetEditorStatus',
            'Retrieves the current editor file status. Returns information about files currently open or modified in the editor.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ProjectGetEditorStatusToolParams,
    ): ToolInvocation<ProjectGetEditorStatusToolParams, ToolResult> {
        return new ProjectGetEditorStatusToolInvocation(params);
    }
}
