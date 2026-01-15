import codebolt from '@codebolt/codeboltjs';

export class TestRunner {
    static async runAllTests() {
        console.log('Starting All Tests...');
        await codebolt.chat.sendMessage('Starting All Tests...');

        // await this.testProjectStructure();
        // await this.testFileUpdateIntent();
        // await this.testUpdateRequest();
        // await this.testUpdateRequest();
        await this.testReviewMergeRequest();

        console.log('All Tests Completed.');
        await codebolt.chat.sendMessage('All Tests Completed.');
    }

    static async testProjectStructure() {
        console.log('\n--- Testing Project Structure Module ---');
        await codebolt.chat.sendMessage('--- Testing Project Structure Module ---');

        try {
            console.log('1. Testing getMetadata...');
            await codebolt.chat.sendMessage('1. Testing getMetadata...');
            const metadata = await codebolt.projectStructure.getMetadata();
            console.log('getMetadata Result:', JSON.stringify(metadata, null, 2));
            await codebolt.chat.sendMessage(`getMetadata Result: ${JSON.stringify(metadata, null, 2)}`);
        } catch (error) {
            console.error('getMetadata Failed:', error);
            await codebolt.chat.sendMessage(`getMetadata Failed: ${error}`);
        }

        try {
            console.log('\n2. Testing getPackages...');
            await codebolt.chat.sendMessage('2. Testing getPackages...');
            const packages = await codebolt.projectStructure.getPackages();
            console.log('getPackages Result:', JSON.stringify(packages, null, 2));
            await codebolt.chat.sendMessage(`getPackages Result: ${JSON.stringify(packages, null, 2)}`);
        } catch (error) {
            console.error('getPackages Failed:', error);
            await codebolt.chat.sendMessage(`getPackages Failed: ${error}`);
        }

        // Add more ProjectStructure tests here as needed
        // For example, createPackage, updatePackage, etc. 
        // Note: Creating packages might have side effects, so be careful.
    }

    static async testFileUpdateIntent() {
        console.log('\n--- Testing File Update Intent Module ---');
        await codebolt.chat.sendMessage('--- Testing File Update Intent Module ---');
        let createdIntentId: string | undefined;

        // 1. Create
        try {
            console.log('1. Testing create...');
            await codebolt.chat.sendMessage('1. Testing create...');
            const result = await codebolt.fileUpdateIntent.create({
                environmentId: 'local-default',
                files: [{
                    filePath: 'test_file.txt',
                    intentLevel: 2
                }],
                description: 'Test intent creation',
                priority: 1
            }, 'test-agent', 'Test Agent');
            console.log('create Result:', JSON.stringify(result, null, 2));
            await codebolt.chat.sendMessage(`create Result: ${JSON.stringify(result, null, 2)}`);
            if (result.intent) {
                createdIntentId = result.intent.id;
            }
        } catch (error) {
            console.error('create Failed:', error);
            await codebolt.chat.sendMessage(`create Failed: ${error}`);
        }

        // 2. List
        try {
            console.log('\n2. Testing list...');
            await codebolt.chat.sendMessage('2. Testing list...');
            const list = await codebolt.fileUpdateIntent.list();
            console.log('list Result:', JSON.stringify(list, null, 2));
            await codebolt.chat.sendMessage(`list Result: ${JSON.stringify(list, null, 2)}`);
        } catch (error) {
            console.error('list Failed:', error);
            await codebolt.chat.sendMessage(`list Failed: ${error}`);
        }

        if (createdIntentId) {
            // 3. Get
            try {
                console.log(`\n3. Testing get (ID: ${createdIntentId})...`);
                await codebolt.chat.sendMessage(`3. Testing get (ID: ${createdIntentId})...`);
                const intent = await codebolt.fileUpdateIntent.get(createdIntentId);
                console.log('get Result:', JSON.stringify(intent, null, 2));
                await codebolt.chat.sendMessage(`get Result: ${JSON.stringify(intent, null, 2)}`);
            } catch (error) {
                console.error('get Failed:', error);
                await codebolt.chat.sendMessage(`get Failed: ${error}`);
            }

            // 4. Update
            try {
                console.log(`\n4. Testing update (ID: ${createdIntentId})...`);
                await codebolt.chat.sendMessage(`4. Testing update (ID: ${createdIntentId})...`);
                const updated = await codebolt.fileUpdateIntent.update(createdIntentId, {
                    description: 'Updated test intent description'
                });
                console.log('update Result:', JSON.stringify(updated, null, 2));
                await codebolt.chat.sendMessage(`update Result: ${JSON.stringify(updated, null, 2)}`);
            } catch (error) {
                console.error('update Failed:', error);
                await codebolt.chat.sendMessage(`update Failed: ${error}`);
            }

            // 5. Complete
            try {
                console.log(`\n5. Testing complete (ID: ${createdIntentId})...`);
                await codebolt.chat.sendMessage(`5. Testing complete (ID: ${createdIntentId})...`);
                const completed = await codebolt.fileUpdateIntent.complete(createdIntentId, 'test-agent');
                console.log('complete Result:', JSON.stringify(completed, null, 2));
                await codebolt.chat.sendMessage(`complete Result: ${JSON.stringify(completed, null, 2)}`);
            } catch (error) {
                console.error('complete Failed:', error);
                await codebolt.chat.sendMessage(`complete Failed: ${error}`);
            }

            // 6. Delete (Cleanup)
            try {
                console.log(`\n6. Testing delete (ID: ${createdIntentId})...`);
                await codebolt.chat.sendMessage(`6. Testing delete (ID: ${createdIntentId})...`);
                const deleted = await codebolt.fileUpdateIntent.delete(createdIntentId);
                console.log('delete Result:', JSON.stringify(deleted, null, 2));
                await codebolt.chat.sendMessage(`delete Result: ${JSON.stringify(deleted, null, 2)}`);
            } catch (error) {
                console.error('delete Failed:', error);
                await codebolt.chat.sendMessage(`delete Failed: ${error}`);
            }
        } else {
            console.log('Skipping Get, Update, Complete, Delete tests because Create failed or returned no ID.');
            await codebolt.chat.sendMessage('Skipping Get, Update, Complete, Delete tests because Create failed or returned no ID.');
        }

        // 7. Check Overlap
        try {
            console.log('\n7. Testing checkOverlap...');
            await codebolt.chat.sendMessage('7. Testing checkOverlap...');
            const overlap = await codebolt.fileUpdateIntent.checkOverlap('local-default', ['test_file.txt'], 5);
            console.log('checkOverlap Result:', JSON.stringify(overlap, null, 2));
            await codebolt.chat.sendMessage(`checkOverlap Result: ${JSON.stringify(overlap, null, 2)}`);
        } catch (error) {
            console.error('checkOverlap Failed:', error);
            await codebolt.chat.sendMessage(`checkOverlap Failed: ${error}`);
        }

        // 8. Get Blocked Files
        try {
            console.log('\n8. Testing getBlockedFiles...');
            await codebolt.chat.sendMessage('8. Testing getBlockedFiles...');
            const blocked = await codebolt.fileUpdateIntent.getBlockedFiles('local-default');
            console.log('getBlockedFiles Result:', JSON.stringify(blocked, null, 2));
            await codebolt.chat.sendMessage(`getBlockedFiles Result: ${JSON.stringify(blocked, null, 2)}`);
        } catch (error) {
            console.error('getBlockedFiles Failed:', error);
            await codebolt.chat.sendMessage(`getBlockedFiles Failed: ${error}`);
        }

        // 9. Get By Agent
        try {
            console.log('\n9. Testing getByAgent...');
            await codebolt.chat.sendMessage('9. Testing getByAgent...');
            const byAgent = await codebolt.fileUpdateIntent.getByAgent('test-agent');
            console.log('getByAgent Result:', JSON.stringify(byAgent, null, 2));
            await codebolt.chat.sendMessage(`getByAgent Result: ${JSON.stringify(byAgent, null, 2)}`);
        } catch (error) {
            console.error('getByAgent Failed:', error);
            await codebolt.chat.sendMessage(`getByAgent Failed: ${error}`);
        }

        // 10. Get Files With Intents
        try {
            console.log('\n10. Testing getFilesWithIntents...');
            await codebolt.chat.sendMessage('10. Testing getFilesWithIntents...');
            const filesWithIntents = await codebolt.fileUpdateIntent.getFilesWithIntents('local-default');
            console.log('getFilesWithIntents Result:', JSON.stringify(filesWithIntents, null, 2));
            await codebolt.chat.sendMessage(`getFilesWithIntents Result: ${JSON.stringify(filesWithIntents, null, 2)}`);
        } catch (error) {
            console.error('getFilesWithIntents Failed:', error);
            await codebolt.chat.sendMessage(`getFilesWithIntents Failed: ${error}`);
            await codebolt.chat.sendMessage(`getFilesWithIntents Failed: ${error}`);
        }
    }

    static async testUpdateRequest() {
        console.log('\n--- Testing Project Structure Update Request Module ---');
        await codebolt.chat.sendMessage('--- Testing Project Structure Update Request Module ---');

        let createdRequestId: string | undefined;

        // 1. Create
        try {
            console.log('1. Testing create...');
            await codebolt.chat.sendMessage('1. Testing create...');
            // @ts-ignore
            const result = await codebolt.projectStructureUpdateRequest.create({
                title: 'Test Update Request',
                description: 'Created by Test Runner',
                author: 'Test Agent',
                authorType: 'agent',
                changes: [
                    {
                        packageId: 'test-package',
                        packageAction: 'create',
                        packageName: 'test-package',
                        packagePath: 'packages/test-package',
                        packageInfo: {
                            id: 'pkg-info-1',
                            action: 'create',
                            item: {
                                name: 'test-package',
                                description: 'A test package',
                                type: 'library'
                            }
                        }
                    }
                ]
            });
            console.log('create Result:', JSON.stringify(result, null, 2));
            await codebolt.chat.sendMessage(`create Result: ${JSON.stringify(result, null, 2)}`);
            if (result.success && result.data) {
                createdRequestId = result.data.id;
            }
        } catch (error) {
            console.error('create Failed:', error);
            await codebolt.chat.sendMessage(`create Failed: ${error}`);
        }
    }

    static async testReviewMergeRequest() {
        console.log('\n--- Testing Review Merge Request Module ---');
        await codebolt.chat.sendMessage('--- Testing Review Merge Request Module ---');

        let createdRequestId: string | undefined;
        const agentId = 'test-agent';
        const swarmId = 'test-swarm';

        // 1. Create
        try {
            console.log('1. Testing create...');
            await codebolt.chat.sendMessage('1. Testing create...');
            const result = await codebolt.reviewMergeRequest.create({
                type: 'review_merge',
                initialTask: 'Implement a new feature to allow users to archive projects.',
                taskDescription: "Users need a way to clean up their workspace without permanently deleting projects. This task involves adding an 'archive' status to projects and updating the dashboard to filter archived projects.",
                agentId: 'agent-dev-007',
                agentName: 'FeatureDevAgent',
                swarmId: 'swarm-project-management-v1',
                title: 'feat: Project Archival Functionality',
                description: "Implemented project archival functionality.\n\n- Added `archived` boolean to Project schema\n- Updated `ProjectList` component to filter out archived projects by default\n- Added Archive/Unarchive buttons to ProjectSettings\n- Added 'Archived Projects' view",
                majorFilesChanged: [
                    "src/types/project.ts",
                    "src/components/ProjectList.tsx",
                    "src/pages/ProjectSettings.tsx",
                    "src/api/projects.ts"
                ],
                diffPatch: "diff --git a/src/types/project.ts b/src/types/project.ts\nindex 83a2f..b29c1 100644\n--- a/src/types/project.ts\n+++ b/src/types/project.ts\n@@ -15,4 +15,5 @@\n   updatedAt: string;\n+  archived: boolean;\n }\n",
                changesFilePath: "/Users/ravirawat/.gemini/antigravity/brain/specs/job-123/changes.md",
                mergeConfig: {
                    strategy: "patch",
                    patchContent: "diff --git a/src/types/project.ts b/src/types/project.ts..."
                },
                issuesFaced: [
                    "Had trouble updating the cache after archival, resolved by invalidating React Query cache keys.",
                    "Migration script required for existing projects (defaulted to false)."
                ],
                remainingTasks: [
                    "Add confirmation dialog before archiving",
                    "Add toast notification on success"
                ]
            });
            console.log('create Result:', JSON.stringify(result, null, 2));
            await codebolt.chat.sendMessage(`create Result: ${JSON.stringify(result, null, 2)}`);
            if (result.request) {
                createdRequestId = result.request.id;
            }
        } catch (error) {
            console.error('create Failed:', error);
            await codebolt.chat.sendMessage(`create Failed: ${error}`);
        }

        // 2. List
        try {
            console.log('\n2. Testing list...');
            await codebolt.chat.sendMessage('2. Testing list...');
            const list = await codebolt.reviewMergeRequest.list();
            console.log('list Result:', JSON.stringify(list, null, 2));
            await codebolt.chat.sendMessage(`list Result: ${JSON.stringify(list, null, 2)}`);
        } catch (error) {
            console.error('list Failed:', error);
            await codebolt.chat.sendMessage(`list Failed: ${error}`);
        }

        if (createdRequestId) {
            // 3. Get
            try {
                console.log(`\n3. Testing get (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`3. Testing get (ID: ${createdRequestId})...`);
                const getResult = await codebolt.reviewMergeRequest.get(createdRequestId);
                console.log('get Result:', JSON.stringify(getResult, null, 2));
                await codebolt.chat.sendMessage(`get Result: ${JSON.stringify(getResult, null, 2)}`);
            } catch (error) {
                console.error('get Failed:', error);
                await codebolt.chat.sendMessage(`get Failed: ${error}`);
            }

            // 4. Update
            try {
                console.log(`\n4. Testing update (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`4. Testing update (ID: ${createdRequestId})...`);
                const updateResult = await codebolt.reviewMergeRequest.update(createdRequestId, {
                    description: 'Updated description by Test Runner'
                });
                console.log('update Result:', JSON.stringify(updateResult, null, 2));
                await codebolt.chat.sendMessage(`update Result: ${JSON.stringify(updateResult, null, 2)}`);
            } catch (error) {
                console.error('update Failed:', error);
                await codebolt.chat.sendMessage(`update Failed: ${error}`);
            }

            // 5. Add Review
            try {
                console.log(`\n5. Testing addReview (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`5. Testing addReview (ID: ${createdRequestId})...`);
                const reviewResult = await codebolt.reviewMergeRequest.addReview(createdRequestId, {
                    agentId: 'reviewer-agent',
                    agentName: 'Reviewer Agent',
                    type: 'comment',
                    comment: 'This is a test comment'
                });
                console.log('addReview Result:', JSON.stringify(reviewResult, null, 2));
                await codebolt.chat.sendMessage(`addReview Result: ${JSON.stringify(reviewResult, null, 2)}`);
            } catch (error) {
                console.error('addReview Failed:', error);
                await codebolt.chat.sendMessage(`addReview Failed: ${error}`);
            }

            // 6. Update Status
            try {
                console.log(`\n6. Testing updateStatus (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`6. Testing updateStatus (ID: ${createdRequestId})...`);
                const statusResult = await codebolt.reviewMergeRequest.updateStatus(createdRequestId, 'in_review');
                console.log('updateStatus Result:', JSON.stringify(statusResult, null, 2));
                await codebolt.chat.sendMessage(`updateStatus Result: ${JSON.stringify(statusResult, null, 2)}`);
            } catch (error) {
                console.error('updateStatus Failed:', error);
                await codebolt.chat.sendMessage(`updateStatus Failed: ${error}`);
            }

            // 7. Add Linked Job
            const dummyJobId = 'dummy-job-123';
            try {
                console.log(`\n7. Testing addLinkedJob (ID: ${createdRequestId}, Job: ${dummyJobId})...`);
                await codebolt.chat.sendMessage(`7. Testing addLinkedJob (ID: ${createdRequestId}, Job: ${dummyJobId})...`);
                const linkResult = await codebolt.reviewMergeRequest.addLinkedJob(createdRequestId, dummyJobId);
                console.log('addLinkedJob Result:', JSON.stringify(linkResult, null, 2));
                await codebolt.chat.sendMessage(`addLinkedJob Result: ${JSON.stringify(linkResult, null, 2)}`);
            } catch (error) {
                console.error('addLinkedJob Failed:', error);
                await codebolt.chat.sendMessage(`addLinkedJob Failed: ${error}`);
            }

            // 8. Remove Linked Job
            try {
                console.log(`\n8. Testing removeLinkedJob (ID: ${createdRequestId}, Job: ${dummyJobId})...`);
                await codebolt.chat.sendMessage(`8. Testing removeLinkedJob (ID: ${createdRequestId}, Job: ${dummyJobId})...`);
                const unlinkResult = await codebolt.reviewMergeRequest.removeLinkedJob(createdRequestId, dummyJobId);
                console.log('removeLinkedJob Result:', JSON.stringify(unlinkResult, null, 2));
                await codebolt.chat.sendMessage(`removeLinkedJob Result: ${JSON.stringify(unlinkResult, null, 2)}`);
            } catch (error) {
                console.error('removeLinkedJob Failed:', error);
                await codebolt.chat.sendMessage(`removeLinkedJob Failed: ${error}`);
            }

            // 14. Merge (Attempt)
            try {
                console.log(`\n14. Testing merge (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`14. Testing merge (ID: ${createdRequestId})...`);
                const mergeResult = await codebolt.reviewMergeRequest.merge(createdRequestId, 'merger-agent');
                console.log('merge Result:', JSON.stringify(mergeResult, null, 2));
                await codebolt.chat.sendMessage(`merge Result: ${JSON.stringify(mergeResult, null, 2)}`);
            } catch (error) {
                console.error('merge Failed:', error);
                await codebolt.chat.sendMessage(`merge Failed: ${error}`);
            }

            // 15. Delete
            try {
                console.log(`\n15. Testing delete (ID: ${createdRequestId})...`);
                await codebolt.chat.sendMessage(`15. Testing delete (ID: ${createdRequestId})...`);
                const deleteResult = await codebolt.reviewMergeRequest.delete(createdRequestId);
                console.log('delete Result:', JSON.stringify(deleteResult, null, 2));
                await codebolt.chat.sendMessage(`delete Result: ${JSON.stringify(deleteResult, null, 2)}`);
            } catch (error) {
                console.error('delete Failed:', error);
                await codebolt.chat.sendMessage(`delete Failed: ${error}`);
            }

        } else {
            console.log('Skipping ID-dependent tests because Create failed or returned no ID.');
            await codebolt.chat.sendMessage('Skipping ID-dependent tests because Create failed or returned no ID.');
        }

        // 9. Pending
        try {
            console.log('\n9. Testing pending...');
            await codebolt.chat.sendMessage('9. Testing pending...');
            const pending = await codebolt.reviewMergeRequest.pending();
            console.log('pending Result:', JSON.stringify(pending, null, 2));
            await codebolt.chat.sendMessage(`pending Result: ${JSON.stringify(pending, null, 2)}`);
        } catch (error) {
            console.error('pending Failed:', error);
            await codebolt.chat.sendMessage(`pending Failed: ${error}`);
        }

        // 10. Ready to Merge
        try {
            console.log('\n10. Testing readyToMerge...');
            await codebolt.chat.sendMessage('10. Testing readyToMerge...');
            const ready = await codebolt.reviewMergeRequest.readyToMerge();
            console.log('readyToMerge Result:', JSON.stringify(ready, null, 2));
            await codebolt.chat.sendMessage(`readyToMerge Result: ${JSON.stringify(ready, null, 2)}`);
        } catch (error) {
            console.error('readyToMerge Failed:', error);
            await codebolt.chat.sendMessage(`readyToMerge Failed: ${error}`);
        }

        // 11. By Agent
        try {
            console.log(`\n11. Testing byAgent (Agent: ${agentId})...`);
            await codebolt.chat.sendMessage(`11. Testing byAgent (Agent: ${agentId})...`);
            const byAgent = await codebolt.reviewMergeRequest.byAgent(agentId);
            console.log('byAgent Result:', JSON.stringify(byAgent, null, 2));
            await codebolt.chat.sendMessage(`byAgent Result: ${JSON.stringify(byAgent, null, 2)}`);
        } catch (error) {
            console.error('byAgent Failed:', error);
            await codebolt.chat.sendMessage(`byAgent Failed: ${error}`);
        }

        // 12. By Swarm
        try {
            console.log(`\n12. Testing bySwarm (Swarm: ${swarmId})...`);
            await codebolt.chat.sendMessage(`12. Testing bySwarm (Swarm: ${swarmId})...`);
            const bySwarm = await codebolt.reviewMergeRequest.bySwarm(swarmId);
            console.log('bySwarm Result:', JSON.stringify(bySwarm, null, 2));
            await codebolt.chat.sendMessage(`bySwarm Result: ${JSON.stringify(bySwarm, null, 2)}`);
        } catch (error) {
            console.error('bySwarm Failed:', error);
            await codebolt.chat.sendMessage(`bySwarm Failed: ${error}`);
        }

        // 13. Statistics
        try {
            console.log('\n13. Testing statistics...');
            await codebolt.chat.sendMessage('13. Testing statistics...');
            const stats = await codebolt.reviewMergeRequest.statistics();
            console.log('statistics Result:', JSON.stringify(stats, null, 2));
            await codebolt.chat.sendMessage(`statistics Result: ${JSON.stringify(stats, null, 2)}`);
        } catch (error) {
            console.error('statistics Failed:', error);
            await codebolt.chat.sendMessage(`statistics Failed: ${error}`);
        }
    }
}
