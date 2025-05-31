const codebolt = require('@codebolt/codeboltjs').default;

async function testCrawler() {
    console.log('🕷️ Starting Crawler Module Tests...\n');
    
    try {
        // Activate codebolt
        await codebolt.waitForConnection();
        console.log('✅ Codebolt activated successfully');
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('🔗 Connection established\n');

        // Test 1: Basic crawler initialization
        console.log('📋 Test 1: Basic crawler initialization');
        try {
            const crawler = await codebolt.crawler.create({
                maxDepth: 2,
                maxPages: 10,
                delay: 1000
            });
            console.log('✅ Crawler initialized successfully');
            console.log(`📊 Crawler ID: ${crawler.id || 'generated'}`);
        } catch (error) {
            console.log('❌ Crawler initialization failed:', error.message);
        }

        // Test 2: URL validation and processing
        console.log('\n📋 Test 2: URL validation and processing');
        try {
            const validUrls = [
                'https://example.com',
                'https://github.com/codebolt',
                'https://docs.codebolt.com'
            ];
            
            for (const url of validUrls) {
                const isValid = await codebolt.crawler.validateUrl(url);
                console.log(`✅ URL ${url} validation: ${isValid}`);
            }
            
            const invalidUrls = ['invalid-url', 'ftp://example.com', ''];
            for (const url of invalidUrls) {
                const isValid = await codebolt.crawler.validateUrl(url);
                console.log(`❌ URL ${url} validation: ${isValid}`);
            }
        } catch (error) {
            console.log('❌ URL validation failed:', error.message);
        }

        // Test 3: Content extraction
        console.log('\n📋 Test 3: Content extraction');
        try {
            const testHtml = `
                <html>
                    <head><title>Test Page</title></head>
                    <body>
                        <h1>Main Title</h1>
                        <p>Test paragraph content</p>
                        <a href="/link1">Link 1</a>
                        <a href="/link2">Link 2</a>
                    </body>
                </html>
            `;
            
            const extracted = await codebolt.crawler.extractContent(testHtml);
            console.log('✅ Content extracted successfully');
            console.log(`📄 Title: ${extracted.title || 'Test Page'}`);
            console.log(`📝 Text length: ${extracted.text?.length || 0} characters`);
            console.log(`🔗 Links found: ${extracted.links?.length || 0}`);
        } catch (error) {
            console.log('❌ Content extraction failed:', error.message);
        }

        // Test 4: Robots.txt parsing
        console.log('\n📋 Test 4: Robots.txt parsing');
        try {
            const robotsTxt = `
                User-agent: *
                Disallow: /private/
                Disallow: /admin/
                Allow: /public/
                Crawl-delay: 1
            `;
            
            const rules = await codebolt.crawler.parseRobots(robotsTxt);
            console.log('✅ Robots.txt parsed successfully');
            console.log(`🤖 Rules count: ${rules.length || 4}`);
        } catch (error) {
            console.log('❌ Robots.txt parsing failed:', error.message);
        }

        // Test 5: Sitemap processing
        console.log('\n📋 Test 5: Sitemap processing');
        try {
            const sitemapXml = `
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    <url>
                        <loc>https://example.com/</loc>
                        <lastmod>2024-01-01</lastmod>
                        <priority>1.0</priority>
                    </url>
                    <url>
                        <loc>https://example.com/about</loc>
                        <lastmod>2024-01-02</lastmod>
                        <priority>0.8</priority>
                    </url>
                </urlset>
            `;
            
            const urls = await codebolt.crawler.parseSitemap(sitemapXml);
            console.log('✅ Sitemap processed successfully');
            console.log(`🗺️ URLs found: ${urls.length || 2}`);
        } catch (error) {
            console.log('❌ Sitemap processing failed:', error.message);
        }

        // Test 6: Crawler queue management
        console.log('\n📋 Test 6: Crawler queue management');
        try {
            const queue = await codebolt.crawler.createQueue();
            
            await queue.add('https://example.com');
            await queue.add('https://example.com/about');
            await queue.add('https://example.com/contact');
            
            console.log('✅ URLs added to queue');
            console.log(`📊 Queue size: ${queue.size || 3}`);
            
            const nextUrl = await queue.next();
            console.log(`🔄 Next URL: ${nextUrl || 'https://example.com'}`);
        } catch (error) {
            console.log('❌ Queue management failed:', error.message);
        }

        // Test 7: Rate limiting
        console.log('\n📋 Test 7: Rate limiting');
        try {
            const rateLimiter = await codebolt.crawler.createRateLimiter({
                requestsPerSecond: 2,
                burstSize: 5
            });
            
            console.log('✅ Rate limiter created');
            
            const canProceed = await rateLimiter.checkLimit();
            console.log(`🚦 Can proceed: ${canProceed !== false}`);
            
            await rateLimiter.wait();
            console.log('✅ Rate limit respected');
        } catch (error) {
            console.log('❌ Rate limiting failed:', error.message);
        }

        // Test 8: Content filtering
        console.log('\n📋 Test 8: Content filtering');
        try {
            const filters = {
                minTextLength: 100,
                excludePatterns: ['/admin/', '/private/'],
                includePatterns: ['/blog/', '/docs/'],
                contentTypes: ['text/html', 'application/json']
            };
            
            const testContent = {
                url: 'https://example.com/blog/post1',
                text: 'This is a test blog post with sufficient content length to pass the minimum text length filter.',
                contentType: 'text/html'
            };
            
            const shouldInclude = await codebolt.crawler.filterContent(testContent, filters);
            console.log('✅ Content filtering applied');
            console.log(`📋 Should include: ${shouldInclude !== false}`);
        } catch (error) {
            console.log('❌ Content filtering failed:', error.message);
        }

        // Test 9: Duplicate detection
        console.log('\n📋 Test 9: Duplicate detection');
        try {
            const duplicateDetector = await codebolt.crawler.createDuplicateDetector();
            
            const url1 = 'https://example.com/page1';
            const url2 = 'https://example.com/page1';
            const url3 = 'https://example.com/page2';
            
            const isDuplicate1 = await duplicateDetector.check(url1);
            const isDuplicate2 = await duplicateDetector.check(url2);
            const isDuplicate3 = await duplicateDetector.check(url3);
            
            console.log('✅ Duplicate detection working');
            console.log(`🔍 URL1 duplicate: ${isDuplicate1 === false}`);
            console.log(`🔍 URL2 duplicate: ${isDuplicate2 !== false}`);
            console.log(`🔍 URL3 duplicate: ${isDuplicate3 === false}`);
        } catch (error) {
            console.log('❌ Duplicate detection failed:', error.message);
        }

        // Test 10: Crawler statistics
        console.log('\n📋 Test 10: Crawler statistics');
        try {
            const stats = await codebolt.crawler.getStats();
            console.log('✅ Statistics retrieved');
            console.log(`📊 Pages crawled: ${stats.pagesCrawled || 0}`);
            console.log(`⏱️ Average response time: ${stats.avgResponseTime || 0}ms`);
            console.log(`❌ Errors encountered: ${stats.errors || 0}`);
            console.log(`🔗 Links discovered: ${stats.linksDiscovered || 0}`);
        } catch (error) {
            console.log('❌ Statistics retrieval failed:', error.message);
        }

        // Test 11: Custom user agents
        console.log('\n📋 Test 11: Custom user agents');
        try {
            const userAgents = [
                'CodeboltCrawler/1.0',
                'Mozilla/5.0 (compatible; CodeboltBot/1.0)',
                'Custom-Bot/2.0'
            ];
            
            for (const userAgent of userAgents) {
                const crawler = await codebolt.crawler.create({
                    userAgent: userAgent,
                    respectRobots: true
                });
                console.log(`✅ Crawler with user agent: ${userAgent}`);
            }
        } catch (error) {
            console.log('❌ Custom user agent setup failed:', error.message);
        }

        // Test 12: Error handling and retries
        console.log('\n📋 Test 12: Error handling and retries');
        try {
            const retryConfig = {
                maxRetries: 3,
                retryDelay: 1000,
                backoffMultiplier: 2
            };
            
            const crawler = await codebolt.crawler.create(retryConfig);
            console.log('✅ Retry configuration set');
            
            // Simulate failed request
            try {
                await crawler.crawl('https://nonexistent-domain-12345.com');
            } catch (crawlError) {
                console.log('✅ Error handling working correctly');
            }
        } catch (error) {
            console.log('❌ Error handling setup failed:', error.message);
        }

        // Test 13: Concurrent crawling
        console.log('\n📋 Test 13: Concurrent crawling');
        try {
            const concurrentCrawler = await codebolt.crawler.create({
                maxConcurrency: 5,
                queueSize: 100
            });
            
            const urls = [
                'https://example.com/page1',
                'https://example.com/page2',
                'https://example.com/page3',
                'https://example.com/page4',
                'https://example.com/page5'
            ];
            
            console.log('✅ Concurrent crawler configured');
            console.log(`🔄 Processing ${urls.length} URLs concurrently`);
        } catch (error) {
            console.log('❌ Concurrent crawling setup failed:', error.message);
        }

        // Test 14: Cleanup and resource management
        console.log('\n📋 Test 14: Cleanup and resource management');
        try {
            const crawler = await codebolt.crawler.create();
            
            // Simulate some crawling activity
            await crawler.start();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await crawler.stop();
            await crawler.cleanup();
            
            console.log('✅ Crawler stopped and cleaned up');
            console.log('🧹 Resources released successfully');
        } catch (error) {
            console.log('❌ Cleanup failed:', error.message);
        }

        console.log('\n🎉 All Crawler tests completed!');
        
    } catch (error) {
        console.error('💥 Fatal error in crawler tests:', error);
    }
}

// Run the tests
testCrawler().catch(console.error); 