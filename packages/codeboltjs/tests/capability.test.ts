/**
 * Test Suite for Capability Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Capability Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Capability module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Capability module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should list all capabilities', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.capability.listCapabilities();

        expect(response).toBeDefined();
        expect(Array.isArray(response.capabilities)).toBe(true);

        // AskUserQuestion: Verify capabilities listing
        console.log('✅ AskUserQuestion: Were capabilities listed successfully?');
        console.log('   Total Capabilities:', response.capabilities?.length || 0);
    });

    test('should list capabilities by type', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.capability.listCapabilitiesByType('skill');

        expect(response).toBeDefined();
        expect(Array.isArray(response.capabilities)).toBe(true);

        // AskUserQuestion: Verify capabilities by type
        console.log('✅ AskUserQuestion: Were skills listed successfully?');
        console.log('   Total Skills:', response.capabilities?.length || 0);
    });

    test('should list skills', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.capability.listSkills();

        expect(response).toBeDefined();
        expect(Array.isArray(response.capabilities)).toBe(true);

        // AskUserQuestion: Verify skills listing
        console.log('✅ AskUserQuestion: Were skills listed successfully?');
        console.log('   Total Skills:', response.capabilities?.length || 0);
    });

    test('should list powers', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.capability.listPowers();

        expect(response).toBeDefined();
        expect(Array.isArray(response.capabilities)).toBe(true);

        // AskUserQuestion: Verify powers listing
        console.log('✅ AskUserQuestion: Were powers listed successfully?');
        console.log('   Total Powers:', response.capabilities?.length || 0);
    });

    test('should get capability detail', async () => {
        const codebolt = sharedCodebolt();

        // First list capabilities to get an ID
        const listResponse = await codebolt.capability.listCapabilities();
        const capabilityId = listResponse.capabilities?.[0]?.id || 'test-capability-id';

        const response = await codebolt.capability.getCapabilityDetail(capabilityId);

        expect(response).toBeDefined();

        // AskUserQuestion: Verify capability detail
        console.log('✅ AskUserQuestion: Was the capability detail retrieved successfully?');
        console.log('   Capability:', response.capability?.name);
    });
});
