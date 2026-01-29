const codebolt = require('@codebolt/codeboltjs');

async function testDebugMCPTools() {
    console.log('🐞 Testing Debug MCP Tools');
    console.log('========================');
    await codebolt.waitForConnection();
    try {
        
        try {
            const result = await codebolt.tools.executeTool('codebolt.debug', 'debug_open_browser', { url: 'https://example.com', port: 3000 });
            console.log('✅ debug_open_browser:', result?.success);
        } catch (e) { console.log('⚠️  debug_open_browser failed:', e.message); }
        console.log('🎉 Debug MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Debug MCP tools test error:', e.message);
    }
}

testDebugMCPTools(); 