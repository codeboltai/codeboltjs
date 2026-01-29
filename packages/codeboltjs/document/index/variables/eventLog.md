[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / eventLog

# Variable: eventLog

> `const` **eventLog**: `object`

Defined in: [packages/codeboltjs/src/modules/eventLog.ts:22](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/eventLog.ts#L22)

## Type Declaration

### appendEvent()

> **appendEvent**: (`params`) => `Promise`\<[`EventLogAppendResponse`](../interfaces/EventLogAppendResponse.md)\>

Append a single event to the log

#### Parameters

##### params

[`AppendEventParams`](../interfaces/AppendEventParams.md)

Event parameters

#### Returns

`Promise`\<[`EventLogAppendResponse`](../interfaces/EventLogAppendResponse.md)\>

### appendEvents()

> **appendEvents**: (`params`) => `Promise`\<[`EventLogAppendMultipleResponse`](../interfaces/EventLogAppendMultipleResponse.md)\>

Append multiple events to the log

#### Parameters

##### params

[`AppendEventsParams`](../interfaces/AppendEventsParams.md)

Events parameters

#### Returns

`Promise`\<[`EventLogAppendMultipleResponse`](../interfaces/EventLogAppendMultipleResponse.md)\>

### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Create a new event log instance

#### Parameters

##### name

`string`

Instance name

##### description?

`string`

Optional description

#### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Delete an event log instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Get an event log instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

### getInstanceStats()

> **getInstanceStats**: (`instanceId`) => `Promise`\<[`EventLogStatsResponse`](../interfaces/EventLogStatsResponse.md)\>

Get instance statistics

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`EventLogStatsResponse`](../interfaces/EventLogStatsResponse.md)\>

### listInstances()

> **listInstances**: () => `Promise`\<[`EventLogInstanceListResponse`](../interfaces/EventLogInstanceListResponse.md)\>

List all event log instances

#### Returns

`Promise`\<[`EventLogInstanceListResponse`](../interfaces/EventLogInstanceListResponse.md)\>

### queryEvents()

> **queryEvents**: (`query`) => `Promise`\<[`EventLogQueryResponse`](../interfaces/EventLogQueryResponse.md)\>

Query events using DSL

#### Parameters

##### query

[`EventLogDSL`](../interfaces/EventLogDSL.md)

Query DSL object

#### Returns

`Promise`\<[`EventLogQueryResponse`](../interfaces/EventLogQueryResponse.md)\>

### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>

Update an event log instance

#### Parameters

##### instanceId

`string`

Instance ID

##### updates

[`UpdateEventLogInstanceParams`](../interfaces/UpdateEventLogInstanceParams.md)

Update parameters

#### Returns

`Promise`\<[`EventLogInstanceResponse`](../interfaces/EventLogInstanceResponse.md)\>
