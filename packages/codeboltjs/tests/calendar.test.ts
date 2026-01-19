/**
 * Test Suite for Calendar Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Calendar Module', () => {
    beforeAll(async () => {
        console.log('[Calendar Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Calendar Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a calendar event', async () => {
        const codebolt = sharedCodebolt();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        const response = await codebolt.calendar.createEvent({
            title: 'Test Calendar Event',
            description: 'Test event for comprehensive testing',
            eventType: 'meeting',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            hasDuration: true,
            createdByName: 'Test User',
            createdByType: 'user'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data?.event).toBeDefined();

        // AskUserQuestion: Verify event creation
        console.log('✅ AskUserQuestion: Was the calendar event created successfully?');
        console.log('   Event ID:', response.data?.event?.id);
        console.log('   Event Title:', response.data?.event?.title);
    });

    test('should list calendar events', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.calendar.listEvents({});

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(Array.isArray(response.data?.events)).toBe(true);

        // AskUserQuestion: Verify event listing
        console.log('✅ AskUserQuestion: Were calendar events listed successfully?');
        console.log('   Total Events:', response.data?.events?.length || 0);
    });

    test('should get upcoming events', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.calendar.getUpcomingEvents({
            withinMinutes: 60
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify upcoming events retrieval
        console.log('✅ AskUserQuestion: Were upcoming events retrieved successfully?');
        console.log('   Upcoming Events:', response.data?.events?.length || 0);
    });

    test('should mark event as complete', async () => {
        const codebolt = sharedCodebolt();

        // Create an event first
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - 1); // Past event

        const createResponse = await codebolt.calendar.createEvent({
            title: 'Test Event for Completion',
            eventType: 'reminder',
            startTime: startTime.toISOString(),
            hasDuration: false,
            createdByName: 'Test User',
            createdByType: 'user'
        });

        const eventId = createResponse.data?.event?.id || '';

        // Mark as complete
        const response = await codebolt.calendar.markEventComplete({
            eventId
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify event completion
        console.log('✅ AskUserQuestion: Was the event marked as complete successfully?');
        console.log('   Event Completed:', response.data?.event?.completed);
    });

    test('should RSVP to event', async () => {
        const codebolt = sharedCodebolt();

        // Create an event with participants
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);

        const createResponse = await codebolt.calendar.createEvent({
            title: 'Test Event with RSVP',
            eventType: 'meeting',
            startTime: startTime.toISOString(),
            hasDuration: false,
            createdByName: 'Test User',
            createdByType: 'user'
        });

        const eventId = createResponse.data?.event?.id || '';

        // RSVP to the event
        const response = await codebolt.calendar.rsvp({
            eventId,
            participantId: 'test-participant-123',
            status: 'accepted'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify RSVP
        console.log('✅ AskUserQuestion: Was RSVP recorded successfully?');
        console.log('   RSVP Status:', response.data?.event?.participants?.[0]?.status);
    });
});
