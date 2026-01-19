/**
 * Test Suite for Knowledge Graph Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Knowledge Graph Module', () => {
    let testTemplateId: string;
    let testInstanceId: string;
    let testRecordId: string;
    let testEdgeId: string;
    let testViewId: string;

    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Knowledge Graph module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Knowledge Graph module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create an instance template', async () => {
        const codebolt = sharedCodebolt();

        const config = {
            name: 'test-template',
            description: 'Test instance template',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    value: { type: 'number' }
                }
            }
        };

        const response = await codebolt.knowledgeGraph.createInstanceTemplate(config);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testTemplateId = response.data?.id || '';

        // AskUserQuestion: Verify instance template creation
        console.log('✅ AskUserQuestion: Was the instance template created successfully?');
        console.log('   Template name:', config.name);
        console.log('   Template ID:', testTemplateId);
    });

    test('should get an instance template', async () => {
        const codebolt = sharedCodebolt();

        if (!testTemplateId) {
            console.log('Skipping test - no template ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.getInstanceTemplate(testTemplateId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify instance template retrieval
        console.log('✅ AskUserQuestion: Was the instance template retrieved successfully?');
        console.log('   Template ID:', testTemplateId);
        console.log('   Template name:', response.data?.name);
    });

    test('should list instance templates', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.knowledgeGraph.listInstanceTemplates();

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.templates)).toBe(true);

        // AskUserQuestion: Verify instance template listing
        console.log('✅ AskUserQuestion: Were instance templates listed successfully?');
        console.log('   Total templates:', response.data?.templates?.length);
    });

    test('should create a knowledge graph instance', async () => {
        const codebolt = sharedCodebolt();

        const config = {
            name: 'test-instance',
            templateId: testTemplateId
        };

        const response = await codebolt.knowledgeGraph.createInstance(config);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testInstanceId = response.data?.id || '';

        // AskUserQuestion: Verify instance creation
        console.log('✅ AskUserQuestion: Was the knowledge graph instance created successfully?');
        console.log('   Instance name:', config.name);
        console.log('   Instance ID:', testInstanceId);
    });

    test('should add a memory record to instance', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId) {
            console.log('Skipping test - no instance ID available');
            return;
        }

        const record = {
            type: 'test-record',
            data: {
                name: 'Test Record',
                value: 123,
                description: 'Test memory record'
            }
        };

        const response = await codebolt.knowledgeGraph.addMemoryRecord(testInstanceId, record);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testRecordId = response.data?.id || '';

        // AskUserQuestion: Verify memory record addition
        console.log('✅ AskUserQuestion: Was the memory record added successfully?');
        console.log('   Instance ID:', testInstanceId);
        console.log('   Record ID:', testRecordId);
    });

    test('should list memory records in instance', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId) {
            console.log('Skipping test - no instance ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.listMemoryRecords(testInstanceId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.records)).toBe(true);

        // AskUserQuestion: Verify memory record listing
        console.log('✅ AskUserQuestion: Were memory records listed successfully?');
        console.log('   Instance ID:', testInstanceId);
        console.log('   Total records:', response.data?.records?.length);
    });

    test('should add an edge to instance', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId || !testRecordId) {
            console.log('Skipping test - no instance or record ID available');
            return;
        }

        // First add another record to connect to
        const record2 = await codebolt.knowledgeGraph.addMemoryRecord(testInstanceId, {
            type: 'test-record-2',
            data: { name: 'Test Record 2', value: 456 }
        });

        const edge = {
            from: testRecordId,
            to: record2.data?.id || '',
            type: 'test-relationship',
            properties: {
                weight: 1.0,
                label: 'test edge'
            }
        };

        const response = await codebolt.knowledgeGraph.addEdge(testInstanceId, edge);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testEdgeId = response.data?.id || '';

        // AskUserQuestion: Verify edge addition
        console.log('✅ AskUserQuestion: Was the edge added successfully?');
        console.log('   Instance ID:', testInstanceId);
        console.log('   Edge ID:', testEdgeId);
    });

    test('should list edges in instance', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId) {
            console.log('Skipping test - no instance ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.listEdges(testInstanceId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.edges)).toBe(true);

        // AskUserQuestion: Verify edge listing
        console.log('✅ AskUserQuestion: Were edges listed successfully?');
        console.log('   Instance ID:', testInstanceId);
        console.log('   Total edges:', response.data?.edges?.length);
    });

    test('should create a view template', async () => {
        const codebolt = sharedCodebolt();

        const config = {
            name: 'test-view-template',
            description: 'Test view template',
            query: {
                type: 'path',
                path: ['*']
            }
        };

        const response = await codebolt.knowledgeGraph.createViewTemplate(config);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify view template creation
        console.log('✅ AskUserQuestion: Was the view template created successfully?');
        console.log('   Template name:', config.name);
        console.log('   Template ID:', response.data?.id);
    });

    test('should create a view', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId) {
            console.log('Skipping test - no instance ID available');
            return;
        }

        const config = {
            name: 'test-view',
            instanceId: testInstanceId,
            query: {
                type: 'path',
                path: ['*']
            }
        };

        const response = await codebolt.knowledgeGraph.createView(config);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testViewId = response.data?.id || '';

        // AskUserQuestion: Verify view creation
        console.log('✅ AskUserQuestion: Was the view created successfully?');
        console.log('   View name:', config.name);
        console.log('   View ID:', testViewId);
    });

    test('should execute a view', async () => {
        const codebolt = sharedCodebolt();

        if (!testViewId) {
            console.log('Skipping test - no view ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.executeView(testViewId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify view execution
        console.log('✅ AskUserQuestion: Was the view executed successfully?');
        console.log('   View ID:', testViewId);
        console.log('   Results:', response.data?.results?.length || 0);
    });

    test('should delete a memory record', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId || !testRecordId) {
            console.log('Skipping test - no instance or record ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.deleteMemoryRecord(testInstanceId, testRecordId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify memory record deletion
        console.log('✅ AskUserQuestion: Was the memory record deleted successfully?');
        console.log('   Record ID:', testRecordId);
    });

    test('should delete an edge', async () => {
        const codebolt = sharedCodebolt();

        if (!testInstanceId || !testEdgeId) {
            console.log('Skipping test - no instance or edge ID available');
            return;
        }

        const response = await codebolt.knowledgeGraph.deleteEdge(testInstanceId, testEdgeId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify edge deletion
        console.log('✅ AskUserQuestion: Was the edge deleted successfully?');
        console.log('   Edge ID:', testEdgeId);
    });
});
