[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / SendAgentMessageInput

# Interface: SendAgentMessageInput

Defined in: [types/agentEventQueue.ts:268](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L268)

Input for sending an inter-agent message

## Properties

### content

> **content**: `string`

Defined in: [types/agentEventQueue.ts:274](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L274)

Message content

***

### messageType?

> `optional` **messageType**: `"text"` \| `"json"` \| `"command"`

Defined in: [types/agentEventQueue.ts:276](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L276)

Message type

***

### priority?

> `optional` **priority**: [`AgentEventPriority`](../enumerations/AgentEventPriority.md)

Defined in: [types/agentEventQueue.ts:278](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L278)

Event priority

***

### replyTo?

> `optional` **replyTo**: `string`

Defined in: [types/agentEventQueue.ts:280](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L280)

Reference to a previous eventId for replies

***

### targetAgentId

> **targetAgentId**: `string`

Defined in: [types/agentEventQueue.ts:270](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L270)

Target agent ID

***

### targetThreadId?

> `optional` **targetThreadId**: `string`

Defined in: [types/agentEventQueue.ts:272](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/agentEventQueue.ts#L272)

Target thread ID
