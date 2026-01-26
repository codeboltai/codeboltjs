/**
 * Job Add Dependency Tool - Adds a dependency between two jobs
 * Wraps the SDK's jobService.addDependency() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { DependencyType } from '../../types/job';

/**
 * Parameters for the JobAddDependency tool
 */
export interface JobAddDependencyToolParams {
    /**
     * The ID of the job that will depend on another job
     */
    job_id: string;

    /**
     * The ID of the job that the first job depends on
     */
    depends_on_job_id: string;

    /**
     * Optional type of dependency
     */
    type?: DependencyType;
}

class JobAddDependencyToolInvocation extends BaseToolInvocation<
    JobAddDependencyToolParams,
    ToolResult
> {
    constructor(params: JobAddDependencyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.addDependency(
                this.params.job_id,
                this.params.depends_on_job_id,
                this.params.type
            );

            if (!response.job) {
                return {
                    llmContent: `Failed to add dependency: Job not found or operation failed`,
                    returnDisplay: `Failed to add dependency between jobs`,
                    error: {
                        message: 'Failed to add dependency: Job not found or operation failed',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added dependency: ${this.params.job_id} now depends on ${this.params.depends_on_job_id}${this.params.type ? ` (type: ${this.params.type})` : ''}\n\nUpdated Job:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Added dependency: ${this.params.job_id} -> ${this.params.depends_on_job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding dependency: ${errorMessage}`,
                returnDisplay: `Error adding dependency: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobAddDependency tool
 */
export class JobAddDependencyTool extends BaseDeclarativeTool<
    JobAddDependencyToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_add_dependency';

    constructor() {
        super(
            JobAddDependencyTool.Name,
            'JobAddDependency',
            `Adds a dependency between two jobs. The first job (job_id) will depend on the second job (depends_on_job_id). Dependencies can be of different types: 'blocks', 'related', 'parent-child', or 'discovered-from'.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job that will depend on another job',
                        type: 'string',
                    },
                    depends_on_job_id: {
                        description: 'The ID of the job that the first job depends on',
                        type: 'string',
                    },
                    type: {
                        description: 'Optional type of dependency',
                        type: 'string',
                        enum: ['blocks', 'related', 'parent-child', 'discovered-from'],
                    },
                },
                required: ['job_id', 'depends_on_job_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobAddDependencyToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (!params.depends_on_job_id || params.depends_on_job_id.trim() === '') {
            return "The 'depends_on_job_id' parameter must be non-empty.";
        }

        if (params.job_id === params.depends_on_job_id) {
            return "A job cannot depend on itself.";
        }

        if (params.type !== undefined) {
            const validTypes = ['blocks', 'related', 'parent-child', 'discovered-from'];
            if (!validTypes.includes(params.type)) {
                return `The 'type' parameter must be one of: ${validTypes.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: JobAddDependencyToolParams,
    ): ToolInvocation<JobAddDependencyToolParams, ToolResult> {
        return new JobAddDependencyToolInvocation(params);
    }
}
