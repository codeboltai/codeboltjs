[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [dbmemory.ts:12](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/dbmemory.ts#L12)

A module for handling in-memory database operations via WebSocket.

## Type Declaration

### addKnowledge()

> **addKnowledge**: (`key`, `value`) => `Promise`\<`MemorySetResponse`\>

Adds a key-value pair to the in-memory database.

#### Parameters

##### key

`string`

The key under which to store the value.

##### value

`MemoryValue`

The value to be stored.

#### Returns

`Promise`\<`MemorySetResponse`\>

A promise that resolves with the response from the memory set event.

### getKnowledge()

> **getKnowledge**: (`key`) => `Promise`\<`MemoryGetResponse`\>

Retrieves a value from the in-memory database by key.

#### Parameters

##### key

`string`

The key of the value to retrieve.

#### Returns

`Promise`\<`MemoryGetResponse`\>

A promise that resolves with the response from the memory get event.
