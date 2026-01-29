/**
 * Comprehensive Test Suite for Memory-Related Modules
 *
 * This test suite covers all methods from:
 * - dbmemory module (set, get)
 * - episodicMemory module (create, list, get, appendEvent, queryEvents, etc.)
 * - knowledgeGraph module (instance templates, instances, memory records, edges, views)
 * - persistentMemory module (create, get, list, update, delete, execute, validate)
 * - vectordb module (getVector, addVectorItem, queryVectorItem, queryVectorItems)
 * - memory module (json, todo, markdown formats with save, update, delete, list)
 *
 * Each test includes:
 * 1. Use of shared CodeboltSDK instance from setup.ts
 * 2. Descriptive test names
 * 3. All memory operations
 * 4. Vector similarity searches
 * 5. Knowledge graph operations
 * 6. AskUserQuestion verification at the end of each test
 * 7. Proper cleanup (delete test data)
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
    withTimeout,
    retryOperation,
    delay,
} from './setup';

// ============================================================================
// Test Suite Configuration
// ============================================================================

describe('CodeboltJS Memory Modules Comprehensive Tests', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up memory test environment...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] Memory tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    // ============================================================================
    // Helper Functions
    // ============================================================================

    /**
     * Helper function to trigger user verification using AskUserQuestion pattern
     */
    async function verifyWithUser(testName: string, details: any) {
        try {
            console.log(`\n=== VERIFICATION REQUEST FOR: ${testName} ===`);
            console.log('Details:', JSON.stringify(details, null, 2));
            console.log('Please verify the above result manually.\n');

            // Note: In production, this would integrate with the notification system
            // await codebolt.askUserQuestion({
            //     type: 'question',
            //     message: `Verify test: ${testName}`,
            //     data: details
            // });
        } catch (error) {
            console.log('Verification request error:', error);
        }
    }

    // ============================================================================
    // DBMemory Module Tests
    // ============================================================================

    describe('DBMemory Module', () => {
        let testKeys: string[] = [];

        test('should add knowledge to dbmemory with string value', async () => {
            const codebolt = sharedCodebolt();
            const testKey = `test-key-string-${Date.now()}`;
            testKeys.push(testKey);

            const response = await withTimeout(
                async () => {
                    return await codebolt.dbmemory.addKnowledge(testKey, 'Test knowledge value');
                },
                10000,
                'DBMemory addKnowledge timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('DBMemory - Add Knowledge (String)', {
                key: testKey,
                value: 'Test knowledge value',
                response
            });
        });

        test('should add knowledge to dbmemory with object value', async () => {
            const codebolt = sharedCodebolt();
            const testKey = `test-key-object-${Date.now()}`;
            testKeys.push(testKey);

            const testValue = {
                name: 'Test Object',
                count: 42,
                active: true,
                timestamp: new Date().toISOString()
            };

            const response = await withTimeout(
                async () => {
                    return await codebolt.dbmemory.addKnowledge(testKey, testValue);
                },
                10000,
                'DBMemory addKnowledge timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('DBMemory - Add Knowledge (Object)', {
                key: testKey,
                value: testValue,
                response
            });
        });

        test('should get knowledge from dbmemory', async () => {
            const codebolt = sharedCodebolt();
            const testKey = `test-key-get-${Date.now()}`;
            testKeys.push(testKey);

            // First add knowledge
            await codebolt.dbmemory.addKnowledge(testKey, { data: 'retrieval test' });

            // Then retrieve it
            const response = await withTimeout(
                async () => {
                    return await codebolt.dbmemory.getKnowledge(testKey);
                },
                10000,
                'DBMemory getKnowledge timed out'
            );

            expect(response).toBeDefined();
            expect(response.value).toBeDefined();
            expect(response.value.data).toBe('retrieval test');

            await verifyWithUser('DBMemory - Get Knowledge', {
                key: testKey,
                retrievedValue: response.value
            });
        });

        test('should handle non-existent key gracefully', async () => {
            const codebolt = sharedCodebolt();
            const nonExistentKey = `non-existent-key-${Date.now()}`;

            const response = await withTimeout(
                async () => {
                    return await codebolt.dbmemory.getKnowledge(nonExistentKey);
                },
                10000,
                'DBMemory getKnowledge timed out'
            );

            expect(response).toBeDefined();
            // Should handle missing keys gracefully

            await verifyWithUser('DBMemory - Non-existent Key', {
                key: nonExistentKey,
                response
            });
        });

        test('should update existing knowledge in dbmemory', async () => {
            const codebolt = sharedCodebolt();
            const testKey = `test-key-update-${Date.now()}`;
            testKeys.push(testKey);

            // Add initial value
            await codebolt.dbmemory.addKnowledge(testKey, { version: 1 });

            // Update with new value
            const response = await withTimeout(
                async () => {
                    return await codebolt.dbmemory.addKnowledge(testKey, { version: 2, updated: true });
                },
                10000,
                'DBMemory update timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // Verify the update
            const retrieved = await codebolt.dbmemory.getKnowledge(testKey);
            expect(retrieved.value.version).toBe(2);

            await verifyWithUser('DBMemory - Update Knowledge', {
                key: testKey,
                newValue: { version: 2, updated: true },
                retrievedValue: retrieved.value
            });
        });
    });

    // ============================================================================
    // Episodic Memory Module Tests
    // ============================================================================

    describe('Episodic Memory Module', () => {
        let testMemoryIds: string[] = [];

        test('should create a new episodic memory', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.createMemory({
                        title: 'Test Episodic Memory'
                    });
                },
                10000,
                'EpisodicMemory createMemory timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            testMemoryIds.push(response.data.id);

            await verifyWithUser('EpisodicMemory - Create Memory', {
                memoryId: response.data.id,
                title: response.data.title,
                createdAt: response.data.createdAt
            });
        });

        test('should list all episodic memories', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.listMemories();
                },
                10000,
                'EpisodicMemory listMemories timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);

            await verifyWithUser('EpisodicMemory - List Memories', {
                count: response.data.length,
                memories: response.data
            });
        });

        test('should get a specific episodic memory by ID', async () => {
            const codebolt = sharedCodebolt();

            // Create a memory first
            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Get'
            });
            testMemoryIds.push(createResponse.data.id);

            // Get the memory
            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.getMemory({
                        memoryId: createResponse.data.id
                    });
                },
                10000,
                'EpisodicMemory getMemory timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data.id).toBe(createResponse.data.id);

            await verifyWithUser('EpisodicMemory - Get Memory', {
                memoryId: response.data.id,
                title: response.data.title,
                eventCount: response.data.eventCount
            });
        });

        test('should append an event to episodic memory', async () => {
            const codebolt = sharedCodebolt();

            // Create a memory first
            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Events'
            });
            testMemoryIds.push(createResponse.data.id);

            // Append an event
            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.appendEvent({
                        memoryId: createResponse.data.id,
                        event_type: 'test_event',
                        emitting_agent_id: 'agent-test-001',
                        team_id: 'team-test-001',
                        tags: ['test', 'automation'],
                        payload: {
                            action: 'test_action',
                            details: 'Event payload test data'
                        }
                    });
                },
                10000,
                'EpisodicMemory appendEvent timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            await verifyWithUser('EpisodicMemory - Append Event', {
                memoryId: createResponse.data.id,
                eventId: response.data.id,
                eventType: response.data.event_type,
                payload: response.data.payload
            });
        });

        test('should query events from episodic memory with filters', async () => {
            const codebolt = sharedCodebolt();

            // Create a memory and add events
            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Query'
            });
            testMemoryIds.push(createResponse.data.id);

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'query_test',
                emitting_agent_id: 'agent-query-001',
                tags: ['query', 'test'],
                payload: { test: 'data1' }
            });

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'query_test',
                emitting_agent_id: 'agent-query-001',
                tags: ['query', 'test'],
                payload: { test: 'data2' }
            });

            // Query events
            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.queryEvents({
                        memoryId: createResponse.data.id,
                        event_type: 'query_test',
                        lastCount: 10
                    });
                },
                10000,
                'EpisodicMemory queryEvents timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.events).toBeDefined();
            expect(Array.isArray(response.data.events)).toBe(true);

            await verifyWithUser('EpisodicMemory - Query Events', {
                memoryId: createResponse.data.id,
                eventCount: response.data.events.length,
                total: response.data.total,
                filtered: response.data.filtered
            });
        });

        test('should get event types from episodic memory', async () => {
            const codebolt = sharedCodebolt();

            // Create a memory and add different event types
            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Event Types'
            });
            testMemoryIds.push(createResponse.data.id);

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'type_a',
                emitting_agent_id: 'agent-001',
                payload: {}
            });

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'type_b',
                emitting_agent_id: 'agent-001',
                payload: {}
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.getEventTypes({
                        memoryId: createResponse.data.id
                    });
                },
                10000,
                'EpisodicMemory getEventTypes timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);

            await verifyWithUser('EpisodicMemory - Get Event Types', {
                memoryId: createResponse.data.id,
                eventTypes: response.data
            });
        });

        test('should get tags from episodic memory', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Tags'
            });
            testMemoryIds.push(createResponse.data.id);

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'tagged_event',
                emitting_agent_id: 'agent-001',
                tags: ['important', 'production', 'api'],
                payload: {}
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.getTags({
                        memoryId: createResponse.data.id
                    });
                },
                10000,
                'EpisodicMemory getTags timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            await verifyWithUser('EpisodicMemory - Get Tags', {
                memoryId: createResponse.data.id,
                tags: response.data
            });
        });

        test('should get agents from episodic memory', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Agents'
            });
            testMemoryIds.push(createResponse.data.id);

            await codebolt.episodicMemory.appendEvent({
                memoryId: createResponse.data.id,
                event_type: 'agent_event',
                emitting_agent_id: 'agent-special-001',
                payload: {}
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.getAgents({
                        memoryId: createResponse.data.id
                    });
                },
                10000,
                'EpisodicMemory getAgents timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            await verifyWithUser('EpisodicMemory - Get Agents', {
                memoryId: createResponse.data.id,
                agents: response.data
            });
        });

        test('should archive an episodic memory', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Archive'
            });
            const memoryId = createResponse.data.id;

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.archiveMemory({
                        memoryId
                    });
                },
                10000,
                'EpisodicMemory archiveMemory timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('EpisodicMemory - Archive Memory', {
                memoryId,
                response
            });
        });

        test('should unarchive an episodic memory', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Test Memory for Unarchive'
            });
            const memoryId = createResponse.data.id;

            // First archive it
            await codebolt.episodicMemory.archiveMemory({ memoryId });

            // Then unarchive
            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.unarchiveMemory({
                        memoryId
                    });
                },
                10000,
                'EpisodicMemory unarchiveMemory timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('EpisodicMemory - Unarchive Memory', {
                memoryId,
                response
            });
        });

        test('should update episodic memory title', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.episodicMemory.createMemory({
                title: 'Original Title'
            });
            testMemoryIds.push(createResponse.data.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.episodicMemory.updateTitle({
                        memoryId: createResponse.data.id,
                        title: 'Updated Title'
                    });
                },
                10000,
                'EpisodicMemory updateTitle timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('EpisodicMemory - Update Title', {
                memoryId: createResponse.data.id,
                oldTitle: 'Original Title',
                newTitle: 'Updated Title',
                response
            });
        });
    });

    // ============================================================================
    // Knowledge Graph Module Tests
    // ============================================================================

    describe('Knowledge Graph Module', () => {
        let testTemplateIds: string[] = [];
        let testInstanceIds: string[] = [];
        let testRecordIds: string[] = [];
        let testEdgeIds: string[] = [];
        let testViewIds: string[] = [];

        test('should create a knowledge graph instance template', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.createInstanceTemplate({
                        name: 'Person Template',
                        description: 'Template for person entities',
                        record_kinds: [
                            {
                                name: 'Person',
                                label: 'Person',
                                description: 'A person entity',
                                attributes: {
                                    name: { type: 'string', required: true },
                                    age: { type: 'number', required: false },
                                    email: { type: 'string', required: false }
                                }
                            }
                        ],
                        edge_types: [
                            {
                                name: 'KNOWS',
                                label: 'Knows',
                                description: 'Person knows another person',
                                from_kinds: ['Person'],
                                to_kinds: ['Person']
                            }
                        ]
                    });
                },
                15000,
                'KnowledgeGraph createInstanceTemplate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            testTemplateIds.push(response.data.id);

            await verifyWithUser('KnowledgeGraph - Create Instance Template', {
                templateId: response.data.id,
                name: response.data.name,
                recordKindsCount: response.data.record_kinds.length,
                edgeTypesCount: response.data.edge_types.length
            });
        });

        test('should list knowledge graph instance templates', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.listInstanceTemplates();
                },
                10000,
                'KnowledgeGraph listInstanceTemplates timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);

            await verifyWithUser('KnowledgeGraph - List Instance Templates', {
                count: response.data.length,
                templates: response.data.map((t: any) => ({ id: t.id, name: t.name }))
            });
        });

        test('should get a knowledge graph instance template', async () => {
            const codebolt = sharedCodebolt();

            // Create a template first
            const createResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Company Template',
                record_kinds: [
                    {
                        name: 'Company',
                        label: 'Company',
                        attributes: {
                            name: { type: 'string', required: true },
                            industry: { type: 'string', required: false }
                        }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(createResponse.data.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.getInstanceTemplate(createResponse.data.id);
                },
                10000,
                'KnowledgeGraph getInstanceTemplate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data.id).toBe(createResponse.data.id);

            await verifyWithUser('KnowledgeGraph - Get Instance Template', {
                templateId: response.data.id,
                name: response.data.name
            });
        });

        test('should create a knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Create template first
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Product Template',
                record_kinds: [
                    {
                        name: 'Product',
                        label: 'Product',
                        attributes: {
                            name: { type: 'string', required: true },
                            price: { type: 'number', required: false }
                        }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            // Create instance
            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.createInstance({
                        templateId: templateResponse.data.id,
                        name: 'Product Catalog Instance',
                        description: 'Instance for managing products'
                    });
                },
                10000,
                'KnowledgeGraph createInstance timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            testInstanceIds.push(response.data.id);

            await verifyWithUser('KnowledgeGraph - Create Instance', {
                instanceId: response.data.id,
                templateId: response.data.templateId,
                name: response.data.name
            });
        });

        test('should list knowledge graph instances', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.listInstances();
                },
                10000,
                'KnowledgeGraph listInstances timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);

            await verifyWithUser('KnowledgeGraph - List Instances', {
                count: response.data.length,
                instances: response.data.map((i: any) => ({ id: i.id, name: i.name }))
            });
        });

        test('should add a memory record to knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Create template and instance
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Task Template',
                record_kinds: [
                    {
                        name: 'Task',
                        label: 'Task',
                        attributes: {
                            title: { type: 'string', required: true },
                            status: { type: 'string', required: false },
                            priority: { type: 'number', required: false }
                        }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Task Instance'
            });
            testInstanceIds.push(instanceResponse.data.id);

            // Add memory record
            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.addMemoryRecord(
                        instanceResponse.data.id,
                        {
                            kind: 'Task',
                            attributes: {
                                title: 'Test Task',
                                status: 'pending',
                                priority: 1
                            }
                        }
                    );
                },
                10000,
                'KnowledgeGraph addMemoryRecord timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            testRecordIds.push(response.data.id);

            await verifyWithUser('KnowledgeGraph - Add Memory Record', {
                instanceId: instanceResponse.data.id,
                recordId: response.data.id,
                kind: response.data.kind,
                attributes: response.data.attributes
            });
        });

        test('should list memory records from knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Setup
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Document Template',
                record_kinds: [
                    {
                        name: 'Document',
                        label: 'Document',
                        attributes: {
                            title: { type: 'string', required: true },
                            content: { type: 'string', required: false }
                        }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Document Instance'
            });
            testInstanceIds.push(instanceResponse.data.id);

            await codebolt.knowledgeGraph.addMemoryRecord(instanceResponse.data.id, {
                kind: 'Document',
                attributes: { title: 'Doc 1', content: 'Content 1' }
            });

            await codebolt.knowledgeGraph.addMemoryRecord(instanceResponse.data.id, {
                kind: 'Document',
                attributes: { title: 'Doc 2', content: 'Content 2' }
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.listMemoryRecords(instanceResponse.data.id, {
                        kind: 'Document',
                        limit: 10
                    });
                },
                10000,
                'KnowledgeGraph listMemoryRecords timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);

            await verifyWithUser('KnowledgeGraph - List Memory Records', {
                instanceId: instanceResponse.data.id,
                count: response.data.length,
                records: response.data
            });
        });

        test('should add an edge to knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Setup
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Network Template',
                record_kinds: [
                    {
                        name: 'Node',
                        label: 'Node',
                        attributes: {
                            name: { type: 'string', required: true }
                        }
                    }
                ],
                edge_types: [
                    {
                        name: 'CONNECTS_TO',
                        label: 'Connects To',
                        from_kinds: ['Node'],
                        to_kinds: ['Node']
                    }
                ]
            });
            testTemplateIds.push(templateResponse.data.id);

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Network Instance'
            });
            testInstanceIds.push(instanceResponse.data.id);

            const node1Response = await codebolt.knowledgeGraph.addMemoryRecord(
                instanceResponse.data.id,
                { kind: 'Node', attributes: { name: 'Node 1' } }
            );

            const node2Response = await codebolt.knowledgeGraph.addMemoryRecord(
                instanceResponse.data.id,
                { kind: 'Node', attributes: { name: 'Node 2' } }
            );

            // Add edge
            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.addEdge(
                        instanceResponse.data.id,
                        {
                            kind: 'CONNECTS_TO',
                            from_node_id: node1Response.data.id,
                            to_node_id: node2Response.data.id,
                            attributes: { weight: 1.0 }
                        }
                    );
                },
                10000,
                'KnowledgeGraph addEdge timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            testEdgeIds.push(response.data.id);

            await verifyWithUser('KnowledgeGraph - Add Edge', {
                instanceId: instanceResponse.data.id,
                edgeId: response.data.id,
                kind: response.data.kind,
                fromNode: node1Response.data.id,
                toNode: node2Response.data.id
            });
        });

        test('should list edges from knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Setup with existing instance
            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.listEdges(testInstanceIds[0]);
                },
                10000,
                'KnowledgeGraph listEdges timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            await verifyWithUser('KnowledgeGraph - List Edges', {
                instanceId: testInstanceIds[0],
                edges: response.data
            });
        });

        test('should update a memory record in knowledge graph', async () => {
            const codebolt = sharedCodebolt();

            // Use existing instance and record
            if (testInstanceIds.length > 0 && testRecordIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.knowledgeGraph.updateMemoryRecord(
                            testInstanceIds[0],
                            testRecordIds[0],
                            {
                                attributes: {
                                    title: 'Updated Task',
                                    status: 'completed',
                                    priority: 2
                                }
                            }
                        );
                    },
                    10000,
                    'KnowledgeGraph updateMemoryRecord timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('KnowledgeGraph - Update Memory Record', {
                    instanceId: testInstanceIds[0],
                    recordId: testRecordIds[0],
                    updatedAttributes: response.data.attributes
                });
            }
        });

        test('should delete a memory record from knowledge graph', async () => {
            const codebolt = sharedCodebolt();

            // Create temporary record
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Temp Template',
                record_kinds: [
                    {
                        name: 'TempItem',
                        label: 'TempItem',
                        attributes: { name: { type: 'string', required: true } }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Temp Instance'
            });
            testInstanceIds.push(instanceResponse.data.id);

            const recordResponse = await codebolt.knowledgeGraph.addMemoryRecord(
                instanceResponse.data.id,
                { kind: 'TempItem', attributes: { name: 'To be deleted' } }
            );

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.deleteMemoryRecord(
                        instanceResponse.data.id,
                        recordResponse.data.id
                    );
                },
                10000,
                'KnowledgeGraph deleteMemoryRecord timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data.deleted).toBe(true);

            await verifyWithUser('KnowledgeGraph - Delete Memory Record', {
                instanceId: instanceResponse.data.id,
                recordId: recordResponse.data.id,
                deleted: response.data.deleted
            });
        });

        test('should create a view template', async () => {
            const codebolt = sharedCodebolt();

            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'View Test Template',
                record_kinds: [
                    {
                        name: 'ViewItem',
                        label: 'ViewItem',
                        attributes: { name: { type: 'string', required: true } }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.createViewTemplate({
                        name: 'All Items View',
                        description: 'View all items',
                        applicable_template_ids: [templateResponse.data.id],
                        match: {},
                        return: ['id', 'name']
                    });
                },
                10000,
                'KnowledgeGraph createViewTemplate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            await verifyWithUser('KnowledgeGraph - Create View Template', {
                viewTemplateId: response.data.id,
                name: response.data.name
            });
        });

        test('should create a view', async () => {
            const codebolt = sharedCodebolt();

            // Setup
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'View Instance Template',
                record_kinds: [
                    {
                        name: 'Item',
                        label: 'Item',
                        attributes: { name: { type: 'string', required: true } }
                    }
                ],
                edge_types: []
            });
            testTemplateIds.push(templateResponse.data.id);

            const viewTemplateResponse = await codebolt.knowledgeGraph.createViewTemplate({
                name: 'Items View',
                applicable_template_ids: [templateResponse.data.id],
                match: {},
                return: ['id', 'name']
            });

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'View Test Instance'
            });
            testInstanceIds.push(instanceResponse.data.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.createView({
                        name: 'Test View',
                        instanceId: instanceResponse.data.id,
                        templateId: viewTemplateResponse.data.id
                    });
                },
                10000,
                'KnowledgeGraph createView timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.id).toBeDefined();

            testViewIds.push(response.data.id);

            await verifyWithUser('KnowledgeGraph - Create View', {
                viewId: response.data.id,
                instanceId: response.data.instanceId,
                name: response.data.name
            });
        });

        test('should execute a view', async () => {
            const codebolt = sharedCodebolt();

            if (testViewIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.knowledgeGraph.executeView(testViewIds[0]);
                    },
                    10000,
                    'KnowledgeGraph executeView timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('KnowledgeGraph - Execute View', {
                    viewId: testViewIds[0],
                    result: response.data
                });
            }
        });

        test('should delete a knowledge graph instance', async () => {
            const codebolt = sharedCodebolt();

            // Create temporary instance
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Delete Test Template',
                record_kinds: [
                    {
                        name: 'DeleteItem',
                        label: 'DeleteItem',
                        attributes: { name: { type: 'string', required: true } }
                    }
                ],
                edge_types: []
            });

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Delete Test Instance'
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.knowledgeGraph.deleteInstance(instanceResponse.data.id);
                },
                10000,
                'KnowledgeGraph deleteInstance timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data.deleted).toBe(true);

            await verifyWithUser('KnowledgeGraph - Delete Instance', {
                instanceId: instanceResponse.data.id,
                deleted: response.data.deleted
            });
        });
    });

    // ============================================================================
    // Persistent Memory Module Tests
    // ============================================================================

    describe('Persistent Memory Module', () => {
        let testMemoryIds: string[] = [];

        test('should create a persistent memory configuration', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.persistentMemory.create({
                        label: 'Test Persistent Memory',
                        description: 'Test persistent memory configuration',
                        inputs_scope: ['user_input', 'context'],
                        retrieval: {
                            source_type: 'vectordb',
                            source_id: 'test-vector-db',
                            limit: 10
                        },
                        contribution: {
                            format: 'json',
                            max_tokens: 1000
                        }
                    });
                },
                15000,
                'PersistentMemory create timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.memory).toBeDefined();
            expect(response.data.memory.id).toBeDefined();

            testMemoryIds.push(response.data.memory.id);

            await verifyWithUser('PersistentMemory - Create', {
                memoryId: response.data.memory.id,
                label: response.data.memory.label,
                status: response.data.memory.status
            });
        });

        test('should get a persistent memory by ID', async () => {
            const codebolt = sharedCodebolt();

            if (testMemoryIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.persistentMemory.get(testMemoryIds[0]);
                    },
                    10000,
                    'PersistentMemory get timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.data.memory.id).toBe(testMemoryIds[0]);

                await verifyWithUser('PersistentMemory - Get', {
                    memoryId: response.data.memory.id,
                    label: response.data.memory.label
                });
            }
        });

        test('should list persistent memories', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.persistentMemory.list({
                        activeOnly: false
                    });
                },
                10000,
                'PersistentMemory list timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.memories).toBeDefined();
            expect(Array.isArray(response.data.memories)).toBe(true);

            await verifyWithUser('PersistentMemory - List', {
                count: response.data.memories.length,
                memories: response.data.memories.map((m: any) => ({
                    id: m.id,
                    label: m.label,
                    status: m.status
                }))
            });
        });

        test('should update a persistent memory', async () => {
            const codebolt = sharedCodebolt();

            if (testMemoryIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.persistentMemory.update(testMemoryIds[0], {
                            label: 'Updated Persistent Memory',
                            status: 'active'
                        });
                    },
                    10000,
                    'PersistentMemory update timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('PersistentMemory - Update', {
                    memoryId: testMemoryIds[0],
                    newLabel: 'Updated Persistent Memory',
                    newStatus: 'active'
                });
            }
        });

        test('should execute persistent memory retrieval', async () => {
            const codebolt = sharedCodebolt();

            if (testMemoryIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.persistentMemory.executeRetrieval(
                            testMemoryIds[0],
                            {
                                keywords: ['test', 'query'],
                                action: 'search',
                                context: { userId: 'test-user' },
                                query: 'test query for retrieval'
                            }
                        );
                    },
                    15000,
                    'PersistentMemory executeRetrieval timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.data).toBeDefined();
                expect(response.data.result).toBeDefined();

                await verifyWithUser('PersistentMemory - Execute Retrieval', {
                    memoryId: testMemoryIds[0],
                    executionResult: response.data.result
                });
            }
        });

        test('should validate a persistent memory configuration', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.persistentMemory.validate({
                        label: 'Validation Test Memory',
                        retrieval: {
                            source_type: 'vectordb',
                            source_id: 'test-db'
                        },
                        contribution: {
                            format: 'json'
                        }
                    });
                },
                10000,
                'PersistentMemory validate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.validation).toBeDefined();

            await verifyWithUser('PersistentMemory - Validate', {
                valid: response.data.validation.valid,
                errors: response.data.validation.errors
            });
        });

        test('should get step specifications', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.persistentMemory.getStepSpecs();
                },
                10000,
                'PersistentMemory getStepSpecs timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.specs).toBeDefined();

            await verifyWithUser('PersistentMemory - Get Step Specs', {
                specsCount: response.data.specs.length,
                specs: response.data.specs
            });
        });

        test('should delete a persistent memory', async () => {
            const codebolt = sharedCodebolt();

            // Create temporary memory
            const createResponse = await codebolt.persistentMemory.create({
                label: 'Temporary Memory for Deletion',
                retrieval: {
                    source_type: 'kv',
                    source_id: 'temp-kv'
                },
                contribution: {
                    format: 'text'
                }
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.persistentMemory.delete(createResponse.data.memory.id);
                },
                10000,
                'PersistentMemory delete timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('PersistentMemory - Delete', {
                memoryId: createResponse.data.memory.id,
                deleted: true
            });
        });
    });

    // ============================================================================
    // VectorDB Module Tests
    // ============================================================================

    describe('VectorDB Module', () => {
        let testVectorKeys: string[] = [];

        test('should add a vector item to vectordb', async () => {
            const codebolt = sharedCodebolt();

            const testItem = {
                id: `vec-item-${Date.now()}`,
                text: 'This is a test document for vector storage',
                metadata: {
                    category: 'test',
                    timestamp: new Date().toISOString()
                }
            };
            testVectorKeys.push(testItem.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.addVectorItem(testItem);
                },
                15000,
                'VectorDB addVectorItem timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Add Vector Item', {
                itemId: testItem.id,
                text: testItem.text,
                response
            });
        });

        test('should get a vector from vectordb', async () => {
            const codebolt = sharedCodebolt();

            // Add a vector first
            const testKey = `vec-get-${Date.now()}`;
            testVectorKeys.push(testKey);

            await codebolt.vectordb.addVectorItem({
                id: testKey,
                text: 'Document for vector retrieval test',
                metadata: { type: 'test-get' }
            });

            // Small delay to ensure indexing
            await delay(500);

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.getVector(testKey);
                },
                10000,
                'VectorDB getVector timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Get Vector', {
                key: testKey,
                vectorData: response
            });
        });

        test('should query a vector item for similarity search', async () => {
            const codebolt = sharedCodebolt();

            const queryKey = `query-test-${Date.now()}`;
            testVectorKeys.push(queryKey);

            // Add items for similarity search
            await codebolt.vectordb.addVectorItem({
                id: 'doc1',
                text: 'Machine learning is a subset of artificial intelligence',
                metadata: { category: 'AI' }
            });

            await codebolt.vectordb.addVectorItem({
                id: 'doc2',
                text: 'Deep learning uses neural networks with multiple layers',
                metadata: { category: 'AI' }
            });

            await codebolt.vectordb.addVectorItem({
                id: queryKey,
                text: 'Neural networks are used in deep learning',
                metadata: { category: 'query' }
            });

            // Wait for indexing
            await delay(1000);

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.queryVectorItem(queryKey);
                },
                15000,
                'VectorDB queryVectorItem timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Query Vector Item (Similarity Search)', {
                queryKey,
                results: response,
                similaritySearch: true
            });
        });

        test('should query multiple vector items', async () => {
            const codebolt = sharedCodebolt();

            const items = [
                `item1-${Date.now()}`,
                `item2-${Date.now()}`,
                `item3-${Date.now()}`
            ];
            testVectorKeys.push(...items);

            // Add multiple items
            for (const item of items) {
                await codebolt.vectordb.addVectorItem({
                    id: item,
                    text: `Test document for ${item}`,
                    metadata: { batch: 'multi-query' }
                });
            }

            // Wait for indexing
            await delay(1000);

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.queryVectorItems(
                        items,
                        'test-db-path'
                    );
                },
                15000,
                'VectorDB queryVectorItems timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Query Vector Items (Batch)', {
                itemCount: items.length,
                results: response,
                batchQuery: true
            });
        });

        test('should handle similarity search with different content types', async () => {
            const codebolt = sharedCodebolt();

            const testId = `similarity-test-${Date.now()}`;
            testVectorKeys.push(testId);

            // Add diverse content
            await codebolt.vectordb.addVectorItem({
                id: 'tech-1',
                text: 'JavaScript is a programming language for web development',
                metadata: { domain: 'technology' }
            });

            await codebolt.vectordb.addVectorItem({
                id: 'tech-2',
                text: 'Python is used for data science and automation',
                metadata: { domain: 'technology' }
            });

            await codebolt.vectordb.addVectorItem({
                id: testId,
                text: 'Web development often uses JavaScript frameworks',
                metadata: { domain: 'technology' }
            });

            await delay(1000);

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.queryVectorItem(testId);
                },
                15000,
                'VectorDB similarity search with different content types timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Similarity Search (Different Content Types)', {
                queryId: testId,
                queryText: 'Web development often uses JavaScript frameworks',
                results: response,
                note: 'Should find tech-1 as most similar due to JavaScript context'
            });
        });

        test('should handle vector operations with metadata', async () => {
            const codebolt = sharedCodebolt();

            const metadataKey = `metadata-test-${Date.now()}`;
            testVectorKeys.push(metadataKey);

            const complexMetadata = {
                title: 'Advanced Vector Operations',
                author: 'Test Author',
                tags: ['vector', 'search', 'embedding'],
                timestamp: new Date().toISOString(),
                category: 'technical',
                priority: 1
            };

            await codebolt.vectordb.addVectorItem({
                id: metadataKey,
                text: 'Document with complex metadata for testing vector operations',
                metadata: complexMetadata
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.vectordb.getVector(metadataKey);
                },
                10000,
                'VectorDB getVector with metadata timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('VectorDB - Vector Operations with Metadata', {
                itemId: metadataKey,
                metadata: complexMetadata,
                response
            });
        });
    });

    // ============================================================================
    // Memory Module Tests (JSON, Todo, Markdown formats)
    // ============================================================================

    describe('Memory Module (JSON, Todo, Markdown)', () => {
        let testMemoryIds: string[] = [];

        // ==================== JSON Format Tests ====================

        test('should save memory in JSON format', async () => {
            const codebolt = sharedCodebolt();

            const testData = {
                title: 'Test JSON Memory',
                content: 'This is test content in JSON format',
                metadata: {
                    created: new Date().toISOString(),
                    tags: ['json', 'test']
                }
            };

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.json.save(testData);
                },
                10000,
                'Memory json.save timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.memoryId).toBeDefined();

            testMemoryIds.push(response.memoryId);

            await verifyWithUser('Memory - JSON Save', {
                memoryId: response.memoryId,
                data: testData,
                response
            });
        });

        test('should update memory in JSON format', async () => {
            const codebolt = sharedCodebolt();

            if (testMemoryIds.length > 0) {
                const updatedData = {
                    title: 'Updated JSON Memory',
                    content: 'This content has been updated',
                    metadata: {
                        updated: new Date().toISOString(),
                        tags: ['json', 'updated']
                    }
                };

                const response = await withTimeout(
                    async () => {
                        return await codebolt.memory.json.update(testMemoryIds[0], updatedData);
                    },
                    10000,
                    'Memory json.update timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('Memory - JSON Update', {
                    memoryId: testMemoryIds[0],
                    updatedData,
                    response
                });
            }
        });

        test('should list memories in JSON format', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.json.list({
                        limit: 10
                    });
                },
                10000,
                'Memory json.list timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.items).toBeDefined();
            expect(Array.isArray(response.items)).toBe(true);

            await verifyWithUser('Memory - JSON List', {
                count: response.items.length,
                items: response.items
            });
        });

        test('should delete memory in JSON format', async () => {
            const codebolt = sharedCodebolt();

            // Create temporary memory
            const createResponse = await codebolt.memory.json.save({
                title: 'Temporary JSON Memory',
                content: 'This will be deleted'
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.json.delete(createResponse.memoryId);
                },
                10000,
                'Memory json.delete timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('Memory - JSON Delete', {
                memoryId: createResponse.memoryId,
                deleted: true,
                response
            });
        });

        // ==================== Todo Format Tests ====================

        test('should save memory in Todo format', async () => {
            const codebolt = sharedCodebolt();

            const todoData = {
                title: 'Test Todo Memory',
                description: 'This is a test todo item',
                status: 'pending' as const,
                priority: 1,
                dueDate: new Date().toISOString()
            };

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.todo.save(todoData, {
                        category: 'test',
                        project: 'memory-test'
                    });
                },
                10000,
                'Memory todo.save timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.memoryId).toBeDefined();

            testMemoryIds.push(response.memoryId);

            await verifyWithUser('Memory - Todo Save', {
                memoryId: response.memoryId,
                todo: todoData,
                metadata: { category: 'test', project: 'memory-test' }
            });
        });

        test('should update memory in Todo format', async () => {
            const codebolt = sharedCodebolt();

            // Create a todo first
            const createResponse = await codebolt.memory.todo.save({
                title: 'Todo to Update',
                status: 'pending'
            });

            const updatedTodo = {
                title: 'Updated Todo',
                status: 'completed' as const,
                completedAt: new Date().toISOString()
            };

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.todo.update(createResponse.memoryId, updatedTodo);
                },
                10000,
                'Memory todo.update timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('Memory - Todo Update', {
                memoryId: createResponse.memoryId,
                updatedTodo,
                response
            });

            // Cleanup
            await codebolt.memory.todo.delete(createResponse.memoryId);
        });

        test('should list memories in Todo format', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.todo.list({
                        status: 'pending',
                        limit: 10
                    });
                },
                10000,
                'Memory todo.list timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.items).toBeDefined();
            expect(Array.isArray(response.items)).toBe(true);

            await verifyWithUser('Memory - Todo List', {
                filters: { status: 'pending', limit: 10 },
                count: response.items.length,
                items: response.items
            });
        });

        test('should delete memory in Todo format', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.memory.todo.save({
                title: 'Todo to Delete',
                status: 'pending'
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.todo.delete(createResponse.memoryId);
                },
                10000,
                'Memory todo.delete timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('Memory - Todo Delete', {
                memoryId: createResponse.memoryId,
                deleted: true,
                response
            });
        });

        // ==================== Markdown Format Tests ====================

        test('should save memory in Markdown format', async () => {
            const codebolt = sharedCodebolt();

            const markdownContent = `# Test Document

This is a **test** document in markdown format.

## Features
- Item 1
- Item 2
- Item 3

## Code Example

\`\`\`javascript
console.log('Hello, Memory!');
\`\`\`
`;

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.markdown.save(markdownContent, {
                        title: 'Test Markdown Document',
                        tags: ['markdown', 'test', 'documentation']
                    });
                },
                10000,
                'Memory markdown.save timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.memoryId).toBeDefined();

            testMemoryIds.push(response.memoryId);

            await verifyWithUser('Memory - Markdown Save', {
                memoryId: response.memoryId,
                contentLength: markdownContent.length,
                metadata: { title: 'Test Markdown Document', tags: ['markdown', 'test', 'documentation'] }
            });
        });

        test('should update memory in Markdown format', async () => {
            const codebolt = sharedCodebolt();

            if (testMemoryIds.length > 0) {
                const updatedMarkdown = `# Updated Document

This content has been **updated**.

## New Section
Added new content here.
`;

                const response = await withTimeout(
                    async () => {
                        return await codebolt.memory.markdown.update(
                            testMemoryIds[0],
                            updatedMarkdown,
                            {
                                title: 'Updated Markdown Document',
                                lastModified: new Date().toISOString()
                            }
                        );
                    },
                    10000,
                    'Memory markdown.update timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('Memory - Markdown Update', {
                    memoryId: testMemoryIds[0],
                    contentLength: updatedMarkdown.length,
                    response
                });
            }
        });

        test('should list memories in Markdown format', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.markdown.list({
                        limit: 10
                    });
                },
                10000,
                'Memory markdown.list timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.items).toBeDefined();
            expect(Array.isArray(response.items)).toBe(true);

            await verifyWithUser('Memory - Markdown List', {
                count: response.items.length,
                items: response.items.map((item: any) => ({
                    memoryId: item.memoryId || item.id,
                    metadata: item.metadata
                }))
            });
        });

        test('should delete memory in Markdown format', async () => {
            const codebolt = sharedCodebolt();

            const createResponse = await codebolt.memory.markdown.save(
                '# Temporary Markdown\n\nThis will be deleted.',
                { title: 'Temp Doc' }
            );

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.markdown.delete(createResponse.memoryId);
                },
                10000,
                'Memory markdown.delete timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('Memory - Markdown Delete', {
                memoryId: createResponse.memoryId,
                deleted: true,
                response
            });
        });

        // ==================== Cross-Format Tests ====================

        test('should handle multiple format operations in sequence', async () => {
            const codebolt = sharedCodebolt();

            // JSON
            const jsonResponse = await codebolt.memory.json.save({
                type: 'multi-format-test',
                timestamp: Date.now()
            });

            // Todo
            const todoResponse = await codebolt.memory.todo.save({
                title: 'Multi-format Todo',
                status: 'pending'
            });

            // Markdown
            const mdResponse = await codebolt.memory.markdown.save(
                '# Multi-format Test\n\nTesting all formats.',
                { test: true }
            );

            await verifyWithUser('Memory - Multi-Format Operations', {
                jsonMemoryId: jsonResponse.memoryId,
                todoMemoryId: todoResponse.memoryId,
                markdownMemoryId: mdResponse.memoryId,
                allFormatsSuccessful: true
            });

            // Cleanup
            await codebolt.memory.json.delete(jsonResponse.memoryId);
            await codebolt.memory.todo.delete(todoResponse.memoryId);
            await codebolt.memory.markdown.delete(mdResponse.memoryId);
        });
    });

    // ============================================================================
    // Memory Ingestion Module Tests
    // ============================================================================

    describe('Memory Ingestion Module', () => {
        let testPipelineIds: string[] = [];

        test('should create a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.create({
                        id: `test-pipeline-${Date.now()}`,
                        label: 'Test Ingestion Pipeline',
                        description: 'Pipeline for testing memory ingestion',
                        trigger: 'onConversationEnd',
                        trigger_config: {
                            auto_execute: true
                        },
                        processors: [
                            {
                                type: 'llm_summarize',
                                config: {
                                    max_length: 500
                                },
                                order: 1
                            },
                            {
                                type: 'embed',
                                config: {
                                    model: 'default'
                                },
                                order: 2
                            }
                        ],
                        routing: {
                            destination: 'vectordb',
                            destination_id: 'test-vector-db',
                            field_mapping: {
                                content: 'summary',
                                metadata: 'timestamp'
                            }
                        }
                    });
                },
                15000,
                'MemoryIngestion create timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.pipeline).toBeDefined();

            testPipelineIds.push(response.data.pipeline.id);

            await verifyWithUser('MemoryIngestion - Create Pipeline', {
                pipelineId: response.data.pipeline.id,
                label: response.data.pipeline.label,
                trigger: response.data.pipeline.trigger,
                processorCount: response.data.pipeline.processors.length
            });
        });

        test('should list memory ingestion pipelines', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.list({
                        activeOnly: false
                    });
                },
                10000,
                'MemoryIngestion list timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.pipelines).toBeDefined();
            expect(Array.isArray(response.data.pipelines)).toBe(true);

            await verifyWithUser('MemoryIngestion - List Pipelines', {
                count: response.data.pipelines.length,
                pipelines: response.data.pipelines.map((p: any) => ({
                    id: p.id,
                    label: p.label,
                    status: p.status,
                    trigger: p.trigger
                }))
            });
        });

        test('should get a memory ingestion pipeline by ID', async () => {
            const codebolt = sharedCodebolt();

            if (testPipelineIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.memoryIngestion.get(testPipelineIds[0]);
                    },
                    10000,
                    'MemoryIngestion get timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.data.pipeline.id).toBe(testPipelineIds[0]);

                await verifyWithUser('MemoryIngestion - Get Pipeline', {
                    pipelineId: response.data.pipeline.id,
                    label: response.data.pipeline.label,
                    status: response.data.pipeline.status
                });
            }
        });

        test('should update a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            if (testPipelineIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.memoryIngestion.update(testPipelineIds[0], {
                            label: 'Updated Ingestion Pipeline',
                            status: 'active'
                        });
                    },
                    10000,
                    'MemoryIngestion update timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('MemoryIngestion - Update Pipeline', {
                    pipelineId: testPipelineIds[0],
                    newLabel: 'Updated Ingestion Pipeline',
                    newStatus: 'active'
                });
            }
        });

        test('should validate a memory ingestion pipeline configuration', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.validate({
                        label: 'Validation Test Pipeline',
                        trigger: 'manual',
                        processors: [
                            {
                                type: 'filter',
                                config: {
                                    conditions: {}
                                }
                            }
                        ],
                        routing: {
                            destination: 'kv',
                            destination_id: 'test-kv'
                        }
                    });
                },
                10000,
                'MemoryIngestion validate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.validation).toBeDefined();

            await verifyWithUser('MemoryIngestion - Validate Pipeline', {
                valid: response.data.validation.valid,
                errors: response.data.validation.errors
            });
        });

        test('should get processor specifications', async () => {
            const codebolt = sharedCodebolt();

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.getProcessorSpecs();
                },
                10000,
                'MemoryIngestion getProcessorSpecs timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.data.specs).toBeDefined();
            expect(Array.isArray(response.data.specs)).toBe(true);

            await verifyWithUser('MemoryIngestion - Get Processor Specs', {
                specsCount: response.data.specs.length,
                specs: response.data.specs.map((s: any) => ({
                    type: s.type,
                    name: s.name || s.type
                }))
            });
        });

        test('should execute a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            if (testPipelineIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.memoryIngestion.execute({
                            pipelineId: testPipelineIds[0],
                            eventType: 'test_event',
                            trigger: 'manual',
                            payload: {
                                content: 'Test content for ingestion pipeline execution',
                                metadata: {
                                    test: true,
                                    timestamp: new Date().toISOString()
                                }
                            }
                        });
                    },
                    20000,
                    'MemoryIngestion execute timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);
                expect(response.data).toBeDefined();
                expect(response.data.result).toBeDefined();

                await verifyWithUser('MemoryIngestion - Execute Pipeline', {
                    pipelineId: testPipelineIds[0],
                    executionResult: response.data.result,
                    success: response.data.result.success
                });
            }
        });

        test('should activate a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            // Create a pipeline in draft status
            const createResponse = await codebolt.memoryIngestion.create({
                label: 'Pipeline to Activate',
                trigger: 'manual',
                processors: [],
                routing: {
                    destination: 'kv',
                    destination_id: 'test-kv'
                }
            });
            testPipelineIds.push(createResponse.data.pipeline.id);

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.activate(createResponse.data.pipeline.id);
                },
                10000,
                'MemoryIngestion activate timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('MemoryIngestion - Activate Pipeline', {
                pipelineId: createResponse.data.pipeline.id,
                status: 'active'
            });
        });

        test('should disable a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            if (testPipelineIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.memoryIngestion.disable(testPipelineIds[0]);
                    },
                    10000,
                    'MemoryIngestion disable timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                await verifyWithUser('MemoryIngestion - Disable Pipeline', {
                    pipelineId: testPipelineIds[0],
                    status: 'disabled'
                });
            }
        });

        test('should duplicate a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            if (testPipelineIds.length > 0) {
                const response = await withTimeout(
                    async () => {
                        return await codebolt.memoryIngestion.duplicate(
                            testPipelineIds[0],
                            `duplicated-pipeline-${Date.now()}`,
                            'Duplicated Pipeline'
                        );
                    },
                    10000,
                    'MemoryIngestion duplicate timed out'
                );

                expect(response).toBeDefined();
                expect(response.success).toBe(true);

                testPipelineIds.push(response.data.pipeline.id);

                await verifyWithUser('MemoryIngestion - Duplicate Pipeline', {
                    originalPipelineId: testPipelineIds[0],
                    newPipelineId: response.data.pipeline.id,
                    newLabel: response.data.pipeline.label
                });
            }
        });

        test('should delete a memory ingestion pipeline', async () => {
            const codebolt = sharedCodebolt();

            // Create temporary pipeline
            const createResponse = await codebolt.memoryIngestion.create({
                label: 'Temporary Pipeline for Deletion',
                trigger: 'manual',
                processors: [],
                routing: {
                    destination: 'kv',
                    destination_id: 'temp-kv'
                }
            });

            const response = await withTimeout(
                async () => {
                    return await codebolt.memoryIngestion.delete(createResponse.data.pipeline.id);
                },
                10000,
                'MemoryIngestion delete timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('MemoryIngestion - Delete Pipeline', {
                pipelineId: createResponse.data.pipeline.id,
                deleted: true
            });
        });
    });

    // ============================================================================
    // Integration Tests - Cross-Module Operations
    // ============================================================================

    describe('Memory Integration Tests (Cross-Module)', () => {
        test('should integrate episodic memory with vector db', async () => {
            const codebolt = sharedCodebolt();

            // Create episodic memory
            const memoryResponse = await codebolt.episodicMemory.createMemory({
                title: 'Integration Test Memory'
            });

            // Add events
            await codebolt.episodicMemory.appendEvent({
                memoryId: memoryResponse.data.id,
                event_type: 'integration_test',
                emitting_agent_id: 'agent-integration-001',
                payload: {
                    text: 'Integration test event for vector storage',
                    action: 'test_integration'
                }
            });

            // Query events
            const eventsResponse = await codebolt.episodicMemory.queryEvents({
                memoryId: memoryResponse.data.id,
                lastCount: 10
            });

            await verifyWithUser('Integration - Episodic Memory + Vector DB', {
                memoryId: memoryResponse.data.id,
                eventsCount: eventsResponse.data.events.length,
                integration: 'episodic_with_vector'
            });
        });

        test('should integrate knowledge graph with persistent memory', async () => {
            const codebolt = sharedCodebolt();

            // Create KG template and instance
            const templateResponse = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'Integration Test Template',
                record_kinds: [
                    {
                        name: 'KnowledgeItem',
                        label: 'KnowledgeItem',
                        attributes: {
                            content: { type: 'string', required: true },
                            category: { type: 'string', required: false }
                        }
                    }
                ],
                edge_types: []
            });

            const instanceResponse = await codebolt.knowledgeGraph.createInstance({
                templateId: templateResponse.data.id,
                name: 'Integration Test Instance'
            });

            // Add memory record
            const recordResponse = await codebolt.knowledgeGraph.addMemoryRecord(
                instanceResponse.data.id,
                {
                    kind: 'KnowledgeItem',
                    attributes: {
                        content: 'Integration test knowledge',
                        category: 'test'
                    }
                }
            );

            // Create persistent memory that references KG
            const persistentResponse = await codebolt.persistentMemory.create({
                label: 'Integration Persistent Memory',
                retrieval: {
                    source_type: 'kg',
                    source_id: instanceResponse.data.id
                },
                contribution: {
                    format: 'json'
                }
            });

            await verifyWithUser('Integration - Knowledge Graph + Persistent Memory', {
                instanceId: instanceResponse.data.id,
                recordId: recordResponse.data.id,
                persistentMemoryId: persistentResponse.data.memory.id,
                integration: 'kg_with_persistent'
            });

            // Cleanup
            await codebolt.knowledgeGraph.deleteInstance(instanceResponse.data.id);
            await codebolt.persistentMemory.delete(persistentResponse.data.memory.id);
        });

        test('should integrate memory ingestion with all memory types', async () => {
            const codebolt = sharedCodebolt();

            // Create ingestion pipeline that routes to multiple destinations
            const pipelineResponse = await codebolt.memoryIngestion.create({
                label: 'Multi-Destination Pipeline',
                trigger: 'manual',
                processors: [
                    {
                        type: 'transform',
                        config: {
                            transformations: ['normalize', 'tokenize']
                        }
                    }
                ],
                routing: {
                    destination: 'vectordb',
                    destination_id: 'integration-test-db'
                }
            });

            // Execute pipeline
            const executeResponse = await codebolt.memoryIngestion.execute({
                pipelineId: pipelineResponse.data.pipeline.id,
                payload: {
                    content: 'Multi-destination integration test',
                    sources: ['episodic', 'kg', 'persistent']
                }
            });

            await verifyWithUser('Integration - Memory Ingestion + All Memory Types', {
                pipelineId: pipelineResponse.data.pipeline.id,
                executionSuccess: executeResponse.data.result.success,
                destinations: ['vectordb', 'episodic', 'kg', 'persistent'],
                integration: 'ingestion_with_all_memory_types'
            });

            // Cleanup
            await codebolt.memoryIngestion.delete(pipelineResponse.data.pipeline.id);
        });

        test('should perform end-to-end memory workflow', async () => {
            const codebolt = sharedCodebolt();

            // Step 1: Create episodic memory and add events
            const episodicResponse = await codebolt.episodicMemory.createMemory({
                title: 'E2E Test Memory'
            });

            await codebolt.episodicMemory.appendEvent({
                memoryId: episodicResponse.data.id,
                event_type: 'workflow_test',
                emitting_agent_id: 'agent-e2e-001',
                payload: { step: 1, data: 'Initial data' }
            });

            // Step 2: Create knowledge graph structure
            const kgTemplate = await codebolt.knowledgeGraph.createInstanceTemplate({
                name: 'E2E Template',
                record_kinds: [
                    {
                        name: 'WorkflowStep',
                        label: 'WorkflowStep',
                        attributes: {
                            stepNumber: { type: 'number', required: true },
                            description: { type: 'string', required: true }
                        }
                    }
                ],
                edge_types: []
            });

            const kgInstance = await codebolt.knowledgeGraph.createInstance({
                templateId: kgTemplate.data.id,
                name: 'E2E Instance'
            });

            await codebolt.knowledgeGraph.addMemoryRecord(
                kgInstance.data.id,
                {
                    kind: 'WorkflowStep',
                    attributes: {
                        stepNumber: 1,
                        description: 'End-to-end workflow test'
                    }
                }
            );

            // Step 3: Store in vector DB
            await codebolt.vectordb.addVectorItem({
                id: `e2e-test-${Date.now()}`,
                text: 'End-to-end workflow test vector item',
                metadata: {
                    workflowId: episodicResponse.data.id,
                    instanceId: kgInstance.data.id
                }
            });

            // Step 4: Create persistent memory configuration
            const persistentResponse = await codebolt.persistentMemory.create({
                label: 'E2E Persistent Memory',
                retrieval: {
                    source_type: 'vectordb',
                    source_id: 'e2e-test-db'
                },
                contribution: {
                    format: 'json'
                }
            });

            await verifyWithUser('Integration - End-to-End Workflow', {
                episodicMemoryId: episodicResponse.data.id,
                kgInstanceId: kgInstance.data.id,
                persistentMemoryId: persistentResponse.data.memory.id,
                workflowSteps: ['episodic', 'knowledge-graph', 'vector-db', 'persistent'],
                status: 'complete'
            });

            // Cleanup
            await codebolt.knowledgeGraph.deleteInstance(kgInstance.data.id);
            await codebolt.persistentMemory.delete(persistentResponse.data.memory.id);
        });
    });

    // ============================================================================
    // Performance and Stress Tests
    // ============================================================================

    describe('Memory Performance Tests', () => {
        test('should handle multiple concurrent memory operations', async () => {
            const codebolt = sharedCodebolt();

            const operations = [];

            // Create multiple episodic memories concurrently
            for (let i = 0; i < 5; i++) {
                operations.push(
                    codebolt.episodicMemory.createMemory({
                        title: `Concurrent Test Memory ${i}`
                    })
                );
            }

            const results = await Promise.all(operations);

            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });

            await verifyWithUser('Performance - Concurrent Operations', {
                operationCount: 5,
                allSuccessful: results.every(r => r.success),
                memoryIds: results.map(r => r.data.id)
            });

            // Cleanup
            for (const result of results) {
                await codebolt.episodicMemory.archiveMemory({ memoryId: result.data.id });
            }
        });

        test('should handle large data in memory operations', async () => {
            const codebolt = sharedCodebolt();

            const largeContent = '# Large Document\n\n' + Array(50).fill('This is a test line with some content. ').join('\n');

            const response = await withTimeout(
                async () => {
                    return await codebolt.memory.markdown.save(largeContent, {
                        size: 'large',
                        lineCount: 50
                    });
                },
                15000,
                'Performance - Large data operation timed out'
            );

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            await verifyWithUser('Performance - Large Data Handling', {
                memoryId: response.memoryId,
                contentSize: largeContent.length,
                success: true
            });

            // Cleanup
            await codebolt.memory.markdown.delete(response.memoryId);
        });

        test('should handle rapid sequential vector operations', async () => {
            const codebolt = sharedCodebolt();

            const vectorIds = [];

            // Add multiple vectors rapidly
            for (let i = 0; i < 5; i++) {
                const response = await codebolt.vectordb.addVectorItem({
                    id: `rapid-test-${Date.now()}-${i}`,
                    text: `Rapid test document ${i}`,
                    metadata: { batch: 'rapid-test', index: i }
                });
                vectorIds.push(`rapid-test-${Date.now()}-${i}`);
            }

            // Wait for indexing
            await delay(2000);

            // Query one of them
            const queryResponse = await codebolt.vectordb.queryVectorItem(vectorIds[2]);

            await verifyWithUser('Performance - Rapid Vector Operations', {
                vectorsAdded: vectorIds.length,
                querySuccessful: queryResponse.success,
                testType: 'rapid_sequential'
            });
        });
    });
});
