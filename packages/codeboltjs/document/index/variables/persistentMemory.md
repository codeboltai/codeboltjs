[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / persistentMemory

# Variable: persistentMemory

> `const` **persistentMemory**: `object`

Defined in: [packages/codeboltjs/src/modules/persistentMemory.ts:20](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/persistentMemory.ts#L20)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Create a new persistent memory configuration

#### Parameters

##### config

[`CreatePersistentMemoryParams`](../interfaces/CreatePersistentMemoryParams.md)

Memory configuration

#### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

### delete()

> **delete**: (`memoryId`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Delete a persistent memory

#### Parameters

##### memoryId

`string`

Memory ID

#### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

### executeRetrieval()

> **executeRetrieval**: (`memoryId`, `intent`) => `Promise`\<[`PersistentMemoryExecuteResponse`](../interfaces/PersistentMemoryExecuteResponse.md)\>

Execute memory retrieval pipeline

#### Parameters

##### memoryId

`string`

Memory ID

##### intent

[`PipelineExecutionIntent`](../interfaces/PipelineExecutionIntent.md)

Execution intent with context

#### Returns

`Promise`\<[`PersistentMemoryExecuteResponse`](../interfaces/PersistentMemoryExecuteResponse.md)\>

### get()

> **get**: (`memoryId`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Get a persistent memory by ID

#### Parameters

##### memoryId

`string`

Memory ID

#### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

### getStepSpecs()

> **getStepSpecs**: () => `Promise`\<[`PersistentMemoryStepSpecsResponse`](../interfaces/PersistentMemoryStepSpecsResponse.md)\>

Get available step specifications

#### Returns

`Promise`\<[`PersistentMemoryStepSpecsResponse`](../interfaces/PersistentMemoryStepSpecsResponse.md)\>

### list()

> **list**: (`filters?`) => `Promise`\<[`PersistentMemoryListResponse`](../interfaces/PersistentMemoryListResponse.md)\>

List persistent memories

#### Parameters

##### filters?

[`ListPersistentMemoryParams`](../interfaces/ListPersistentMemoryParams.md)

Optional filters

#### Returns

`Promise`\<[`PersistentMemoryListResponse`](../interfaces/PersistentMemoryListResponse.md)\>

### update()

> **update**: (`memoryId`, `updates`) => `Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

Update a persistent memory

#### Parameters

##### memoryId

`string`

Memory ID

##### updates

[`UpdatePersistentMemoryParams`](../interfaces/UpdatePersistentMemoryParams.md)

Update parameters

#### Returns

`Promise`\<[`PersistentMemoryResponse`](../interfaces/PersistentMemoryResponse.md)\>

### validate()

> **validate**: (`memory`) => `Promise`\<[`PersistentMemoryValidateResponse`](../interfaces/PersistentMemoryValidateResponse.md)\>

Validate a memory configuration

#### Parameters

##### memory

[`CreatePersistentMemoryParams`](../interfaces/CreatePersistentMemoryParams.md)

Memory configuration to validate

#### Returns

`Promise`\<[`PersistentMemoryValidateResponse`](../interfaces/PersistentMemoryValidateResponse.md)\>
