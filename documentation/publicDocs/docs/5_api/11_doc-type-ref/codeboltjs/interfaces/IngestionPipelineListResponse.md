---
title: IngestionPipelineListResponse
---

[**@codebolt/codeboltjs**](../README)

***

# Interface: IngestionPipelineListResponse

Defined in: [packages/codeboltjs/src/types/memoryIngestion.ts:126](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L126)

Memory Ingestion Types
Type definitions for memory ingestion pipeline operations

## Extends

- [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse)

## Properties

| Property | Type | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="data"></a> `data?` | \{ `pipelines`: [`IngestionPipeline`](IngestionPipeline)[]; \} | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`data`](MemoryIngestionBaseResponse.md#data) | - | [packages/codeboltjs/src/types/memoryIngestion.ts:127](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L127) |
| `data.pipelines` | [`IngestionPipeline`](IngestionPipeline)[] | - | - | [packages/codeboltjs/src/types/memoryIngestion.ts:127](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L127) |
| <a id="error"></a> `error?` | `string` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`error`](MemoryIngestionBaseResponse.md#error) | [packages/codeboltjs/src/types/memoryIngestion.ts:11](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L11) |
| <a id="message"></a> `message?` | `string` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`message`](MemoryIngestionBaseResponse.md#message) | [packages/codeboltjs/src/types/memoryIngestion.ts:10](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L10) |
| <a id="requestid"></a> `requestId` | `string` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`requestId`](MemoryIngestionBaseResponse.md#requestid) | [packages/codeboltjs/src/types/memoryIngestion.ts:13](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L13) |
| <a id="success"></a> `success` | `boolean` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`success`](MemoryIngestionBaseResponse.md#success) | [packages/codeboltjs/src/types/memoryIngestion.ts:8](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L8) |
| <a id="timestamp"></a> `timestamp` | `string` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`timestamp`](MemoryIngestionBaseResponse.md#timestamp) | [packages/codeboltjs/src/types/memoryIngestion.ts:12](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L12) |
| <a id="type"></a> `type` | `string` | - | [`MemoryIngestionBaseResponse`](MemoryIngestionBaseResponse).[`type`](MemoryIngestionBaseResponse.md#type) | [packages/codeboltjs/src/types/memoryIngestion.ts:7](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/memoryIngestion.ts#L7) |
