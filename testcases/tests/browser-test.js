const codebolt = require('@codebolt/codeboltjs');

async function testBrowserOperations() {
    console.log('🌐 Testing Browser Operations');
    console.log('=============================');
    
    try {

        await codebolt.waitForConnection();
        
        console.log('\n1. Testing new page creation...');
        const newPageResult = await codebolt.browser.newPage();
        console.log('✅ New page created:', newPageResult);
        
        console.log('\n2. Testing get current URL...');
        const urlResult = await codebolt.browser.getUrl();
        console.log('✅ Current URL:', urlResult);
        
        console.log('\n3. Testing navigation to a page...');
        const goToResult = await codebolt.browser.goToPage('https://example.com');
        console.log('✅ Navigated to page:', goToResult);
        
        // Wait a bit for the page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n4. Testing get URL after navigation...');
        const newUrlResult = await codebolt.browser.getUrl();
        console.log('✅ URL after navigation:', newUrlResult);
        
        console.log('\n5. Testing screenshot...');
        const screenshotResult = await codebolt.browser.screenshot();
        console.log('✅ Screenshot taken:', screenshotResult);
        
        console.log('\n6. Testing get HTML...');
        const htmlResult = await codebolt.browser.getHTML();
        console.log('✅ HTML retrieved:', {
            success: htmlResult.success,
            htmlLength: htmlResult.html ? htmlResult.html.length : 0
        });
        
        console.log('\n7. Testing get Markdown...');
        const markdownResult = await codebolt.browser.getMarkdown();
        console.log('✅ Markdown retrieved:', {
            success: markdownResult.success,
            markdownLength: markdownResult.markdown ? markdownResult.markdown.length : 0
        });
        
        console.log('\n8. Testing get content...');
        const contentResult = await codebolt.browser.getContent();
        console.log('✅ Content retrieved:', {
            success: contentResult.success,
            contentLength: contentResult.content ? contentResult.content.length : 0
        });
        
        console.log('\n9. Testing extract text...');
        const textResult = await codebolt.browser.extractText();
        console.log('✅ Text extracted:', {
            success: textResult.success,
            textLength: textResult.text ? textResult.text.length : 0
        });
        
        console.log('\n10. Testing get snapshot...');
        const snapshotResult = await codebolt.browser.getSnapShot();
        console.log('✅ Snapshot taken:', snapshotResult);
        
        console.log('\n11. Testing get browser info...');
        const browserInfoResult = await codebolt.browser.getBrowserInfo();
        console.log('✅ Browser info:', browserInfoResult);
        
        console.log('\n12. Testing scroll...');
        const scrollResult = await codebolt.browser.scroll('down', '100');
        console.log('✅ Scrolled:', scrollResult);
        
        // Note: Interactive tests like click and type require specific element IDs
        // which may not be available on example.com, so they are commented out
        
        // console.log('\n13. Testing click (requires element ID)...');
        // const clickResult = await codebolt.browser.click('some-element-id');
        // console.log('✅ Clicked:', clickResult);
        
        // console.log('\n14. Testing type (requires element ID)...');
        // const typeResult = await codebolt.browser.type('some-input-id', 'Test text');
        // console.log('✅ Typed:', typeResult);
        
        // console.log('\n15. Testing search (requires element ID)...');
        // const searchResult = await codebolt.browser.search('search-input-id', 'test query');
        // console.log('✅ Searched:', searchResult);
        
        
        // console.log('\n16. Testing enter key...');
        // const enterResult = await codebolt.browser.enter();
        // console.log('✅ Enter key pressed:', enterResult);
        
        console.log('\n16. Closing browser...');
        codebolt.browser.close();
        console.log('✅ Browser closed');
        
        console.log('\n🎉 All browser tests completed successfully!');
        console.log('Note: Some interactive tests (click, type, search) are commented out as they require specific element IDs');
        
    } catch (error) {
        console.error('❌ Browser test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testBrowserOperations().catch(console.error); 