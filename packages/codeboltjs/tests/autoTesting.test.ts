/**
 * Test Suite for AutoTesting Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('AutoTesting Module', () => {
    beforeAll(async () => {
        console.log('[AutoTesting] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[AutoTesting] Connection ready');
    });

    describe('AutoTesting Module', () => {
        test('should create test suite', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.autoTesting.createSuite({
                name: `Test Suite ${Date.now()}`,
                description: 'Test suite for comprehensive testing',
                projectPath: '/test/project'
            });

            expect(response).toBeDefined();
            expect(response.suite).toBeDefined();

            // AskUserQuestion: Verify test suite creation
            console.log('✅ AskUserQuestion: Was the test suite created successfully?');
            console.log('   Suite ID:', response.suite?.id);
        });

        test('should list test suites', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.autoTesting.listSuites();

            expect(response).toBeDefined();
            expect(Array.isArray(response.suites)).toBe(true);

            // AskUserQuestion: Verify test suite listing
            console.log('✅ AskUserQuestion: Were test suites listed successfully?');
            console.log('   Total Suites:', response.suites?.length || 0);
        });

        test('should create test case', async () => {
            const codebolt = sharedCodebolt();

            // First create a suite
            const suiteResponse = await codebolt.autoTesting.createSuite({
                name: `Suite for Case ${Date.now()}`,
                projectPath: '/test/project'
            });
            const suiteId = suiteResponse.suite?.id || '';

            // Create a test case
            const response = await codebolt.autoTesting.createCase({
                suiteId,
                name: 'Test Case',
                description: 'Test case description',
                steps: [
                    { action: 'navigate', params: { url: 'http://example.com' } },
                    { action: 'click', params: { selector: '#button' } }
                ]
            });

            expect(response).toBeDefined();
            expect(response.case).toBeDefined();

            // AskUserQuestion: Verify test case creation
            console.log('✅ AskUserQuestion: Was the test case created successfully?');
            console.log('   Case ID:', response.case?.id);
        });

        test('should create test run', async () => {
            const codebolt = sharedCodebolt();

            // First create a suite and case
            const suiteResponse = await codebolt.autoTesting.createSuite({
                name: `Suite for Run ${Date.now()}`,
                projectPath: '/test/project'
            });
            const suiteId = suiteResponse.suite?.id || '';

            // Create a test run
            const response = await codebolt.autoTesting.createRun({
                suiteId,
                environment: 'staging',
                parallel: true
            });

            expect(response).toBeDefined();
            expect(response.run).toBeDefined();

            // AskUserQuestion: Verify test run creation
            console.log('✅ AskUserQuestion: Was the test run created successfully?');
            console.log('   Run ID:', response.run?.id);
        });

        test('should update run status', async () => {
            const codebolt = sharedCodebolt();

            // First create a suite and run
            const suiteResponse = await codebolt.autoTesting.createSuite({
                name: `Suite for Status ${Date.now()}`,
                projectPath: '/test/project'
            });
            const suiteId = suiteResponse.suite?.id || '';

            const runResponse = await codebolt.autoTesting.createRun({ suiteId });
            const runId = runResponse.run?.id || '';

            // Update run status
            const response = await codebolt.autoTesting.updateRunStatus({
                runId,
                status: 'completed',
                result: 'passed'
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // AskUserQuestion: Verify status update
            console.log('✅ AskUserQuestion: Was the run status updated successfully?');
            console.log('   Success:', response.success);
        });
    });
});
