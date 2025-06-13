const codebolt = require('@codebolt/codeboltjs');

async function testAgentMCPTools() {
    console.log('🤖 Testing Agent MCP Tools');
    console.log('==========================');
    await codebolt.waitForConnection();
    try {
        // 1. start
        try {
            const result = await codebolt.tools.executeTool('codebolt.agent', 'start', { agentId: 'act', task: 'Hi' });
            console.log('✅ start:', result?.success);
        } catch (e) { console.log('⚠️  start failed:', e.message); }
        // 2. find
        try {
            const result = await codebolt.tools.executeTool('codebolt.agent', 'find', { task: 'create node js application' });
            console.log('✅ find:', result?.success, 'Found:', result?.data?.length || 0);
        } catch (e) { console.log('⚠️  find failed:', e.message); }
        // 3. list
        try {
            const result = await codebolt.tools.executeTool('codebolt.agent', 'list', {});
            console.log('✅ list:', result?.success, 'Agents:', result?.data?.length || 0);
        } catch (e) { console.log('⚠️  list failed:', e.message); }
        // 4. get_detail (requires a real agentId)
        try {
            const result = await codebolt.tools.executeTool('codebolt.agent', 'get_detail', { agentId: 'ask' });
            console.log('✅ get_detail:', result?.success, 'Agent:', !!result?.data);
        } catch (e) { console.log('⚠️  get_detail failed:', e.message); }
        console.log('🎉 Agent MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Agent MCP tools test error:', e.message);
    }
}

testAgentMCPTools(); 