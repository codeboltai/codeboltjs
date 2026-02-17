import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { findNextJobForAgent } from './jobfinder';
import { SwarmConfig, AgentContext } from './jobfinder/types';
import { executeJob } from './implementor';

// ================================
// MAIN AGENT ENTRY POINT
// ================================


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

  // Fetch swarm configuration
  let swarmConfig: SwarmConfig = {
    isJobSelfSplittingEnabled: false,
    minimumJobSplitProposalRequired: 1,
    maxSplitProposals: 5,
    isJobSplitDeliberationRequired: false,
    selectJobSplitDeliberationType: '',
  };

  try {
    const configResponse = await codebolt.swarm.getSwarmConfig(ctx.swarmId);
    if (configResponse.success && configResponse.data?.config) {
      const fetchedConfig = configResponse.data.config;
      swarmConfig = {
        isJobSelfSplittingEnabled: false, // Defaulting to false as direct mapping is not present in JobCoordinationSettings
        minimumJobSplitProposalRequired: fetchedConfig.jobCoordination?.minSplitProposals ?? 1,
        maxSplitProposals: fetchedConfig.jobCoordination?.maxSplitProposals ?? 5,
        isJobSplitDeliberationRequired: fetchedConfig.jobCoordination?.splitDeliberationEnabled ?? false,
        selectJobSplitDeliberationType: '',
      };
      codebolt.chat.sendMessage(`🔧 Loaded swarm config: SplitDeliberation=${swarmConfig.isJobSplitDeliberationRequired}`);
    } else {
      codebolt.chat.sendMessage(`⚠️ Failed to load swarm config, using defaults: ${configResponse.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    codebolt.chat.sendMessage(`⚠️ Error fetching swarm config: ${error}`);
  }

  let running = true;
  while (running) {
    codebolt.chat.sendMessage(`🔍 Finding next job for agent...`);

    const findJobResult = await findNextJobForAgent(ctx, swarmConfig);

    codebolt.chat.sendMessage(`📋 Find job result: success=${findJobResult?.success}, action=${findJobResult?.action}`);

    // Handle find job result
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
          await codebolt.job.updateJob(job.id, { status: 'working' });

          try {
            // Run the agent loop to implement the job
            await executeJob(reqMessage, job, ctx);

            // Mark job as review (not closed — reviewer will close it)
            await codebolt.job.updateJob(job.id, { status: 'review' });
            codebolt.chat.sendMessage(`✅ Job ${job.id} implementation done, submitted for review`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            codebolt.chat.sendMessage(`❌ Job ${job.id} failed: ${errorMsg}`);
            // Unlock the job so another agent can pick it up
            await codebolt.job.unlockJob(job.id, ctx.agentId);
            await codebolt.job.updateJob(job.id, { status: 'open' });
          }
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
