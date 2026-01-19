/**
 * Test Suite for FileUpdateIntent Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('FileUpdateIntent Module', () => {
    beforeAll(async () => {
        console.log('[FileUpdateIntent] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[FileUpdateIntent] Connection ready');
    });

    describe('FileUpdateIntent Module', () => {
        test('should create file update intent', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.fileUpdateIntent.create(
                {
                    filePath: '/test/file.js',
                    intendedChanges: 'Add new function',
                    estimatedComplexity: 'low'
                },
                'test-agent-123',
                'Test Agent'
            );

            expect(response).toBeDefined();
            expect(response.intent).toBeDefined();

            // AskUserQuestion: Verify intent creation
            console.log('✅ AskUserQuestion: Was the file update intent created successfully?');
            console.log('   Intent ID:', response.intent?.id);
        });

        test('should list file update intents', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.fileUpdateIntent.list({
                status: 'active'
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response)).toBe(true);

            // AskUserQuestion: Verify intent listing
            console.log('✅ AskUserQuestion: Were file update intents listed successfully?');
            console.log('   Total Intents:', response.length);
        });

        test('should complete file update intent', async () => {
            const codebolt = sharedCodebolt();

            // First create an intent
            const createResponse = await codebolt.fileUpdateIntent.create(
                {
                    filePath: '/test/file-complete.js',
                    intendedChanges: 'Test changes'
                },
                'test-agent-123'
            );
            const intentId = createResponse.intent?.id || '';

            // Complete the intent
            const response = await codebolt.fileUpdateIntent.complete(intentId, 'test-agent-123');

            expect(response).toBeDefined();
            expect(response.status).toBe('completed');

            // AskUserQuestion: Verify intent completion
            console.log('✅ AskUserQuestion: Was the file update intent completed successfully?');
            console.log('   Status:', response.status);
        });
    });
});
