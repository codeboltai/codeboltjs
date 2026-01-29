/**
 * Test Suite for GroupFeedback Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('GroupFeedback Module', () => {
    beforeAll(async () => {
        console.log('[GroupFeedback] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[GroupFeedback] Connection ready');
    });

    describe('GroupFeedback Module', () => {
        test('should create feedback', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.groupFeedback.create({
                title: 'Test Group Feedback',
                description: 'Test feedback for comprehensive testing',
                participants: ['agent-1', 'agent-2'],
                createdBy: 'test-agent-123'
            });

            expect(response).toBeDefined();
            expect(response.feedback).toBeDefined();

            // AskUserQuestion: Verify feedback creation
            console.log('✅ AskUserQuestion: Was the group feedback created successfully?');
            console.log('   Feedback ID:', response.feedback?.id);
        });

        test('should list feedback', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.groupFeedback.list({
                status: 'open'
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.feedbacks)).toBe(true);

            // AskUserQuestion: Verify feedback listing
            console.log('✅ AskUserQuestion: Was group feedback listed successfully?');
            console.log('   Total Feedbacks:', response.feedbacks?.length || 0);
        });

        test('should respond to feedback', async () => {
            const codebolt = sharedCodebolt();

            // First create feedback
            const createResponse = await codebolt.groupFeedback.create({
                title: `Test Feedback for Respond ${Date.now()}`,
                participants: ['agent-1'],
                createdBy: 'test-agent-123'
            });
            const feedbackId = createResponse.feedback?.id || '';

            // Respond to feedback
            const response = await codebolt.groupFeedback.respond({
                feedbackId,
                responderId: 'agent-1',
                response: 'This looks good to me'
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // AskUserQuestion: Verify feedback response
            console.log('✅ AskUserQuestion: Was the feedback response recorded successfully?');
            console.log('   Success:', response.success);
        });
    });
});
