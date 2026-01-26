/**
 * Test Suite for RequirementPlan Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('RequirementPlan Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for RequirementPlan module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All RequirementPlan module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create requirement plan', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.requirementPlan.create({
            fileName: `test-requirement-plan-${Date.now()}.md`
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify requirement plan creation
        console.log('✅ AskUserQuestion: Was the requirement plan created successfully?');
        console.log('   File Path:', response.filePath);
    });

    test('should get requirement plan', async () => {
        const codebolt = sharedCodebolt();

        // First create a plan
        const createResponse = await codebolt.requirementPlan.create({
            fileName: `test-get-plan-${Date.now()}.md`
        });
        const filePath = createResponse.filePath || '';

        // Get the plan
        const response = await codebolt.requirementPlan.get(filePath);

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify requirement plan retrieval
        console.log('✅ AskUserQuestion: Was the requirement plan retrieved successfully?');
        console.log('   Title:', response.data?.title);
    });

    test('should list requirement plans', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.requirementPlan.list();

        expect(response).toBeDefined();
        expect(Array.isArray(response.plans)).toBe(true);

        // AskUserQuestion: Verify requirement plans listing
        console.log('✅ AskUserQuestion: Were requirement plans listed successfully?');
        console.log('   Total Plans:', response.plans?.length || 0);
    });

    test('should add section to requirement plan', async () => {
        const codebolt = sharedCodebolt();

        // First create a plan
        const createResponse = await codebolt.requirementPlan.create({
            fileName: `test-add-section-${Date.now()}.md`
        });
        const filePath = createResponse.filePath || '';

        // Add a section
        const response = await codebolt.requirementPlan.addSection(filePath, {
            type: 'markdown',
            title: 'Test Section',
            content: 'Test section content'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify section addition
        console.log('✅ AskUserQuestion: Was the section added successfully?');
        console.log('   Success:', response.success);
    });
});
