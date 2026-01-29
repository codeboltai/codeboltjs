[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [eventLog.ts:22](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/eventLog.ts#L22)

## Type Declaration

### appendEvent()

> **appendEvent**: (`params`) => `Promise`\<`EventLogAppendResponse`\>

Append a single event to the log

#### Parameters

##### params

`AppendEventParams`

Event parameters

#### Returns

`Promise`\<`EventLogAppendResponse`\>

### appendEvents()

> **appendEvents**: (`params`) => `Promise`\<`EventLogAppendMultipleResponse`\>

Append multiple events to the log

#### Parameters

##### params

`AppendEventsParams`

Events parameters

#### Returns

`Promise`\<`EventLogAppendMultipleResponse`\>

### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<`EventLogInstanceResponse`\>

Create a new event log instance

#### Parameters

##### name

`string`

Instance name

##### description?

`string`

Optional description

#### Returns

`Promise`\<`EventLogInstanceResponse`\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<`EventLogInstanceResponse`\>

Delete an event log instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`EventLogInstanceResponse`\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<`EventLogInstanceResponse`\>

Get an event log instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`EventLogInstanceResponse`\>

### getInstanceStats()

> **getInstanceStats**: (`instanceId`) => `Promise`\<`EventLogStatsResponse`\>

Get instance statistics

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`EventLogStatsResponse`\>

### listInstances()

> **listInstances**: () => `Promise`\<`EventLogInstanceListResponse`\>

List all event log instances

#### Returns

`Promise`\<`EventLogInstanceListResponse`\>

### queryEvents()

> **queryEvents**: (`query`) => `Promise`\<`EventLogQueryResponse`\>

Query events using DSL

#### Parameters

##### query

`EventLogDSL`

Query DSL object

#### Returns

`Promise`\<`EventLogQueryResponse`\>

### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<`EventLogInstanceResponse`\>

Update an event log instance

#### Parameters

##### instanceId

`string`

Instance ID

##### updates

`UpdateEventLogInstanceParams`

Update parameters

#### Returns

`Promise`\<`EventLogInstanceResponse`\>
