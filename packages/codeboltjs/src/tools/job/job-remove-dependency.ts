/**
 * Job Remove Dependency Tool - Removes a dependency between two jobs
 * Wraps the SDK's jobService.removeDependency() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';

/**
 * Parameters for the JobRemoveDependency tool
 */
export interface JobRemoveDependencyToolParams {
    /**
     * The ID of the job to remove a dependency from
     */
    job_id: string;

    /**
     * The ID of the dependency job to remove
     */
    depends_on_job_id: string;
}

class JobRemoveDependencyToolInvocation extends BaseToolInvocation<
    JobRemoveDependencyToolParams,
    ToolResult
> {
    constructor(params: JobRemoveDependencyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.removeDependency(
                this.params.job_id,
                this.params.depends_on_job_id
            );

            if (!response.job) {
                return {
                    llmContent: `Failed to remove dependency: Job not found or operation failed`,
                    returnDisplay: `Failed to remove dependency between jobs`,
                    error: {
                        message: 'Failed to remove dependency: Job not found or operation failed',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully removed dependency: ${this.params.job_id} no longer depends on ${this.params.depends_on_job_id}\n\nUpdated Job:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Removed dependency: ${this.params.job_id} -/-> ${this.params.depends_on_job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error removing dependency: ${errorMessage}`,
                returnDisplay: `Error removing dependency: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobRemoveDependency tool
 */
export class JobRemoveDependencyTool extends BaseDeclarativeTool<
    JobRemoveDependencyToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_remove_dependency';

    constructor() {
        super(
            JobRemoveDependencyTool.Name,
            'JobRemoveDependency',
            `Removes a dependency between two jobs. The dependency from the first job (job_id) on the second job (depends_on_job_id) will be removed, potentially unblocking the first job.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to remove a dependency from',
                        type: 'string',
                    },
                    depends_on_job_id: {
                        description: 'The ID of the dependency job to remove',
                        type: 'string',
                    },
                },
                required: ['job_id', 'depends_on_job_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobRemoveDependencyToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (!params.depends_on_job_id || params.depends_on_job_id.trim() === '') {
            return "The 'depends_on_job_id' parameter must be non-empty.";
        }

        if (params.job_id === params.depends_on_job_id) {
            return "A job cannot have a dependency on itself.";
        }

        return null;
    }

    protected createInvocation(
        params: JobRemoveDependencyToolParams,
    ): ToolInvocation<JobRemoveDependencyToolParams, ToolResult> {
        return new JobRemoveDependencyToolInvocation(params);
    }
}
