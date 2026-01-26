/**
 * Project Get Path Tool - Retrieves the project path
 * Wraps the SDK's cbproject.getProjectPath() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbproject from '../../modules/project';

/**
 * Parameters for the ProjectGetPath tool
 */
export interface ProjectGetPathToolParams {
    // No parameters required
}

class ProjectGetPathToolInvocation extends BaseToolInvocation<
    ProjectGetPathToolParams,
    ToolResult
> {
    constructor(params: ProjectGetPathToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbproject.getProjectPath();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved project path',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting project path: ${errorMessage}`,
                returnDisplay: `Error getting project path: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ProjectGetPath tool logic
 */
export class ProjectGetPathTool extends BaseDeclarativeTool<
    ProjectGetPathToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_get_path';

    constructor() {
        super(
            ProjectGetPathTool.Name,
            'ProjectGetPath',
            'Retrieves the path of the current project. Returns the absolute file system path where the project is located.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ProjectGetPathToolParams,
    ): ToolInvocation<ProjectGetPathToolParams, ToolResult> {
        return new ProjectGetPathToolInvocation(params);
    }
}
