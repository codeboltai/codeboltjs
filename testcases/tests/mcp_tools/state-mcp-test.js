const codebolt = require('@codebolt/codeboltjs');

async function testStateMCPTools() {
    console.log('🔑 Testing State MCP Tools');
    console.log('==========================');
    await codebolt.waitForConnection();
    try {
        // 1. state_get
        try {
            const result = await codebolt.tools.executeTool('codebolt.state', 'state_get', { key: 'all' });
            console.log('✅ state_get:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  state_get failed:', e.message); }
        // 2. state_set_agent
        try {
            const result = await codebolt.tools.executeTool('codebolt.state', 'state_set_agent', { key: 'testKey', value: 'testValue', type: 'string' });
            console.log('✅ state_set_agent:', result?.success);
        } catch (e) { console.log('⚠️  state_set_agent failed:', e.message); }
        // 3. state_get_agent
        try {
            const result = await codebolt.tools.executeTool('codebolt.state', 'state_get_agent', { variableName: 'testKey' });
            console.log('✅ state_get_agent:', result?.success, 'Data:', result?.data);
        } catch (e) { console.log('⚠️  state_get_agent failed:', e.message); }
        // 4. state_remove_agent
        try {
            const result = await codebolt.tools.executeTool('codebolt.state', 'state_remove_agent', { key: 'testKey', value: 'testValue', type: 'string' });
            console.log('✅ state_remove_agent:', result?.success);
        } catch (e) { console.log('⚠️  state_remove_agent failed:', e.message); }
        // 5. state_update_project
        try {
            const result = await codebolt.tools.executeTool('codebolt.state', 'state_update_project', { key: 'projectKey', value: 'projectValue' });
            console.log('✅ state_update_project:', result?.success);
        } catch (e) { console.log('⚠️  state_update_project failed:', e.message); }
        console.log('🎉 State MCP tools tests completed!');
    } catch (e) {
        console.error('❌ State MCP tools test error:', e.message);
    }
}

testStateMCPTools(); 