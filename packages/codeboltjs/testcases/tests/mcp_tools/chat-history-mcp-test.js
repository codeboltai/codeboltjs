const codebolt = require('@codebolt/codeboltjs');

async function testChatHistoryMCPTools() {
    console.log('💬 Testing Chat History MCP Tools');
    console.log('===================================');
    await codebolt.waitForConnection();
    try {
        // 1. chat_summarize_all
        try {
            const result = await codebolt.tools.executeTool('codebolt.chat', 'chat_summarize_all', {});
            console.log('✅ chat_summarize_all:', result?.success, 'Summary:', !!result?.data);
        } catch (e) { console.log('⚠️  chat_summarize_all failed:', e.message); }
        // 2. chat_summarize
        try {
            const sampleMessages = [
                { sender: 'user', text: 'Hello, how are you?' },
                { sender: 'assistant', text: 'I am fine, thank you! How can I help you today?' },
                { sender: 'user', text: 'Summarize our conversation.' }
            ];
            const result = await codebolt.tools.executeTool('codebolt.chat', 'chat_summarize', { messages: sampleMessages, depth: 1 });
            console.log('✅ chat_summarize:', result?.success, 'Summary:', !!result?.data);
        } catch (e) { console.log('⚠️  chat_summarize failed:', e.message); }
        console.log('🎉 Chat History MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Chat History MCP tools test error:', e.message);
    }
}

testChatHistoryMCPTools(); 