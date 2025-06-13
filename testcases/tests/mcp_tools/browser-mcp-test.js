const codebolt = require('@codebolt/codeboltjs');

async function testBrowserMCPTools() {
    console.log('🌐 Testing Browser MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. browser_navigate
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_navigate', { url: 'https://example.com' });
            console.log('✅ browser_navigate:', result?.success, 'URL:', result?.currentUrl);
        } catch (e) { console.log('⚠️  browser_navigate failed:', e.message); }
        // 2. browser_click
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_click', { selector: 'body' });
            console.log('✅ browser_click:', result?.success);
        } catch (e) { console.log('⚠️  browser_click failed:', e.message); }
        // 3. browser_type
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_type', { selector: 'input', text: 'test' });
            console.log('✅ browser_type:', result?.success);
        } catch (e) { console.log('⚠️  browser_type failed:', e.message); }
        // 4. browser_screenshot
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_screenshot', { fullPage: true });
            console.log('✅ browser_screenshot:', result?.success, 'Screenshot:', !!result?.screenshot);
        } catch (e) { console.log('⚠️  browser_screenshot failed:', e.message); }
        // 5. browser_get_content
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_get_content', {});
            console.log('✅ browser_get_content:', result?.success, 'Content:', !!result?.content);
        } catch (e) { console.log('⚠️  browser_get_content failed:', e.message); }
        // 6. browser_scroll
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'browser_scroll', { direction: 'down', amount: 100 });
            console.log('✅ browser_scroll:', result?.success);
        } catch (e) { console.log('⚠️  browser_scroll failed:', e.message); }
        console.log('🎉 Browser MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Browser MCP tools test error:', e.message);
    }
}

testBrowserMCPTools(); 