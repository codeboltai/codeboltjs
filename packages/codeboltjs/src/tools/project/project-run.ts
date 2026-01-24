/**
 * Project Run Tool - Runs the current project
 * Wraps the SDK's cbproject.runProject() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbproject from '../../modules/project';

/**
 * Parameters for the ProjectRun tool
 */
export interface ProjectRunToolParams {
    // No parameters required
}

class ProjectRunToolInvocation extends BaseToolInvocation<
    ProjectRunToolParams,
    ToolResult
> {
    constructor(params: ProjectRunToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbproject.runProject();

            return {
                llmContent: 'Project run command executed successfully',
                returnDisplay: 'Successfully executed project run command',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error running project: ${errorMessage}`,
                returnDisplay: `Error running project: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ProjectRun tool logic
 */
export class ProjectRunTool extends BaseDeclarativeTool<
    ProjectRunToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_run';

    constructor() {
        super(
            ProjectRunTool.Name,
            'ProjectRun',
            'Runs the current project. Executes the project run command configured for the project.',
            Kind.Execute,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ProjectRunToolParams,
    ): ToolInvocation<ProjectRunToolParams, ToolResult> {
        return new ProjectRunToolInvocation(params);
    }
}
