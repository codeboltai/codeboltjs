import codebolt from '@codebolt/codeboltjs';
import { AgentContext, JobBlockingAnalysis, FindJobResult } from './types';
import { JOB_DEPENDENCY_ANALYSIS_PROMPT } from './prompts';
import { llmWithJsonRetry } from './utils';

/**
 * Finds the next available job for an agent.
 *
 * Process:
 * 1. Fetches all open jobs from the swarm's default job group
 * 2. For each job, analyzes if it's blocked by other jobs using LLM
 * 3. If blocked: marks job with pheromones and adds blockers/dependencies
 * 4. If not blocked: attempts to lock the job for this agent
 * 5. Returns the first successfully locked job
 */
export async function findNextJob(ctx: AgentContext, groupId: string): Promise<FindJobResult> {
    try {
        // Step 1: Fetch open jobs sorted by importance
        const pendingJobsResponse = await codebolt.job.listJobs({
            groupId: groupId,
            sortBy: 'importance',
            filterOutBlockers: true,
            status: ['open']
        });

        codebolt.chat.sendMessage(`Searching for jobs in group: ${groupId}`);
        const allOpenJobs = (pendingJobsResponse as any).data?.jobs || (pendingJobsResponse as any).jobs || [];

        if (allOpenJobs.length === 0) {
            codebolt.chat.sendMessage('No open jobs available');
            return { success: false, error: 'No open jobs available' };
        }

        codebolt.chat.sendMessage(`Found ${allOpenJobs.length} open jobs, analyzing dependencies...`);

        // Step 2: Iterate through jobs to find one that's not blocked
        for (const job of allOpenJobs) {
            codebolt.chat.sendMessage(`Analyzing job: "${job.name}" (${job.id})`);

            // Get other jobs for dependency analysis
            const otherJobs = allOpenJobs.filter((j: any) => j.id !== job.id);
            const otherJobsContext = otherJobs
                .map((j: any) => `- ID: ${j.id}\n  Name: ${j.name}`)
                .join('\n\n');

            try {
                // Step 3: Analyze if this job is blocked
                const prompt = JOB_DEPENDENCY_ANALYSIS_PROMPT
                    .replace(/{{currentJobId}}/g, job.id)
                    .replace(/{{currentJobName}}/g, job.name)
                    .replace(/{{otherJobs}}/g, otherJobsContext || 'None');

                const blockingAnalysis = await llmWithJsonRetry<JobBlockingAnalysis>(
                    prompt,
                    'Analyze dependencies. Respond with ONLY valid JSON.'
                );

                // Step 4: Handle blocked job
                if (blockingAnalysis?.hasBlocker && blockingAnalysis.blockingJobIds?.length > 0) {
                    codebolt.chat.sendMessage(
                        `Job "${job.name}" is blocked by: ${blockingAnalysis.blockingJobIds.join(', ')}`
                    );

                    // Mark job as not ready (pheromone signal)
                    await codebolt.job.depositPheromone(job.id, {
                        type: 'not_ready',
                        intensity: 1,
                        depositedBy: ctx.agentId,
                        depositedByName: ctx.agentName
                    });

                    // Add explicit blockers
                    await codebolt.job.addBlocker(job.id, {
                        text: blockingAnalysis.reason,
                        addedBy: ctx.agentId,
                        addedByName: ctx.agentName,
                        blockerJobIds: blockingAnalysis.blockingJobIds
                    });

                    // Add dependencies for structural correctness
                    for (const blockerId of blockingAnalysis.blockingJobIds) {
                        await codebolt.job.addDependency(job.id, blockerId, 'blocks');

                        // Increase importance of blocking tasks
                        await codebolt.job.depositPheromone(blockerId, {
                            type: 'importance',
                            intensity: 0.8,
                            depositedBy: ctx.agentId,
                            depositedByName: ctx.agentName
                        });
                    }

                    // Skip to next job
                    continue;
                }

                // Step 5: Job is not blocked - try to lock it
                codebolt.chat.sendMessage(`Job "${job.name}" is available, attempting to lock...`);

                const lockResult = await codebolt.job.lockJob(job.id, ctx.agentId, ctx.agentName);

                if (!lockResult) {
                    codebolt.chat.sendMessage(`Failed to lock job "${job.name}" (may be locked by another agent)`);
                    continue;
                }

                // Step 6: Successfully locked - return the job
                codebolt.chat.sendMessage(`Successfully assigned job "${job.name}" to agent ${ctx.agentName}`);

                return {
                    success: true,
                    job: {
                        id: job.id,
                        name: job.name,
                        description: job.description,
                        status: job.status,
                        groupId: groupId
                    }
                };

            } catch (err) {
                codebolt.chat.sendMessage(`Error analyzing job ${job.id}: ${err}`);
                continue;
            }
        }

        // No available jobs could be locked
        return {
            success: false,
            error: 'All jobs are either blocked or locked by other agents'
        };

    } catch (error) {
        return {
            success: false,
            error: `Error finding jobs: ${error}`
        };
    }
}
