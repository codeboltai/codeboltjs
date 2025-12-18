import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

/**
 * Swarm Test Agent
 * Demonstrates all swarm module functions from codeboltjs
 */

codebolt.onMessage(async (reqMessage: FlatUserMessage,additionalVariable:any) => {
    try {

        // codebolt.chat.sendMessage(` got additional variables${JSON.stringify(additionalVariable)}`)
        codebolt.chat.sendMessage("🐝 Swarm Test Agent Started ", {});
                    // ================================
            // 2. AGENT REGISTRATION
            // ================================

            
            codebolt.chat.sendMessage("👤 Testing Agent Registration Functions...", {});
            let swarmId='4d21d5ca-9950-4300-a380-9019864d32ec'; 

            codebolt.chat.sendMessage(`${additionalVariable.agentId}`)

            // Register an agent
            const registerAgentResult = await codebolt.swarm.registerAgent(swarmId, {
                agentId:additionalVariable.agentId,
                name: "Developer",
                capabilities: ["coding", "testing"],
                agentType: "internal"
            });

            codebolt.chat.sendMessage(`Agent Registered with ${JSON.stringify(registerAgentResult)}`)
            // Create a team
                const createTeamResult = await codebolt.swarm.createTeam(swarmId, {
                    name: "Testing Team",
                    description: "Team for testing tasks",
                    maxMembers: 10,
                    metadata: { department: "engineering" },
                    createdBy:registerAgentResult?.data?.agentId || additionalVariable.agentId
                });
                codebolt.chat.sendMessage(`✅ createTeam: ${JSON.stringify(createTeamResult)}`, {});


    } catch (error) {
        codebolt.chat.sendMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, {});
    }
});
