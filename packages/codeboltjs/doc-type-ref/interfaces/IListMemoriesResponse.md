---
title: IListMemoriesResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: IListMemoriesResponse

Defined in: [packages/codeboltjs/src/modules/episodicMemory.ts:130](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L130)

## Extends

- [`EpisodicMemoryResponse`](EpisodicMemoryResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | [`EpisodicMemory`](EpisodicMemory)[] | [`EpisodicMemoryResponse`](EpisodicMemoryResponse).[`data`](EpisodicMemoryResponse.md#data) | - | [packages/codeboltjs/src/modules/episodicMemory.ts:131](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L131) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | - | [`EpisodicMemoryResponse`](EpisodicMemoryResponse).[`error`](EpisodicMemoryResponse.md#error) | [packages/codeboltjs/src/modules/episodicMemory.ts:119](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L119) |
| `error.code` | `string` | - | - | [packages/codeboltjs/src/modules/episodicMemory.ts:120](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L120) |
| `error.details?` | `any` | - | - | [packages/codeboltjs/src/modules/episodicMemory.ts:122](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L122) |
| `error.message` | `string` | - | - | [packages/codeboltjs/src/modules/episodicMemory.ts:121](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L121) |
| <a id="requestid"></a> `requestId?` | `string` | - | [`EpisodicMemoryResponse`](EpisodicMemoryResponse).[`requestId`](EpisodicMemoryResponse.md#requestid) | [packages/codeboltjs/src/modules/episodicMemory.ts:117](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L117) |
| <a id="success"></a> `success` | `boolean` | - | [`EpisodicMemoryResponse`](EpisodicMemoryResponse).[`success`](EpisodicMemoryResponse.md#success) | [packages/codeboltjs/src/modules/episodicMemory.ts:116](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L116) |
