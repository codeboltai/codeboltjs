[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / actionBlock

# Variable: actionBlock

> `const` **actionBlock**: `object`

Defined in: [packages/codeboltjs/src/modules/actionBlock.ts:81](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/actionBlock.ts#L81)

ActionBlock Module
Provides functionality for managing and executing ActionBlocks

## Type Declaration

### getDetail()

> **getDetail**: (`actionBlockName`) => `Promise`\<[`GetActionBlockDetailResponse`](../interfaces/GetActionBlockDetailResponse.md)\>

Get detailed information about a specific ActionBlock

#### Parameters

##### actionBlockName

`string`

Name of the ActionBlock to retrieve

#### Returns

`Promise`\<[`GetActionBlockDetailResponse`](../interfaces/GetActionBlockDetailResponse.md)\>

Promise resolving to ActionBlock details

### list()

> **list**: (`filter?`) => `Promise`\<[`ActionBlockListResponse`](../interfaces/ActionBlockListResponse.md)\>

List all available ActionBlocks

#### Parameters

##### filter?

[`ActionBlockFilter`](../interfaces/ActionBlockFilter.md)

Optional filter to narrow results by type

#### Returns

`Promise`\<[`ActionBlockListResponse`](../interfaces/ActionBlockListResponse.md)\>

Promise resolving to list of ActionBlocks

### start()

> **start**: (`actionBlockName`, `params?`) => `Promise`\<[`StartActionBlockResponse`](../interfaces/StartActionBlockResponse.md)\>

Start an ActionBlock by name

#### Parameters

##### actionBlockName

`string`

Name of the ActionBlock to start

##### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the ActionBlock

#### Returns

`Promise`\<[`StartActionBlockResponse`](../interfaces/StartActionBlockResponse.md)\>

Promise resolving to execution result
