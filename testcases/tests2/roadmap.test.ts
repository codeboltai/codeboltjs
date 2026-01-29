/**
 * Test Suite for Roadmap Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Roadmap Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Roadmap module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Roadmap module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get roadmap', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.roadmap.getRoadmap();

        expect(response).toBeDefined();

        // AskUserQuestion: Verify roadmap retrieval
        console.log('✅ AskUserQuestion: Was the roadmap retrieved successfully?');
        console.log('   Phases:', response.roadmap?.phases?.length || 0);
    });

    test('should get phases', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.roadmap.getPhases();

        expect(response).toBeDefined();
        expect(Array.isArray(response.phases)).toBe(true);

        // AskUserQuestion: Verify phases retrieval
        console.log('✅ AskUserQuestion: Were phases retrieved successfully?');
        console.log('   Total Phases:', response.phases?.length || 0);
    });

    test('should create phase', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.roadmap.createPhase({
            name: 'Test Phase',
            description: 'Test phase description',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        expect(response).toBeDefined();
        expect(response.phase).toBeDefined();

        // AskUserQuestion: Verify phase creation
        console.log('✅ AskUserQuestion: Was the phase created successfully?');
        console.log('   Phase ID:', response.phase?.id);
    });

    test('should create feature', async () => {
        const codebolt = sharedCodebolt();

        // First create a phase
        const phaseResponse = await codebolt.roadmap.createPhase({
            name: `Test Phase for Feature ${Date.now()}`,
            startDate: new Date().toISOString()
        });
        const phaseId = phaseResponse.phase?.id || '';

        // Create a feature
        const response = await codebolt.roadmap.createFeature({
            phaseId,
            name: 'Test Feature',
            description: 'Test feature description',
            status: 'backlog'
        });

        expect(response).toBeDefined();
        expect(response.feature).toBeDefined();

        // AskUserQuestion: Verify feature creation
        console.log('✅ AskUserQuestion: Was the feature created successfully?');
        console.log('   Feature ID:', response.feature?.id);
    });

    test('should create idea', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.roadmap.createIdea({
            title: 'Test Idea',
            description: 'Test idea description',
            priority: 'medium',
            tags: ['enhancement', 'feature']
        });

        expect(response).toBeDefined();
        expect(response.idea).toBeDefined();

        // AskUserQuestion: Verify idea creation
        console.log('✅ AskUserQuestion: Was the idea created successfully?');
        console.log('   Idea ID:', response.idea?.id);
    });
});
