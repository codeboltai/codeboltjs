[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CalendarUpdatePayload

# Interface: CalendarUpdatePayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:74](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L74)

Payload for calendar update notifications

## Properties

### action

> **action**: `"deleted"` \| `"created"` \| `"updated"` \| `"reminder"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:79](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L79)

Action that occurred

***

### calendarEventId

> **calendarEventId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:77](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L77)

ID of the calendar event

***

### description?

> `optional` **description**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:87](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L87)

Additional event details

***

### endTime?

> `optional` **endTime**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:85](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L85)

Event end time (ISO string)

***

### eventTitle?

> `optional` **eventTitle**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:81](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L81)

Title of the calendar event

***

### location?

> `optional` **location**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:89](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L89)

Location of the event

***

### startTime?

> `optional` **startTime**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:83](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L83)

Event start time (ISO string)

***

### type

> **type**: `"calendarUpdate"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:75](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L75)
