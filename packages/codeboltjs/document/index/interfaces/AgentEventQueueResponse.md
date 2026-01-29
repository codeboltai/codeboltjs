[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AgentEventQueueResponse

# Interface: AgentEventQueueResponse\<T\>

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:290](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L290)

Standard response for Agent Event Queue operations

## Type Parameters

### T

`T` = `any`

## Properties

### code

> **code**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:294](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L294)

Response code

***

### data?

> `optional` **data**: `T`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:298](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L298)

Response data

***

### error?

> `optional` **error**: `object`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:300](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L300)

Error details

#### code

> **code**: `string`

#### details?

> `optional` **details**: `any`

#### message

> **message**: `string`

***

### message

> **message**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:296](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L296)

Human-readable message

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:308](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L308)

Request ID for correlation

***

### success

> **success**: `boolean`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:292](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L292)

Whether the operation succeeded

***

### timestamp?

> `optional` **timestamp**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:306](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L306)

Request timestamp
