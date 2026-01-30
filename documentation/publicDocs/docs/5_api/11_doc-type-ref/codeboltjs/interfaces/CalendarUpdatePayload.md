---
title: CalendarUpdatePayload
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: CalendarUpdatePayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:74](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L74)

Payload for calendar update notifications

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="action"></a> `action` | `"deleted"` \| `"created"` \| `"updated"` \| `"reminder"` | Action that occurred | [packages/codeboltjs/src/types/agentEventQueue.ts:79](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L79) |
| <a id="calendareventid"></a> `calendarEventId` | `string` | ID of the calendar event | [packages/codeboltjs/src/types/agentEventQueue.ts:77](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L77) |
| <a id="description"></a> `description?` | `string` | Additional event details | [packages/codeboltjs/src/types/agentEventQueue.ts:87](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L87) |
| <a id="endtime"></a> `endTime?` | `string` | Event end time (ISO string) | [packages/codeboltjs/src/types/agentEventQueue.ts:85](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L85) |
| <a id="eventtitle"></a> `eventTitle?` | `string` | Title of the calendar event | [packages/codeboltjs/src/types/agentEventQueue.ts:81](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L81) |
| <a id="location"></a> `location?` | `string` | Location of the event | [packages/codeboltjs/src/types/agentEventQueue.ts:89](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L89) |
| <a id="starttime"></a> `startTime?` | `string` | Event start time (ISO string) | [packages/codeboltjs/src/types/agentEventQueue.ts:83](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L83) |
| <a id="type"></a> `type` | `"calendarUpdate"` | - | [packages/codeboltjs/src/types/agentEventQueue.ts:75](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/agentEventQueue.ts#L75) |
