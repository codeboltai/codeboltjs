[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [persistentMemory.ts:20](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/persistentMemory.ts#L20)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<`PersistentMemoryResponse`\>

Create a new persistent memory configuration

#### Parameters

##### config

`CreatePersistentMemoryParams`

Memory configuration

#### Returns

`Promise`\<`PersistentMemoryResponse`\>

### delete()

> **delete**: (`memoryId`) => `Promise`\<`PersistentMemoryResponse`\>

Delete a persistent memory

#### Parameters

##### memoryId

`string`

Memory ID

#### Returns

`Promise`\<`PersistentMemoryResponse`\>

### executeRetrieval()

> **executeRetrieval**: (`memoryId`, `intent`) => `Promise`\<`PersistentMemoryExecuteResponse`\>

Execute memory retrieval pipeline

#### Parameters

##### memoryId

`string`

Memory ID

##### intent

`PipelineExecutionIntent`

Execution intent with context

#### Returns

`Promise`\<`PersistentMemoryExecuteResponse`\>

### get()

> **get**: (`memoryId`) => `Promise`\<`PersistentMemoryResponse`\>

Get a persistent memory by ID

#### Parameters

##### memoryId

`string`

Memory ID

#### Returns

`Promise`\<`PersistentMemoryResponse`\>

### getStepSpecs()

> **getStepSpecs**: () => `Promise`\<`PersistentMemoryStepSpecsResponse`\>

Get available step specifications

#### Returns

`Promise`\<`PersistentMemoryStepSpecsResponse`\>

### list()

> **list**: (`filters?`) => `Promise`\<`PersistentMemoryListResponse`\>

List persistent memories

#### Parameters

##### filters?

`ListPersistentMemoryParams`

Optional filters

#### Returns

`Promise`\<`PersistentMemoryListResponse`\>

### update()

> **update**: (`memoryId`, `updates`) => `Promise`\<`PersistentMemoryResponse`\>

Update a persistent memory

#### Parameters

##### memoryId

`string`

Memory ID

##### updates

`UpdatePersistentMemoryParams`

Update parameters

#### Returns

`Promise`\<`PersistentMemoryResponse`\>

### validate()

> **validate**: (`memory`) => `Promise`\<`PersistentMemoryValidateResponse`\>

Validate a memory configuration

#### Parameters

##### memory

`CreatePersistentMemoryParams`

Memory configuration to validate

#### Returns

`Promise`\<`PersistentMemoryValidateResponse`\>
