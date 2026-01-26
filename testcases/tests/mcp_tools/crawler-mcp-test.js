const codebolt = require('@codebolt/codeboltjs');

async function testCrawlerMCPTools() {
    console.log('🕷️ Testing Crawler MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. crawler_crawl
        try {
            const result = await codebolt.tools.executeTool('codebolt.crawler', 'crawler_crawl', { url: 'https://example.com' });
            console.log('✅ crawler_crawl:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  crawler_crawl failed:', e.message); }
        console.log('🎉 Crawler MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Crawler MCP tools test error:', e.message);
    }
}

testCrawlerMCPTools(); 