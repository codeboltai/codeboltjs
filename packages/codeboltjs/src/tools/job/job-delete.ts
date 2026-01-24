/**
 * Job Delete Tool - Deletes a job by its ID
 * Wraps the SDK's jobService.deleteJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';

/**
 * Parameters for the JobDelete tool
 */
export interface JobDeleteToolParams {
    /**
     * The ID of the job to delete
     */
    job_id: string;
}

class JobDeleteToolInvocation extends BaseToolInvocation<
    JobDeleteToolParams,
    ToolResult
> {
    constructor(params: JobDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.deleteJob(this.params.job_id);

            if (!response.deleted) {
                return {
                    llmContent: `Failed to delete job: ${this.params.job_id}`,
                    returnDisplay: `Failed to delete job: ${this.params.job_id}`,
                    error: {
                        message: `Failed to delete job: ${this.params.job_id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted job: ${this.params.job_id}`,
                returnDisplay: `Successfully deleted job: ${this.params.job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting job: ${errorMessage}`,
                returnDisplay: `Error deleting job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobDelete tool
 */
export class JobDeleteTool extends BaseDeclarativeTool<
    JobDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_delete';

    constructor() {
        super(
            JobDeleteTool.Name,
            'JobDelete',
            `Deletes a job by its ID. This action is permanent and cannot be undone.`,
            Kind.Delete,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to delete (e.g., "COD2-5")',
                        type: 'string',
                    },
                },
                required: ['job_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobDeleteToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: JobDeleteToolParams,
    ): ToolInvocation<JobDeleteToolParams, ToolResult> {
        return new JobDeleteToolInvocation(params);
    }
}
