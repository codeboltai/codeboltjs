const codebolt = require('@codebolt/codeboltjs');

async function testJsTreeParserMCPTools() {
    console.log('🌳 Testing JsTreeParser MCP Tools');
    console.log('=================================');
    await codebolt.waitForConnection();
    try {
        // 1. tree_parse_javascript
        try {
            const result = await codebolt.tools.executeTool('codebolt.jsTreeParser', 'tree_parse_javascript', { filePath: './src/index.js' });
            console.log('✅ tree_parse_javascript:', result?.success, 'Tree:', !!result?.tree || !!result?.data);
        } catch (e) { console.log('⚠️  tree_parse_javascript failed:', e.message); }
        console.log('🎉 JsTreeParser MCP tools tests completed!');
    } catch (e) {
        console.error('❌ JsTreeParser MCP tools test error:', e.message);
    }
}

testJsTreeParserMCPTools(); 