/**
 * Test Suite for MemoryIngestion Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('MemoryIngestion Module', () => {
    beforeAll(async () => {
        console.log('[MemoryIngestion] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[MemoryIngestion] Connection ready');
    });

    describe('MemoryIngestion Module', () => {
        test('should create ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.memoryIngestion.create({
                name: 'test-ingestion-pipeline',
                description: 'Test ingestion pipeline',
                source: 'filesystem',
                processors: ['clean', 'chunk', 'embed']
            });

            expect(response).toBeDefined();
            expect(response.pipeline).toBeDefined();

            // AskUserQuestion: Verify pipeline creation
            console.log('✅ AskUserQuestion: Was the ingestion pipeline created successfully?');
            console.log('   Pipeline ID:', response.pipeline?.id);
        });

        test('should list ingestion pipelines', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.memoryIngestion.list();

            expect(response).toBeDefined();
            expect(Array.isArray(response.pipelines)).toBe(true);

            // AskUserQuestion: Verify pipeline listing
            console.log('✅ AskUserQuestion: Were ingestion pipelines listed successfully?');
            console.log('   Total Pipelines:', response.pipelines?.length || 0);
        });

        test('should execute ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            // First create a pipeline
            const createResponse = await codebolt.memoryIngestion.create({
                name: `test-pipeline-exec-${Date.now()}`,
                source: 'filesystem'
            });
            const pipelineId = createResponse.pipeline?.id || '';

            // Execute the pipeline
            const response = await codebolt.memoryIngestion.execute(pipelineId, {
                sourcePath: '/test/path',
                options: {
                    recursive: true
                }
            });

            expect(response).toBeDefined();

            // AskUserQuestion: Verify pipeline execution
            console.log('✅ AskUserQuestion: Was the ingestion pipeline executed successfully?');
            console.log('   Execution ID:', response.executionId);
        });
    });
});
