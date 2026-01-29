---
title: IMarkEventCompleteResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: IMarkEventCompleteResponse

Defined in: [packages/codeboltjs/src/modules/calendar.ts:228](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L228)

## Extends

- [`CalendarResponse`](CalendarResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `string` | - | [`CalendarResponse`](CalendarResponse).[`code`](CalendarResponse.md#code) | [packages/codeboltjs/src/modules/calendar.ts:170](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L170) |
| <a id="data"></a> `data?` | \{ `event`: [`CalendarEvent`](CalendarEvent); \} | [`CalendarResponse`](CalendarResponse).[`data`](CalendarResponse.md#data) | - | [packages/codeboltjs/src/modules/calendar.ts:229](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L229) |
| `data.event` | [`CalendarEvent`](CalendarEvent) | - | - | [packages/codeboltjs/src/modules/calendar.ts:230](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L230) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | - | [`CalendarResponse`](CalendarResponse).[`error`](CalendarResponse.md#error) | [packages/codeboltjs/src/modules/calendar.ts:173](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L173) |
| `error.code` | `string` | - | - | [packages/codeboltjs/src/modules/calendar.ts:174](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L174) |
| `error.details?` | `any` | - | - | [packages/codeboltjs/src/modules/calendar.ts:176](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L176) |
| `error.message` | `string` | - | - | [packages/codeboltjs/src/modules/calendar.ts:175](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L175) |
| <a id="message"></a> `message` | `string` | - | [`CalendarResponse`](CalendarResponse).[`message`](CalendarResponse.md#message) | [packages/codeboltjs/src/modules/calendar.ts:171](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L171) |
| <a id="success"></a> `success` | `boolean` | - | [`CalendarResponse`](CalendarResponse).[`success`](CalendarResponse.md#success) | [packages/codeboltjs/src/modules/calendar.ts:169](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/calendar.ts#L169) |
