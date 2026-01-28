import codebolt from '@codebolt/codeboltjs';
import {
    TaskToExecute,
    GeneratedJobDetails,
    CreatedJob
} from './types';

// ================================
// JOB CREATION
// ================================

/**
 * Creates a job using the Codebolt job API
 */
export async function createJob(
    task: TaskToExecute,
    jobDetails: GeneratedJobDetails,
    groupId: string,
    workerAgentId?: string
): Promise<CreatedJob | null> {
    try {
        const jobData = {
            name: jobDetails.name,
            type: jobDetails.type,
            priority: jobDetails.priority,
            description: jobDetails.description,
            status: 'open' as const,
            labels: jobDetails.labels,
            notes: jobDetails.notes,
            assignees: workerAgentId ? [workerAgentId] : []
        };

        const response = await codebolt.job.createJob(groupId, jobData);

        if (response?.job) {
            return {
                jobId: response.job.id,
                taskId: task.taskId,
                name: response.job.name,
                description: response.job.description || '',
                type: response.job.type,
                priority: response.job.priority,
                status: response.job.status
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}
