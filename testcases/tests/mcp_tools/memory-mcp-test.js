const codebolt = require('@codebolt/codeboltjs');

async function testMemoryMCPTools() {
    console.log('🧠 Testing Memory MCP Tools');
    console.log('===========================');
    await codebolt.waitForConnection();
    try {
        // 1. memory_set
        try {
            const setResult = await codebolt.tools.executeTool('codebolt.memory', 'memory_set', {
                key: 'test-key-1',
                value: 'This is a test memory value'
            });
            console.log('✅ memory_set:', setResult?.success, setResult?.message);
        } catch (error) {
            console.log('⚠️  memory_set failed:', error.message);
        }
        // 2. memory_get
        try {
            const getResult = await codebolt.tools.executeTool('codebolt.memory', 'memory_get', {
                key: 'test-key-1'
            });
            console.log('✅ memory_get:', getResult?.success, 'Value:', getResult?.data);
        } catch (error) {
            console.log('⚠️  memory_get failed:', error.message);
        }
        // 3. memory_get with non-existent key
        try {
            const nonExistentResult = await codebolt.tools.executeTool('codebolt.memory', 'memory_get', {
                key: 'non-existent-key-12345'
            });
            console.log('✅ memory_get (non-existent):', nonExistentResult?.success, 'Value:', nonExistentResult?.data);
        } catch (error) {
            console.log('✅ Expected error for non-existent key:', error.message);
        }
        console.log('🎉 All Memory MCP tools tests completed!');
    } catch (error) {
        console.error('❌ Memory MCP tools test error:', error.message);
    }
}

testMemoryMCPTools().catch(console.error); 