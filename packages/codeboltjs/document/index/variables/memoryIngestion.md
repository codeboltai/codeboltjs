[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / memoryIngestion

# Variable: memoryIngestion

> `const` **memoryIngestion**: `object`

Defined in: [packages/codeboltjs/src/modules/memoryIngestion.ts:20](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/memoryIngestion.ts#L20)

## Type Declaration

### activate()

> **activate**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Activate an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### create()

> **create**: (`config`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Create a new ingestion pipeline

#### Parameters

##### config

[`CreateIngestionPipelineParams`](../interfaces/CreateIngestionPipelineParams.md)

Pipeline configuration

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### delete()

> **delete**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Delete an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### disable()

> **disable**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Disable an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### duplicate()

> **duplicate**: (`pipelineId`, `newId?`, `newLabel?`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Duplicate an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID to duplicate

##### newId?

`string`

Optional new ID

##### newLabel?

`string`

Optional new label

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### execute()

> **execute**: (`params`) => `Promise`\<[`IngestionExecuteResponse`](../interfaces/IngestionExecuteResponse.md)\>

Execute an ingestion pipeline

#### Parameters

##### params

[`ExecuteIngestionParams`](../interfaces/ExecuteIngestionParams.md)

Execution parameters

#### Returns

`Promise`\<[`IngestionExecuteResponse`](../interfaces/IngestionExecuteResponse.md)\>

### get()

> **get**: (`pipelineId`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Get an ingestion pipeline by ID

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### getProcessorSpecs()

> **getProcessorSpecs**: () => `Promise`\<[`IngestionProcessorSpecsResponse`](../interfaces/IngestionProcessorSpecsResponse.md)\>

Get available processor specifications

#### Returns

`Promise`\<[`IngestionProcessorSpecsResponse`](../interfaces/IngestionProcessorSpecsResponse.md)\>

### list()

> **list**: (`filters?`) => `Promise`\<[`IngestionPipelineListResponse`](../interfaces/IngestionPipelineListResponse.md)\>

List ingestion pipelines

#### Parameters

##### filters?

[`ListIngestionPipelineParams`](../interfaces/ListIngestionPipelineParams.md)

Optional filters

#### Returns

`Promise`\<[`IngestionPipelineListResponse`](../interfaces/IngestionPipelineListResponse.md)\>

### update()

> **update**: (`pipelineId`, `updates`) => `Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

Update an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

##### updates

[`UpdateIngestionPipelineParams`](../interfaces/UpdateIngestionPipelineParams.md)

Update parameters

#### Returns

`Promise`\<[`IngestionPipelineResponse`](../interfaces/IngestionPipelineResponse.md)\>

### validate()

> **validate**: (`pipeline`) => `Promise`\<[`IngestionValidateResponse`](../interfaces/IngestionValidateResponse.md)\>

Validate a pipeline configuration

#### Parameters

##### pipeline

[`CreateIngestionPipelineParams`](../interfaces/CreateIngestionPipelineParams.md)

Pipeline configuration to validate

#### Returns

`Promise`\<[`IngestionValidateResponse`](../interfaces/IngestionValidateResponse.md)\>
