/**
 * Test Suite for Hook Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('Hook Module', () => {
    beforeAll(async () => {
        console.log('[Hook] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Hook] Connection ready');
    });

    describe('Hook Module', () => {
        test('should initialize hook manager', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.hook.initialize('/test/project/path');

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // AskUserQuestion: Verify hook initialization
            console.log('✅ AskUserQuestion: Was the hook manager initialized successfully?');
            console.log('   Success:', response.success);
        });

        test('should create hook', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.hook.create({
                name: 'test-hook',
                trigger: 'file_save',
                action: 'run_tests',
                config: {
                    filePattern: '**/*.js'
                }
            });

            expect(response).toBeDefined();
            expect(response.hook).toBeDefined();

            // AskUserQuestion: Verify hook creation
            console.log('✅ AskUserQuestion: Was the hook created successfully?');
            console.log('   Hook ID:', response.hook?.id);
        });

        test('should list hooks', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.hook.list();

            expect(response).toBeDefined();
            expect(Array.isArray(response.hooks)).toBe(true);

            // AskUserQuestion: Verify hook listing
            console.log('✅ AskUserQuestion: Were hooks listed successfully?');
            console.log('   Total Hooks:', response.hooks?.length || 0);
        });
    });
});
