/**
 * Review Create Tool - Creates a new merge request review
 * Wraps the SDK's reviewMergeRequestService.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';
import type { CreateReviewMergeRequest, ReviewRequestType, MergeStrategy } from '../../types/reviewMergeRequest';

/**
 * Parameters for the ReviewCreate tool
 */
export interface ReviewCreateToolParams {
    /**
     * Type of the request - 'review' or 'review_merge'
     */
    type: ReviewRequestType;

    /**
     * The original task description
     */
    initial_task: string;

    /**
     * Title of the review request
     */
    title: string;

    /**
     * Description of the changes
     */
    description: string;

    /**
     * Main files that were changed
     */
    major_files_changed: string[];

    /**
     * Unified diff format of the changes
     */
    diff_patch: string;

    /**
     * ID of the agent creating the request
     */
    agent_id: string;

    /**
     * Name of the agent creating the request
     */
    agent_name: string;

    /**
     * Optional swarm ID reference
     */
    swarm_id?: string;

    /**
     * Optional list of issues encountered
     */
    issues_faced?: string[];

    /**
     * Optional list of remaining tasks
     */
    remaining_tasks?: string[];

    /**
     * Optional merge strategy - 'patch' or 'git_worktree'
     */
    merge_strategy?: MergeStrategy;

    /**
     * Optional path to changes summary file
     */
    changes_file_path?: string;

    /**
     * Optional extended task description
     */
    task_description?: string;
}

class ReviewCreateToolInvocation extends BaseToolInvocation<
    ReviewCreateToolParams,
    ToolResult
> {
    constructor(params: ReviewCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const createData: CreateReviewMergeRequest = {
                type: this.params.type,
                initialTask: this.params.initial_task,
                title: this.params.title,
                description: this.params.description,
                majorFilesChanged: this.params.major_files_changed,
                diffPatch: this.params.diff_patch,
                agentId: this.params.agent_id,
                agentName: this.params.agent_name,
                swarmId: this.params.swarm_id,
                issuesFaced: this.params.issues_faced,
                remainingTasks: this.params.remaining_tasks,
                changesFilePath: this.params.changes_file_path,
                taskDescription: this.params.task_description,
            };

            if (this.params.merge_strategy) {
                createData.mergeConfig = {
                    strategy: this.params.merge_strategy,
                };
            }

            const response = await reviewMergeRequestService.create(createData);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created review request: ${response.request.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating review: ${errorMessage}`,
                returnDisplay: `Error creating review: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewCreate tool logic
 */
export class ReviewCreateTool extends BaseDeclarativeTool<
    ReviewCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_create';

    constructor() {
        super(
            ReviewCreateTool.Name,
            'ReviewCreate',
            `Creates a new merge request review. Use this to submit code changes for review by other agents or users. Specify the type as 'review' for review only or 'review_merge' for review with merge capability.`,
            Kind.Edit,
            {
                properties: {
                    type: {
                        description: "Type of request: 'review' for review only, 'review_merge' for review with merge capability",
                        type: 'string',
                        enum: ['review', 'review_merge'],
                    },
                    initial_task: {
                        description: 'The original task description that led to these changes',
                        type: 'string',
                    },
                    title: {
                        description: 'A concise title for the review request',
                        type: 'string',
                    },
                    description: {
                        description: 'Detailed description of the changes made',
                        type: 'string',
                    },
                    major_files_changed: {
                        description: 'Array of main file paths that were changed',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    diff_patch: {
                        description: 'The unified diff/patch content of the changes',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'ID of the agent creating this review request',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'Name of the agent creating this review request',
                        type: 'string',
                    },
                    swarm_id: {
                        description: 'Optional swarm ID if this is part of a swarm operation',
                        type: 'string',
                    },
                    issues_faced: {
                        description: 'Optional array of issues encountered during implementation',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    remaining_tasks: {
                        description: 'Optional array of tasks still to be completed',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    merge_strategy: {
                        description: "Optional merge strategy: 'patch' or 'git_worktree'",
                        type: 'string',
                        enum: ['patch', 'git_worktree'],
                    },
                    changes_file_path: {
                        description: 'Optional path to a file containing changes summary',
                        type: 'string',
                    },
                    task_description: {
                        description: 'Optional extended description of the task',
                        type: 'string',
                    },
                },
                required: ['type', 'initial_task', 'title', 'description', 'major_files_changed', 'diff_patch', 'agent_id', 'agent_name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewCreateToolParams,
    ): string | null {
        if (!params.title.trim()) {
            return "The 'title' parameter must be non-empty.";
        }

        if (!params.description.trim()) {
            return "The 'description' parameter must be non-empty.";
        }

        if (!params.agent_id.trim()) {
            return "The 'agent_id' parameter must be non-empty.";
        }

        if (!params.agent_name.trim()) {
            return "The 'agent_name' parameter must be non-empty.";
        }

        if (params.major_files_changed.length === 0) {
            return "The 'major_files_changed' parameter must contain at least one file.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewCreateToolParams,
    ): ToolInvocation<ReviewCreateToolParams, ToolResult> {
        return new ReviewCreateToolInvocation(params);
    }
}
