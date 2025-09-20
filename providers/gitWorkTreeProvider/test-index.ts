/**
 * Test script that directly tests the functions from index.ts
 * This simulates calling onProviderStart followed by onProviderAgentStart
 */

import { 
  ProviderInitVars, 
  ProviderStartResult, 
  AgentStartMessage
} from './src/interfaces/IProviderService';

// Import the functions we want to test (we'll need to modify index.ts to export them)
// For now, we'll create our own instances to test the same flow

import { GitWorktreeProviderService } from './src/services/GitWorktreeProviderService';

// Create provider service instance (same as in index.ts)
const providerService = new GitWorktreeProviderService();

// Replicate the functions from index.ts
async function onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult> {
    return await providerService.onProviderStart(initvars);
}

async function onProviderAgentStart(initvars: AgentStartMessage): Promise<void> {
    return await providerService.onProviderAgentStart(initvars);
}

async function onCloseSignal(): Promise<void> {
    return await providerService.onCloseSignal();
}

/**
 * Main test function that calls the index.ts functions in sequence
 */
async function testIndexFunctions() {
  console.log('=== Testing index.ts Functions ===');

  try {
    // Step 1: Call onProviderStart (same as index.ts)
    console.log('\n1. Testing onProviderStart function...');
    
    const initVars: ProviderInitVars = {
      environmentName: 'index-test-' + Date.now()
    };

    console.log('   Calling with initVars:', initVars);
    const startResult = await onProviderStart(initVars);
    
    console.log('✅ onProviderStart result:');
    console.log('   - Success:', startResult.success);
    console.log('   - Worktree Path:', startResult.worktreePath);
    console.log('   - Environment Name:', startResult.environmentName);
    console.log('   - Agent Server URL:', startResult.agentServerUrl);

    // Step 2: Call onProviderAgentStart (same as index.ts)
    console.log('\n2. Testing onProviderAgentStart function...');
    
    const agentStartMessage: any = {
      type: 'messageResponse',
      message:{
        userMessage:"hi"
      },
      userMessage: 'Test message from index.ts test',
      task: 'Execute test task via index functions',
      context: {
        source: 'index-test',
        environment: initVars.environmentName,
        testId: 'idx-' + Date.now()
      },
      timestamp: Date.now(),
      agentId: 'test'
    };

    console.log('   Calling with agentStartMessage:', {
      type: agentStartMessage.type,
      agentId: agentStartMessage.agentId,
      hasUserMessage: !!agentStartMessage.userMessage,
      hasTask: !!agentStartMessage.task
    });

    await onProviderAgentStart(agentStartMessage);
    
    console.log('✅ onProviderAgentStart completed successfully');

    // Step 3: Brief pause to let operations settle
    console.log('\n3. Allowing time for operations to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n✅ Index.ts functions test completed successfully!');

  } catch (error) {
    console.error('\n❌ Index.ts functions test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:');
      console.error('- Message:', error.message);
      console.error('- Stack:', error.stack);
    }
    
    throw error; // Re-throw to be caught by main error handler

  } finally {
    // Cleanup using the same pattern as index.ts
    console.log('\n4. Cleanup using onCloseSignal...');
    try {
      await onCloseSignal();
      console.log('✅ Cleanup via onCloseSignal completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
  }
}

// Execute the test
if (require.main === module) {
  console.log('Starting test of index.ts functions...');
  
  testIndexFunctions()
    .then(() => {
      console.log('\n🎉 All tests passed! Index.ts functions work correctly.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed!');
      console.error(error);
      process.exit(1);
    });
}

export { testIndexFunctions, onProviderStart, onProviderAgentStart, onCloseSignal };
