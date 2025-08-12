const codebolt = require('@codebolt/codeboltjs');

async function testConfigMCPTools() {
    console.log('⚙️ Testing Config MCP Tools');
    console.log('==========================');
    await codebolt.waitForConnection();
    try {
        // 1. configure_mcp with valid parameters
        try {
            const result = await codebolt.tools.executeTool('codebolt.config', 'configure_mcp', {
                serverName: 'filesystem',
                config: {
                    command: "npx",
                    args: [
                        "-y",
                        "@modelcontextprotocol/server-filesystem",
                        "/path/to/other/allowed/dir"
                    ]
                }
            });
            console.log('✅ configure_mcp:', result?.success, 'Config:', !!result?.data);
        } catch (e) { console.log('⚠️  configure_mcp failed:', e.message); }

        // 2. configure_mcp with missing config (should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.config', 'configure_mcp', {
                serverName: 'filesystem'
            });
            console.log('❌ configure_mcp (missing config) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing config:', e.message); }

        // 3. configure_mcp with missing serverName (should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.config', 'configure_mcp', {
                config: {
                    command: "npx",
                    args: ["-y", "@modelcontextprotocol/server-filesystem"]
                }
            });
            console.log('❌ configure_mcp (missing serverName) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing serverName:', e.message); }

        console.log('🎉 Config MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Config MCP tools test error:', e.message);
    }
}

testConfigMCPTools(); 