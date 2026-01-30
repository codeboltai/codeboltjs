---
title: EventLogAppendResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: EventLogAppendResponse

Defined in: packages/codeboltjs/src/types/eventLog.ts:114

Event Log Types
Type definitions for event log operations

## Extends

- [`EventLogBaseResponse`](EventLogBaseResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `event`: [`EventLogEntry`](EventLogEntry); \} | [`EventLogBaseResponse`](EventLogBaseResponse).[`data`](EventLogBaseResponse.md#data) | - | [packages/codeboltjs/src/types/eventLog.ts:115](packages/codeboltjs/src/types/eventLog.ts#L115) |
| `data.event` | [`EventLogEntry`](EventLogEntry) | - | - | [packages/codeboltjs/src/types/eventLog.ts:115](packages/codeboltjs/src/types/eventLog.ts#L115) |
| <a id="error"></a> `error?` | `string` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`error`](EventLogBaseResponse.md#error) | [packages/codeboltjs/src/types/eventLog.ts:11](packages/codeboltjs/src/types/eventLog.ts#L11) |
| <a id="message"></a> `message?` | `string` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`message`](EventLogBaseResponse.md#message) | [packages/codeboltjs/src/types/eventLog.ts:10](packages/codeboltjs/src/types/eventLog.ts#L10) |
| <a id="requestid"></a> `requestId` | `string` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`requestId`](EventLogBaseResponse.md#requestid) | [packages/codeboltjs/src/types/eventLog.ts:13](packages/codeboltjs/src/types/eventLog.ts#L13) |
| <a id="success"></a> `success` | `boolean` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`success`](EventLogBaseResponse.md#success) | [packages/codeboltjs/src/types/eventLog.ts:8](packages/codeboltjs/src/types/eventLog.ts#L8) |
| <a id="timestamp"></a> `timestamp` | `string` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`timestamp`](EventLogBaseResponse.md#timestamp) | [packages/codeboltjs/src/types/eventLog.ts:12](packages/codeboltjs/src/types/eventLog.ts#L12) |
| <a id="type"></a> `type` | `string` | - | [`EventLogBaseResponse`](EventLogBaseResponse).[`type`](EventLogBaseResponse.md#type) | [packages/codeboltjs/src/types/eventLog.ts:7](packages/codeboltjs/src/types/eventLog.ts#L7) |
