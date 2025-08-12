const codebolt = require('@codebolt/codeboltjs');

async function testMessageMCPTools() {
    console.log('✉️ Testing Message MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. message_send
        try {
            const result = await codebolt.tools.executeTool('codebolt.message', 'message_send', { message: 'Hello MCP' });
            console.log('✅ message_send:', result?.success);
        } catch (e) { console.log('⚠️  message_send failed:', e.message); }
        // 2. message_process_start
        try {
            const result = await codebolt.tools.executeTool('codebolt.message', 'message_process_start', { process: 'testProcess', message: 'Hello MCP' });
            console.log('✅ message_process_start:', result?.success);
        } catch (e) { console.log('⚠️  message_process_start failed:', e.message); }
        // 3. message_process_stop
        try {
            const result = await codebolt.tools.executeTool('codebolt.message', 'message_process_stop', { process: 'testProcess', message: 'Hello MCP' });
            console.log('✅ message_process_stop:', result?.success);
        } catch (e) { console.log('⚠️  message_process_stop failed:', e.message); }
        console.log('🎉 Message MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Message MCP tools test error:', e.message);
    }
}

testMessageMCPTools(); 