/**
 * Test Suite for KVStore Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('KVStore Module', () => {
    beforeAll(async () => {
        console.log('[KVStore] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[KVStore] Connection ready');
    });

    describe('KVStore Module', () => {
        test('should create KV store instance', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.kvStore.createInstance(
                'test-kv-store',
                'Test KV store for comprehensive testing'
            );

            expect(response).toBeDefined();
            expect(response.instance).toBeDefined();

            // AskUserQuestion: Verify KV store creation
            console.log('✅ AskUserQuestion: Was the KV store instance created successfully?');
            console.log('   Instance ID:', response.instance?.id);
        });

        test('should list KV store instances', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.kvStore.listInstances();

            expect(response).toBeDefined();
            expect(Array.isArray(response.instances)).toBe(true);

            // AskUserQuestion: Verify KV store listing
            console.log('✅ AskUserQuestion: Were KV store instances listed successfully?');
            console.log('   Total Instances:', response.instances?.length || 0);
        });

        test('should set and get KV values', async () => {
            const codebolt = sharedCodebolt();

            // First create an instance
            const createResponse = await codebolt.kvStore.createInstance('test-kv-ops');
            const instanceId = createResponse.instance?.id || '';

            // Set a value
            const setResponse = await codebolt.kvStore.set(instanceId, 'testKey', 'testValue');
            expect(setResponse).toBeDefined();

            // Get the value
            const getResponse = await codebolt.kvStore.get(instanceId, 'testKey');
            expect(getResponse).toBeDefined();
            expect(getResponse.value).toBe('testValue');

            // AskUserQuestion: Verify KV operations
            console.log('✅ AskUserQuestion: Were KV set/get operations successful?');
            console.log('   Value Retrieved:', getResponse.value);
        });

        test('should query KV store', async () => {
            const codebolt = sharedCodebolt();

            // First create an instance and set some values
            const createResponse = await codebolt.kvStore.createInstance('test-kv-query');
            const instanceId = createResponse.instance?.id || '';

            await codebolt.kvStore.set(instanceId, 'key1', 'value1');
            await codebolt.kvStore.set(instanceId, 'key2', 'value2');

            // Query the store
            const response = await codebolt.kvStore.query(instanceId, {
                limit: 10
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.results)).toBe(true);

            // AskUserQuestion: Verify KV query
            console.log('✅ AskUserQuestion: Was the KV store query successful?');
            console.log('   Results:', response.results?.length || 0);
        });
    });
});
