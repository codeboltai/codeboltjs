const codebolt = require('@codebolt/codeboltjs');

async function testBrowserMCPTools() {
    console.log('🌐 Testing Browser MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. navigate
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'navigate', { url: 'https://example.com' });
            console.log('✅ navigate:', result?.success, 'URL:', result?.currentUrl);
        } catch (e) { console.log('⚠️  navigate failed:', e.message); }
        // 2. click
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'click', { selector: 'body' });
            console.log('✅ click:', result?.success);
        } catch (e) { console.log('⚠️  click failed:', e.message); }
        // 3. type
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'type', { selector: 'input', text: 'test' });
            console.log('✅ type:', result?.success);
        } catch (e) { console.log('⚠️  type failed:', e.message); }
        // 4. screenshot
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'screenshot', { fullPage: true });
            console.log('✅ screenshot:', result?.success, 'Screenshot:', !!result?.screenshot);
        } catch (e) { console.log('⚠️  screenshot failed:', e.message); }
        // 5. get_content
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_content', {});
            console.log('✅ get_content:', result?.success, 'Content:', !!result?.content);
        } catch (e) { console.log('⚠️  get_content failed:', e.message); }
        // 6. scroll
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'scroll', { direction: 'down', amount: 100 });
            console.log('✅ scroll:', result?.success);
        } catch (e) { console.log('⚠️  scroll failed:', e.message); }
        // 7. new_page
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'new_page', {});
            console.log('✅ new_page:', result?.success);
        } catch (e) { console.log('⚠️  new_page failed:', e.message); }
        // 8. get_url
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_url', {});
            console.log('✅ get_url:', result?.success, 'URL:', result?.url);
        } catch (e) { console.log('⚠️  get_url failed:', e.message); }
        // 9. get_html
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_html', {});
            console.log('✅ get_html:', result?.success, 'HTML Length:', result?.html?.length);
        } catch (e) { console.log('⚠️  get_html failed:', e.message); }
        // 10. get_markdown
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_markdown', {});
            console.log('✅ get_markdown:', result?.success, 'Markdown Length:', result?.markdown?.length);
        } catch (e) { console.log('⚠️  get_markdown failed:', e.message); }
        // 11. extract_text
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'extract_text', {});
            console.log('✅ extract_text:', result?.success, 'Text Length:', result?.text?.length);
        } catch (e) { console.log('⚠️  extract_text failed:', e.message); }
        // 12. get_snapshot
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_snapshot', {});
            console.log('✅ get_snapshot:', result?.success);
        } catch (e) { console.log('⚠️  get_snapshot failed:', e.message); }
        // 13. get_info
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'get_info', {});
            console.log('✅ get_info:', result?.success, 'Info:', result?.info);
        } catch (e) { console.log('⚠️  get_info failed:', e.message); }
        // 14. search
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'search', { selector: 'input', query: 'test query' });
            console.log('✅ search:', result?.success);
        } catch (e) { console.log('⚠️  search failed:', e.message); }
        // 15. enter
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'enter', {});
            console.log('✅ enter:', result?.success);
        } catch (e) { console.log('⚠️  enter failed:', e.message); }
        // 16. close
        try {
            const result = await codebolt.tools.executeTool('codebolt.browser', 'close', {});
            console.log('✅ close:', result?.success);
        } catch (e) { console.log('⚠️  close failed:', e.message); }
        console.log('🎉 Browser MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Browser MCP tools test error:', e.message);
    }
}

testBrowserMCPTools(); 