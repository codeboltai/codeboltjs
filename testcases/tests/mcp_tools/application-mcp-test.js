const codebolt = require('@codebolt/codeboltjs');

async function testAppServericeMCPTools() {
    console.log('🛠️ Testing application MCP Tools');
    console.log('=================================');
    await codebolt.waitForConnection();
    try {
        // 1. get_state
        try {
            const result = await codebolt.tools.executeTool('codebolt.application', 'get_state', {});
            console.log('✅ get_state:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  get_state failed:', e.message); }
        // 2. get_project_state
        try {
            const result = await codebolt.tools.executeTool('codebolt.application', 'get_project_state', {});
            console.log('✅ get_project_state:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  get_project_state failed:', e.message); }
        // 3. update_project_state
        try {
            const result = await codebolt.tools.executeTool('codebolt.application', 'update_project_state', { key: 'testKey', value: 'testValue' });
            console.log('✅ update_project_state:', result?.success);
        } catch (e) { console.log('⚠️  update_project_state failed:', e.message); }
        console.log('🎉 AppServerice MCP tools tests completed!');
    } catch (e) {
        console.error('❌ AppServerice MCP tools test error:', e.message);
    }
}

testAppServericeMCPTools(); 