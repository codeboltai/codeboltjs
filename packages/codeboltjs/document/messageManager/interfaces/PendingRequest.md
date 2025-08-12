[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / PendingRequest

# Interface: PendingRequest

## Table of contents

### Properties

- [messageTypes](PendingRequest.md#messagetypes)
- [reject](PendingRequest.md#reject)
- [requestId](PendingRequest.md#requestid)
- [resolve](PendingRequest.md#resolve)

## Properties

### messageTypes

• **messageTypes**: `string`[]

#### Defined in

[src/core/messageManager.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/core/messageManager.ts#L7)

___

### reject

• **reject**: (`reason?`: `any`) => `void`

#### Type declaration

▸ (`reason?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `reason?` | `any` |

##### Returns

`void`

#### Defined in

[src/core/messageManager.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/core/messageManager.ts#L6)

___

### requestId

• `Optional` **requestId**: `string`

#### Defined in

[src/core/messageManager.ts:8](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/core/messageManager.ts#L8)

___

### resolve

• **resolve**: (`value`: `any`) => `void`

#### Type declaration

▸ (`value`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

##### Returns

`void`

#### Defined in

[src/core/messageManager.ts:5](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/core/messageManager.ts#L5)
