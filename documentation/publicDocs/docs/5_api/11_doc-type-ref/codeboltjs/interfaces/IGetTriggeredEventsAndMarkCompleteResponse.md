---
title: IGetTriggeredEventsAndMarkCompleteResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: IGetTriggeredEventsAndMarkCompleteResponse

Defined in: [packages/codeboltjs/src/modules/calendar.ts:241](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L241)

## Extends

- [`CalendarResponse`](CalendarResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `string` | - | [`CalendarResponse`](CalendarResponse).[`code`](CalendarResponse.md#code) | [packages/codeboltjs/src/modules/calendar.ts:170](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L170) |
| <a id="data"></a> `data?` | \{ `count`: `number`; `events`: [`CalendarEvent`](CalendarEvent)[]; \} | [`CalendarResponse`](CalendarResponse).[`data`](CalendarResponse.md#data) | - | [packages/codeboltjs/src/modules/calendar.ts:242](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L242) |
| `data.count` | `number` | - | - | [packages/codeboltjs/src/modules/calendar.ts:244](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L244) |
| `data.events` | [`CalendarEvent`](CalendarEvent)[] | - | - | [packages/codeboltjs/src/modules/calendar.ts:243](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L243) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | - | [`CalendarResponse`](CalendarResponse).[`error`](CalendarResponse.md#error) | [packages/codeboltjs/src/modules/calendar.ts:173](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L173) |
| `error.code` | `string` | - | - | [packages/codeboltjs/src/modules/calendar.ts:174](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L174) |
| `error.details?` | `any` | - | - | [packages/codeboltjs/src/modules/calendar.ts:176](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L176) |
| `error.message` | `string` | - | - | [packages/codeboltjs/src/modules/calendar.ts:175](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L175) |
| <a id="message"></a> `message` | `string` | - | [`CalendarResponse`](CalendarResponse).[`message`](CalendarResponse.md#message) | [packages/codeboltjs/src/modules/calendar.ts:171](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L171) |
| <a id="success"></a> `success` | `boolean` | - | [`CalendarResponse`](CalendarResponse).[`success`](CalendarResponse.md#success) | [packages/codeboltjs/src/modules/calendar.ts:169](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/calendar.ts#L169) |
