[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [memoryIngestion.ts:20](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/memoryIngestion.ts#L20)

## Type Declaration

### activate()

> **activate**: (`pipelineId`) => `Promise`\<`IngestionPipelineResponse`\>

Activate an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### create()

> **create**: (`config`) => `Promise`\<`IngestionPipelineResponse`\>

Create a new ingestion pipeline

#### Parameters

##### config

`CreateIngestionPipelineParams`

Pipeline configuration

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### delete()

> **delete**: (`pipelineId`) => `Promise`\<`IngestionPipelineResponse`\>

Delete an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### disable()

> **disable**: (`pipelineId`) => `Promise`\<`IngestionPipelineResponse`\>

Disable an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### duplicate()

> **duplicate**: (`pipelineId`, `newId?`, `newLabel?`) => `Promise`\<`IngestionPipelineResponse`\>

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

`Promise`\<`IngestionPipelineResponse`\>

### execute()

> **execute**: (`params`) => `Promise`\<`IngestionExecuteResponse`\>

Execute an ingestion pipeline

#### Parameters

##### params

`ExecuteIngestionParams`

Execution parameters

#### Returns

`Promise`\<`IngestionExecuteResponse`\>

### get()

> **get**: (`pipelineId`) => `Promise`\<`IngestionPipelineResponse`\>

Get an ingestion pipeline by ID

#### Parameters

##### pipelineId

`string`

Pipeline ID

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### getProcessorSpecs()

> **getProcessorSpecs**: () => `Promise`\<`IngestionProcessorSpecsResponse`\>

Get available processor specifications

#### Returns

`Promise`\<`IngestionProcessorSpecsResponse`\>

### list()

> **list**: (`filters?`) => `Promise`\<`IngestionPipelineListResponse`\>

List ingestion pipelines

#### Parameters

##### filters?

`ListIngestionPipelineParams`

Optional filters

#### Returns

`Promise`\<`IngestionPipelineListResponse`\>

### update()

> **update**: (`pipelineId`, `updates`) => `Promise`\<`IngestionPipelineResponse`\>

Update an ingestion pipeline

#### Parameters

##### pipelineId

`string`

Pipeline ID

##### updates

`UpdateIngestionPipelineParams`

Update parameters

#### Returns

`Promise`\<`IngestionPipelineResponse`\>

### validate()

> **validate**: (`pipeline`) => `Promise`\<`IngestionValidateResponse`\>

Validate a pipeline configuration

#### Parameters

##### pipeline

`CreateIngestionPipelineParams`

Pipeline configuration to validate

#### Returns

`Promise`\<`IngestionValidateResponse`\>
