import codebolt from '@codebolt/codeboltjs';
import { BreakTaskInput, BreakTaskResult } from './types';
import { breakdownTask } from './jobBreakdown';

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (threadContext: any, _metadata: any): Promise<BreakTaskResult> => {
    try {
        // Extract parameters
        const params = threadContext?.params || {};
        const { plan, task, existingJobs = [] } = params as BreakTaskInput;

        // Validate required parameters
        if (!plan || !plan.planId) {
            return {
                success: false,
                error: 'plan with planId is required'
            };
        }

        if (!task || !task.taskId) {
            return {
                success: false,
                error: 'task with taskId is required'
            };
        }

        codebolt.chat.sendMessage(`Breaking down task "${task.name}" into sub-jobs...`, {});

        // Break down the task using LLM
        const subJobs = await breakdownTask(task, plan, existingJobs);

        if (!subJobs || subJobs.length === 0) {
            return {
                success: false,
                error: `Failed to break down task: ${task.name}`,
                taskId: task.taskId
            };
        }

        codebolt.chat.sendMessage(
            `Task "${task.name}" broken into ${subJobs.length} sub-jobs: ${subJobs.map(j => j.name).join(', ')}`,
            {}
        );

        return {
            success: true,
            taskId: task.taskId,
            subJobs,
            subJobCount: subJobs.length
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[break-task-into-jobs] Error:', error);
        return {
            success: false,
            error: errorMessage
        };
    }
});

// Re-export types
export * from './types';
