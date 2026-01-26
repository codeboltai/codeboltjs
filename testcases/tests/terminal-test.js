const codebolt = require('@codebolt/codeboltjs').default;

async function testTerminalOperations() {
    console.log('🖥️  Testing Terminal Operations');
    console.log('==============================');
    
    try {
    
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing basic echo command...');
        const echoResult = await codebolt.terminal.executeCommand('echo "Hello from CodeboltJS terminal test"');
        console.log('✅ Echo result:', echoResult);
        
        console.log('\n2. Testing pwd command...');
        const pwdResult = await codebolt.terminal.executeCommand('pwd');
        console.log('✅ Current directory:', pwdResult);
        
        console.log('\n3. Testing ls command...');
        const lsResult = await codebolt.terminal.executeCommand('ls -la');
        console.log('✅ Directory listing:', lsResult);
        
        console.log('\n4. Testing date command...');
        const dateResult = await codebolt.terminal.executeCommand('date');
        console.log('✅ Current date:', dateResult);
        
        console.log('\n5. Testing whoami command...');
        const whoamiResult = await codebolt.terminal.executeCommand('whoami');
        console.log('✅ Current user:', whoamiResult);
        
        console.log('\n6. Testing node version...');
        const nodeVersionResult = await codebolt.terminal.executeCommand('node --version');
        console.log('✅ Node version:', nodeVersionResult);
        
        console.log('\n7. Testing npm version...');
        const npmVersionResult = await codebolt.terminal.executeCommand('npm --version');
        console.log('✅ NPM version:', npmVersionResult);
        
        console.log('\n8. Testing command with return empty string on success...');
        const emptyResult = await codebolt.terminal.executeCommand('echo "test"', true);
        console.log('✅ Empty result (success):', emptyResult);
        
        console.log('\n9. Testing command stream (event emitter)...');
        const streamEmitter = codebolt.terminal.executeCommandWithStream('echo "Streaming test"');
        
        streamEmitter.on('data', (data) => {
            console.log('📡 Stream data:', data);
        });
        
        streamEmitter.on('end', () => {
            console.log('✅ Stream ended');
        });
        
        streamEmitter.on('error', (error) => {
            console.error('❌ Stream error:', error);
        });
        
        // Wait a bit for the stream to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n🎉 All terminal tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Terminal test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testTerminalOperations().catch(console.error); 