/**
 * Test Suite for ActionPlan Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('ActionPlan Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for ActionPlan module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All ActionPlan module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get all action plans', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.actionPlan.getAllPlans();

        expect(response).toBeDefined();
        expect(Array.isArray(response.plans)).toBe(true);

        // AskUserQuestion: Verify action plans listing
        console.log('✅ AskUserQuestion: Were action plans retrieved successfully?');
        console.log('   Total Plans:', response.plans?.length || 0);
    });

    test('should create action plan', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.actionPlan.createActionPlan({
            name: 'Test Action Plan',
            description: 'Test action plan for comprehensive testing',
            agentId: 'test-agent-123',
            agentName: 'Test Agent',
            status: 'active'
        });

        expect(response).toBeDefined();
        expect(response.plan).toBeDefined();

        // AskUserQuestion: Verify action plan creation
        console.log('✅ AskUserQuestion: Was the action plan created successfully?');
        console.log('   Plan ID:', response.plan?.id);
        console.log('   Plan Name:', response.plan?.name);
    });

    test('should get action plan detail', async () => {
        const codebolt = sharedCodebolt();

        // First create a plan
        const createResponse = await codebolt.actionPlan.createActionPlan({
            name: `Test Plan for Detail ${Date.now()}`,
            status: 'active'
        });
        const planId = createResponse.plan?.id || '';

        // Get plan detail
        const response = await codebolt.actionPlan.getPlanDetail(planId);

        expect(response).toBeDefined();
        expect(response.plan).toBeDefined();

        // AskUserQuestion: Verify plan detail retrieval
        console.log('✅ AskUserQuestion: Was the action plan detail retrieved successfully?');
        console.log('   Plan ID:', response.plan?.id);
    });

    test('should add task to action plan', async () => {
        const codebolt = sharedCodebolt();

        // First create a plan
        const createResponse = await codebolt.actionPlan.createActionPlan({
            name: `Test Plan for Task ${Date.now()}`,
            status: 'active'
        });
        const planId = createResponse.plan?.id || '';

        // Add task to plan
        const response = await codebolt.actionPlan.addTaskToActionPlan(planId, {
            name: 'Test Task',
            description: 'Test task description',
            priority: 'high',
            taskType: 'development'
        });

        expect(response).toBeDefined();
        expect(response.task).toBeDefined();

        // AskUserQuestion: Verify task addition
        console.log('✅ AskUserQuestion: Was the task added to the action plan successfully?');
        console.log('   Task ID:', response.task?.id);
    });
});
