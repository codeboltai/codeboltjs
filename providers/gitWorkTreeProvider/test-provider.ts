import { GitWorktreeProviderService } from './src/services/GitWorktreeProviderService';
import { 
  ProviderInitVars, 
  ProviderStartResult, 
  AgentStartMessage
} from './src/interfaces/IProviderService';

/**
 * Test script to call onProviderStart followed by onProviderAgentStart
 */
async function testProviderFlow() {
  console.log('=== Starting Git WorkTree Provider Test ===');

  // Create provider service instance
  const providerService = new GitWorktreeProviderService();

  try {
    // Step 1: Call onProviderStart
    console.log('\n1. Calling onProviderStart...');
    
    const initVars: ProviderInitVars = {
      environmentName: 'test-environment-' + Date.now()
    };

    const startResult: ProviderStartResult = await providerService.onProviderStart(initVars);
    
    console.log('✅ onProviderStart completed successfully:');
    console.log('   - Success:', startResult.success);
    console.log('   - Worktree Path:', startResult.worktreePath);
    console.log('   - Environment Name:', startResult.environmentName);
    console.log('   - Agent Server URL:', startResult.agentServerUrl);

    // Step 2: Call onProviderAgentStart
    console.log('\n2. Calling onProviderAgentStart...');
    
    const agentStartMessage: AgentStartMessage = {
      type: 'agent_start',
      userMessage: 'Hello from test!',
      task: 'Test task execution',
      context: {
        testMode: true,
        environment: initVars.environmentName
      },
      timestamp: Date.now(),
      agentId: 'test-agent-' + Date.now()
    };

    await providerService.onProviderAgentStart(agentStartMessage);
    
    console.log('✅ onProviderAgentStart completed successfully');

    // Optional: Wait a bit to see any async operations complete
    console.log('\n3. Waiting for operations to settle...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Optional: Get current state
    console.log('\n4. Current provider state:');
    const worktreeInfo = providerService.getWorktreeInfo();
    const agentConnection = providerService.getAgentServerConnection();
    
    console.log('   - Worktree created:', worktreeInfo.isCreated);
    console.log('   - Worktree path:', worktreeInfo.path);
    console.log('   - Worktree branch:', worktreeInfo.branch);
    console.log('   - Agent server connected:', agentConnection.isConnected);
    console.log('   - Agent server URL:', agentConnection.serverUrl);

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Cleanup
    console.log('\n5. Cleaning up...');
    try {
      await providerService.onCloseSignal();
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
  }
}

// Run the test
if (require.main === module) {
  testProviderFlow()
    .then(() => {
      console.log('\n=== Test script completed ===');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n=== Test script failed ===');
      console.error(error);
      process.exit(1);
    });
}

export { testProviderFlow };
