/**
 * Review Update Tool - Updates a review
 * Wraps the SDK's reviewMergeRequestService.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';
import type { UpdateReviewMergeRequest, ReviewRequestType, ReviewRequestStatus, MergeStrategy } from '../../types/reviewMergeRequest';

/**
 * Parameters for the ReviewUpdate tool
 */
export interface ReviewUpdateToolParams {
    /**
     * The ID of the review to update
     */
    review_id: string;

    /**
     * Optional new type for the request
     */
    type?: ReviewRequestType;

    /**
     * Optional new status for the request
     */
    status?: ReviewRequestStatus;

    /**
     * Optional new title
     */
    title?: string;

    /**
     * Optional new description
     */
    description?: string;

    /**
     * Optional new list of major files changed
     */
    major_files_changed?: string[];

    /**
     * Optional new diff patch content
     */
    diff_patch?: string;

    /**
     * Optional new list of issues faced
     */
    issues_faced?: string[];

    /**
     * Optional new list of remaining tasks
     */
    remaining_tasks?: string[];

    /**
     * Optional new merge strategy
     */
    merge_strategy?: MergeStrategy;

    /**
     * Optional new path to changes file
     */
    changes_file_path?: string;

    /**
     * Optional new task description
     */
    task_description?: string;
}

class ReviewUpdateToolInvocation extends BaseToolInvocation<
    ReviewUpdateToolParams,
    ToolResult
> {
    constructor(params: ReviewUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateData: UpdateReviewMergeRequest = {};

            if (this.params.type !== undefined) updateData.type = this.params.type;
            if (this.params.status !== undefined) updateData.status = this.params.status;
            if (this.params.title !== undefined) updateData.title = this.params.title;
            if (this.params.description !== undefined) updateData.description = this.params.description;
            if (this.params.major_files_changed !== undefined) updateData.majorFilesChanged = this.params.major_files_changed;
            if (this.params.diff_patch !== undefined) updateData.diffPatch = this.params.diff_patch;
            if (this.params.issues_faced !== undefined) updateData.issuesFaced = this.params.issues_faced;
            if (this.params.remaining_tasks !== undefined) updateData.remainingTasks = this.params.remaining_tasks;
            if (this.params.changes_file_path !== undefined) updateData.changesFilePath = this.params.changes_file_path;
            if (this.params.task_description !== undefined) updateData.taskDescription = this.params.task_description;

            if (this.params.merge_strategy !== undefined) {
                updateData.mergeConfig = {
                    strategy: this.params.merge_strategy,
                };
            }

            const response = await reviewMergeRequestService.update(this.params.review_id, updateData);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating review: ${errorMessage}`,
                returnDisplay: `Error updating review: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewUpdate tool logic
 */
export class ReviewUpdateTool extends BaseDeclarativeTool<
    ReviewUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_update';

    constructor() {
        super(
            ReviewUpdateTool.Name,
            'ReviewUpdate',
            `Updates an existing merge request review. Can modify the title, description, status, files changed, diff patch, and other properties. Only provide the fields you want to update.`,
            Kind.Edit,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to update',
                        type: 'string',
                    },
                    type: {
                        description: "Optional new type: 'review' or 'review_merge'",
                        type: 'string',
                        enum: ['review', 'review_merge'],
                    },
                    status: {
                        description: "Optional new status: 'draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'review_completed', 'merged', 'rejected', 'closed'",
                        type: 'string',
                        enum: ['draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'review_completed', 'merged', 'rejected', 'closed'],
                    },
                    title: {
                        description: 'Optional new title for the review',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional new description of the changes',
                        type: 'string',
                    },
                    major_files_changed: {
                        description: 'Optional new array of main file paths that were changed',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    diff_patch: {
                        description: 'Optional new unified diff/patch content',
                        type: 'string',
                    },
                    issues_faced: {
                        description: 'Optional new array of issues encountered',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    remaining_tasks: {
                        description: 'Optional new array of remaining tasks',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    merge_strategy: {
                        description: "Optional new merge strategy: 'patch' or 'git_worktree'",
                        type: 'string',
                        enum: ['patch', 'git_worktree'],
                    },
                    changes_file_path: {
                        description: 'Optional new path to changes summary file',
                        type: 'string',
                    },
                    task_description: {
                        description: 'Optional new extended task description',
                        type: 'string',
                    },
                },
                required: ['review_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewUpdateToolParams,
    ): string | null {
        if (!params.review_id.trim()) {
            return "The 'review_id' parameter must be non-empty.";
        }

        // Check that at least one update field is provided
        const updateFields = [
            params.type,
            params.status,
            params.title,
            params.description,
            params.major_files_changed,
            params.diff_patch,
            params.issues_faced,
            params.remaining_tasks,
            params.merge_strategy,
            params.changes_file_path,
            params.task_description,
        ];

        const hasUpdate = updateFields.some(field => field !== undefined);
        if (!hasUpdate) {
            return 'At least one field to update must be provided.';
        }

        return null;
    }

    protected createInvocation(
        params: ReviewUpdateToolParams,
    ): ToolInvocation<ReviewUpdateToolParams, ToolResult> {
        return new ReviewUpdateToolInvocation(params);
    }
}
