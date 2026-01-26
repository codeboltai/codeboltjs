import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext } from './types';
import { mainAgentLoop } from './mainAgent';
import { plannerAgent } from './planner';

import fs from 'fs';

/**
 * SwarmAgent - Uses ActionBlock APIs for modular team and job management
 * 
 * This agent delegates:
 * - Team creation/joining to 'create-team-for-swarm' action block
 * - Job finding to 'find-next-job' action block
 */
codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    try {
        const ctx: AgentContext = {
            swarmId: additionalVariable.swarmId || 'ffd950c3-9faa-48b4-b2b2-e65c17f74c6d',
            swarmName: "Test Swarm",
            agentId: additionalVariable.instanceId || 'ffd950c3-9faa-48b4-b2b2-e65c17f74c6d',
            agentName: `Agent:${additionalVariable.instanceId}-${Math.random()}`,
            capabilities: additionalVariable.capabilities ? JSON.parse(additionalVariable.capabilities) : ['coding'],
            requirements: additionalVariable.requirements || 'Build a web application',
        };

        codebolt.chat.sendMessage(`🤖 Agent ${ctx.agentName} starting...`);

        // ========================================
        // PHASE 1: Team Formation via ActionBlock
        // ========================================
        codebolt.chat.sendMessage(`🏗️ Starting team formation...`);

        const teamParams = {
            swarmId: ctx.swarmId,
            swarmName: ctx.swarmName,
            agentId: ctx.agentId,
            agentName: ctx.agentName,
            capabilities: ctx.capabilities,
            requirements: ctx.requirements
        };
        codebolt.chat.sendMessage(`📤 Sending to create-team-for-swarm: ${JSON.stringify(teamParams)}`);

        const teamResult = await codebolt.actionBlock.start('create-team-for-swarm', teamParams);


        if (!teamResult.success) {
            codebolt.chat.sendMessage(`⚠️ Team formation failed: ${teamResult.error}`);
        } else {
            codebolt.chat.sendMessage(`✅ Team formation complete`);
        }

        // ========================================
        // PHASE 2: Job Finding & Execution Loop
        // ========================================
        let running = true;
        let consecutiveNoJobs = 0;
        const MAX_NO_JOBS = 5; // Stop after 5 consecutive failures to find jobs

        while (running) {
            codebolt.chat.sendMessage(`🔍 Searching for next job...`);

            // Use ActionBlock API to find next job
            const jobParams = {
                swarmId: ctx.swarmId,
                agentId: ctx.agentId,
                agentName: ctx.agentName
            };
            codebolt.chat.sendMessage(`📤 Sending to find-next-job: ${JSON.stringify(jobParams)}`);

            const jobResult = await codebolt.actionBlock.start('find-next-job', jobParams);

            if (!jobResult.success || !jobResult.result?.job) {
                consecutiveNoJobs++;
                codebolt.chat.sendMessage(`⏳ No job found (${consecutiveNoJobs}/${MAX_NO_JOBS}): ${jobResult.error || 'No available jobs'}`);

                if (consecutiveNoJobs >= MAX_NO_JOBS) {
                    codebolt.chat.sendMessage(`🛑 Stopping after ${MAX_NO_JOBS} consecutive attempts with no jobs`);
                    running = false;
                    break;
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            // Reset counter on successful job find
            consecutiveNoJobs = 0;
            const job = jobResult.result.job;

            codebolt.chat.sendMessage(`📋 Found job: "${job.name}" (${job.id})`);

            try {
                // Create a safe filename for the plan
                const safeJobName = job.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const planFileName = `plans/${ctx.agentId}-${safeJobName}.md`;

                // Ensure plans directory exists
                if (!fs.existsSync('plans')) {
                    fs.mkdirSync('plans');
                }

                // Create a message for the planner
                const plannerMessage: FlatUserMessage = {
                    ...reqMessage,
                    userMessage: `Plan for job: ${job.name}\n\nTask Description:\n${job.description}\n\nIMPORTANT: You must write the plan to '${planFileName}'.`,
                    messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };

                // Start Planning
                codebolt.chat.sendMessage(`🧠 Creating a plan for "${job.name}"...`);
                await plannerAgent(plannerMessage, planFileName);
                codebolt.chat.sendMessage(`✅ Plan verified at ${planFileName}.`);

                // Create a message for the main agent
                const mainAgentMessage: FlatUserMessage = {
                    ...reqMessage,
                    userMessage: `${job.name}`,
                    messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };

                // Execute the job
                await mainAgentLoop(mainAgentMessage, planFileName);

                // Close and unlock the job
                await codebolt.job.updateJob(job.id, { status: 'closed' });
                codebolt.chat.sendMessage(`✅ Job "${job.name}" marked as closed.`);

                await codebolt.job.unlockJob(job.id, ctx.agentId);
                codebolt.chat.sendMessage(`🔓 Job "${job.name}" unlocked.`);

                // Resolve blockers for dependent jobs
                await resolveJobBlockers(job.id, ctx);

            } catch (err) {
                codebolt.chat.sendMessage(`❌ Error processing job "${job.name}": ${err}`);
                // Unlock job on error
                await codebolt.job.unlockJob(job.id, ctx.agentId);
            }
        }

        codebolt.chat.sendMessage(`🏁 Agent ${ctx.agentName} finished.`);

    } catch (error) {
        codebolt.chat.sendMessage(`❌ ${error instanceof Error ? error.message : error}`, {});
    }
});

/**
 * Helper to resolve blockers for jobs that were blocked by a completed job
 */
async function resolveJobBlockers(completedJobId: string, ctx: AgentContext): Promise<void> {
    try {
        const blockedJobsResponse = await codebolt.job.getBlockedJobs();
        const blockedJobs = (blockedJobsResponse as any).data?.jobs || (blockedJobsResponse as any).jobs || [];

        for (const blockedJob of blockedJobs) {
            const fullBlockedJob = await codebolt.job.getJob(blockedJob.id);
            const targetJob = (fullBlockedJob as any).data?.job || (fullBlockedJob as any).job;

            if (targetJob?.blockers) {
                for (const blocker of targetJob.blockers) {
                    if (blocker.blockerJobIds?.includes(completedJobId)) {
                        const remainingIds = blocker.blockerJobIds.filter((id: string) => id !== completedJobId);

                        if (remainingIds.length === 0) {
                            await codebolt.job.resolveBlocker(targetJob.id, blocker.id, ctx.agentId);
                            await codebolt.job.removeDependency(targetJob.id, completedJobId);
                            codebolt.chat.sendMessage(`✅ Resolved blocker for job "${targetJob.name}"`);
                        } else {
                            await codebolt.job.removeBlocker(targetJob.id, blocker.id);
                            await codebolt.job.addBlocker(targetJob.id, {
                                text: blocker.text,
                                addedBy: blocker.addedBy,
                                blockerJobIds: remainingIds
                            });
                            await codebolt.job.removeDependency(targetJob.id, completedJobId);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error resolving job blockers:', err);
    }
}