import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext, JobSplitAnalysis, JobBlockerAnalysis, SplitApprovalAnalysis } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';
import { llmWithJsonRetry } from './utils';
import { JOB_SPLIT_ANALYSIS_PROMPT, JOB_BLOCKER_ANALYSIS_PROMPT, SPLIT_APPROVAL_PROMPT } from './prompts';

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
            // 0. Process Pending Splits (Approval/Rejection)
            // 0. Process Pending Splits (Approval/Rejection)
            let pendingJobsResponse = await codebolt.job.listJobs({
                groupId: groupId,
                // We need to fetch jobs that might have split proposals. 
                // We'll iterate open jobs and check their splitProposals array.
                status: ['open']
            });
            const allOpenJobs = (pendingJobsResponse as any).data?.jobs || pendingJobsResponse.jobs || [];

            for (const job of allOpenJobs) {
                if (job.splitProposals && job.splitProposals.length > 0) {
                    const pendingProposal = job.splitProposals.find((p: any) => p.status === 'pending');
                    if (pendingProposal) {
                        codebolt.chat.sendMessage(`⚖️ Reviewing split proposal for job "${job.name}"...`);

                        const approvalAnalysis = await llmWithJsonRetry<SplitApprovalAnalysis>(
                            SPLIT_APPROVAL_PROMPT
                                .replace('{{jobName}}', job.name)
                                .replace('{{jobDescription}}', job.description || '')
                                .replace('{{proposalDescription}}', pendingProposal.description)
                                .replace('{{proposedJobs}}', JSON.stringify(pendingProposal.proposedJobs, null, 2)),
                            `Should I approve this split?`
                        );

                        if (approvalAnalysis && approvalAnalysis.action === 'approve') {
                            codebolt.chat.sendMessage(`✅ Approving split: ${approvalAnalysis.reason}`);
                            await codebolt.job.acceptSplitProposal(job.id, pendingProposal.id);
                            await codebolt.job.depositPheromone(job.id, {
                                type: 'split-approved',
                                intensity: 10,
                                depositedBy: ctx.agentId,
                                depositedByName: ctx.agentName
                            });
                        } else {
                            codebolt.chat.sendMessage(`❌ Rejecting split: ${approvalAnalysis ? approvalAnalysis.reason : 'Invalid analysis'}`);
                            await codebolt.job.deleteSplitProposal(job.id, pendingProposal.id);
                            await codebolt.job.depositPheromone(job.id, {
                                type: 'split-rejected',
                                intensity: 5,
                                depositedBy: ctx.agentId,
                                depositedByName: ctx.agentName
                            });
                        }
                        continue; // Move to next job or cycles
                    }
                }
            }


            // 1. List Open Jobs for processing
            let jobsResponse = await codebolt.job.listJobs({
                groupId: groupId,
                status: ['open']
            });
            const jobs = (jobsResponse as any).data?.jobs || jobsResponse.jobs || [];

            if (jobs.length === 0) {
                consecutiveNoJobs++;
                if (consecutiveNoJobs > 2) {
                    codebolt.chat.sendMessage(`😴 No jobs found for a while. Exiting loop.`);
                    running = false;
                    break;
                }
                codebolt.chat.sendMessage(`⏳ No jobs available. Waiting...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }
            consecutiveNoJobs = 0; // Reset counter

            // 2. Find and Lock a Job
            let targetJob = null;
            for (const job of jobs) {
                // Skip if already locked
                if ((job as any).lock) continue;

                // Also skip if it has a pending split proposal (we should process that first in the other loop phase)
                if (job.splitProposals && job.splitProposals.some((p: any) => p.status === 'pending')) continue;

                try {
                    const lockResult = await codebolt.job.lockJob(job.id, ctx.agentId, ctx.agentName);
                    if (lockResult) {
                        targetJob = job;
                        codebolt.chat.sendMessage(`🔒 Successfully locked job: ${job.name} (${job.id})`);
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!targetJob) {
                // codebolt.chat.sendMessage(`🔄 Could not lock any jobs. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            // ============================================
            // JOB PROCESSING LOGIC
            // ============================================

            // 3. Check for Splitting (LLM Analysis)
            // Only split root-level jobs (jobs without a parent)
            if (!targetJob.parentJobId) {
                codebolt.chat.sendMessage(`🤔 Analyzing job "${targetJob.name}" for complexity...`);

                const splitAnalysis = await llmWithJsonRetry<JobSplitAnalysis>(
                    JOB_SPLIT_ANALYSIS_PROMPT
                        .replace('{{jobName}}', targetJob.name)
                        .replace('{{jobDescription}}', targetJob.description || 'No description provided'),
                    `Is this job too complex?`
                );

                if (splitAnalysis && splitAnalysis.shouldSplit && splitAnalysis.proposedJobs) {
                    codebolt.chat.sendMessage(`✂️ Job seems too large. Reason: ${splitAnalysis.reason}`);
                    codebolt.chat.sendMessage(`Proposing split into ${splitAnalysis.proposedJobs.length} sub-tasks...`);

                    await codebolt.job.addSplitProposal(targetJob.id, {
                        description: splitAnalysis.reason,
                        proposedJobs: splitAnalysis.proposedJobs
                    });
                    await codebolt.job.depositPheromone(targetJob.id, {
                        type: 'split-proposed',
                        intensity: 8,
                        depositedBy: ctx.agentId,
                        depositedByName: ctx.agentName
                    });

                    codebolt.chat.sendMessage(`✅ Split proposal added. Releasing lock.`);
                    await codebolt.job.unlockJob(targetJob.id, ctx.agentId);
                    continue; // Restart loop to potentially process this proposal or pick another job
                }
            } else {
                codebolt.chat.sendMessage(`Note: Skipping split analysis for sub-task "${targetJob.name}"`);
            }

            // 4. Simulate Work & Add Pheromones
            codebolt.chat.sendMessage(`⚙️ Working on "${targetJob.name}"...`);

            // Add 'working' pheromone
            await codebolt.job.depositPheromone(targetJob.id, {
                type: 'activity',
                intensity: 5,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            // 5. Check/Add Blockers (LLM Analysis)
            codebolt.chat.sendMessage(`🔍 Checking for blockers or external dependencies...`);

            const blockerAnalysis = await llmWithJsonRetry<JobBlockerAnalysis>(
                JOB_BLOCKER_ANALYSIS_PROMPT
                    .replace('{{jobName}}', targetJob.name)
                    .replace('{{jobDescription}}', targetJob.description || 'No description provided'),
                `Does this job have external blockers?`
            );

            if (blockerAnalysis && blockerAnalysis.hasBlocker) {
                codebolt.chat.sendMessage(`🚧 Identified blocker. Reason: ${blockerAnalysis.blockerReason}`);
                await codebolt.job.addBlocker(targetJob.id, {
                    text: blockerAnalysis.blockerReason || "External dependency identified",
                    addedBy: ctx.agentId,
                    addedByName: ctx.agentName,
                });
                await codebolt.job.depositPheromone(targetJob.id, {
                    type: 'blocked',
                    intensity: 9,
                    depositedBy: ctx.agentId,
                    depositedByName: ctx.agentName
                });
            }

            codebolt.chat.sendMessage(`🐝 Agent is now owning job ${targetJob.id}.`);

            // For demo purposes, we will pause briefly then loop
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        codebolt.chat.sendMessage(`❌ ${error instanceof Error ? error.message : error}`, {});
    }
});