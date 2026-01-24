import codebolt from '@codebolt/codeboltjs';
import { AgentContext } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';

codebolt.onActionBlockInvocation(async (threadContext, metadata) => {
    try {
        // threadContext contains custom parameters passed from parent agent
        // metadata contains: sideExecutionId, threadId, parentAgentId, parentAgentInstanceId, timestamp
        // Note: params may be directly in threadContext or nested under threadContext.params
        const rawContext = threadContext as any;
        const vars = rawContext?.params || rawContext || {};
        const ctx: AgentContext = {
            swarmId: vars.swarmId || '',
            swarmName: vars.swarmName || 'Swarm',
            agentId: vars.agentId || metadata.parentAgentInstanceId || '',
            agentName: vars.agentName || `Agent:${metadata.parentAgentInstanceId}`,
            capabilities: vars.capabilities ?
                (typeof vars.capabilities === 'string' ?
                    JSON.parse(vars.capabilities) : vars.capabilities)
                : ['coding'],
            requirements: vars.requirements || 'Build a web application',
        };

        codebolt.chat.sendMessage(`Agent starting team formation...`);
        codebolt.chat.sendMessage(`Swarm ID: ${ctx.swarmId}`);
        codebolt.chat.sendMessage(`Agent ID: ${ctx.agentId}`);
        codebolt.chat.sendMessage(`Agent Name: ${ctx.agentName}`);
        codebolt.chat.sendMessage(`Capabilities: ${ctx.capabilities}`);
        codebolt.chat.sendMessage(`Requirements: ${ctx.requirements}`);

        // Check if teams exist
        const teamsResult = await codebolt.swarm.listTeams(ctx.swarmId);
        const teams = teamsResult.data?.teams || [];

        if (teams.length === 0) {
            // No teams exist - start structure deliberation
            await findOrCreateStructureDeliberation(ctx);
        } else {
            // Teams exist - join swarm
            await handleJoinSwarm(ctx, teams);
        }

        // Find or create swarm mail thread
        await findOrCreateSwarmThread(ctx);

        codebolt.chat.sendMessage('Team formation complete!');
    } catch (error) {
        codebolt.chat.sendMessage(`Error in team formation: ${error instanceof Error ? error.message : error}`, {});
    }
});
