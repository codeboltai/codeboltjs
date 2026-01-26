/**
 * Job Group Create Tool - Creates a new job group
 * Wraps the SDK's jobService.createJobGroup() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { CreateJobGroupData } from '../../types/job';

/**
 * Parameters for the JobGroupCreate tool
 */
export interface JobGroupCreateToolParams {
    /**
     * Optional display name for the job group
     */
    name?: string;

    /**
     * Optional 3-4 letter unique shortname (e.g., "COD2")
     */
    short_name?: string;

    /**
     * Optional parent group ID for hierarchical organization
     */
    parent_id?: string;
}

class JobGroupCreateToolInvocation extends BaseToolInvocation<
    JobGroupCreateToolParams,
    ToolResult
> {
    constructor(params: JobGroupCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const createData: CreateJobGroupData = {
                name: this.params.name,
                shortName: this.params.short_name,
                parentId: this.params.parent_id,
            };

            const response = await jobService.createJobGroup(createData);

            if (!response.group) {
                return {
                    llmContent: 'Error creating job group: No group returned in response',
                    returnDisplay: 'Error creating job group: No group returned in response',
                    error: {
                        message: 'No group returned in response',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created job group: ${response.group.id}\n\nGroup Details:\n${JSON.stringify(response.group, null, 2)}`,
                returnDisplay: `Successfully created job group: ${response.group.id} (${response.group.shortName})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating job group: ${errorMessage}`,
                returnDisplay: `Error creating job group: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobGroupCreate tool
 */
export class JobGroupCreateTool extends BaseDeclarativeTool<
    JobGroupCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_group_create';

    constructor() {
        super(
            JobGroupCreateTool.Name,
            'JobGroupCreate',
            `Creates a new job group. Job groups are containers for organizing related jobs. Each group has a unique shortname used in job IDs (e.g., jobs in group "COD2" have IDs like "COD2-1", "COD2-2", etc.).`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'Optional display name for the job group',
                        type: 'string',
                    },
                    short_name: {
                        description: 'Optional 3-4 letter unique shortname (e.g., "COD2"). If not provided, one will be generated.',
                        type: 'string',
                    },
                    parent_id: {
                        description: 'Optional parent group ID for hierarchical organization',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobGroupCreateToolParams,
    ): string | null {
        if (params.short_name !== undefined) {
            if (params.short_name.length < 2 || params.short_name.length > 6) {
                return "The 'short_name' parameter should be 2-6 characters.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: JobGroupCreateToolParams,
    ): ToolInvocation<JobGroupCreateToolParams, ToolResult> {
        return new JobGroupCreateToolInvocation(params);
    }
}
