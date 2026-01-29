[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [vectordb.ts:4](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/vectordb.ts#L4)

## Type Declaration

### addVectorItem()

> **addVectorItem**: (`item`) => `Promise`\<`AddVectorItemResponse`\>

Adds a new vector item to the vector database.

#### Parameters

##### item

`any`

The item to add to the vector.

#### Returns

`Promise`\<`AddVectorItemResponse`\>

A promise that resolves when the item is successfully added.

### getVector()

> **getVector**: (`key`) => `Promise`\<`GetVectorResponse`\>

Retrieves a vector from the vector database based on the provided key.

#### Parameters

##### key

`string`

The key of the vector to retrieve.

#### Returns

`Promise`\<`GetVectorResponse`\>

A promise that resolves with the retrieved vector.

### queryVectorItem()

> **queryVectorItem**: (`key`) => `Promise`\<`QueryVectorItemResponse`\>

Queries a vector item from the vector database based on the provided key.

#### Parameters

##### key

`string`

The key of the vector to query the item from.

#### Returns

`Promise`\<`QueryVectorItemResponse`\>

A promise that resolves with the queried vector item.

### queryVectorItems()

> **queryVectorItems**: (`items`, `dbPath`) => `Promise`\<`QueryVectorItemResponse`\>

Queries a vector item from the vector database based on the provided key.

#### Parameters

##### items

\[\]

##### dbPath

`string`

#### Returns

`Promise`\<`QueryVectorItemResponse`\>

A promise that resolves with the queried vector item.
