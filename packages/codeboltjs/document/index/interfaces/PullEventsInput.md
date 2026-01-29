[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / PullEventsInput

# Interface: PullEventsInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:238](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L238)

Input for pulling events (get and remove)

## Properties

### agentId?

> `optional` **agentId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:240](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L240)

Agent ID to pull events for

***

### agentInstanceId?

> `optional` **agentInstanceId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:242](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L242)

Agent instance ID

***

### eventTypes?

> `optional` **eventTypes**: [`AgentEventType`](../enumerations/AgentEventType.md)[]

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:248](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L248)

Filter by event types

***

### limit?

> `optional` **limit**: `number` \| `"all"`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:246](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L246)

Number of events to pull, or 'all'

***

### since?

> `optional` **since**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:250](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L250)

Only pull events since this timestamp

***

### threadId?

> `optional` **threadId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:244](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L244)

Thread ID
