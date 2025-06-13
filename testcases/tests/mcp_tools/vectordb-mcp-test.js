const codebolt = require('@codebolt/codeboltjs');

async function testVectorDbMCPTools() {
    console.log('🧬 Testing VectorDB MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. add_item
        try {
            const result = await codebolt.tools.executeTool('codebolt.vector', 'add_item', { item: 'This is a test document for vector database' });
            console.log('✅ add_item:', result?.success);
        } catch (e) { console.log('⚠️  add_item failed:', e.message); }
        // 2. query
        try {
            const result = await codebolt.tools.executeTool('codebolt.vector', 'query', { query: 'test document vector', topK: 1 });
            console.log('✅ query:', result?.success, 'Results:', result?.results?.length || 0);
        } catch (e) { console.log('⚠️  query failed:', e.message); }
        // 3. get_vector
        try {
            const result = await codebolt.tools.executeTool('codebolt.vector', 'get_vector', { item: 'test-vector-001' });
            console.log('✅ get_vector:', result?.success, 'Vector:', result?.vector);
        } catch (e) { console.log('⚠️  get_vector failed:', e.message); }
        console.log('🎉 VectorDB MCP tools tests completed!');
    } catch (e) {
        console.error('❌ VectorDB MCP tools test error:', e.message);
    }
}

testVectorDbMCPTools(); 