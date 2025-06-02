const codebolt = require('@codebolt/codeboltjs');

async function testAgent() {
    console.log('🤖 Testing Agent Module');
    console.log('=======================');
    
    try {
        await codebolt.waitForConnection();
        
        // console.log('\n1. Testing agent list retrieval...');
        // try {
        //     const agentsListResult = await codebolt.agent.getAgentsList('downloaded');
        //     console.log('✅ Agents list result:', agentsListResult);
        //     console.log('   - Type:', agentsListResult?.type);
        //     console.log('   - Agents count:', agentsListResult?.agents?.length || 0);
        //     if (agentsListResult?.agents?.length > 0) {
        //         console.log('   - First agent:', agentsListResult.agents[0]);
        //     }
        // } catch (error) {
        //     console.log('⚠️  Agent list retrieval failed:', error.message);
        // }
        
        // console.log('\n2. Testing all agents list...');
        // try {
        //     const allAgentsResult = await codebolt.agent.getAgentsList('all');
        //     console.log('✅ All agents result:', allAgentsResult);
        //     console.log('   - Type:', allAgentsResult?.type);
        //     console.log('   - Total agents count:', allAgentsResult?.agents?.length || 0);
        // } catch (error) {
        //     console.log('⚠️  All agents list failed:', error.message);
        // }
        
        // console.log('\n3. Testing local agents list...');
        // try {
        //     const localAgentsResult = await codebolt.agent.getAgentsList('local');
        //     console.log('✅ Local agents result:', localAgentsResult);
        //     console.log('   - Type:', localAgentsResult?.type);
        //     console.log('   - Local agents count:', localAgentsResult?.agents?.length || 0);
        // } catch (error) {
        //     console.log('⚠️  Local agents list failed:', error.message);
        // }
        
        console.log('\n2. Testing getAgentsDetail method...');
        
        try {
            // Get the list of agents first
            const agentsList = await codebolt.agent.getAgentsList('downloaded');
            // console.log('✅ Agents list result:', JSON.stringify(agentsList));
            if (agentsList?.agents && agentsList.agents.length > 0) {
                // Get agent IDs from the first few agents
                const agentIds = agentsList.agents.slice(0, 3).map(agent => agent.function?.name);
                console.log('   - Agent IDs to get details for:', agentIds);
                
                // Get details for the selected agents
                const agentsDetailResult = await codebolt.agent.getAgentsDetail(agentIds);
                console.log('✅ Agents detail result type:', agentsDetailResult?.type);
                console.log('   - Expected type: "agentsDetailResponse"');
                console.log('   - Details count:', agentsDetailResult?.agents?.length || 0);
                console.log('✅ Agents detail result:', JSON.stringify(agentsDetailResult));
               
            } else {
                console.log('⚠️ No agents available for detail retrieval');
            }
            
            // Test with empty agent list
        
            
        } catch (error) {
            console.log('⚠️ getAgentsDetail failed:', error.message);
        }
        
        // console.log('\n5. Testing agent finding by task...');
        // const testTask = 'Run project';
        // try {
        //     const findAgentResult = await codebolt.agent.findAgent(
        //         testTask,
        //         3, // maxResult
        //         [], // agents filter
        //         'all', // agentLocation
        //         'use_both' // getFrom
        //     );
        //     console.log('✅ Find agent result:', findAgentResult);
        //     console.log('   - Task:', testTask);
        //     console.log('   - Found agents count:', findAgentResult?.agents?.length || 0);
        //     if (findAgentResult?.agents?.length > 0) {
        //         console.log('   - Best match:', findAgentResult.agents[0]);
        //     }
        // } catch (error) {
        //     console.log('⚠️  Agent finding failed:', error.message);
        // }
        
        // console.log('\n6. Testing agent finding with different parameters...');
        // const analysisTask = 'Analyze data and provide insights';
        // try {
        //     const findAnalysisAgentResult = await codebolt.agent.findAgent(
        //         analysisTask,
        //         1, // maxResult
        //         [], // agents filter
        //         'local_only', // agentLocation
        //         'use_ai' // getFrom
        //     );
        //     console.log('✅ Find analysis agent result:', findAnalysisAgentResult);
        //     console.log('   - Task:', analysisTask);
        //     console.log('   - Location filter:', 'local_only');
        //     console.log('   - Found agents count:', findAnalysisAgentResult?.agents?.length || 0);
        // } catch (error) {
        //     console.log('⚠️  Analysis agent finding failed:', error.message);
        // }
        
        // console.log('\n7. Testing agent starting...');
        // try {
        //     // First find an agent
        //     const findResult = await codebolt.agent.findAgent('Documentation Agent', 1);
        //     if (findResult?.agents && findResult.agents.length > 0) {
        //         const agentId = findResult.agents[0].function?.name || findResult.agents[0].id || findResult.agents[0].name;
        //         const startTask = 'Create a simple hello world function';
                
        //         const startAgentResult = await codebolt.agent.startAgent(agentId, startTask);
        //         console.log('✅ Start agent result:', startAgentResult);
        //         console.log('   - Agent ID:', agentId);
        //         console.log('   - Task:', startTask);
        //         console.log('   - Status:', startAgentResult?.status);
        //         console.log('   - Response type:', startAgentResult?.type);
        //     } else {
        //         console.log('⚠️  No agents found to start');
        //     }
        // } catch (error) {
        //     console.log('⚠️  Agent starting failed:', error.message);
        // }
        
        // console.log('\n8. Testing agent finding with specific agent filter...');
        // try {
        //     // Get some agent names first
        //     const agentsList = await codebolt.agent.getAgentsList('downloaded');
        //     if (agentsList?.agents && agentsList.agents.length > 0) {
        //         const agentNames = agentsList.agents.slice(0, 2).map(agent => agent.function?.name || agent.name || agent.id);
                
        //         const filteredFindResult = await codebolt.agent.findAgent(
        //             'Code generation task',
        //             2,
        //             agentNames, // filter by specific agents
        //             'all',
        //             'use_both'
        //         );
        //         console.log('✅ Filtered find result:', filteredFindResult);
        //         console.log('   - Filter agents:', agentNames);
        //         console.log('   - Found agents count:', filteredFindResult?.agents?.length || 0);
        //     } else {
        //         console.log('⚠️  No agents available for filtering');
        //     }
        // } catch (error) {
        //     console.log('⚠️  Filtered agent finding failed:', error.message);
        // }
        
        // console.log('\n9. Testing agent finding with remote only location...');
        // try {
        //     const remoteAgentResult = await codebolt.agent.findAgent(
        //         'Complex data processing task',
        //         5,
        //         [],
        //         'remote_only',
        //         'use_vector_db'
        //     );
        //     console.log('✅ Remote agent result:', remoteAgentResult);
        //     console.log('   - Location filter:', 'remote_only');
        //     console.log('   - Found agents count:', remoteAgentResult?.agents?.length || 0);
        // } catch (error) {
        //     console.log('⚠️  Remote agent finding failed:', error.message);
        // }
        
        // console.log('\n10. Testing comprehensive agent workflow...');
        // try {
        //     const workflowTask = 'Build a React component for user authentication';
            
        //     // Step 1: Find suitable agents
        //     const foundAgents = await codebolt.agent.findAgent(workflowTask, 3);
        //     console.log('   - Found agents for workflow:', foundAgents?.agents?.length || 0);
            
        //     if (foundAgents?.agents && foundAgents.agents.length > 0) {
        //         // Step 2: Get detailed information about the best agent
        //         const bestAgent = foundAgents.agents[0];
        //         const agentId = bestAgent.function?.name || bestAgent.id || bestAgent.name;
        //         const agentDetails = await codebolt.agent.getAgentsDetail([agentId]);
        //         console.log('   - Agent details retrieved:', agentDetails?.agents?.length || 0);
                
        //         // Step 3: Start the agent with the task
        //         const workflowResult = await codebolt.agent.startAgent(agentId, workflowTask);
        //         console.log('✅ Workflow completion:', workflowResult?.type);
        //     } else {
        //         console.log('⚠️  No suitable agents found for workflow');
        //     }
        // } catch (error) {
        //     console.log('⚠️  Agent workflow failed:', error.message);
        // }
        
        // console.log('\n🎉 All agent tests completed successfully!');
        // console.log('Note: Some tests may show warnings if no agents are available or configured');
        
    } catch (error) {
        console.error('❌ Agent test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testAgent().catch(console.error); 