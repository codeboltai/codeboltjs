---
title: IngestionPipeline
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: IngestionPipeline

Defined in: packages/codeboltjs/src/types/memoryIngestion.ts:50

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="createdat"></a> `createdAt` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:59](packages/codeboltjs/src/types/memoryIngestion.ts#L59) |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:53](packages/codeboltjs/src/types/memoryIngestion.ts#L53) |
| <a id="id"></a> `id` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:51](packages/codeboltjs/src/types/memoryIngestion.ts#L51) |
| <a id="label"></a> `label` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:52](packages/codeboltjs/src/types/memoryIngestion.ts#L52) |
| <a id="processors"></a> `processors` | [`IngestionProcessor`](IngestionProcessor)[] | [packages/codeboltjs/src/types/memoryIngestion.ts:57](packages/codeboltjs/src/types/memoryIngestion.ts#L57) |
| <a id="routing"></a> `routing` | [`IngestionRouting`](IngestionRouting) | [packages/codeboltjs/src/types/memoryIngestion.ts:58](packages/codeboltjs/src/types/memoryIngestion.ts#L58) |
| <a id="status"></a> `status` | `"active"` \| `"draft"` \| `"disabled"` | [packages/codeboltjs/src/types/memoryIngestion.ts:54](packages/codeboltjs/src/types/memoryIngestion.ts#L54) |
| <a id="trigger"></a> `trigger` | [`IngestionTrigger`](../type-aliases/IngestionTrigger) | [packages/codeboltjs/src/types/memoryIngestion.ts:55](packages/codeboltjs/src/types/memoryIngestion.ts#L55) |
| <a id="trigger_config"></a> `trigger_config?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/types/memoryIngestion.ts:56](packages/codeboltjs/src/types/memoryIngestion.ts#L56) |
| <a id="updatedat"></a> `updatedAt` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:60](packages/codeboltjs/src/types/memoryIngestion.ts#L60) |
