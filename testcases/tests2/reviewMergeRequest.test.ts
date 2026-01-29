/**
 * Test Suite for ReviewMergeRequest Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('ReviewMergeRequest Module', () => {
    beforeAll(async () => {
        console.log('[ReviewMergeRequest] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[ReviewMergeRequest] Connection ready');
    });

    describe('ReviewMergeRequest Module', () => {
        test('should create review merge request', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.reviewMergeRequest.create({
                title: 'Test Merge Request',
                description: 'Test merge request for comprehensive testing',
                sourceBranch: 'feature/test',
                targetBranch: 'main',
                authorId: 'test-user-123'
            });

            expect(response).toBeDefined();
            expect(response.request).toBeDefined();

            // AskUserQuestion: Verify MR creation
            console.log('✅ AskUserQuestion: Was the review merge request created successfully?');
            console.log('   MR ID:', response.request?.id);
        });

        test('should list review merge requests', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.reviewMergeRequest.list({
                status: 'open'
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.requests)).toBe(true);

            // AskUserQuestion: Verify MR listing
            console.log('✅ AskUserQuestion: Were review merge requests listed successfully?');
            console.log('   Total Requests:', response.totalCount);
        });

        test('should add review feedback', async () => {
            const codebolt = sharedCodebolt();

            // First create an MR
            const createResponse = await codebolt.reviewMergeRequest.create({
                title: `Test MR for Feedback ${Date.now()}`,
                sourceBranch: 'feature/test',
                targetBranch: 'main',
                authorId: 'test-user-123'
            });
            const mrId = createResponse.request?.id || '';

            // Add feedback
            const response = await codebolt.reviewMergeRequest.addFeedback(mrId, {
                reviewerId: 'reviewer-123',
                feedback: 'Looks good, minor suggestions',
                approvalStatus: 'approved'
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // AskUserQuestion: Verify feedback addition
            console.log('✅ AskUserQuestion: Was the review feedback added successfully?');
            console.log('   Success:', response.success);
        });
    });
});
