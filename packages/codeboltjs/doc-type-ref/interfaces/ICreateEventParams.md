---
title: ICreateEventParams
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: ICreateEventParams

Defined in: [packages/codeboltjs/src/modules/calendar.ts:62](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L62)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="agenda"></a> `agenda?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:79](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L79) |
| <a id="agentexecutionid"></a> `agentExecutionId?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:87](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L87) |
| <a id="allday"></a> `allDay?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:69](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L69) |
| <a id="checktype"></a> `checkType?` | [`CalendarCheckType`](../type-aliases/CalendarCheckType) | [packages/codeboltjs/src/modules/calendar.ts:80](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L80) |
| <a id="createdbyid"></a> `createdById?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:84](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L84) |
| <a id="createdbyname"></a> `createdByName?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:85](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L85) |
| <a id="createdbytype"></a> `createdByType?` | [`CalendarParticipantType`](../type-aliases/CalendarParticipantType) | [packages/codeboltjs/src/modules/calendar.ts:86](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L86) |
| <a id="cronexpression"></a> `cronExpression?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:73](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L73) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:64](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L64) |
| <a id="endtime"></a> `endTime?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:67](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L67) |
| <a id="eventtype"></a> `eventType?` | [`CalendarEventType`](../type-aliases/CalendarEventType) | [packages/codeboltjs/src/modules/calendar.ts:65](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L65) |
| <a id="hasduration"></a> `hasDuration?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:68](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L68) |
| <a id="isrecurring"></a> `isRecurring?` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:72](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L72) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/modules/calendar.ts:82](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L82) |
| <a id="participants"></a> `participants?` | [`CalendarParticipant`](CalendarParticipant)[] | [packages/codeboltjs/src/modules/calendar.ts:71](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L71) |
| <a id="recurrenceendtime"></a> `recurrenceEndTime?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:74](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L74) |
| <a id="reminder"></a> `reminder?` | \{ `enabled`: `boolean`; `minutesBefore`: `number`; \} | [packages/codeboltjs/src/modules/calendar.ts:75](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L75) |
| `reminder.enabled` | `boolean` | [packages/codeboltjs/src/modules/calendar.ts:76](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L76) |
| `reminder.minutesBefore` | `number` | [packages/codeboltjs/src/modules/calendar.ts:77](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L77) |
| <a id="starttime"></a> `startTime` | `string` | [packages/codeboltjs/src/modules/calendar.ts:66](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L66) |
| <a id="swarmid"></a> `swarmId?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:70](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L70) |
| <a id="tags"></a> `tags?` | `string`[] | [packages/codeboltjs/src/modules/calendar.ts:81](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L81) |
| <a id="threadid"></a> `threadId?` | `string` | [packages/codeboltjs/src/modules/calendar.ts:88](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L88) |
| <a id="title"></a> `title` | `string` | [packages/codeboltjs/src/modules/calendar.ts:63](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L63) |
