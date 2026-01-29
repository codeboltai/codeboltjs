[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AddEventInput

# Interface: AddEventInput

Defined in: [types/agentEventQueue.ts:198](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L198)

Input for adding an event to an agent's queue

## Properties

### eventType?

> `optional` **eventType**: [`AgentEventType`](../enumerations/AgentEventType.md)

Defined in: [types/agentEventQueue.ts:206](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L206)

Type of event

***

### expiresAt?

> `optional` **expiresAt**: `string`

Defined in: [types/agentEventQueue.ts:212](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L212)

Optional expiration time (ISO string)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [types/agentEventQueue.ts:214](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L214)

Additional metadata

***

### payload

> **payload**: `AgentEventPayload`

Defined in: [types/agentEventQueue.ts:210](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L210)

Event payload

***

### priority?

> `optional` **priority**: [`AgentEventPriority`](../enumerations/AgentEventPriority.md)

Defined in: [types/agentEventQueue.ts:208](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L208)

Event priority

***

### targetAgentId

> **targetAgentId**: `string`

Defined in: [types/agentEventQueue.ts:200](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L200)

Target agent ID

***

### targetAgentInstanceId?

> `optional` **targetAgentInstanceId**: `string`

Defined in: [types/agentEventQueue.ts:202](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L202)

Specific target agent instance ID

***

### targetThreadId?

> `optional` **targetThreadId**: `string`

Defined in: [types/agentEventQueue.ts:204](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L204)

Target thread ID
