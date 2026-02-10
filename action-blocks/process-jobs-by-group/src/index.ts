import codebolt from '@codebolt/codeboltjs';
import {
    ProcessJobsByGroupInput,
    ProcessJobsByGroupResult,
    Job,
    JobProcessingState,
    ProcessingContext,
    ThreadContext,
    ActionBlockInvocationMetadata
} from './types';
import { MESSAGES } from './prompts';

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Check if a job has any blocking dependencies that are not yet completed
 */
function hasBlockingDependencies(job: Job, completedJobs: Set<string>): boolean {
    if (!job.dependencies || job.dependencies.length === 0) {
        return false;
    }

    for (const dep of job.dependencies) {
        // Only 'blocks' type dependencies prevent a job from starting
        if (dep.type === 'blocks' && !completedJobs.has(dep.targetJobId)) {
            return true;
        }
    }

    return false;
}

/**
 * Find all jobs that are ready to start (no blocking dependencies)
 */
function findReadyJobs(context: ProcessingContext): Job[] {
    const readyJobs: Job[] = [];

    for (const jobId of context.pendingJobs) {
        const job = context.allJobs.get(jobId);
        if (job && !hasBlockingDependencies(job, context.completedJobs)) {
            readyJobs.push(job);
        }
    }

    return readyJobs;
}

/**
 * Create a thread message for a job
 */
function createJobMessage(job: Job): string {
    let message = `Execute the following job:\n\n`;
    message += `**Job Name:** ${job.name}\n`;
    message += `**Job ID:** ${job.id}\n`;
    if (job.description) {
        message += `**Description:** ${job.description}\n`;
    }
    message += `**Type:** ${job.type}\n`;
    message += `**Priority:** ${job.priority}\n`;
    if (job.labels && job.labels.length > 0) {
        message += `**Labels:** ${job.labels.join(', ')}\n`;
    }
    if (job.notes) {
        message += `**Notes:** ${job.notes}\n`;
    }
    return message;
}

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (
    threadContext: ThreadContext,
    _metadata: ActionBlockInvocationMetadata
): Promise<ProcessJobsByGroupResult> => {
    try {
        // Extract parameters - handle both locations
        const params = (threadContext?.params || threadContext || {}) as unknown as ProcessJobsByGroupInput;
        const jobGroupId = params.jobGroupId;
        const workerAgentId = params.workerAgentId;

        // Validate required parameters
        if (!jobGroupId) {
            return {
                success: false,
                error: 'jobGroupId is required',
                processedJobs: [],
                failedJobs: [],
                totalProcessed: 0
            };
        }

        if (!workerAgentId) {
            return {
                success: false,
                error: 'workerAgentId is required',
                processedJobs: [],
                failedJobs: [],
                totalProcessed: 0
            };
        }

        codebolt.chat.sendMessage(MESSAGES.STARTING(jobGroupId), {});

        // Step 1: Fetch all jobs in the group
        codebolt.chat.sendMessage(MESSAGES.FETCHING_JOBS(jobGroupId), {});

        const jobsResponse = await codebolt.job.listJobs({ groupId: jobGroupId });

        if (!jobsResponse.jobs || jobsResponse.jobs.length === 0) {
            codebolt.chat.sendMessage(MESSAGES.NO_JOBS(jobGroupId), {});
            return {
                success: true,
                message: MESSAGES.NO_JOBS(jobGroupId),
                processedJobs: [],
                failedJobs: [],
                totalProcessed: 0
            };
        }

        const jobs = jobsResponse.jobs as Job[];
        codebolt.chat.sendMessage(MESSAGES.JOBS_FOUND(jobs.length), {});

        // Initialize processing context
        const context: ProcessingContext = {
            allJobs: new Map(jobs.map(j => [j.id, j])),
            completedJobs: new Set<string>(),
            failedJobs: new Set<string>(),
            processingJobs: new Map<string, JobProcessingState>(),
            pendingJobs: new Set(jobs.filter(j => j.status !== 'closed').map(j => j.id))
        };

        // Map threadId to jobId for tracking
        const threadToJobMap = new Map<string, string>();

        // Step 2: Main processing loop
        while (context.pendingJobs.size > 0 || context.processingJobs.size > 0) {
            // Find jobs ready to start
            codebolt.chat.sendMessage(MESSAGES.FINDING_READY_JOBS(), {});
            const readyJobs = findReadyJobs(context);

            if (readyJobs.length > 0) {
                codebolt.chat.sendMessage(MESSAGES.READY_JOBS_FOUND(readyJobs.length), {});

                // Start each ready job
                let startedCount = 0;
                for (const job of readyJobs) {
                    try {
                        // Lock the job before starting
                        codebolt.chat.sendMessage(MESSAGES.LOCKING_JOB(job.name), {});
                        await codebolt.job.lockJob(job.id, workerAgentId, 'Worker Agent');

                        // Update job status to working
                        await codebolt.job.updateJob(job.id, { status: 'working' });

                        // Start background thread for this job
                        startedCount++;
                        codebolt.chat.sendMessage(
                            MESSAGES.STARTING_JOB(job.name, startedCount, readyJobs.length),
                            {}
                        );

                        const threadResult = await codebolt.thread.createThreadInBackground({
                            title: `Job: ${job.name}`,
                            userMessage: createJobMessage(job),
                            selectedAgent: { id: workerAgentId },
                            groupId: jobGroupId,
                            metadata: { jobId: job.id }
                        });

                        if (threadResult.type === 'ThreadAgentStarted' && threadResult.threadId) {
                            // Track the processing job
                            const state: JobProcessingState = {
                                jobId: job.id,
                                threadId: threadResult.threadId,
                                status: 'processing',
                                startedAt: new Date().toISOString()
                            };
                            context.processingJobs.set(job.id, state);
                            threadToJobMap.set(threadResult.threadId, job.id);
                            context.pendingJobs.delete(job.id);

                            codebolt.chat.sendMessage(
                                MESSAGES.JOB_STARTED(job.name, threadResult.threadId),
                                {}
                            );
                        } else {
                            // Failed to start thread
                            const error = threadResult.error || 'Unknown error starting thread';
                            codebolt.chat.sendMessage(
                                MESSAGES.ERROR_STARTING_THREAD(job.name, error),
                                {}
                            );
                            context.failedJobs.add(job.id);
                            context.pendingJobs.delete(job.id);

                            // Unlock the job
                            await codebolt.job.unlockJob(job.id, workerAgentId);
                        }
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                        codebolt.chat.sendMessage(
                            MESSAGES.ERROR_LOCKING_JOB(job.name, errorMsg),
                            {}
                        );
                        context.failedJobs.add(job.id);
                        context.pendingJobs.delete(job.id);
                    }
                }
            } else if (context.processingJobs.size === 0) {
                // No ready jobs and nothing processing - something is wrong
                break;
            } else {
                codebolt.chat.sendMessage(MESSAGES.NO_READY_JOBS(), {});
            }

            // Wait for completion events if we have processing jobs
            if (context.processingJobs.size > 0) {
                const event = await codebolt.agentEventQueue.waitForAnyExternalEvent();

                // Handle background agent completions
                // Event type is: 'agentQueueEvent' | 'backgroundAgentCompletion' | 'backgroundGroupedAgentCompletion'
                // The actual data is in event.data
                if (event.type === 'backgroundAgentCompletion' || event.type === 'backgroundGroupedAgentCompletion') {
                    const eventData = event.data as { threadId?: string; success?: boolean; error?: string };
                    const threadId = eventData?.threadId;

                    if (threadId) {
                        const jobId = threadToJobMap.get(threadId);

                        if (jobId) {
                            const job = context.allJobs.get(jobId);
                            const jobName = job?.name || jobId;

                            // Check if success or failure
                            const isSuccess = eventData?.success !== false;

                            if (isSuccess) {
                                // Mark job as completed
                                context.completedJobs.add(jobId);
                                context.processingJobs.delete(jobId);
                                threadToJobMap.delete(threadId);

                                codebolt.chat.sendMessage(
                                    MESSAGES.JOB_COMPLETED(jobName, context.pendingJobs.size),
                                    {}
                                );

                                // Update job status
                                await codebolt.job.updateJob(jobId, { status: 'closed' });
                            } else {
                                // Mark job as failed
                                context.failedJobs.add(jobId);
                                context.processingJobs.delete(jobId);
                                threadToJobMap.delete(threadId);

                                const errorMsg = eventData?.error || 'Unknown error';
                                codebolt.chat.sendMessage(MESSAGES.JOB_FAILED(jobName, errorMsg), {});

                                // Update job status
                                await codebolt.job.updateJob(jobId, { status: 'hold' });
                            }

                            // Unlock the job
                            codebolt.chat.sendMessage(MESSAGES.UNLOCKING_JOB(jobName), {});
                            await codebolt.job.unlockJob(jobId, workerAgentId);

                            // Update dependencies
                            codebolt.chat.sendMessage(
                                MESSAGES.UPDATING_DEPENDENCIES(jobName),
                                {}
                            );
                        }
                    }
                }
            }
        }

        // Final summary
        const processedCount = context.completedJobs.size;
        const failedCount = context.failedJobs.size;
        const finalMessage = MESSAGES.ALL_COMPLETE(processedCount, failedCount);
        codebolt.chat.sendMessage(finalMessage, {});

        return {
            success: failedCount === 0,
            processedJobs: Array.from(context.completedJobs),
            failedJobs: Array.from(context.failedJobs),
            totalProcessed: processedCount,
            message: finalMessage
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Job processing failed:', error);
        codebolt.chat.sendMessage(MESSAGES.ERROR_PROCESSING(errorMessage), {});
        return {
            success: false,
            error: errorMessage,
            processedJobs: [],
            failedJobs: [],
            totalProcessed: 0
        };
    }
});

// Re-export types
export * from './types';
