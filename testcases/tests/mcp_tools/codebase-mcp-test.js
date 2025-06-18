const codebolt = require('@codebolt/codeboltjs');

async function testCodebaseMCPTools() {
    console.log('🔍 Testing Codebase MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. Test codebase_search
        try {
            const result = await codebolt.tools.executeTool('codebolt.codebase', 'codebase_search', {
                query: 'function testCodebaseMCPTools'
            });
            console.log('✅ codebase_search:', result, 'Results:', result?.results?.length || 0);
        } catch (e) {
            console.log('⚠️  codebase_search failed:', e.message);
        }

        // // 2. Test search_mcp_tool
        try {
            const result = await codebolt.tools.executeTool('codebolt.codebase', 'search_mcp_tool', {
                query: 'test'
            });
            console.log('✅ search_mcp_tool:', result, 'Results:', result?.results?.length || 0);
        } catch (e) {
            console.log('⚠️  search_mcp_tool failed:', e.message);
        }

        // // Test codebase_search with empty query (should fail)
        // try {
        //     const result = await codebolt.tools.executeTool('codebolt.codebase', 'codebase_search', {
        //         query: '',
        //         target_directories: ['./testcases/tests']
        //     });
        //     console.log('❌ codebase_search with empty query should fail but succeeded');
        // } catch (e) {
        //     console.log('✅ codebase_search correctly failed with empty query:', e.message);
        // }

        // // Test search_mcp_tool with empty query (should fail)
        // try {
        //     const result = await codebolt.tools.executeTool('codebolt.codebase', 'search_mcp_tool', {
        //         query: '',
        //         tags: []
        //     });
        //     console.log('❌ search_mcp_tool with empty query should fail but succeeded');
        // } catch (e) {
        //     console.log('✅ search_mcp_tool correctly failed with empty query:', e.message);
        // }

        console.log('🎉 Codebase MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Codebase MCP tools test error:', e.message);
    }
}

testCodebaseMCPTools(); 