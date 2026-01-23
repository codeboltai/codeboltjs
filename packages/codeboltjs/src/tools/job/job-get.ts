/**
 * Job Get Tool - Retrieves a job by its ID
 * Wraps the SDK's jobService.getJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';

/**
 * Parameters for the JobGet tool
 */
export interface JobGetToolParams {
    /**
     * The ID of the job to retrieve
     */
    job_id: string;
}

class JobGetToolInvocation extends BaseToolInvocation<
    JobGetToolParams,
    ToolResult
> {
    constructor(params: JobGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.getJob(this.params.job_id);

            if (!response.job) {
                return {
                    llmContent: `Job not found: ${this.params.job_id}`,
                    returnDisplay: `Job not found: ${this.params.job_id}`,
                    error: {
                        message: `Job not found: ${this.params.job_id}`,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Job Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Successfully retrieved job: ${this.params.job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving job: ${errorMessage}`,
                returnDisplay: `Error retrieving job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobGet tool
 */
export class JobGetTool extends BaseDeclarativeTool<
    JobGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_get';

    constructor() {
        super(
            JobGetTool.Name,
            'JobGet',
            `Retrieves a job by its ID. Returns the full job details including name, description, status, priority, assignees, labels, dependencies, and other metadata.`,
            Kind.Read,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to retrieve (e.g., "COD2-5")',
                        type: 'string',
                    },
                },
                required: ['job_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobGetToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: JobGetToolParams,
    ): ToolInvocation<JobGetToolParams, ToolResult> {
        return new JobGetToolInvocation(params);
    }
}
