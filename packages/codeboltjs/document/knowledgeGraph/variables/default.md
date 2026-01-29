[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [knowledgeGraph.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/knowledgeGraph.ts#L33)

## Type Declaration

### addEdge()

> **addEdge**: (`instanceId`, `edge`) => `Promise`\<`KGEdgeResponse`\>

Add an edge to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### edge

`CreateKGEdgeParams`

Edge data

#### Returns

`Promise`\<`KGEdgeResponse`\>

### addEdges()

> **addEdges**: (`instanceId`, `edges`) => `Promise`\<`KGEdgeListResponse`\>

Add multiple edges to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### edges

`CreateKGEdgeParams`[]

Array of edge data

#### Returns

`Promise`\<`KGEdgeListResponse`\>

### addMemoryRecord()

> **addMemoryRecord**: (`instanceId`, `record`) => `Promise`\<`KGMemoryRecordResponse`\>

Add a memory record to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### record

`CreateKGMemoryRecordParams`

Record data

#### Returns

`Promise`\<`KGMemoryRecordResponse`\>

### addMemoryRecords()

> **addMemoryRecords**: (`instanceId`, `records`) => `Promise`\<`KGMemoryRecordListResponse`\>

Add multiple memory records to an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### records

`CreateKGMemoryRecordParams`[]

Array of record data

#### Returns

`Promise`\<`KGMemoryRecordListResponse`\>

### createInstance()

> **createInstance**: (`config`) => `Promise`\<`KGInstanceResponse`\>

Create a new knowledge graph instance

#### Parameters

##### config

`CreateKGInstanceParams`

Instance configuration

#### Returns

`Promise`\<`KGInstanceResponse`\>

### createInstanceTemplate()

> **createInstanceTemplate**: (`config`) => `Promise`\<`KGInstanceTemplateResponse`\>

Create a new instance template

#### Parameters

##### config

`CreateKGInstanceTemplateParams`

Template configuration

#### Returns

`Promise`\<`KGInstanceTemplateResponse`\>

### createView()

> **createView**: (`config`) => `Promise`\<`KGViewResponse`\>

Create a view

#### Parameters

##### config

`CreateKGViewParams`

View configuration

#### Returns

`Promise`\<`KGViewResponse`\>

### createViewTemplate()

> **createViewTemplate**: (`config`) => `Promise`\<`KGViewTemplateResponse`\>

Create a view template

#### Parameters

##### config

`CreateKGViewTemplateParams`

View template configuration

#### Returns

`Promise`\<`KGViewTemplateResponse`\>

### deleteEdge()

> **deleteEdge**: (`instanceId`, `edgeId`) => `Promise`\<`KGDeleteResponse`\>

Delete an edge

#### Parameters

##### instanceId

`string`

Instance ID

##### edgeId

`string`

Edge ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<`KGDeleteResponse`\>

Delete an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### deleteInstanceTemplate()

> **deleteInstanceTemplate**: (`templateId`) => `Promise`\<`KGDeleteResponse`\>

Delete an instance template

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### deleteMemoryRecord()

> **deleteMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<`KGDeleteResponse`\>

Delete a memory record

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### deleteView()

> **deleteView**: (`viewId`) => `Promise`\<`KGDeleteResponse`\>

Delete a view

#### Parameters

##### viewId

`string`

View ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### deleteViewTemplate()

> **deleteViewTemplate**: (`templateId`) => `Promise`\<`KGDeleteResponse`\>

Delete a view template

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<`KGDeleteResponse`\>

### executeView()

> **executeView**: (`viewId`) => `Promise`\<`KGViewExecuteResponse`\>

Execute a view query

#### Parameters

##### viewId

`string`

View ID

#### Returns

`Promise`\<`KGViewExecuteResponse`\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<`KGInstanceResponse`\>

Get an instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KGInstanceResponse`\>

### getInstanceTemplate()

> **getInstanceTemplate**: (`templateId`) => `Promise`\<`KGInstanceTemplateResponse`\>

Get an instance template by ID

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<`KGInstanceTemplateResponse`\>

### getMemoryRecord()

> **getMemoryRecord**: (`instanceId`, `recordId`) => `Promise`\<`KGMemoryRecordResponse`\>

Get a memory record by ID

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

#### Returns

`Promise`\<`KGMemoryRecordResponse`\>

### getViewTemplate()

> **getViewTemplate**: (`templateId`) => `Promise`\<`KGViewTemplateResponse`\>

Get a view template by ID

#### Parameters

##### templateId

`string`

Template ID

#### Returns

`Promise`\<`KGViewTemplateResponse`\>

### listEdges()

> **listEdges**: (`instanceId`, `filters?`) => `Promise`\<`KGEdgeListResponse`\>

List edges in an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### filters?

`ListKGEdgesParams`

Optional filters

#### Returns

`Promise`\<`KGEdgeListResponse`\>

### listInstances()

> **listInstances**: (`templateId?`) => `Promise`\<`KGInstanceListResponse`\>

List instances, optionally filtered by template

#### Parameters

##### templateId?

`string`

Optional template ID filter

#### Returns

`Promise`\<`KGInstanceListResponse`\>

### listInstanceTemplates()

> **listInstanceTemplates**: () => `Promise`\<`KGInstanceTemplateListResponse`\>

List all instance templates

#### Returns

`Promise`\<`KGInstanceTemplateListResponse`\>

### listMemoryRecords()

> **listMemoryRecords**: (`instanceId`, `filters?`) => `Promise`\<`KGMemoryRecordListResponse`\>

List memory records in an instance

#### Parameters

##### instanceId

`string`

Instance ID

##### filters?

`ListKGMemoryRecordsParams`

Optional filters

#### Returns

`Promise`\<`KGMemoryRecordListResponse`\>

### listViews()

> **listViews**: (`instanceId`) => `Promise`\<`KGViewListResponse`\>

List views for an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KGViewListResponse`\>

### listViewTemplates()

> **listViewTemplates**: (`applicableTemplateId?`) => `Promise`\<`KGViewTemplateListResponse`\>

List view templates

#### Parameters

##### applicableTemplateId?

`string`

Optional filter by applicable template

#### Returns

`Promise`\<`KGViewTemplateListResponse`\>

### updateInstanceTemplate()

> **updateInstanceTemplate**: (`templateId`, `updates`) => `Promise`\<`KGInstanceTemplateResponse`\>

Update an instance template

#### Parameters

##### templateId

`string`

Template ID

##### updates

`Partial`\<`CreateKGInstanceTemplateParams`\>

Update parameters

#### Returns

`Promise`\<`KGInstanceTemplateResponse`\>

### updateMemoryRecord()

> **updateMemoryRecord**: (`instanceId`, `recordId`, `updates`) => `Promise`\<`KGMemoryRecordResponse`\>

Update a memory record

#### Parameters

##### instanceId

`string`

Instance ID

##### recordId

`string`

Record ID

##### updates

`Partial`\<`CreateKGMemoryRecordParams`\>

Update parameters

#### Returns

`Promise`\<`KGMemoryRecordResponse`\>

### updateViewTemplate()

> **updateViewTemplate**: (`templateId`, `updates`) => `Promise`\<`KGViewTemplateResponse`\>

Update a view template

#### Parameters

##### templateId

`string`

Template ID

##### updates

`Partial`\<`CreateKGViewTemplateParams`\>

Update parameters

#### Returns

`Promise`\<`KGViewTemplateResponse`\>
