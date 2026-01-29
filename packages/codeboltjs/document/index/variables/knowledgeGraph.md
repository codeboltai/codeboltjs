[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / knowledgeGraph

# Variable: knowledgeGraph

> `const` **knowledgeGraph**: `object`

Defined in: [packages/codeboltjs/src/modules/knowledgeGraph.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/knowledgeGraph.ts#L33)

## Type Declaration

### addEdge()

> **addEdge**: (`instanceId`, `edge`) => `Promise`\<[`KGEdgeResponse`](../interfaces/KGEdgeResponse.md)\>

Add an edge to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### edge

[`CreateKGEdgeParams`](../interfaces/CreateKGEdgeParams.md)

Edge data

#### Returns

`Promise`\<[`KGEdgeResponse`](../interfaces/KGEdgeResponse.md)\>

### addEdges()

> **addEdges**: (`instanceId`, `edges`) => `Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

Add multiple edges to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### edges

[`CreateKGEdgeParams`](../interfaces/CreateKGEdgeParams.md)[]

Array of edge data

#### Returns

`Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

### addMemoryRecord()

> **addMemoryRecord**: (`instanceId`, `record`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Add a memory record to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### record

[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)

Record data

#### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

### addMemoryRecords()

> **addMemoryRecords**: (`instanceId`, `records`) => `Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

Add multiple memory records to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### records

[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)[]

Array of record data

#### Returns

`Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

### createInstance()

> **createInstance**: (`config`) => `Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

Create a new knowledge graph instance

#### Parameters

##### config

[`CreateKGInstanceParams`](../interfaces/CreateKGInstanceParams.md)

Instance configuration

#### Returns

`Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

### createInstanceTemplate()

> **createInstanceTemplate**: (`config`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Create a new instance template

#### Parameters

##### config

[`CreateKGInstanceTemplateParams`](../interfaces/CreateKGInstanceTemplateParams.md)

Template configuration

#### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

### createView()

> **createView**: (`config`) => `Promise`\<[`KGViewResponse`](../interfaces/KGViewResponse.md)\>

Create a view

#### Parameters

##### config

[`CreateKGViewParams`](../interfaces/CreateKGViewParams.md)

View configuration

#### Returns

`Promise`\<[`KGViewResponse`](../interfaces/KGViewResponse.md)\>

### createViewTemplate()

> **createViewTemplate**: (`config`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Create a view template

#### Parameters

##### config

[`CreateKGViewTemplateParams`](../interfaces/CreateKGViewTemplateParams.md)

View template configuration

#### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

### deleteEdge()

> **deleteEdge**: (`instanceId`, `edgeId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an edge

#### Parameters

##### instanceId

`string`

Instance ID

##### edgeId

`string`

Edge ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### deleteInstanceTemplate()

> **deleteInstanceTemplate**: (`templateId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete an instance template

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### deleteMemoryRecord()

> **deleteMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a memory record

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### deleteView()

> **deleteView**: (`viewId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a view

#### Parameters

##### viewId

`string`

View ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### deleteViewTemplate()

> **deleteViewTemplate**: (`templateId`) => `Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

Delete a view template

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<[`KGDeleteResponse`](../interfaces/KGDeleteResponse.md)\>

### executeView()

> **executeView**: (`viewId`) => `Promise`\<[`KGViewExecuteResponse`](../interfaces/KGViewExecuteResponse.md)\>

Execute a view query

#### Parameters

##### viewId

`string`

View ID

#### Returns

`Promise`\<[`KGViewExecuteResponse`](../interfaces/KGViewExecuteResponse.md)\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

Get an instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KGInstanceResponse`](../interfaces/KGInstanceResponse.md)\>

### getInstanceTemplate()

> **getInstanceTemplate**: (`templateId`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Get an instance template by ID

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

### getMemoryRecord()

> **getMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Get a memory record by ID

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

#### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

### getViewTemplate()

> **getViewTemplate**: (`templateId`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Get a view template by ID

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

### listEdges()

> **listEdges**: (`instanceId`, `filters?`) => `Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

List edges in an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### filters?

[`ListKGEdgesParams`](../interfaces/ListKGEdgesParams.md)

Optional filters

#### Returns

`Promise`\<[`KGEdgeListResponse`](../interfaces/KGEdgeListResponse.md)\>

### listInstances()

> **listInstances**: (`templateId?`) => `Promise`\<[`KGInstanceListResponse`](../interfaces/KGInstanceListResponse.md)\>

List instances, optionally filtered by template

#### Parameters

##### templateId?

`string`

Optional template ID filter

#### Returns

`Promise`\<[`KGInstanceListResponse`](../interfaces/KGInstanceListResponse.md)\>

### listInstanceTemplates()

> **listInstanceTemplates**: () => `Promise`\<[`KGInstanceTemplateListResponse`](../interfaces/KGInstanceTemplateListResponse.md)\>

List all instance templates

#### Returns

`Promise`\<[`KGInstanceTemplateListResponse`](../interfaces/KGInstanceTemplateListResponse.md)\>

### listMemoryRecords()

> **listMemoryRecords**: (`instanceId`, `filters?`) => `Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

List memory records in an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### filters?

[`ListKGMemoryRecordsParams`](../interfaces/ListKGMemoryRecordsParams.md)

Optional filters

#### Returns

`Promise`\<[`KGMemoryRecordListResponse`](../interfaces/KGMemoryRecordListResponse.md)\>

### listViews()

> **listViews**: (`instanceId`) => `Promise`\<[`KGViewListResponse`](../interfaces/KGViewListResponse.md)\>

List views for an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KGViewListResponse`](../interfaces/KGViewListResponse.md)\>

### listViewTemplates()

> **listViewTemplates**: (`applicableTemplateId?`) => `Promise`\<[`KGViewTemplateListResponse`](../interfaces/KGViewTemplateListResponse.md)\>

List view templates

#### Parameters

##### applicableTemplateId?

`string`

Optional filter by applicable template

#### Returns

`Promise`\<[`KGViewTemplateListResponse`](../interfaces/KGViewTemplateListResponse.md)\>

### updateInstanceTemplate()

> **updateInstanceTemplate**: (`templateId`, `updates`) => `Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

Update an instance template

#### Parameters

##### templateId

`string`

Template ID

##### updates

`Partial`\<[`CreateKGInstanceTemplateParams`](../interfaces/CreateKGInstanceTemplateParams.md)\>

Update parameters

#### Returns

`Promise`\<[`KGInstanceTemplateResponse`](../interfaces/KGInstanceTemplateResponse.md)\>

### updateMemoryRecord()

> **updateMemoryRecord**: (`instanceId`, `recordId`, `updates`) => `Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

Update a memory record

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

##### updates

`Partial`\<[`CreateKGMemoryRecordParams`](../interfaces/CreateKGMemoryRecordParams.md)\>

Update parameters

#### Returns

`Promise`\<[`KGMemoryRecordResponse`](../interfaces/KGMemoryRecordResponse.md)\>

### updateViewTemplate()

> **updateViewTemplate**: (`templateId`, `updates`) => `Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>

Update a view template

#### Parameters

##### templateId

`string`

Template ID

##### updates

`Partial`\<[`CreateKGViewTemplateParams`](../interfaces/CreateKGViewTemplateParams.md)\>

Update parameters

#### Returns

`Promise`\<[`KGViewTemplateResponse`](../interfaces/KGViewTemplateResponse.md)\>
