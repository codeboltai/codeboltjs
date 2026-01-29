[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AgentEventMessage

# Interface: AgentEventMessage

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:156](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L156)

Core event message structure

## Properties

### acknowledgedAt?

> `optional` **acknowledgedAt**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:180](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L180)

When acknowledgement was received

***

### createdAt

> **createdAt**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:176](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L176)

Event creation timestamp (ISO string)

***

### deliveredAt?

> `optional` **deliveredAt**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:178](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L178)

When the event was delivered via WebSocket

***

### eventId

> **eventId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:158](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L158)

Unique event identifier (UUID)

***

### eventType

> **eventType**: [`AgentEventType`](../enumerations/AgentEventType.md)

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:170](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L170)

Type of event

***

### expiresAt?

> `optional` **expiresAt**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:182](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L182)

Optional expiration time (ISO string)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:188](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L188)

Additional metadata

***

### payload

> **payload**: [`AgentEventPayload`](../type-aliases/AgentEventPayload.md)

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L174)

Event payload (discriminated by type)

***

### priority

> **priority**: [`AgentEventPriority`](../enumerations/AgentEventPriority.md)

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:172](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L172)

Event priority

***

### retryCount

> **retryCount**: `number`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:186](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L186)

Number of delivery retry attempts

***

### sourceAgentId?

> `optional` **sourceAgentId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:166](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L166)

Source agent ID (for inter-agent messages)

***

### sourceThreadId?

> `optional` **sourceThreadId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:168](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L168)

Source thread ID

***

### status

> **status**: [`AgentEventStatus`](../enumerations/AgentEventStatus.md)

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:184](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L184)

Current status of the event

***

### targetAgentId

> **targetAgentId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:160](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L160)

Target agent ID

***

### targetAgentInstanceId?

> `optional` **targetAgentInstanceId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:162](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L162)

Specific target agent instance ID (optional)

***

### targetThreadId?

> `optional` **targetThreadId**: `string`

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:164](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L164)

Target thread ID (optional)
