const codebolt = require('@codebolt/codeboltjs');

async function testTokenizerMCPTools() {
    console.log('🔤 Testing Tokenizer MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. tokenizer_encode
        try {
            const result = await codebolt.tools.executeTool('codebolt.tokenizer', 'tokenizer_encode', { text: 'Hello MCP' });
            console.log('✅ tokenizer_encode:', result?.success, 'Tokens:', result?.tokens || result?.data);
        } catch (e) { console.log('⚠️  tokenizer_encode failed:', e.message); }
        // 2. tokenizer_decode
        try {
            const result = await codebolt.tools.executeTool('codebolt.tokenizer', 'tokenizer_decode', { tokens: [1,2,3] });
            console.log('✅ tokenizer_decode:', result?.success, 'Text:', result?.text || result?.data);
        } catch (e) { console.log('⚠️  tokenizer_decode failed:', e.message); }
        console.log('🎉 Tokenizer MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Tokenizer MCP tools test error:', e.message);
    }
}

testTokenizerMCPTools(); 