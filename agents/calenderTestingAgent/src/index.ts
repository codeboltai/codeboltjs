import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';

// ================================
// CALENDAR TESTING AGENT
// ================================

const logResult = (testName: string, result: any) => {
    console.log(`\n=== ${testName} ===`);
    console.log(JSON.stringify(result, null, 2));
};

const logError = (testName: string, error: any) => {
    console.error(`\n=== ${testName} FAILED ===`);
    console.error(error);
};

// ================================
// MAIN AGENT ENTRY POINT
// ================================

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    try {
        codebolt.chat.sendMessage('🗓️ Starting Calendar Module Tests...\n');
          const response = await codebolt.llm.inference({
                messages: [
                    { role: 'system', content: 'You are a precise conversation compression assistant.' },
                    { role: 'user', content: "hi" }
                ],
                // temperature for more consistent summaries
            });
            codebolt.chat.sendMessage(JSON.stringify(response))
return true
        // let createdEventId: string | undefined;
        // let createdEventIds: string[] = [];

        // // ================================
        // // TEST 1: Get Status
        // // ================================
        // // try {
        // //     const statusResult = await codebolt.calendar.getStatus();
        // //     codebolt.chat.sendMessage('TEST 1: getStatus', statusResult);
        // // } catch (error) {
        // //     logError('TEST 1: getStatus', error);
        // // }

        // // ================================
        // // TEST 2: Create Event
        // // ================================
        // try {
        //     const createResult = await codebolt.calendar.createEvent({
        //         title: 'Test Meeting',
        //         description: 'This is a test calendar event',
        //         eventType: 'meeting',
        //         startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        //         endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        //         hasDuration: true,
        //         participants: [
        //             {
        //                 id: 'agent-1',
        //                 name: 'Test Agent',
        //                 type: 'agent',
        //                 status: 'pending'
        //             }
        //         ],
        //         reminder: {
        //             enabled: true,
        //             minutesBefore: 15
        //         },
        //         tags: ['test', 'meeting'],
        //         metadata: { testKey: 'testValue' },
        //         createdById: 'test-agent',
        //         createdByName: 'Calendar Test Agent',
        //         createdByType: 'agent'
        //     });
        //     codebolt.chat.sendMessage('TEST 2: createEvent', createResult);
        //     logResult('TEST 2: createEvent', createResult);
        //     createdEventId = createResult.data?.event?.id;
        //     if (createdEventId) createdEventIds.push(createdEventId);
        // } catch (error) {
        //     logError('TEST 2: createEvent', error);
        // }

        // // ================================
        // // TEST 3: Create Additional Events for Batch Testing
        // // ================================
        // try {
        //     const event2 = await codebolt.calendar.createEvent({
        //         title: 'Test Reminder',
        //         eventType: 'reminder',
        //         startTime: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
        //         hasDuration: false,
        //         createdById: 'test-agent',
        //         createdByName: 'Calendar Test Agent',
        //         createdByType: 'agent'
        //     });
        //     logResult('TEST 3a: createEvent (reminder)', event2);
        //     if (event2.data?.event?.id) createdEventIds.push(event2.data.event.id);

        //     const event3 = await codebolt.calendar.createEvent({
        //         title: 'Test Deadline',
        //         eventType: 'deadline',
        //         startTime: new Date(Date.now() - 60000).toISOString(), // 1 min ago (triggered)
        //         hasDuration: false,
        //         createdById: 'test-agent',
        //         createdByName: 'Calendar Test Agent',
        //         createdByType: 'agent'
        //     });
        //     logResult('TEST 3b: createEvent (deadline - past)', event3);
        //     if (event3.data?.event?.id) createdEventIds.push(event3.data.event.id);
        // } catch (error) {
        //     logError('TEST 3: createEvent (additional)', error);
        // }

        // // ================================
        // // TEST 4: Get Event
        // // ================================
        // if (createdEventId) {
        //     try {
        //         const getResult = await codebolt.calendar.getEvent({ eventId: createdEventId });
        //         logResult('TEST 4: getEvent', getResult);
        //     } catch (error) {
        //         logError('TEST 4: getEvent', error);
        //     }
        // }

        // // ================================
        // // TEST 5: Update Event
        // // ================================
        // if (createdEventId) {
        //     try {
        //         const updateResult = await codebolt.calendar.updateEvent({
        //             eventId: createdEventId,
        //             title: 'Updated Test Meeting',
        //             description: 'Updated description for the test event',
        //             tags: ['test', 'meeting', 'updated']
        //         });
        //         logResult('TEST 5: updateEvent', updateResult);
        //     } catch (error) {
        //         logError('TEST 5: updateEvent', error);
        //     }
        // }

        // // ================================
        // // TEST 6: List Events
        // // ================================
        // try {
        //     const listResult = await codebolt.calendar.listEvents({
        //         tags: ['test']
        //     });
        //     logResult('TEST 6: listEvents', listResult);
        // } catch (error) {
        //     logError('TEST 6: listEvents', error);
        // }

        // // ================================
        // // TEST 7: Get Events In Range
        // // ================================
        // try {
        //     const rangeResult = await codebolt.calendar.getEventsInRange({
        //         startDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        //         endDate: new Date(Date.now() + 86400000).toISOString() // 1 day from now
        //     });
        //     logResult('TEST 7: getEventsInRange', rangeResult);
        // } catch (error) {
        //     logError('TEST 7: getEventsInRange', error);
        // }

        // // ================================
        // // TEST 8: Get Upcoming Events
        // // ================================
        // try {
        //     const upcomingResult = await codebolt.calendar.getUpcomingEvents({
        //         withinMinutes: 120
        //     });
        //     logResult('TEST 8: getUpcomingEvents', upcomingResult);
        // } catch (error) {
        //     logError('TEST 8: getUpcomingEvents', error);
        // }

        // // ================================
        // // TEST 9: Get Triggered Events
        // // ================================
        // try {
        //     const triggeredResult = await codebolt.calendar.getTriggeredEvents({
        //         includeCompleted: false
        //     });
        //     logResult('TEST 9: getTriggeredEvents', triggeredResult);
        // } catch (error) {
        //     logError('TEST 9: getTriggeredEvents', error);
        // }

        // // ================================
        // // TEST 10: Mark Event Complete
        // // ================================
        // if (createdEventIds.length > 0) {
        //     try {
        //         const markCompleteResult = await codebolt.calendar.markEventComplete({
        //             eventId: createdEventIds[createdEventIds.length - 1] // Mark the past event as complete
        //         });
        //         logResult('TEST 10: markEventComplete', markCompleteResult);
        //     } catch (error) {
        //         logError('TEST 10: markEventComplete', error);
        //     }
        // }

        // // ================================
        // // TEST 11: Mark Multiple Events Complete
        // // ================================
        // if (createdEventIds.length >= 2) {
        //     try {
        //         const markMultipleResult = await codebolt.calendar.markEventsComplete({
        //             eventIds: createdEventIds.slice(0, 2)
        //         });
        //         logResult('TEST 11: markEventsComplete', markMultipleResult);
        //     } catch (error) {
        //         logError('TEST 11: markEventsComplete', error);
        //     }
        // }

        // // ================================
        // // TEST 12: RSVP
        // // ================================
        // if (createdEventId) {
        //     try {
        //         const rsvpResult = await codebolt.calendar.rsvp({
        //             eventId: createdEventId,
        //             participantId: 'agent-1',
        //             status: 'accepted'
        //         });
        //         logResult('TEST 12: rsvp', rsvpResult);
        //     } catch (error) {
        //         logError('TEST 12: rsvp', error);
        //     }
        // }

        // // ================================
        // // TEST 13: Get Triggered Events and Mark Complete
        // // ================================
        // try {
        //     const triggeredAndCompleteResult = await codebolt.calendar.getTriggeredEventsAndMarkComplete();
        //     logResult('TEST 13: getTriggeredEventsAndMarkComplete', triggeredAndCompleteResult);
        // } catch (error) {
        //     logError('TEST 13: getTriggeredEventsAndMarkComplete', error);
        // }

        // // ================================
        // // TEST 14: Delete Event (Cleanup)
        // // ================================
        // for (const eventId of createdEventIds) {
        //     try {
        //         const deleteResult = await codebolt.calendar.deleteEvent({ eventId });
        //         logResult(`TEST 14: deleteEvent (${eventId})`, deleteResult);
        //     } catch (error) {
        //         logError(`TEST 14: deleteEvent (${eventId})`, error);
        //     }
        // }

        // // ================================
        // // Final Status Check
        // // ================================
        // try {
        //     const finalStatus = await codebolt.calendar.getStatus();
        //     logResult('FINAL: getStatus', finalStatus);
        // } catch (error) {
        //     logError('FINAL: getStatus', error);
        // }

        // console.log('\n✅ Calendar Module Tests Completed!\n');
        // return 'Calendar testing completed successfully';

    } catch (error) {
        console.error('❌ Calendar Testing Failed:', error);
        return `Calendar testing failed: ${error}`;
    }
});
