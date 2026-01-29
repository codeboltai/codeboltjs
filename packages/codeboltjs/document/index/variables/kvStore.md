[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / kvStore

# Variable: kvStore

> `const` **kvStore**: `object`

Defined in: [packages/codeboltjs/src/modules/kvStore.ts:24](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/kvStore.ts#L24)

## Type Declaration

### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Create a new KV store instance

#### Parameters

##### name

`string`

Instance name

##### description?

`string`

Optional description

#### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

### delete()

> **delete**: (`instanceId`, `namespace`, `key`) => `Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

Delete a value from the KV store

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace

`string`

Namespace

##### key

`string`

Key

#### Returns

`Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

Delete a KV store instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KVDeleteResponse`](../interfaces/KVDeleteResponse.md)\>

### deleteNamespace()

> **deleteNamespace**: (`instanceId`, `namespace`) => `Promise`\<[`KVDeleteNamespaceResponse`](../interfaces/KVDeleteNamespaceResponse.md)\>

Delete an entire namespace from the KV store

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace

`string`

Namespace to delete

#### Returns

`Promise`\<[`KVDeleteNamespaceResponse`](../interfaces/KVDeleteNamespaceResponse.md)\>

### get()

> **get**: (`instanceId`, `namespace`, `key`) => `Promise`\<[`KVGetResponse`](../interfaces/KVGetResponse.md)\>

Get a value from the KV store

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace

`string`

Namespace

##### key

`string`

Key

#### Returns

`Promise`\<[`KVGetResponse`](../interfaces/KVGetResponse.md)\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Get a KV store instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

### getNamespaces()

> **getNamespaces**: (`instanceId`) => `Promise`\<[`KVNamespacesResponse`](../interfaces/KVNamespacesResponse.md)\>

Get all namespaces in an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<[`KVNamespacesResponse`](../interfaces/KVNamespacesResponse.md)\>

### getRecordCount()

> **getRecordCount**: (`instanceId`, `namespace?`) => `Promise`\<[`KVRecordCountResponse`](../interfaces/KVRecordCountResponse.md)\>

Get record count for an instance or namespace

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace?

`string`

Optional namespace filter

#### Returns

`Promise`\<[`KVRecordCountResponse`](../interfaces/KVRecordCountResponse.md)\>

### listInstances()

> **listInstances**: () => `Promise`\<[`KVInstanceListResponse`](../interfaces/KVInstanceListResponse.md)\>

List all KV store instances

#### Returns

`Promise`\<[`KVInstanceListResponse`](../interfaces/KVInstanceListResponse.md)\>

### query()

> **query**: (`query`) => `Promise`\<[`KVQueryResponse`](../interfaces/KVQueryResponse.md)\>

Query the KV store using DSL

#### Parameters

##### query

[`KVQueryDSL`](../interfaces/KVQueryDSL.md)

Query DSL object

#### Returns

`Promise`\<[`KVQueryResponse`](../interfaces/KVQueryResponse.md)\>

### set()

> **set**: (`instanceId`, `namespace`, `key`, `value`, `autoCreateInstance`) => `Promise`\<[`KVSetResponse`](../interfaces/KVSetResponse.md)\>

Set a value in the KV store

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace

`string`

Namespace

##### key

`string`

Key

##### value

`any`

Value to store

##### autoCreateInstance

`boolean` = `false`

Auto-create instance if it doesn't exist

#### Returns

`Promise`\<[`KVSetResponse`](../interfaces/KVSetResponse.md)\>

### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>

Update a KV store instance

#### Parameters

##### instanceId

`string`

Instance ID

##### updates

[`UpdateKVInstanceParams`](../interfaces/UpdateKVInstanceParams.md)

Update parameters

#### Returns

`Promise`\<[`KVInstanceResponse`](../interfaces/KVInstanceResponse.md)\>
