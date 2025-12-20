import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';

// ================================
// MAIN AGENT ENTRY POINT
// ================================

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    try {
        let ctx: AgentContext = {
            swarmId: '96168618-e8a5-461d-8d33-54bf17996b87',
            swarmName:"Test Swarm",
            agentId: additionalVariable.agentId,
            agentName: `Agent:${additionalVariable.agentId}-${Math.random()}`,
            capabilities: additionalVariable.capabilities || ['coding'],
            requirements: additionalVariable.requirements || 'Build a web application',
        };
        codebolt.chat.sendMessage('🐝 Swarm Agent Started', {});

//  const finalCheck = await codebolt.agentDeliberation.list({
//     // deliberationType:'shared-list'
//         // search: `Test Swarm Initial Teams`,
//     });
//     codebolt.chat.sendMessage(JSON.stringify(finalCheck),{})
//         return
        // Register to swarm
        let registerAgentResult = await codebolt.swarm.registerAgent(ctx.swarmId, {
            agentId: ctx.agentId,
            name: ctx.agentName,
            capabilities: ctx.capabilities,
            agentType: 'internal',
        });
        ctx.agentId = registerAgentResult.data?.agentId || ''

        // Create or join swarm mail thread and send greeting
        await findOrCreateSwarmThread(ctx);

        // Check if teams exist
        const teamsResult = await codebolt.swarm.listTeams(ctx.swarmId);
        const teams = teamsResult.data?.teams || [];

        if (teams.length === 0) {
            // No teams - bootstrap via deliberation
            await findOrCreateStructureDeliberation(ctx);
        } else {
            // Teams exist - join flow
            await handleJoinSwarm(ctx, teams);
        }

        codebolt.chat.sendMessage('🐝 Done!', {});
    } catch (error) {
        codebolt.chat.sendMessage(`❌ ${error instanceof Error ? error.message : error}`, {});
    }
});
