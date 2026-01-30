---
title: UpdateIngestionPipelineParams
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: UpdateIngestionPipelineParams

Defined in: packages/codeboltjs/src/types/memoryIngestion.ts:95

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:97](packages/codeboltjs/src/types/memoryIngestion.ts#L97) |
| <a id="label"></a> `label?` | `string` | [packages/codeboltjs/src/types/memoryIngestion.ts:96](packages/codeboltjs/src/types/memoryIngestion.ts#L96) |
| <a id="processors"></a> `processors?` | [`IngestionProcessor`](IngestionProcessor)[] | [packages/codeboltjs/src/types/memoryIngestion.ts:101](packages/codeboltjs/src/types/memoryIngestion.ts#L101) |
| <a id="routing"></a> `routing?` | [`IngestionRouting`](IngestionRouting) | [packages/codeboltjs/src/types/memoryIngestion.ts:102](packages/codeboltjs/src/types/memoryIngestion.ts#L102) |
| <a id="status"></a> `status?` | `"active"` \| `"draft"` \| `"disabled"` | [packages/codeboltjs/src/types/memoryIngestion.ts:98](packages/codeboltjs/src/types/memoryIngestion.ts#L98) |
| <a id="trigger"></a> `trigger?` | [`IngestionTrigger`](../type-aliases/IngestionTrigger) | [packages/codeboltjs/src/types/memoryIngestion.ts:99](packages/codeboltjs/src/types/memoryIngestion.ts#L99) |
| <a id="trigger_config"></a> `trigger_config?` | `Record`\<`string`, `any`\> | [packages/codeboltjs/src/types/memoryIngestion.ts:100](packages/codeboltjs/src/types/memoryIngestion.ts#L100) |
