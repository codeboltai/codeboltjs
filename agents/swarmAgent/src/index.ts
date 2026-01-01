import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext, JobSplitAnalysis, JobBlockerAnalysis, SplitApprovalAnalysis, JobBlockingAnalysis } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';
import { llmWithJsonRetry } from './utils';
import { JOB_SPLIT_ANALYSIS_PROMPT, JOB_BLOCKER_ANALYSIS_PROMPT, SPLIT_APPROVAL_PROMPT, JOB_DEPENDENCY_ANALYSIS_PROMPT, MAIN_AGENT_PROMPT } from './prompts';
import { mainAgentLoop } from './mainAgent';
import { plannerAgent } from './planner';

import fs from 'fs'
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'

import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier


} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';




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
                        codebolt.chat.sendMessage(`✅ Job "${job.name}" is not blocked.`);

                        // Lock the job
                        codebolt.chat.sendMessage(`🔒 Attempting to lock job "${job.name}"...`);
                        const lockResult = await codebolt.job.lockJob(job.id, ctx.agentId, ctx.agentName);

                        if (!lockResult) {
                            codebolt.chat.sendMessage(`⚠️ Failed to acquire lock for job "${job.name}". Skipping.`);
                            continue;
                        }

                        codebolt.chat.sendMessage(`✅ Successfully locked job "${job.name}"`);


                        // Create a safe filename for the plan
                        const safeJobName = job.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        const planFileName = `plans/${ctx.agentId}-${safeJobName}.md`;

                        // Ensure plans directory exists
                        if (!fs.existsSync('plans')) {
                            fs.mkdirSync('plans');
                        }

                        // Create a message for the planner with the specific filename instruction
                        const plannerMessage: FlatUserMessage = {
                            ...reqMessage,
                            userMessage: `Plan for job: ${job.name}\n\nTask Description:\n${job.description}\n\nIMPORTANT: You must write the plan to '${planFileName}'.`,
                            messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        };

                        // Start Planning
                        codebolt.chat.sendMessage(`🧠 Creating a plan for "${job.name}"...`);
                        await plannerAgent(plannerMessage, planFileName);

                        // Verify plan was created
                        // if (!fs.existsSync(planFileName)) {
                        //     codebolt.chat.sendMessage(`❌ Planner failed to create plan file at ${planFileName}. Skipping execution for this job.`);
                        //     await codebolt.job.unlockJob(job.id, ctx.agentId);
                        //     continue;
                        // }

                        codebolt.chat.sendMessage(`✅ Plan verified at ${planFileName}.`);

                        // Create a message for the main agent with the job details and plan path
                        const mainAgentMessage: FlatUserMessage = {
                            ...reqMessage,
                            userMessage: `${job.name}`, // Preserving original format for now, mainAgent receives plan path via context or logic
                            messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        };
                        // Start the main agent with the task, passing the explicit plan path
                        await mainAgentLoop(mainAgentMessage, planFileName);

                        // 1. Close the job
                        await codebolt.job.updateJob(job.id, { status: 'closed' });
                        codebolt.chat.sendMessage(`✅ Job "${job.name}" marked as closed.`);

                        // 2. Unlock the job
                        await codebolt.job.unlockJob(job.id, ctx.agentId);
                        codebolt.chat.sendMessage(`🔓 Job "${job.name}" unlocked.`);

                        // 3. Resolve Blockers for other jobs
                        // Find all jobs that are blocked
                        const blockedJobsResponse = await codebolt.job.getBlockedJobs();
                        const blockedJobs = (blockedJobsResponse as any).data?.jobs || blockedJobsResponse.jobs || [];

                        for (const blockedJob of blockedJobs) {
                            // Check if this job has any blockers
                            // We need to fetch the job details or blockers? 
                            // The job object from getBlockedJobs list might not have full blocker details populated depending on API.
                            // But usually we can check 'blockers' or we might need to fetch blockers specifically.
                            // Let's assume fetching the job details is safer or check if blockers property exists.
                            // Actually better to list blockers? No, we have addBlocker/removeBlocker. 
                            // To resolve a blocker we need its ID.
                            // Let's try to get more details if needed, but assuming `blockedJob` has `blockers` field if it mirrors `Job` interface.

                            // We might need to fetch the full job if it's not populated, but let's try assuming it is or fetch it.
                            const fullBlockedJob = await codebolt.job.getJob(blockedJob.id);
                            const targetJob = (fullBlockedJob as any).data?.job || fullBlockedJob.job;

                            if (targetJob && (targetJob as any).blockers) {
                                for (const blocker of (targetJob as any).blockers) {
                                    if (blocker.blockerJobIds && blocker.blockerJobIds.includes(job.id)) {
                                        // Make a copy of ids without the current job
                                        const remainingIds = blocker.blockerJobIds.filter((id: string) => id !== job.id);

                                        if (remainingIds.length === 0) {
                                            // Resolve this blocker entirely
                                            await codebolt.job.resolveBlocker(targetJob.id, blocker.id, ctx.agentId);
                                            codebolt.chat.sendMessage(`✅ Resolved blocker for job "${targetJob.name}" (dependency met).`);

                                            // Also remove the "blocks" dependency
                                            await codebolt.job.removeDependency(targetJob.id, job.id);


                                        } else {
                                            // Update the blocker with remaining IDs
                                            // We can't update directly, so remove and add? OR does addBlocker update?
                                            // Actually resolve matches 'blockerId'. 
                                            // We should probably just remove and re-add or better, just leave it?
                                            // The prompt logic might have just added one blocker per dependency set.
                                            // If we remove the ID, we need to update the text or state.
                                            // For now, let's remove and add new one if API allows, or if we can't update, we just resolve if it's the *only* one.
                                            // If there are others, we theoretically should update the list.
                                            // Let's try removing and re-adding for correctness.
                                            await codebolt.job.removeBlocker(targetJob.id, blocker.id);
                                            await codebolt.job.addBlocker(targetJob.id, {
                                                text: blocker.text,
                                                addedBy: blocker.addedBy,
                                                blockerJobIds: remainingIds
                                            });

                                            // Remove the dependency link
                                            await codebolt.job.removeDependency(targetJob.id, job.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error in dependency analysis for job ${job.id}:`, err);
                }



            }

        }

    } catch (error) {
        codebolt.chat.sendMessage(`❌ ${error instanceof Error ? error.message : error}`, {});
    }
});