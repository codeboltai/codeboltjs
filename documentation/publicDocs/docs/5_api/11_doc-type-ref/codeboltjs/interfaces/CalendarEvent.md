---
title: CalendarEvent
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: CalendarEvent

Defined in: [packages/codeboltjs/src/modules/calendar.ts:29](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L29)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agenda"></a> `agenda?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:47](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L47) |
| <a id="allday"></a> `allDay?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:37](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L37) |
| <a id="checktype"></a> `checkType?` | [`CalendarCheckType`](../type-aliases/CalendarCheckType) | [packages/codeboltjs/src/modules/calendar.ts:48](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L48) |
| <a id="completed"></a> `completed?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:51](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L51) |
| <a id="completedat"></a> `completedAt?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:52](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L52) |
| <a id="createdat"></a> `createdAt` | `string` | [packages/codeboltjs/src/modules/calendar.ts:53](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L53) |
| <a id="createdby"></a> `createdBy` | [`CalendarParticipant`](CalendarParticipant) | [packages/codeboltjs/src/modules/calendar.ts:55](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L55) |
| <a id="cronexpression"></a> `cronExpression?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:41](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L41) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:32](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L32) |
| <a id="endtime"></a> `endTime?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:35](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L35) |
| <a id="eventtype"></a> `eventType` | [`CalendarEventType`](../type-aliases/CalendarEventType) | [packages/codeboltjs/src/modules/calendar.ts:33](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L33) |
| <a id="hasduration"></a> `hasDuration` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:36](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L36) |
| <a id="id"></a> `id` | `string` | [packages/codeboltjs/src/modules/calendar.ts:30](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L30) |
| <a id="isrecurring"></a> `isRecurring?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:40](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L40) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/modules/calendar.ts:50](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L50) |
| <a id="participants"></a> `participants?` | [`CalendarParticipant`](CalendarParticipant)[] | [packages/codeboltjs/src/modules/calendar.ts:39](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L39) |
| <a id="recurrenceendtime"></a> `recurrenceEndTime?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:42](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L42) |
| <a id="reminder"></a> `reminder?` | \{ `enabled`: `boolean`; `minutesBefore`: `number`; \} | [packages/codeboltjs/src/modules/calendar.ts:43](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L43) |
| `reminder.enabled` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:44](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L44) |
| `reminder.minutesBefore` | `number` | [packages/codeboltjs/src/modules/calendar.ts:45](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L45) |
| <a id="starttime"></a> `startTime` | `string` | [packages/codeboltjs/src/modules/calendar.ts:34](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L34) |
| <a id="swarmid"></a> `swarmId?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:38](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L38) |
| <a id="tags"></a> `tags?` | `string`[] | [packages/codeboltjs/src/modules/calendar.ts:49](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L49) |
| <a id="title"></a> `title` | `string` | [packages/codeboltjs/src/modules/calendar.ts:31](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L31) |
| <a id="updatedat"></a> `updatedAt` | `string` | [packages/codeboltjs/src/modules/calendar.ts:54](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L54) |
