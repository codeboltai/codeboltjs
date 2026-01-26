/**
 * Project Structure Update Git Tool - Updates git information
 * Wraps the SDK's projectStructure.updateGit() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateGit tool
 */
export interface UpdateGitToolParams {
    /** Optional repository URL */
    repository?: string;
    /** Optional current branch */
    branch?: string;
    /** Optional remote name */
    remote?: string;
    /** Optional main branch name */
    mainBranch?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateGitToolInvocation extends BaseToolInvocation<
    UpdateGitToolParams,
    ToolResult
> {
    constructor(params: UpdateGitToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { workspacePath, ...gitInfo } = this.params;
            const response = await projectStructureService.updateGit(
                gitInfo,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully updated git information',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating git info: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool to update git information
 */
export class UpdateGitTool extends BaseDeclarativeTool<
    UpdateGitToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_git';

    constructor() {
        super(
            UpdateGitTool.Name,
            'UpdateGit',
            'Updates git information including repository URL, branch, and remote settings.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    repository: {
                        type: 'string',
                        description: 'Repository URL',
                    },
                    branch: {
                        type: 'string',
                        description: 'Current branch name',
                    },
                    remote: {
                        type: 'string',
                        description: 'Remote name',
                    },
                    mainBranch: {
                        type: 'string',
                        description: 'Main branch name',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: [],
            },
        );
    }

    protected createInvocation(
        params: UpdateGitToolParams,
    ): ToolInvocation<UpdateGitToolParams, ToolResult> {
        return new UpdateGitToolInvocation(params);
    }
}
