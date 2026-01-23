/**
 * Project Get Repo Map Tool - Retrieves the repository map
 * Wraps the SDK's cbproject.getRepoMap() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbproject from '../../modules/project';

/**
 * Parameters for the ProjectGetRepoMap tool
 */
export interface ProjectGetRepoMapToolParams {
    /**
     * Optional message parameter for repo map retrieval
     */
    message?: any;
}

class ProjectGetRepoMapToolInvocation extends BaseToolInvocation<
    ProjectGetRepoMapToolParams,
    ToolResult
> {
    constructor(params: ProjectGetRepoMapToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbproject.getRepoMap(this.params.message);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved repository map',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting repository map: ${errorMessage}`,
                returnDisplay: `Error getting repository map: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ProjectGetRepoMap tool logic
 */
export class ProjectGetRepoMapTool extends BaseDeclarativeTool<
    ProjectGetRepoMapToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_get_repo_map';

    constructor() {
        super(
            ProjectGetRepoMapTool.Name,
            'ProjectGetRepoMap',
            'Retrieves the repository map for the current project. Returns a structured representation of the project repository, optionally filtered by the provided message parameter.',
            Kind.Read,
            {
                properties: {
                    message: {
                        description: 'Optional message parameter for filtering or configuring the repo map retrieval.',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ProjectGetRepoMapToolParams,
    ): ToolInvocation<ProjectGetRepoMapToolParams, ToolResult> {
        return new ProjectGetRepoMapToolInvocation(params);
    }
}
