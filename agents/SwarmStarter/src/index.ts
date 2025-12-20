import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    const swarmId = '96168618-e8a5-461d-8d33-54bf17996b87';
    
    codebolt.chat.sendMessage("🚀 Starting Swarm initializer...");

    try {
        // Get swarm details
        const swarmResponse: any = await codebolt.swarm.getSwarm(swarmId);
        
        if (!swarmResponse.data?.swarm) {
            codebolt.chat.sendMessage("❌ Failed to get swarm details");
            return;
        }

        const swarm = swarmResponse.data.swarm;
        const maxAgents = swarm.configuration?.maxAgents || 1;
        
        codebolt.chat.sendMessage(`📋 Swarm: ${swarm.name} (Starting ${maxAgents} agents)`);

        // Get the task/message from the user request
        const userTask = reqMessage.userMessage || "Execute assigned task";

        // Helper to delay execution
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Start threads based on maxAgents count
        const threadPromises = Array.from({ length: maxAgents }, async (_, index) => {
            const agentIndex = index + 1;
            try {
                codebolt.chat.sendMessage(`🔄 Starting thread for agent #${agentIndex}`);
                
                // Stagger thread starts to avoid overwhelming the system
                await delay(1000 * index);
                
                const threadResult = await codebolt.thread.createAndStartThread({
                    title: `Swarm Task(${userTask}) - Agent #${agentIndex}`,
                    description: `Processing swarm task for agent #${agentIndex}`,
                    userMessage: userTask,
                    selectedAgent: {
                        id: 'swarmAgent',
                        name: 'Swarm Agent'
                    },
                    metadata: {
                        swarmId: swarmId,
                        agentIndex: agentIndex,
                        startedAt: new Date().toISOString()
                    },
                    tags: ['swarm', swarmId],
                });

                codebolt.chat.sendMessage(`✅ Thread started for agent #${agentIndex}`);
                return { agentIndex, success: true, result: threadResult };
            } catch (error: any) {
                codebolt.chat.sendMessage(`❌ Failed to start thread for agent #${agentIndex}: ${error.message}`);
                return { agentIndex, success: false, error: error.message };
            }
        });

        // Wait for all threads to be started
        const results = await Promise.all(threadPromises);

        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        codebolt.chat.sendMessage(`\n📊 Swarm Start Summary:\n✅ Successful: ${successful}\n❌ Failed: ${failed}\n👥 Total: ${maxAgents}`);

    } catch (error: any) {
        codebolt.chat.sendMessage(`❌ Error initializing swarm: ${error.message}`);
    }
});
