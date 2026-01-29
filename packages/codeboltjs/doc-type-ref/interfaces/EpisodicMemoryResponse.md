---
title: EpisodicMemoryResponse
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: EpisodicMemoryResponse

Defined in: [packages/codeboltjs/src/modules/episodicMemory.ts:115](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L115)

## Extended by

- [`ICreateMemoryResponse`](ICreateMemoryResponse)
- [`IListMemoriesResponse`](IListMemoriesResponse)
- [`IGetMemoryResponse`](IGetMemoryResponse)
- [`IAppendEventResponse`](IAppendEventResponse)
- [`IQueryEventsResponse`](IQueryEventsResponse)
- [`IGetEventTypesResponse`](IGetEventTypesResponse)
- [`IGetTagsResponse`](IGetTagsResponse)
- [`IGetAgentsResponse`](IGetAgentsResponse)
- [`IArchiveMemoryResponse`](IArchiveMemoryResponse)
- [`IUnarchiveMemoryResponse`](IUnarchiveMemoryResponse)
- [`IUpdateTitleResponse`](IUpdateTitleResponse)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data"></a> `data?` | `any` | [packages/codeboltjs/src/modules/episodicMemory.ts:118](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L118) |
| <a id="error"></a> `error?` | \{ `code`: `string`; `details?`: `any`; `message`: `string`; \} | [packages/codeboltjs/src/modules/episodicMemory.ts:119](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L119) |
| `error.code` | `string` | [packages/codeboltjs/src/modules/episodicMemory.ts:120](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L120) |
| `error.details?` | `any` | [packages/codeboltjs/src/modules/episodicMemory.ts:122](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L122) |
| `error.message` | `string` | [packages/codeboltjs/src/modules/episodicMemory.ts:121](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L121) |
| <a id="requestid"></a> `requestId?` | `string` | [packages/codeboltjs/src/modules/episodicMemory.ts:117](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L117) |
| <a id="success"></a> `success` | `boolean` | [packages/codeboltjs/src/modules/episodicMemory.ts:116](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/episodicMemory.ts#L116) |
