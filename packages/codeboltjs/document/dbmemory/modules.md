[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for handling in-memory database operations via WebSocket.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `addKnowledge` | (`key`: `string`, `value`: `any`) => `Promise`\<`MemorySetResponse`\> | - |
| `getKnowledge` | (`key`: `string`) => `Promise`\<`MemoryGetResponse`\> | - |

#### Defined in

[dbmemory.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/dbmemory.ts#L7)
