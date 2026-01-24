import codebolt from '@codebolt/codeboltjs';
import { AgentContext, FindJobResult } from './types';
import { findNextJob } from './jobFinder';

/**
 * find-next-job Action Block
 *
 * Finds and assigns the next available job to an agent.
 *
 * Process:
 * 1. Gets the default job group for the swarm
 * 2. Fetches open jobs sorted by importance
 * 3. Analyzes each job for dependencies/blockers
 * 4. Locks and assigns the first available job
 *
 * Input (via threadContext):
 *   - swarmId: The swarm ID to find jobs from
 *   - agentId: (optional) The agent ID
 *   - agentName: (optional) The agent name
 *
 * Output:
 *   - success: boolean
 *   - job: { id, name, description, status, groupId } (if found)
 *   - error: string (if failed)
 */
codebolt.onActionBlockInvocation(async (threadContext, metadata): Promise<FindJobResult> => {
    try {
        // Extract parameters from threadContext (custom params from parent agent)
        // metadata contains: sideExecutionId, threadId, parentAgentId, parentAgentInstanceId, timestamp
        // Note: params may be directly in threadContext or nested under threadContext.params
        const rawContext = threadContext as any;
        const vars = rawContext?.params || rawContext || {};

        const ctx: AgentContext = {
            swarmId: vars.swarmId || '',
            agentId: vars.agentId || metadata.parentAgentInstanceId || '',
            agentName: vars.agentName || `Agent:${metadata.parentAgentInstanceId}`,
        };

        codebolt.chat.sendMessage(`Agent starting team formation...`);
        codebolt.chat.sendMessage(`Swarm ID: ${ctx.swarmId}`);
        codebolt.chat.sendMessage(`Agent ID: ${ctx.agentId}`);
        codebolt.chat.sendMessage(`Agent Name: ${ctx.agentName}`);

        // Validate required parameters
        if (!ctx.swarmId) {
            codebolt.chat.sendMessage('Error: swarmId is required');
            return { success: false, error: 'swarmId is required' };
        }

        codebolt.chat.sendMessage(`Agent ${ctx.agentName} searching for next job...`);

        // Get the default job group for this swarm
        const defaultJobGroup = await codebolt.swarm.getDefaultJobGroup(ctx.swarmId);

        if (!defaultJobGroup?.data?.groupId) {
            codebolt.chat.sendMessage(`No default job group found for swarm ${ctx.swarmId}`);
            return { success: false, error: 'No default job group found for swarm' };
        }

        const groupId = defaultJobGroup.data.groupId;
        codebolt.chat.sendMessage(`Using job group: ${groupId}`);

        // Find and assign the next available job
        const result = await findNextJob(ctx, groupId);

        if (result.success && result.job) {
            codebolt.chat.sendMessage(`Found job: "${result.job.name}"`);
        } else {
            codebolt.chat.sendMessage(result.error || 'No job found');
        }

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        codebolt.chat.sendMessage(`Error in find-next-job: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
});
