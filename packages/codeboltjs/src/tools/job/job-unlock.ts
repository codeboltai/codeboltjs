/**
 * Job Unlock Tool - Releases a lock on a job
 * Wraps the SDK's jobService.unlockJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';

/**
 * Parameters for the JobUnlock tool
 */
export interface JobUnlockToolParams {
    /**
     * The ID of the job to unlock
     */
    job_id: string;

    /**
     * The ID of the agent releasing the lock (must match the agent that acquired it)
     */
    agent_id: string;
}

class JobUnlockToolInvocation extends BaseToolInvocation<
    JobUnlockToolParams,
    ToolResult
> {
    constructor(params: JobUnlockToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.unlockJob(
                this.params.job_id,
                this.params.agent_id
            );

            if (!response.job) {
                return {
                    llmContent: `Failed to unlock job: ${this.params.job_id}. The job may not exist, may not be locked, or may be locked by a different agent.`,
                    returnDisplay: `Failed to unlock job: ${this.params.job_id}`,
                    error: {
                        message: 'Failed to unlock job: Job not found, not locked, or locked by different agent',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully unlocked job: ${this.params.job_id}\n\nJob Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Unlocked job ${this.params.job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error unlocking job: ${errorMessage}`,
                returnDisplay: `Error unlocking job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobUnlock tool
 */
export class JobUnlockTool extends BaseDeclarativeTool<
    JobUnlockToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_unlock';

    constructor() {
        super(
            JobUnlockTool.Name,
            'JobUnlock',
            `Releases a lock on a job. The agent releasing the lock must be the same agent that acquired it. Use this when work on a job is complete or paused.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to unlock (e.g., "COD2-5")',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent releasing the lock (must match the agent that acquired it)',
                        type: 'string',
                    },
                },
                required: ['job_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobUnlockToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: JobUnlockToolParams,
    ): ToolInvocation<JobUnlockToolParams, ToolResult> {
        return new JobUnlockToolInvocation(params);
    }
}
