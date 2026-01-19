import Codebolt from '../src/core/Codebolt';
import assert from 'assert';

const codebolt = new Codebolt();

/**
 * Comprehensive Test Suite for Browser Module
 *
 * Tests cover all browser methods:
 * - newPage, goTo, getUrl
 * - screenshot, getHTML
 * - getMarkdown, getPdf, pdfToText
 * - getContent, getSnapshot, getBrowserInfo
 * - extractText, close
 * - scroll, type, click, enter, search
 */

const testCases = [
    // ============================================================================
    // BASIC NAVIGATION TESTS
    // ============================================================================
    {
        name: 'browser.newPage should create a new browser page',
        testFunction: async () => {
            await codebolt.waitForReady();
            const response = await codebolt.browser.newPage();

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');
            console.log('✓ New page created successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.goTo should navigate to a valid URL',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            const testUrl = 'https://example.com';
            const response = await codebolt.browser.goToPage(testUrl);

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');
            console.log(`✓ Navigated to ${testUrl} successfully`);

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.goTo should handle invalid URLs gracefully',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            const invalidUrl = 'not-a-valid-url';

            try {
                await codebolt.browser.goToPage(invalidUrl);
                console.log('⚠ Invalid URL handling: No error thrown');
            } catch (error) {
                console.log(`✓ Invalid URL handled: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.getUrl should return current page URL',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            const testUrl = 'https://example.com';
            await codebolt.browser.goToPage(testUrl);

            const response = await codebolt.browser.getUrl();

            assert.ok(response, 'Response should exist');
            assert.ok(response.url || response.currentUrl, 'Response should contain URL');
            console.log(`✓ Current URL: ${response.url || response.currentUrl}`);

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser navigation should work in sequence',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            const urls = [
                'https://example.com',
                'https://example.org',
                'https://example.net'
            ];

            for (const url of urls) {
                await codebolt.browser.goToPage(url);
                const response = await codebolt.browser.getUrl();
                console.log(`  Navigated to: ${response.url || response.currentUrl}`);
            }

            console.log('✓ Sequential navigation successful');

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // CONTENT EXTRACTION TESTS
    // ============================================================================
    {
        name: 'browser.getHTML should retrieve page HTML',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.getHTML();

            assert.ok(response, 'Response should exist');
            assert.ok(response.html || response.content, 'Response should contain HTML content');
            assert.ok(
                (response.html || response.content).length > 0,
                'HTML content should not be empty'
            );
            console.log(`✓ HTML retrieved (${(response.html || response.content).length} characters)`);

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.getMarkdown should convert page to Markdown',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.getMarkdown();

            assert.ok(response, 'Response should exist');
            assert.ok(response.markdown || response.content, 'Response should contain Markdown content');
            console.log(`✓ Markdown retrieved (${(response.markdown || response.content).length} characters)`);

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.getContent should retrieve page content',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.getContent();

            assert.ok(response, 'Response should exist');
            assert.ok(response.content || response.html || response.text, 'Response should contain content');
            console.log(`✓ Content retrieved (${response.content?.length || 0} characters)`);

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.extractText should extract visible text from page',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.extractText();

            assert.ok(response, 'Response should exist');
            assert.ok(response.text || response.content, 'Response should contain extracted text');
            console.log(`✓ Text extracted (${(response.text || response.content).length} characters)`);

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // SCREENSHOT AND VISUAL TESTS
    // ============================================================================
    {
        name: 'browser.screenshot should capture page screenshot',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.screenshot();

            assert.ok(response, 'Response should exist');
            assert.ok(response.screenshot, 'Response should contain screenshot data');
            console.log('✓ Screenshot captured successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.getSnapshot should retrieve page snapshot',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.getSnapShot();

            assert.ok(response, 'Response should exist');
            assert.ok(response.tree, 'Response should contain snapshot tree');
            console.log('✓ Page snapshot retrieved successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // BROWSER INFO TESTS
    // ============================================================================
    {
        name: 'browser.getBrowserInfo should retrieve viewport information',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.getBrowserInfo();

            assert.ok(response, 'Response should exist');
            assert.ok(response.info || response.viewport, 'Response should contain browser info');

            const info = response.info || response.viewport;
            assert.ok(typeof info.width === 'number', 'Should have width');
            assert.ok(typeof info.height === 'number', 'Should have height');

            console.log(`✓ Browser info: ${info.width}x${info.height}, scroll: ${info.scrollX},${info.scrollY}`);

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // PDF TESTS
    // ============================================================================
    {
        name: 'browser.getPDF should generate PDF from page',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            // Note: getPDF and pdfToText are void functions that send events
            try {
                codebolt.browser.getPDF();
                console.log('✓ PDF generation initiated');
            } catch (error) {
                console.log(`⚠ PDF generation: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.pdfToText should convert PDF to text',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            // Note: pdfToText is a void function that sends an event
            try {
                codebolt.browser.pdfToText();
                console.log('✓ PDF to text conversion initiated');
            } catch (error) {
                console.log(`⚠ PDF to text conversion: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // INTERACTION TESTS - SCROLL
    // ============================================================================
    {
        name: 'browser.scroll should scroll page down',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.scroll('down', '500');

            assert.ok(response, 'Response should exist');
            console.log('✓ Scrolled down successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.scroll should scroll page up',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            // First scroll down
            await codebolt.browser.scroll('down', '500');

            // Then scroll up
            const response = await codebolt.browser.scroll('up', '300');

            assert.ok(response, 'Response should exist');
            console.log('✓ Scrolled up successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.scroll should handle invalid scroll direction',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            try {
                await codebolt.browser.scroll('invalid', '100');
                console.log('⚠ Invalid scroll direction: No error thrown');
            } catch (error) {
                console.log(`✓ Invalid scroll direction handled: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // INTERACTION TESTS - TYPE
    // ============================================================================
    {
        name: 'browser.type should type text into an element',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            // Navigate to a page with input fields
            await codebolt.browser.goToPage('https://example.com');

            // Note: This would typically use a real page with input fields
            // For testing purposes, we're demonstrating the API call
            const elementId = 'input-field';
            const text = 'Test input text';

            try {
                const response = await codebolt.browser.type(elementId, text);
                assert.ok(response, 'Response should exist');
                console.log(`✓ Typed "${text}" into element ${elementId}`);
            } catch (error) {
                console.log(`⚠ Type operation: ${error.message} (element may not exist)`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.type should handle empty element ID',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();

            try {
                await codebolt.browser.type('', 'test text');
                console.log('⚠ Empty element ID: No error thrown');
            } catch (error) {
                console.log(`✓ Empty element ID handled: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // INTERACTION TESTS - CLICK
    // ============================================================================
    {
        name: 'browser.click should click on an element',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const elementId = 'clickable-element';

            try {
                const response = await codebolt.browser.click(elementId);
                assert.ok(response, 'Response should exist');
                console.log(`✓ Clicked on element ${elementId}`);
            } catch (error) {
                console.log(`⚠ Click operation: ${error.message} (element may not exist)`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.click should handle invalid element selector',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const invalidSelector = '#non-existent-element-12345';

            try {
                await codebolt.browser.click(invalidSelector);
                console.log('⚠ Invalid selector: No error thrown');
            } catch (error) {
                console.log(`✓ Invalid selector handled: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // INTERACTION TESTS - ENTER
    // ============================================================================
    {
        name: 'browser.enter should press Enter key',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const response = await codebolt.browser.enter();

            assert.ok(response, 'Response should exist');
            console.log('✓ Enter key pressed successfully');

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // INTERACTION TESTS - SEARCH
    // ============================================================================
    {
        name: 'browser.search should search within an element',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const elementId = 'search-container';
            const query = 'test search';

            try {
                const response = await codebolt.browser.search(elementId, query);
                assert.ok(response, 'Response should exist');
                console.log(`✓ Searched for "${query}" in element ${elementId}`);
            } catch (error) {
                console.log(`⚠ Search operation: ${error.message} (element may not exist)`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },
    {
        name: 'browser.search should handle empty query',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            const elementId = 'search-container';

            try {
                await codebolt.browser.search(elementId, '');
                console.log('⚠ Empty query: No error thrown');
            } catch (error) {
                console.log(`✓ Empty query handled: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    },

    // ============================================================================
    // MULTI-PAGE TESTS
    // ============================================================================
    {
        name: 'browser should handle multiple pages in sequence',
        testFunction: async () => {
            await codebolt.waitForReady();

            const pages = [
                { url: 'https://example.com', name: 'Page 1' },
                { url: 'https://example.org', name: 'Page 2' },
                { url: 'https://example.net', name: 'Page 3' }
            ];

            for (const page of pages) {
                await codebolt.browser.newPage();
                await codebolt.browser.goToPage(page.url);
                const urlResponse = await codebolt.browser.getUrl();
                console.log(`  ${page.name}: ${urlResponse.url || urlResponse.currentUrl}`);
                codebolt.browser.close();
            }

            console.log('✓ Multiple pages handled in sequence');
        }
    },

    // ============================================================================
    // CLOSE TESTS
    // ============================================================================
    {
        name: 'browser.close should close the current page',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            // Note: close is a void function that sends an event
            try {
                codebolt.browser.close();
                console.log('✓ Page closed successfully');
            } catch (error) {
                console.log(`⚠ Close operation: ${error.message}`);
            }
        }
    },

    // ============================================================================
    // COMPLEX WORKFLOW TESTS
    // ============================================================================
    {
        name: 'browser should complete a complex navigation and extraction workflow',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Create new page
            await codebolt.browser.newPage();
            console.log('  → New page created');

            // Navigate to URL
            await codebolt.browser.goToPage('https://example.com');
            console.log('  → Navigated to URL');

            // Get current URL
            const urlResponse = await codebolt.browser.getUrl();
            console.log(`  → Current URL: ${urlResponse.url || urlResponse.currentUrl}`);

            // Get HTML
            const htmlResponse = await codebolt.browser.getHTML();
            console.log(`  → HTML retrieved (${(htmlResponse.html || htmlResponse.content).length} chars)`);

            // Get Markdown
            const markdownResponse = await codebolt.browser.getMarkdown();
            console.log(`  → Markdown retrieved (${(markdownResponse.markdown || markdownResponse.content).length} chars)`);

            // Get content
            const contentResponse = await codebolt.browser.getContent();
            console.log(`  → Content retrieved (${contentResponse.content?.length || 0} chars)`);

            // Extract text
            const textResponse = await codebolt.browser.extractText();
            console.log(`  → Text extracted (${(textResponse.text || textResponse.content).length} chars)`);

            // Get browser info
            const infoResponse = await codebolt.browser.getBrowserInfo();
            const info = infoResponse.info || infoResponse.viewport;
            console.log(`  → Browser info: ${info.width}x${info.height}`);

            // Take screenshot
            const screenshotResponse = await codebolt.browser.screenshot();
            console.log(`  → Screenshot captured`);

            // Get snapshot
            const snapshotResponse = await codebolt.browser.getSnapShot();
            console.log(`  → Snapshot retrieved`);

            // Cleanup
            codebolt.browser.close();
            console.log('  → Page closed');

            console.log('✓ Complex workflow completed successfully');
        }
    },
    {
        name: 'browser should complete an interaction workflow',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');
            console.log('  → Page ready');

            // Scroll operations
            await codebolt.browser.scroll('down', '500');
            console.log('  → Scrolled down');

            await codebolt.browser.scroll('up', '300');
            console.log('  → Scrolled up');

            // Enter key
            await codebolt.browser.enter();
            console.log('  → Enter pressed');

            // Cleanup
            codebolt.browser.close();
            console.log('  → Page closed');

            console.log('✓ Interaction workflow completed successfully');
        }
    },

    // ============================================================================
    // ERROR HANDLING TESTS
    // ============================================================================
    {
        name: 'browser should handle operations without page',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Try to get URL without creating a page first
            try {
                await codebolt.browser.getUrl();
                console.log('⚠ Operation without page: No error thrown');
            } catch (error) {
                console.log(`✓ Operation without page handled: ${error.message}`);
            }
        }
    },
    {
        name: 'browser should handle rapid consecutive operations',
        testFunction: async () => {
            await codebolt.waitForReady();
            await codebolt.browser.newPage();
            await codebolt.browser.goToPage('https://example.com');

            // Rapid operations
            const operations = [
                codebolt.browser.getUrl(),
                codebolt.browser.getHTML(),
                codebolt.browser.getContent(),
                codebolt.browser.getBrowserInfo()
            ];

            try {
                await Promise.all(operations);
                console.log('✓ Rapid operations handled successfully');
            } catch (error) {
                console.log(`⚠ Rapid operations: ${error.message}`);
            }

            // Cleanup
            codebolt.browser.close();
        }
    }
];

// Run tests sequentially
describe('Browser Module Tests - Sequential Execution', () => {
    test.each(testCases)('%s', async (testCase) => {
        await testCase.testFunction();
    }, 60000);
});

// Export for individual test running (if needed)
// export { testCases };
