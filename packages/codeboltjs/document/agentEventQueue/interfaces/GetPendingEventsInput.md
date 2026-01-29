[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / GetPendingEventsInput

# Interface: GetPendingEventsInput

Defined in: [types/agentEventQueue.ts:220](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L220)

Input for getting pending events

## Properties

### agentId?

> `optional` **agentId**: `string`

Defined in: [types/agentEventQueue.ts:222](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L222)

Agent ID to get events for

***

### agentInstanceId?

> `optional` **agentInstanceId**: `string`

Defined in: [types/agentEventQueue.ts:224](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L224)

Agent instance ID

***

### eventTypes?

> `optional` **eventTypes**: [`AgentEventType`](../enumerations/AgentEventType.md)[]

Defined in: [types/agentEventQueue.ts:230](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L230)

Filter by event types

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/agentEventQueue.ts:228](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L228)

Maximum number of events to return

***

### minPriority?

> `optional` **minPriority**: [`AgentEventPriority`](../enumerations/AgentEventPriority.md)

Defined in: [types/agentEventQueue.ts:232](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L232)

Filter by priority

***

### threadId?

> `optional` **threadId**: `string`

Defined in: [types/agentEventQueue.ts:226](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L226)

Thread ID
