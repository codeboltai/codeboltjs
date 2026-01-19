/**
 * Test Suite for EventLog Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('EventLog Module', () => {
    beforeAll(async () => {
        console.log('[EventLog] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[EventLog] Connection ready');
    });

    describe('EventLog Module', () => {
        test('should create event log instance', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.eventLog.createInstance(
                'test-event-log',
                'Test event log for comprehensive testing'
            );

            expect(response).toBeDefined();
            expect(response.instance).toBeDefined();

            // AskUserQuestion: Verify event log creation
            console.log('✅ AskUserQuestion: Was the event log instance created successfully?');
            console.log('   Instance ID:', response.instance?.id);
        });

        test('should append event to log', async () => {
            const codebolt = sharedCodebolt();

            // First create an instance
            const createResponse = await codebolt.eventLog.createInstance('test-event-append');
            const instanceId = createResponse.instance?.id || '';

            // Append an event
            const response = await codebolt.eventLog.append(instanceId, {
                eventType: 'test_event',
                source: 'comprehensive-test',
                data: {
                    message: 'Test event data',
                    timestamp: new Date().toISOString()
                }
            });

            expect(response).toBeDefined();
            expect(response.success).toBe(true);

            // AskUserQuestion: Verify event append
            console.log('✅ AskUserQuestion: Was the event appended successfully?');
            console.log('   Success:', response.success);
        });

        test('should query event log', async () => {
            const codebolt = sharedCodebolt();

            // First create an instance and append events
            const createResponse = await codebolt.eventLog.createInstance('test-event-query');
            const instanceId = createResponse.instance?.id || '';

            await codebolt.eventLog.append(instanceId, {
                eventType: 'query_test',
                source: 'test'
            });

            // Query the log
            const response = await codebolt.eventLog.query(instanceId, {
                limit: 10
            });

            expect(response).toBeDefined();
            expect(Array.isArray(response.events)).toBe(true);

            // AskUserQuestion: Verify event log query
            console.log('✅ AskUserQuestion: Was the event log query successful?');
            console.log('   Events Found:', response.events?.length || 0);
        });

        test('should get event log stats', async () => {
            const codebolt = sharedCodebolt();

            // First create an instance
            const createResponse = await codebolt.eventLog.createInstance('test-event-stats');
            const instanceId = createResponse.instance?.id || '';

            // Get stats
            const response = await codebolt.eventLog.getStats(instanceId);

            expect(response).toBeDefined();
            expect(response.stats).toBeDefined();

            // AskUserQuestion: Verify stats retrieval
            console.log('✅ AskUserQuestion: Were event log stats retrieved successfully?');
            console.log('   Total Events:', response.stats?.totalEvents || 0);
        });
    });
});
