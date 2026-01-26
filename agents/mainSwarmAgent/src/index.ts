import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

// ================================
// TYPE DEFINITIONS
// ================================

interface AgentContext {
  swarmId: string;
  swarmName: string;
  agentId: string;
  agentName: string;
  capabilities: string[];
  requirements: string;
}

interface SwarmConfig {
  isJobSelfSplittingEnabled: boolean;
  minimumJobSplitProposalRequired: number;
  isJobSplitDeliberationRequired: boolean;
  selectJobSplitDeliberationType: string;
}

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

  let running = true;
  while (running) {
    // Use the find-next-job-for-agent action block to find and pick the next job
    codebolt.chat.sendMessage(`🔍 Invoking find-next-job-for-agent action block...`);

    const actionBlockResponse: any = await codebolt.actionBlock.start('find-next-job-for-agent', {
      swarmId: ctx.swarmId,
      swarmName: ctx.swarmName,
      agentId: ctx.agentId,
      agentName: ctx.agentName,
      capabilities: ctx.capabilities,
      requirements: ctx.requirements,
      swarmConfig: SWARM_CONFIG
    });

    codebolt.chat.sendMessage(`📋 Action block response: ${JSON.stringify(actionBlockResponse)}`);

    // Check if action block call itself failed
    if (!actionBlockResponse?.success) {
      codebolt.chat.sendMessage(`⚠️ Action block call failed: ${actionBlockResponse?.error}`);
      running = false;
      break;
    }

    // Extract the actual result from the action block response
    const findJobResult = actionBlockResponse.result;

    codebolt.chat.sendMessage(`📋 Find job result: success=${findJobResult?.success}, action=${findJobResult?.action}`);

    // Handle action block result
    if (!findJobResult?.success) {
      if (findJobResult?.action === 'terminate') {
        codebolt.chat.sendMessage(`🛑 No open jobs available. Agent terminating.`);
        running = false;
        break;
      }

      if (findJobResult?.action === null) {
        // Job was processed but is blocked, continue to next iteration
        codebolt.chat.sendMessage(`⏳ Job processed but blocked. Continuing to next job...`);
        continue;
      }

      codebolt.chat.sendMessage(`⚠️ Error finding job: ${findJobResult?.error}`);
      running = false;
      break;
    }

    const job = findJobResult.job;
    const action = findJobResult.action;

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
        codebolt.chat.sendMessage(`❓ Unknown action: ${action}. Agent terminating.`);
        running = false;
    }
  }

  codebolt.chat.sendMessage(`👋 Main Swarm Agent completed`);
});
