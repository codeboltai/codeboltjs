[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [calendar.ts:267](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L267)

## Type Declaration

### createEvent()

> **createEvent**: (`params`) => `Promise`\<[`ICreateEventResponse`](../interfaces/ICreateEventResponse.md)\>

Create a new calendar event

#### Parameters

##### params

[`ICreateEventParams`](../interfaces/ICreateEventParams.md)

Event creation parameters

#### Returns

`Promise`\<[`ICreateEventResponse`](../interfaces/ICreateEventResponse.md)\>

Promise resolving to the created event

### deleteEvent()

> **deleteEvent**: (`params`) => `Promise`\<[`IDeleteEventResponse`](../interfaces/IDeleteEventResponse.md)\>

Delete a calendar event

#### Parameters

##### params

[`IDeleteEventParams`](../interfaces/IDeleteEventParams.md)

Parameters including eventId

#### Returns

`Promise`\<[`IDeleteEventResponse`](../interfaces/IDeleteEventResponse.md)\>

Promise resolving to deletion confirmation

### getEvent()

> **getEvent**: (`params`) => `Promise`\<[`IGetEventResponse`](../interfaces/IGetEventResponse.md)\>

Get a single calendar event by ID

#### Parameters

##### params

[`IGetEventParams`](../interfaces/IGetEventParams.md)

Parameters including eventId

#### Returns

`Promise`\<[`IGetEventResponse`](../interfaces/IGetEventResponse.md)\>

Promise resolving to the event

### getEventsInRange()

> **getEventsInRange**: (`params`) => `Promise`\<[`IGetEventsInRangeResponse`](../interfaces/IGetEventsInRangeResponse.md)\>

Get events within a specific date range

#### Parameters

##### params

[`IGetEventsInRangeParams`](../interfaces/IGetEventsInRangeParams.md)

Parameters including startDate and endDate

#### Returns

`Promise`\<[`IGetEventsInRangeResponse`](../interfaces/IGetEventsInRangeResponse.md)\>

Promise resolving to events in range

### getStatus()

> **getStatus**: () => `Promise`\<[`IGetStatusResponse`](../interfaces/IGetStatusResponse.md)\>

Get the calendar scheduler status

#### Returns

`Promise`\<[`IGetStatusResponse`](../interfaces/IGetStatusResponse.md)\>

Promise resolving to scheduler status information

### getTriggeredEvents()

> **getTriggeredEvents**: (`params`) => `Promise`\<[`IGetTriggeredEventsResponse`](../interfaces/IGetTriggeredEventsResponse.md)\>

Get triggered events (events whose start time has passed)

#### Parameters

##### params

[`IGetTriggeredEventsParams`](../interfaces/IGetTriggeredEventsParams.md) = `{}`

Optional parameters including includeCompleted flag

#### Returns

`Promise`\<[`IGetTriggeredEventsResponse`](../interfaces/IGetTriggeredEventsResponse.md)\>

Promise resolving to triggered events

### getTriggeredEventsAndMarkComplete()

> **getTriggeredEventsAndMarkComplete**: () => `Promise`\<[`IGetTriggeredEventsAndMarkCompleteResponse`](../interfaces/IGetTriggeredEventsAndMarkCompleteResponse.md)\>

Get triggered events and mark them all as complete in one operation

#### Returns

`Promise`\<[`IGetTriggeredEventsAndMarkCompleteResponse`](../interfaces/IGetTriggeredEventsAndMarkCompleteResponse.md)\>

Promise resolving to the events that were retrieved and marked complete

### getUpcomingEvents()

> **getUpcomingEvents**: (`params`) => `Promise`\<[`IGetUpcomingEventsResponse`](../interfaces/IGetUpcomingEventsResponse.md)\>

Get upcoming events within a specified time window

#### Parameters

##### params

[`IGetUpcomingEventsParams`](../interfaces/IGetUpcomingEventsParams.md) = `{}`

Optional parameters including withinMinutes (default: 60)

#### Returns

`Promise`\<[`IGetUpcomingEventsResponse`](../interfaces/IGetUpcomingEventsResponse.md)\>

Promise resolving to upcoming events

### listEvents()

> **listEvents**: (`params`) => `Promise`\<[`IListEventsResponse`](../interfaces/IListEventsResponse.md)\>

List calendar events with optional filters

#### Parameters

##### params

[`IListEventsParams`](../interfaces/IListEventsParams.md) = `{}`

Optional filter parameters

#### Returns

`Promise`\<[`IListEventsResponse`](../interfaces/IListEventsResponse.md)\>

Promise resolving to list of events

### markEventComplete()

> **markEventComplete**: (`params`) => `Promise`\<[`IMarkEventCompleteResponse`](../interfaces/IMarkEventCompleteResponse.md)\>

Mark a single event as complete

#### Parameters

##### params

[`IMarkEventCompleteParams`](../interfaces/IMarkEventCompleteParams.md)

Parameters including eventId

#### Returns

`Promise`\<[`IMarkEventCompleteResponse`](../interfaces/IMarkEventCompleteResponse.md)\>

Promise resolving to the completed event

### markEventsComplete()

> **markEventsComplete**: (`params`) => `Promise`\<[`IMarkEventsCompleteResponse`](../interfaces/IMarkEventsCompleteResponse.md)\>

Mark multiple events as complete

#### Parameters

##### params

[`IMarkEventsCompleteParams`](../interfaces/IMarkEventsCompleteParams.md)

Parameters including array of eventIds

#### Returns

`Promise`\<[`IMarkEventsCompleteResponse`](../interfaces/IMarkEventsCompleteResponse.md)\>

Promise resolving to the completed events

### rsvp()

> **rsvp**: (`params`) => `Promise`\<[`IRSVPResponse`](../interfaces/IRSVPResponse.md)\>

RSVP to a calendar event

#### Parameters

##### params

[`IRSVPParams`](../interfaces/IRSVPParams.md)

Parameters including eventId, participantId, and status

#### Returns

`Promise`\<[`IRSVPResponse`](../interfaces/IRSVPResponse.md)\>

Promise resolving to the updated event

### updateEvent()

> **updateEvent**: (`params`) => `Promise`\<[`IUpdateEventResponse`](../interfaces/IUpdateEventResponse.md)\>

Update an existing calendar event

#### Parameters

##### params

[`IUpdateEventParams`](../interfaces/IUpdateEventParams.md)

Event update parameters including eventId

#### Returns

`Promise`\<[`IUpdateEventResponse`](../interfaces/IUpdateEventResponse.md)\>

Promise resolving to the updated event
