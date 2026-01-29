[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / TaskUpdatePayload

# Interface: TaskUpdatePayload

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:112](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L112)

Payload for task update notifications

## Properties

### action

> **action**: `"completed"` \| `"failed"` \| `"cancelled"` \| `"created"` \| `"updated"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:117](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L117)

Action that occurred

***

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:125](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L125)

Error message if failed

***

### progress?

> `optional` **progress**: `number`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:123](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L123)

Progress percentage (0-100)

***

### status?

> `optional` **status**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:121](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L121)

Current status of the task

***

### taskId

> **taskId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:115](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L115)

ID of the task

***

### taskTitle?

> `optional` **taskTitle**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:119](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L119)

Title of the task

***

### type

> **type**: `"taskUpdate"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:113](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L113)
