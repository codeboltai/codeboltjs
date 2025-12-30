import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext, JobSplitAnalysis, JobBlockerAnalysis, SplitApprovalAnalysis, JobBlockingAnalysis } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';
import { llmWithJsonRetry } from './utils';
import { JOB_SPLIT_ANALYSIS_PROMPT, JOB_BLOCKER_ANALYSIS_PROMPT, SPLIT_APPROVAL_PROMPT, JOB_DEPENDENCY_ANALYSIS_PROMPT } from './prompts';

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    try {
        let ctx: AgentContext = {
            swarmId: additionalVariable.swarmId || '2ed48baa-159f-4be9-9fe6-a439610ab2c6',
            swarmName: "Test Swarm",
            agentId: additionalVariable.instanceId || '2ed48baa-159f-4be9-9fe6-a439610ab2c6',
            agentName: `Agent:${additionalVariable.instanceId}-${Math.random()}`,
            capabilities: additionalVariable.capabilities ? JSON.parse(additionalVariable.capabilities) : ['coding'],
            requirements: additionalVariable.requirements || 'Build a web application',
        };

        codebolt.chat.sendMessage(`🤖 Agent ${ctx.agentName} starting...`);

        // Get Default Job Group
        let defaultJobGroup = await codebolt.swarm.getDefaultJobGroup(ctx.swarmId);
        if (!defaultJobGroup || !defaultJobGroup.data?.groupId) {
            codebolt.chat.sendMessage(`⚠️ No default job group found for swarm ${ctx.swarmId}`);
            return;
        }
        const groupId = defaultJobGroup.data.groupId;
        codebolt.chat.sendMessage(`📂 Target Job Group: ${groupId}`);

        // MAIN LOOP
        let running = true;
        let consecutiveNoJobs = 0;

        while (running) {

            let pendingJobsResponse = await codebolt.job.listJobs({
                groupId: groupId,
                // We need to fetch jobs that might have split proposals. 
                // We'll iterate open jobs and check their splitProposals array.
                sortBy: 'importance',
                filterOutBlockers: true,

                status: ['open']
            });
            const allOpenJobs = (pendingJobsResponse as any).data?.jobs || pendingJobsResponse.jobs || [];

            for (const job of allOpenJobs) {
                // ------------------------------------------
                // 1. Dependency/Blocker Analysis
                // ------------------------------------------
                // We want to skip this if we already know it's blocked or not ready, but for now we check fresh.
                // Filter out the current job from the potential blockers list
                const otherJobs = allOpenJobs.filter((j: any) => j.id !== job.id);

                if (otherJobs.length > 0) {
                    const otherJobsContext = otherJobs.map((j: any) => `- ID: ${j.id}\n  Name: ${j.name}`).join('\n\n');

                    try {
                        const prompt = JOB_DEPENDENCY_ANALYSIS_PROMPT
                            .replace(/{{currentJobId}}/g, job.id)
                            .replace(/{{currentJobName}}/g, job.name)
                            .replace(/{{otherJobs}}/g, otherJobsContext);

                        const blockingAnalysis = await llmWithJsonRetry<JobBlockingAnalysis>(
                            prompt,
                            'Analyze dependencies. Respond with ONLY valid JSON.'
                        );

                        if (blockingAnalysis && blockingAnalysis.hasBlocker && blockingAnalysis.blockingJobIds && blockingAnalysis.blockingJobIds.length > 0) {
                            codebolt.chat.sendMessage(`🚫 Job "${job.name}" is blocked by: ${blockingAnalysis.blockingJobIds.join(', ')}`);

                            // 1a. Mark current job as not ready (pheromone)
                            // We use a "not_ready" pheromone.
                            await codebolt.job.depositPheromone(job.id, {
                                type: 'not_ready',
                                intensity: 1, // Simple flag
                                depositedBy: ctx.agentId,
                                depositedByName: ctx.agentName
                            });

                            // 1b. Add explicit blockers to the current job
                            await codebolt.job.addBlocker(job.id, {
                                text: blockingAnalysis.reason,
                                addedBy: ctx.agentId,
                                addedByName: ctx.agentName,
                                blockerJobIds: blockingAnalysis.blockingJobIds
                            });

                            // Add dependencies for structural correctness
                            for (const blockerId of blockingAnalysis.blockingJobIds) {
                                await codebolt.job.addDependency(job.id, blockerId, 'blocks');

                                // 1c. Add "importance" pheromone to the blocking task
                                // This signals other agents to pick this up.
                                await codebolt.job.depositPheromone(blockerId, {
                                    type: 'importance',
                                    intensity: 0.8, // High importance
                                    depositedBy: ctx.agentId,
                                    depositedByName: ctx.agentName
                                });
                            }

                            // Skip processing this job since it is blocked
                            continue;
                        }

                        else {
                            codebolt.chat.sendMessage(`✅ Job "${job.name}" is not blocked. ${JSON.stringify(blockingAnalysis)}`);
                            running = false;
                            break;

                        }
                    } catch (err) {
                        console.error(`Error in dependency analysis for job ${job.id}:`, err);
                    }
                }

                // ------------------------------------------
                // 2. Lock the Job
                // ------------------------------------------
                // ------------------------------------------
                // 2. Lock the Job
                // ------------------------------------------
                // Skip if already locked by anyone (including self from previous run, as lock is persistent)
                // if ((job as any).lock) {
                //     // codebolt.chat.sendMessage(`ℹ️ Job "${job.name}" is already locked. Skipping.`);
                //     continue;
                // }

                // try {
                //     codebolt.chat.sendMessage(`🔒 Attempting to lock job "${job.name}"...`);
                //     const lockResult = await codebolt.job.lockJob(job.id, ctx.agentId, ctx.agentName);

                //     if (!lockResult || !lockResult.job) {
                //         codebolt.chat.sendMessage(`⚠️ Failed to acquire lock for job "${job.name}". Skipping.`);
                //         continue;
                //     }

                //     codebolt.chat.sendMessage(`✅ Successfully locked job "${job.name}"`);
                //     const targetJob = job; // Alias for compatibility with existing logic

                //     // ============================================
                //     // JOB PROCESSING LOGIC
                //     // ============================================

                //     // 3. Check for Splitting (LLM Analysis)
                //     // Only split root-level jobs (jobs without a parent)
                //     if (!targetJob.parentJobId) {
                //         codebolt.chat.sendMessage(`🤔 Analyzing job "${targetJob.name}" for complexity...`);

                //         const splitAnalysis = await llmWithJsonRetry<JobSplitAnalysis>(
                //             JOB_SPLIT_ANALYSIS_PROMPT
                //                 .replace('{{jobName}}', targetJob.name)
                //                 .replace('{{jobDescription}}', targetJob.description || 'No description provided'),
                //             `Is this job too complex?`
                //         );

                //         if (splitAnalysis && splitAnalysis.shouldSplit && splitAnalysis.proposedJobs) {
                //             codebolt.chat.sendMessage(`✂️ Job seems too large. Reason: ${splitAnalysis.reason}`);
                //             codebolt.chat.sendMessage(`Proposing split into ${splitAnalysis.proposedJobs.length} sub-tasks...`);

                //             await codebolt.job.addSplitProposal(targetJob.id, {
                //                 description: splitAnalysis.reason,
                //                 proposedJobs: splitAnalysis.proposedJobs
                //             });
                //             await codebolt.job.depositPheromone(targetJob.id, {
                //                 type: 'split-proposed',
                //                 intensity: 8,
                //                 depositedBy: ctx.agentId,
                //                 depositedByName: ctx.agentName
                //             });

                //             codebolt.chat.sendMessage(`✅ Split proposal added. Releasing lock.`);
                //             await codebolt.job.unlockJob(targetJob.id, ctx.agentId);
                //             // We processed this job by proposing a split, so we move on.
                //             break;
                //         }
                //     } else {
                //         codebolt.chat.sendMessage(`Note: Skipping split analysis for sub-task "${targetJob.name}"`);
                //     }

                //     // 4. Simulate Work & Add Pheromones
                //     codebolt.chat.sendMessage(`⚙️ Working on "${targetJob.name}"...`);

                //     // Add 'working' pheromone
                //     await codebolt.job.depositPheromone(targetJob.id, {
                //         type: 'activity',
                //         intensity: 5,
                //         depositedBy: ctx.agentId,
                //         depositedByName: ctx.agentName
                //     });

                //     // 5. Check/Add Blockers (LLM Analysis)
                //     codebolt.chat.sendMessage(`🔍 Checking for blockers or external dependencies...`);

                //     const blockerAnalysis = await llmWithJsonRetry<JobBlockerAnalysis>(
                //         JOB_BLOCKER_ANALYSIS_PROMPT
                //             .replace('{{jobName}}', targetJob.name)
                //             .replace('{{jobDescription}}', targetJob.description || 'No description provided'),
                //         `Does this job have external blockers?`
                //     );

                //     if (blockerAnalysis && blockerAnalysis.hasBlocker) {
                //         codebolt.chat.sendMessage(`🚧 Identified blocker. Reason: ${blockerAnalysis.blockerReason}`);
                //         await codebolt.job.addBlocker(targetJob.id, {
                //             text: blockerAnalysis.blockerReason || "External dependency identified",
                //             addedBy: ctx.agentId,
                //             addedByName: ctx.agentName,
                //         });
                //         await codebolt.job.depositPheromone(targetJob.id, {
                //             type: 'blocked',
                //             intensity: 9,
                //             depositedBy: ctx.agentId,
                //             depositedByName: ctx.agentName
                //         });
                //     }

                //     codebolt.chat.sendMessage(`🐝 Agent is now owning job ${targetJob.id}.`);

                //     // Break the loop to focus on this job (prevention of hoarding)
                //     break;

                // } catch (err) {
                //     console.error(`Error locking job ${job.id}:`, err);
                //     continue;
                // }
            }
        }

    } catch (error) {
        codebolt.chat.sendMessage(`❌ ${error instanceof Error ? error.message : error}`, {});
    }
});