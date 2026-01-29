const codebolt = require('../../src/index.ts');

async function testWebSocketInitialization() {
    console.log('Testing WebSocket initialization...');
    
    try {
        // Test that we can wait for the codebolt instance to be ready
        console.log('Waiting for Codebolt to be ready...');
        await codebolt.waitForReady();
        console.log('✅ Codebolt is ready!');
        
        // Test that onMessage can be called without race conditions
        console.log('Setting up message handler...');
        codebolt.onMessage((message) => {
            console.log('📨 Received message:', message);
            return "Message processed successfully";
        });
        console.log('✅ Message handler set up successfully!');
        
        console.log('🎉 All tests passed! WebSocket initialization is working properly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testWebSocketInitialization(); 