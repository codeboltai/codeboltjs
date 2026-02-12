import codebolt from '@codebolt/codeboltjs';
import { AgentContext, SwarmConfig, FindJobResult } from './types';
import { pickJob } from './jobPicker';

/**
 * Find and assign the next available job to an agent using pheromone-based selection.
 *
 * Process:
 * 1. Gets the default job group for the swarm
 * 2. Fetches open jobs sorted by importance
 * 3. Uses pheromone-based priority system to pick the best job
 * 4. Returns the selected job and recommended action
 */
export async function findNextJobForAgent(ctx: AgentContext, swarmConfig: SwarmConfig): Promise<FindJobResult> {
    try {
        codebolt.chat.sendMessage(`🔍 Finding next job for agent...`);
        codebolt.chat.sendMessage(`Swarm ID: ${ctx.swarmId}`);
        codebolt.chat.sendMessage(`Agent: ${ctx.agentName} (${ctx.agentId})`);

        // Validate required parameters
        if (!ctx.swarmId) {
            codebolt.chat.sendMessage('❌ Error: swarmId is required');
            return { success: false, error: 'swarmId is required' };
        }

        // Get the default job group for this swarm
        const defaultJobGroup = await codebolt.swarm.getDefaultJobGroup(ctx.swarmId);

        if (!defaultJobGroup?.data?.groupId) {
            codebolt.chat.sendMessage(`⚠️ No default job group found for swarm ${ctx.swarmId}`);
            return { success: false, error: 'No default job group found for swarm' };
        }

        const groupId = defaultJobGroup.data.groupId;
        codebolt.chat.sendMessage(`📂 Target Job Group: ${groupId}`);

        // Fetch open jobs sorted by importance
        let pendingJobsResponse: any = await codebolt.job.listJobs({
            groupId: groupId,
            sortBy: 'importance',
            status: ['open']
        });

        const pendingJobs = pendingJobsResponse?.data?.jobs || [];
        codebolt.chat.sendMessage(`📥 Found ${pendingJobs.length} open jobs`);

        if (pendingJobs.length === 0) {
            codebolt.chat.sendMessage(`🛑 No open jobs available`);
            return { success: false, error: 'No open jobs available', action: 'terminate' };
        }

        // Use pheromone-based job picking
        const pickResult = await pickJob(pendingJobs, ctx, swarmConfig);

        if (pickResult.action === 'terminate') {
            return { success: false, error: 'No actionable jobs found', action: 'terminate' };
        }

        if (pickResult.action === null) {
            // Job was processed but is blocked
            return { success: false, error: 'Job is blocked, continuing to next', action: null };
        }

        if (pickResult.job) {
            codebolt.chat.sendMessage(`✅ Selected job: "${pickResult.job.name}" - Action: ${pickResult.action}`);
            return {
                success: true,
                job: {
                    id: pickResult.job.id,
                    name: pickResult.job.name,
                    description: pickResult.job.description,
                    status: pickResult.job.status,
                    groupId: groupId
                },
                action: pickResult.action
            };
        }

        return { success: false, error: 'No job selected', action: pickResult.action };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        codebolt.chat.sendMessage(`❌ Error in find-next-job: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
}
