import codebolt from '@codebolt/codeboltjs';

export class TestRunner {
    static async runAllTests() {
        console.log('Starting All Tests...');
        await codebolt.chat.sendMessage('Starting All Tests...');

        await this.testProjectStructure();
        // await this.testFileUpdateIntent();

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
        }
    }
}
