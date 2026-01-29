const codebolt = require('@codebolt/codeboltjs');

async function testTerminalMCPTools() {
    console.log('💻 Testing Terminal MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. terminal_execute_command (valid)
        try {
            const result = await codebolt.tools.executeTool('codebolt.terminal', 'terminal_execute_command', {
                command: 'echo "Hello from MCP"'
            });
            console.log('✅ terminal_execute_command:', result?.success, 'Result:', result);
        } catch (e) { console.log('⚠️  terminal_execute_command failed:', e.message); }
        // 2. terminal_execute_command (missing command, should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.terminal', 'terminal_execute_command', {});
            console.log('❌ terminal_execute_command (missing command) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing command:', e.message); }
        console.log('🎉 Terminal MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Terminal MCP tools test error:', e.message);
    }
}

testTerminalMCPTools(); 