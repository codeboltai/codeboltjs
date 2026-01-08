import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { AgentContext, SwarmConfig } from './types';
import { pickJob } from './jobPicker';
import { minimum } from 'zod/v4-mini';

// ================================
// MAIN AGENT ENTRY POINT
// ================================

const SWARM_CONFIG: SwarmConfig = {
  isJobSelfSplittingEnabled: false,
  minimumJobSplitProposalRequired: 1, // if split proposal required only 1 that auto approve,
  isJobSplitDeliberationRequired: false,
  selectJobSplitDeliberationType: '', // random,
}

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
  codebolt.chat.sendMessage("🚀 Starting Main Swarm Agent");

  let ctx: AgentContext = {
    swarmId: additionalVariable.swarmId || '139ce5b8-bc16-4a3a-8638-d1b620e9abf3',
    swarmName: "Test Swarm",
    agentId: additionalVariable.instanceId || '139ce5b8-bc16-4a3a-8638-d1b620e9abf3',
    agentName: `Agent:${additionalVariable.instanceId}-${Math.random()}`,
    capabilities: additionalVariable.capabilities ? JSON.parse(additionalVariable.capabilities) : ['coding'],
    requirements: additionalVariable.requirements || 'Build a web application',
  };

  // Get Default Job Group
  let defaultJobGroup = await codebolt.swarm.getDefaultJobGroup(ctx.swarmId);
  if (!defaultJobGroup || !defaultJobGroup.data?.groupId) {
    codebolt.chat.sendMessage(`⚠️ No default job group found for swarm ${ctx.swarmId}`);
    return;
  }
  const groupId = defaultJobGroup.data.groupId;
  codebolt.chat.sendMessage(`📂 Target Job Group: ${groupId}`);

  let running = true;
  while (running) {
    // Fetch open jobs sorted by importance
    let pendingJobsResponse: any = await codebolt.job.listJobs({
      groupId: groupId,
      sortBy: 'importance',
      status: ['open']
    });

    const pendingJobs = pendingJobsResponse?.data?.jobs || [];
    codebolt.chat.sendMessage(`📥 Found ${pendingJobs.length} open jobs`);

    if (pendingJobs.length === 0) {
      codebolt.chat.sendMessage(`🛑 No open jobs available. Agent terminating.`);
      running = false;
      break;
    }

    // Pick a job using pheromone-based selection
    const { job, action } = await pickJob(pendingJobs, ctx, SWARM_CONFIG);

    switch (action) {
      case 'implement':
        if (job) {
          codebolt.chat.sendMessage(`🔨 Implementing job: ${job.id} - ${job.name}`);

          // Lock the job
          await codebolt.job.lockJob(job.id, ctx.agentId, ctx.agentName);

          // Update job status to working
          await codebolt.job.updateJob(job.id, { status: 'closed' });

          // TODO: Implement actual job execution logic here
          codebolt.chat.sendMessage(`📝 Job ${job.id} is now being worked on...`);

          // For now, just mark as completed after one iteration
          // In real implementation, this would involve actual work
          // running = false;
        }
        break;

      case 'split':
        codebolt.chat.sendMessage(`✂️ Job marked for split. Moving to next job...`);
        // Continue to next iteration to pick another job
        break;

      case 'free-request':
        if (job) {
          codebolt.chat.sendMessage(`🔓 Requesting job freeing for: ${job.id}`);
          // Add unlock request
          await codebolt.job.addUnlockRequest(job.id, {
            requestedBy: ctx.agentId,
            requestedByName: ctx.agentName,
            reason: 'Job has been blocked for too long and needs intervention'
          });
        }
        break;

      case 'terminate':
        codebolt.chat.sendMessage(`🛑 No actionable work available. Agent terminating.`);
        running = false;
        break;

      case null:
        // Job was processed but is blocked, continue to next iteration
        codebolt.chat.sendMessage(`⏳ Job processed but blocked. Continuing to next job...`);
        break;

      default:
        codebolt.chat.sendMessage(`❓ Unknown action. Agent terminating.`);
        running = false;
    }
  }

  codebolt.chat.sendMessage(`👋 Main Swarm Agent completed`);
});
