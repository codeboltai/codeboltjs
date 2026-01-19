/**
 * Test Suite for State Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('State Module', () => {
    beforeAll(async () => {
        console.log('[State Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[State Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get application state', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.state.getApplicationState();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify application state
        console.log('✅ AskUserQuestion: Was the application state retrieved successfully?');
        console.log('   State Keys:', Object.keys(response).length);
    });

    test('should add to agent state', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.state.addToAgentState('testKey', 'testValue');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify agent state update
        console.log('✅ AskUserQuestion: Was the agent state updated successfully?');
        console.log('   Success:', response.success);
    });

    test('should get agent state', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.state.getAgentState();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify agent state retrieval
        console.log('✅ AskUserQuestion: Was the agent state retrieved successfully?');
        console.log('   State Keys:', Object.keys(response.state || {}).length);
    });

    test('should get project state', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.state.getProjectState();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify project state
        console.log('✅ AskUserQuestion: Was the project state retrieved successfully?');
        console.log('   State Keys:', Object.keys(response.state || {}).length);
    });

    test('should update project state', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.state.updateProjectState('testKey', 'testValue');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify project state update
        console.log('✅ AskUserQuestion: Was the project state updated successfully?');
        console.log('   Success:', response.success);
    });
});
