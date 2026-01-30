---
title: actionBlock
---

[**@codebolt/codeboltjs**](../README)

***

# Variable: actionBlock

```ts
const actionBlock: {
  getDetail: (actionBlockName: string) => Promise<GetActionBlockDetailResponse>;
  list: (filter?: ActionBlockFilter) => Promise<ActionBlockListResponse>;
  start: (actionBlockName: string, params?: Record<string, any>) => Promise<StartActionBlockResponse>;
};
```

Defined in: [packages/codeboltjs/src/modules/actionBlock.ts:81](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/actionBlock.ts#L81)

ActionBlock Module
Provides functionality for managing and executing ActionBlocks

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="getdetail"></a> `getDetail()` | (`actionBlockName`: `string`) => `Promise`\<[`GetActionBlockDetailResponse`](../interfaces/GetActionBlockDetailResponse)\> | Get detailed information about a specific ActionBlock | [packages/codeboltjs/src/modules/actionBlock.ts:103](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/actionBlock.ts#L103) |
| <a id="list"></a> `list()` | (`filter?`: [`ActionBlockFilter`](../interfaces/ActionBlockFilter)) => `Promise`\<[`ActionBlockListResponse`](../interfaces/ActionBlockListResponse)\> | List all available ActionBlocks | [packages/codeboltjs/src/modules/actionBlock.ts:87](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/actionBlock.ts#L87) |
| <a id="start"></a> `start()` | (`actionBlockName`: `string`, `params?`: `Record`\<`string`, `any`\>) => `Promise`\<[`StartActionBlockResponse`](../interfaces/StartActionBlockResponse)\> | Start an ActionBlock by name | [packages/codeboltjs/src/modules/actionBlock.ts:120](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/actionBlock.ts#L120) |
