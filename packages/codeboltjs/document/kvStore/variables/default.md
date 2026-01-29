[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [kvStore.ts:24](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/kvStore.ts#L24)

## Type Declaration

### createInstance()

> **createInstance**: (`name`, `description?`) => `Promise`\<`KVInstanceResponse`\>

Create a new KV store instance

#### Parameters

##### name

`string`

Instance name

##### description?

`string`

Optional description

#### Returns

`Promise`\<`KVInstanceResponse`\>

### delete()

> **delete**: (`instanceId`, `namespace`, `key`) => `Promise`\<`KVDeleteResponse`\>

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

`Promise`\<`KVDeleteResponse`\>

### deleteInstance()

> **deleteInstance**: (`instanceId`) => `Promise`\<`KVDeleteResponse`\>

Delete a KV store instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KVDeleteResponse`\>

### deleteNamespace()

> **deleteNamespace**: (`instanceId`, `namespace`) => `Promise`\<`KVDeleteNamespaceResponse`\>

Delete an entire namespace from the KV store

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace

`string`

Namespace to delete

#### Returns

`Promise`\<`KVDeleteNamespaceResponse`\>

### get()

> **get**: (`instanceId`, `namespace`, `key`) => `Promise`\<`KVGetResponse`\>

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

`Promise`\<`KVGetResponse`\>

### getInstance()

> **getInstance**: (`instanceId`) => `Promise`\<`KVInstanceResponse`\>

Get a KV store instance by ID

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KVInstanceResponse`\>

### getNamespaces()

> **getNamespaces**: (`instanceId`) => `Promise`\<`KVNamespacesResponse`\>

Get all namespaces in an instance

#### Parameters

##### instanceId

`string`

Instance ID

#### Returns

`Promise`\<`KVNamespacesResponse`\>

### getRecordCount()

> **getRecordCount**: (`instanceId`, `namespace?`) => `Promise`\<`KVRecordCountResponse`\>

Get record count for an instance or namespace

#### Parameters

##### instanceId

`string`

Instance ID

##### namespace?

`string`

Optional namespace filter

#### Returns

`Promise`\<`KVRecordCountResponse`\>

### listInstances()

> **listInstances**: () => `Promise`\<`KVInstanceListResponse`\>

List all KV store instances

#### Returns

`Promise`\<`KVInstanceListResponse`\>

### query()

> **query**: (`query`) => `Promise`\<`KVQueryResponse`\>

Query the KV store using DSL

#### Parameters

##### query

`KVQueryDSL`

Query DSL object

#### Returns

`Promise`\<`KVQueryResponse`\>

### set()

> **set**: (`instanceId`, `namespace`, `key`, `value`, `autoCreateInstance`) => `Promise`\<`KVSetResponse`\>

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

`Promise`\<`KVSetResponse`\>

### updateInstance()

> **updateInstance**: (`instanceId`, `updates`) => `Promise`\<`KVInstanceResponse`\>

Update a KV store instance

#### Parameters

##### instanceId

`string`

Instance ID

##### updates

`UpdateKVInstanceParams`

Update parameters

#### Returns

`Promise`\<`KVInstanceResponse`\>
