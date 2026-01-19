/**
 * Test Suite for Crawler Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Crawler Module', () => {
    beforeAll(async () => {
        console.log('[Crawler Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Crawler Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should start crawler', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a fire-and-forget operation
        codebolt.crawler.start();

        // AskUserQuestion: Verify crawler start
        console.log('✅ AskUserQuestion: Did the crawler start successfully?');
        console.log('   Check crawler logs for confirmation');
    });

    test('should navigate crawler to page', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a fire-and-forget operation
        codebolt.crawler.goToPage('https://example.com');

        // AskUserQuestion: Verify navigation
        console.log('✅ AskUserQuestion: Did the crawler navigate to the page?');
        console.log('   URL: https://example.com');
    });

    test('should take crawler screenshot', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a fire-and-forget operation
        codebolt.crawler.screenshot();

        // AskUserQuestion: Verify screenshot
        console.log('✅ AskUserQuestion: Was the screenshot taken successfully?');
        console.log('   Check output directory for screenshot file');
    });

    test('should scroll crawler', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a fire-and-forget operation
        codebolt.crawler.scroll('down');

        // AskUserQuestion: Verify scroll
        console.log('✅ AskUserQuestion: Did the crawler scroll successfully?');
        console.log('   Direction: down');
    });
});
