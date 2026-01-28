import codebolt from '@codebolt/codeboltjs';
import { CreateJobInput, CreateJobResult } from './types';
import { generateJobDetails } from './jobGenerator';
import { createJob } from './jobCreator';

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (threadContext: any, _metadata: any): Promise<CreateJobResult> => {
    try {
        // Extract parameters
        const params = threadContext?.params || {};
        const { plan, task, groupId, workerAgentId } = params as CreateJobInput;

        // Validate required parameters
        if (!plan || !plan.planId) {
            return {
                success: false,
                error: 'plan with planId is required',
                groupId: ''
            };
        }

        if (!task || !task.taskId) {
            return {
                success: false,
                error: 'task with taskId is required',
                groupId: groupId || ''
            };
        }

        if (!groupId) {
            return {
                success: false,
                error: 'groupId is required',
                groupId: ''
            };
        }

        codebolt.chat.sendMessage(`Creating job for task "${task.name}"...`, {});

        // Generate detailed job specification using LLM
        const jobDetails = await generateJobDetails(task, plan);

        // Create the job
        const createdJob = await createJob(task, jobDetails, groupId, workerAgentId);

        if (!createdJob) {
            return {
                success: false,
                error: `Failed to create job for task: ${task.name}`,
                groupId
            };
        }

        codebolt.chat.sendMessage(`Created job ${createdJob.jobId}`, {});

        return {
            success: true,
            jobId: createdJob.jobId,
            taskId: task.taskId,
            groupId,
            job: createdJob
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage,
            groupId: ''
        };
    }
});

// Re-export types
export * from './types';
